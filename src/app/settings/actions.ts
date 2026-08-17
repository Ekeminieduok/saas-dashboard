"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateMerchantProfile(businessName: string, email: string) {
  const merchant = await prisma.merchant.findFirst();
  if (!merchant) throw new Error("No merchant configured");

  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { businessName, email },
  });

  revalidatePath("/settings");
}
