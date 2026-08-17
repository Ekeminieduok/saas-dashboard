"use server";

import { prisma } from "@/lib/prisma";
import { generateApiKey, hashApiKey } from "@/lib/api-key";
import { revalidatePath } from "next/cache";

export async function createApiKey(name: string) {
  const merchant = await prisma.merchant.findFirst();
  if (!merchant) throw new Error("No merchant configured");

  const { fullKey, prefix } = generateApiKey();
  const hashedKey = hashApiKey(fullKey);

  await prisma.apiKey.create({
    data: { merchantId: merchant.id, name, hashedKey, prefix },
  });

  revalidatePath("/api-keys");

  // The full key is returned here and ONLY here -- it's never written
  // to the database, only its hash is. Once this function returns,
  // there is no way for the app itself to show this key again.
  return fullKey;
}

export async function revokeApiKey(id: string) {
  await prisma.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
  revalidatePath("/api-keys");
}
