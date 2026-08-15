import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

// Paystack calls this URL directly (not your browser), so there's no
// user session here — trust is established entirely by the signature
// check below, using your Paystack secret key.
export async function POST(req: Request) {
  const rawBody = await req.text(); // must read as raw text, not .json() —
  // the signature is computed over the exact bytes Paystack sent, and
  // JSON.parse -> JSON.stringify does not always reproduce those bytes.
  const signature = req.headers.get("x-paystack-signature");

  // Single-tenant for now: there's only one Merchant row. Once this
  // becomes real multi-tenant, this lookup changes to something that
  // identifies *which* merchant the webhook belongs to.
  const merchant = await prisma.merchant.findFirst();
  if (!merchant) {
    return new Response("No merchant configured", { status: 500 });
  }

  const expectedSignature = crypto
    .createHmac("sha512", merchant.paystackSecretKey)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    // Do NOT process the payload if this fails — it means the request
    // didn't actually come from Paystack.
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const eventId = `${event.event}:${event.data?.id}`;

  const alreadyProcessed = await prisma.paystackWebhookLog.findUnique({
    where: { paystackEventId: eventId },
  });
  if (alreadyProcessed) {
    // Same event delivered again — acknowledge without reprocessing.
    return new Response("OK", { status: 200 });
  }

  try {
    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(merchant.id, event.data);
        break;
      case "refund.processed":
        await handleRefundProcessed(merchant.id, event.data);
        break;
      default:
        // Other event types (transfers, disputes, etc.) — ignore for now.
        console.log("Unhandled Paystack event:", event.event);
    }

    await prisma.paystackWebhookLog.create({
      data: { paystackEventId: eventId, eventType: event.event },
    });

    return new Response("OK", { status: 200 });
  } catch (err) {
    // Log and still return 200. Returning an error status makes Paystack
    // retry, which is fine for transient DB issues — but if the bug is in
    // our code, retries won't fix it and just spam the logs. For a first
    // project, logging loudly and moving on is the simpler, safer default.
    console.error("Webhook processing failed:", err);
    return new Response("OK", { status: 200 });
  }
}

async function handleChargeSuccess(merchantId: string, data: any) {
  const customer = await prisma.customer.upsert({
    where: { merchantId_email: { merchantId, email: data.customer.email } },
    update: {},
    create: {
      merchantId,
      paystackCustomerId: data.customer.customer_code ?? String(data.customer.id),
      email: data.customer.email,
      name:
        [data.customer.first_name, data.customer.last_name]
          .filter(Boolean)
          .join(" ") || null,
      phone: data.customer.phone ?? null,
    },
  });

  await prisma.transaction.upsert({
    where: { paystackReference: data.reference },
    update: {
      status: data.status,
      paidAt: data.paid_at ? new Date(data.paid_at) : null,
    },
    create: {
      merchantId,
      customerId: customer.id,
      paystackReference: data.reference,
      amountKobo: data.amount,
      currency: data.currency ?? "NGN",
      status: data.status,
      channel: data.channel ?? null,
      paidAt: data.paid_at ? new Date(data.paid_at) : null,
    },
  });
}

async function handleRefundProcessed(merchantId: string, data: any) {
  // NOTE: verify these field names against a real test-mode refund
  // webhook once you trigger one — Paystack's refund payload shape
  // isn't as consistently documented as charge.success. Log `data`
  // the first time this fires and adjust field names if needed.
  const transactionReference = data.transaction_reference ?? data.transaction?.reference;
  if (!transactionReference) {
    console.warn("Refund webhook missing transaction reference:", data);
    return;
  }

  const transaction = await prisma.transaction.findUnique({
    where: { paystackReference: transactionReference },
  });
  if (!transaction) {
    console.warn("Refund for unknown transaction:", transactionReference);
    return;
  }

  await prisma.refund.upsert({
    where: { paystackRefundId: String(data.id) },
    update: { status: data.status },
    create: {
      merchantId,
      transactionId: transaction.id,
      paystackRefundId: String(data.id),
      amountKobo: data.amount,
      reason: data.merchant_note ?? data.customer_note ?? null,
      status: data.status,
    },
  });
}
