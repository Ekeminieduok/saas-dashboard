import { prisma } from "@/lib/prisma";
import { WebhooksManager } from "@/components/webhooks-manager";

export default async function WebhooksPage() {
  const merchant = await prisma.merchant.findFirst();

  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { merchantId: merchant?.id },
    orderBy: { createdAt: "desc" },
  });

  const serialized = endpoints.map((e) => ({
    id: e.id,
    url: e.url,
    secret: e.secret,
    events: e.events,
    active: e.active,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <div className="px-8 py-8">
      <header className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
          Webhooks
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Register a URL and we&apos;ll notify it when events happen on your
          account — mirrors how Paystack notifies us. (Note: this page
          manages endpoints; actually sending deliveries to them is a
          later step, not built yet.)
        </p>
      </header>

      <WebhooksManager initialEndpoints={serialized} />
    </div>
  );
}
