"use server";

import { prisma } from "@/lib/prisma";
import { paystackRequest } from "@/lib/paystack";
import { revalidatePath } from "next/cache";

type PaystackPage = { id: number; slug: string };

export async function createPaymentLink(name: string, amountNaira: number | null) {
  const merchant = await prisma.merchant.findFirst();
  if (!merchant) throw new Error("No merchant configured");

  const amountKobo = amountNaira ? Math.round(amountNaira * 100) : undefined;

  // This is a real call to Paystack's API (test mode) that creates an
  // actual hosted checkout page on their side -- we're not building our
  // own checkout, we're generating the same kind of link the real
  // Paystack dashboard's "Payment links" page creates.
  const page = await paystackRequest<PaystackPage>(merchant.paystackSecretKey, "/page", {
    method: "POST",
    body: JSON.stringify({ name, amount: amountKobo }),
  });

  await prisma.paymentLink.create({
    data: {
      merchantId: merchant.id,
      paystackPageId: String(page.id),
      slug: page.slug,
      name,
      amountKobo: amountKobo ?? null,
      active: true,
    },
  });

  revalidatePath("/payment-links");
}

export async function togglePaymentLink(id: string, active: boolean) {
  // Kept local-only for now, rather than also calling Paystack's Update
  // Page endpoint -- the link still works on Paystack's side either way,
  // this just controls whether it's shown as active in this dashboard.
  await prisma.paymentLink.update({ where: { id }, data: { active } });
  revalidatePath("/payment-links");
}
