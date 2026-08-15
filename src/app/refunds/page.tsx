import { prisma } from "@/lib/prisma";
import { Money } from "@/components/money";
import { StatusBadge } from "@/components/status-badge";

export default async function RefundsPage() {
  const merchant = await prisma.merchant.findFirst();

  const refunds = await prisma.refund.findMany({
    where: { merchantId: merchant?.id },
    orderBy: { createdAt: "desc" },
    // A refund belongs to a Transaction, which belongs to a Customer --
    // two levels of relation, both fetched in this one query via
    // nested include, rather than three round trips to the database.
    include: {
      transaction: {
        include: { customer: true },
      },
    },
  });

  const totalRefundedKobo = refunds.reduce((sum, r) => sum + r.amountKobo, 0);

  return (
    <div className="px-8 py-8">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
            Refunds
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Money returned to customers, linked back to the original payment.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Total refunded
          </p>
          <p className="mt-1 text-lg font-medium text-[var(--color-ink)]">
            <Money amountKobo={totalRefundedKobo} />
          </p>
        </div>
      </header>

      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        {refunds.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">
            No refunds yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <th className="px-5 py-3 font-normal">Date</th>
                <th className="px-5 py-3 font-normal">Customer</th>
                <th className="px-5 py-3 font-normal">Original transaction</th>
                <th className="px-5 py-3 font-normal">Reason</th>
                <th className="px-5 py-3 font-normal">Status</th>
                <th className="px-5 py-3 text-right font-normal">Amount</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((refund) => (
                <tr key={refund.id} className="border-t border-[var(--color-border)]">
                  <td className="px-5 py-3 text-[var(--color-muted)]">
                    {refund.createdAt.toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    {refund.transaction.customer?.email ?? "—"}
                  </td>
                  <td className="px-5 py-3 font-[family-name:var(--font-mono)] text-xs text-[var(--color-muted)]">
                    {refund.transaction.paystackReference}
                  </td>
                  <td className="px-5 py-3 text-[var(--color-muted)]">
                    {refund.reason ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={refund.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Money amountKobo={refund.amountKobo} />
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
