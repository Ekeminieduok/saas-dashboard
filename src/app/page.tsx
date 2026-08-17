import { prisma } from "@/lib/prisma";
import { Money } from "@/components/money";
import { StatusBadge } from "@/components/status-badge";

// Server component: this runs on the server, queries the DB directly,
// and sends only the rendered HTML to the browser -- no client-side
// fetch, no loading spinner, no API route needed for read-only data.
export default async function SalesOverviewPage() {
  const merchant = await prisma.merchant.findFirst();

  const [revenue, successfulCount, customerCount, refundCount, recentTransactions] =
    await Promise.all([
      prisma.transaction.aggregate({
        where: { merchantId: merchant?.id, status: "success" },
        _sum: { amountKobo: true },
      }),
      prisma.transaction.count({
        where: { merchantId: merchant?.id, status: "success" },
      }),
      prisma.customer.count({ where: { merchantId: merchant?.id } }),
      prisma.refund.count({ where: { merchantId: merchant?.id } }),
      prisma.transaction.findMany({
        where: { merchantId: merchant?.id },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { customer: true },
      }),
    ]);

  const totalRevenueKobo = revenue._sum.amountKobo ?? 0;

  return (
    <div className="px-8 py-8">
      <header className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
          Sales overview
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {merchant ? merchant.businessName : "No merchant configured"}
        </p>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total revenue">
          <Money amountKobo={totalRevenueKobo} />
        </StatCard>
        <StatCard label="Successful transactions">
          <span className="money">{successfulCount.toLocaleString("en-NG")}</span>
        </StatCard>
        <StatCard label="Customers">
          <span className="money">{customerCount.toLocaleString("en-NG")}</span>
        </StatCard>
        <StatCard label="Refunds">
          <span className="money">{refundCount.toLocaleString("en-NG")}</span>
        </StatCard>
      </div>

      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="font-[family-name:var(--font-display)] text-sm font-medium text-[var(--color-ink)]">
            Recent transactions
          </h2>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">
            No transactions yet. Once a real Paystack test payment comes through
            the webhook, it&apos;ll show up here.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <th className="px-5 py-3 font-normal">Customer</th>
                <th className="px-5 py-3 font-normal">Reference</th>
                <th className="px-5 py-3 font-normal">Status</th>
                <th className="px-5 py-3 text-right font-normal">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="border-t border-[var(--color-border)]">
                  <td className="px-5 py-3">{tx.customer?.email ?? "—"}</td>
                  <td className="px-5 py-3 font-[family-name:var(--font-mono)] text-xs text-[var(--color-muted)]">
                    {tx.paystackReference}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Money amountKobo={tx.amountKobo} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-medium text-[var(--color-ink)]">{children}</p>
    </div>
  );
}
