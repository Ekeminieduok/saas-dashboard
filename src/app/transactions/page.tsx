import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Money } from "@/components/money";
import { StatusBadge } from "@/components/status-badge";

const STATUS_TABS = ["all", "success", "pending", "failed", "abandoned"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

// Next.js passes route params/searchParams as Promises now (App Router,
// Next 15+) so pages can start streaming before they resolve. We await
// it like any other async data source.
export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus: StatusTab = STATUS_TABS.includes(status as StatusTab)
    ? (status as StatusTab)
    : "all";

  const merchant = await prisma.merchant.findFirst();

  const transactions = await prisma.transaction.findMany({
    where: {
      merchantId: merchant?.id,
      ...(activeStatus !== "all" ? { status: activeStatus } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { customer: true },
  });

  return (
    <div className="px-8 py-8">
      <header className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Every payment synced from Paystack, most recent first.
        </p>
      </header>

      <div className="mb-5 flex gap-1 border-b border-[var(--color-border)]">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab}
            href={tab === "all" ? "/transactions" : `/transactions?status=${tab}`}
            className={`border-b-2 px-3 py-2 text-sm capitalize transition-colors ${
              activeStatus === tab
                ? "border-[var(--color-jade)] text-[var(--color-ink)]"
                : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            {tab}
          </Link>
        ))}
      </div>

      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        {transactions.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">
            No {activeStatus !== "all" ? activeStatus : ""} transactions yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <th className="px-5 py-3 font-normal">Date</th>
                <th className="px-5 py-3 font-normal">Customer</th>
                <th className="px-5 py-3 font-normal">Reference</th>
                <th className="px-5 py-3 font-normal">Channel</th>
                <th className="px-5 py-3 font-normal">Status</th>
                <th className="px-5 py-3 text-right font-normal">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t border-[var(--color-border)]">
                  <td className="px-5 py-3 text-[var(--color-muted)]">
                    {tx.createdAt.toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3">{tx.customer?.email ?? "—"}</td>
                  <td className="px-5 py-3 font-[family-name:var(--font-mono)] text-xs text-[var(--color-muted)]">
                    {tx.paystackReference}
                  </td>
                  <td className="px-5 py-3 capitalize text-[var(--color-muted)]">
                    {tx.channel ?? "—"}
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
