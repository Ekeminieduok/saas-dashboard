"use server";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createWebhookEndpoint(url: string, events: string[]) {
  const merchant = await prisma.merchant.findFirst();
  if (!merchant) throw new Error("No merchant configured");

  // Unlike an API key, this secret is stored in the clear and shown
  // persistently -- the merchant needs to re-read it every time they
  // verify a delivery, the same way we needed Paystack's secret to
  // verify theirs in the webhook receiver.
  const secret = `whsec_${crypto.randomBytes(24).toString("base64url")}`;

  await prisma.webhookEndpoint.create({
    data: { merchantId: merchant.id, url, events, secret },
  });

  revalidatePath("/webhooks");
}

export async function toggleWebhookEndpoint(id: string, active: boolean) {
  await prisma.webhookEndpoint.update({ where: { id }, data: { active } });
  revalidatePath("/webhooks");
}

export async function deleteWebhookEndpoint(id: string) {
  await prisma.webhookEndpoint.delete({ where: { id } });
  revalidatePath("/webhooks");
}
