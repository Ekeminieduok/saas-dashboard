import { prisma } from "@/lib/prisma";
import { PaymentLinksManager } from "@/components/payment-links-manager";

export default async function PaymentLinksPage() {
  const merchant = await prisma.merchant.findFirst();

  const links = await prisma.paymentLink.findMany({
    where: { merchantId: merchant?.id },
    orderBy: { createdAt: "desc" },
  });

  const serialized = links.map((l) => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    amountKobo: l.amountKobo,
    active: l.active,
  }));

  return (
    <div className="px-8 py-8">
      <header className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
          Payment links
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Real, working Paystack test-mode checkout pages — share the link,
          get paid, watch it show up in Transactions.
        </p>
      </header>

      <PaymentLinksManager initialLinks={serialized} />
    </div>
  );
}
