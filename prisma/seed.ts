import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Standalone script, so it builds its own client rather than
// importing src/lib/prisma.ts (keeps it runnable outside Next.js).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not set in .env — add your Paystack test secret key first."
    );
  }

  // upsert, not create: safe to re-run this script as many times as
  // you want without creating duplicate merchants or erroring out.
  const merchant = await prisma.merchant.upsert({
    where: { email: "rickyeduok@gmail.com" }, // change to your real email
    update: {},
    create: {
      businessName: "My Test Store",
      email: "rickyeduok@gmail.com", // change to your real email
      paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
    },
  });

  console.log("Seeded merchant:", merchant.id, merchant.businessName);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });