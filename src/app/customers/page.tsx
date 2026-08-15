import { prisma } from "@/lib/prisma";
import { Money } from "@/components/money";

// One Prisma query, using groupBy to aggregate per-customer totals
// directly in Postgres, rather than fetching every transaction and
// summing in JavaScript. For a table with thousands of rows, doing
// the math in the database is the difference between a fast query
// and a slow one.
export default async function CustomersPage() {
  const merchant = await prisma.merchant.findFirst();

  const customers = await prisma.customer.findMany({
    where: { merchantId: merchant?.id },
    orderBy: { createdAt: "desc" },
  });

  const spendByCustomer = await prisma.transaction.groupBy({
    by: ["customerId"],
    where: { merchantId: merchant?.id, status: "success" },
    _sum: { amountKobo: true },
    _count: { _all: true },
  });

  // groupBy returns a flat list keyed by customerId — turn it into a
  // lookup map so each customer row can find its own totals in O(1).
  const spendMap = new Map(
    spendByCustomer
      .filter((row) => row.customerId !== null)
      .map((row) => [
        row.customerId as string,
        { totalKobo: row._sum.amountKobo ?? 0, count: row._count._all },
      ])
  );

  return (
    <div className="px-8 py-8">
      <header className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
          Customers
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Everyone who's paid you, synced automatically from transactions.
        </p>
      </header>

      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        {customers.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">
            No customers yet. They&apos;re created automatically the first
            time someone pays you.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <th className="px-5 py-3 font-normal">Customer</th>
                <th className="px-5 py-3 font-normal">First seen</th>
                <th className="px-5 py-3 text-right font-normal">Transactions</th>
                <th className="px-5 py-3 text-right font-normal">Total spent</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const stats = spendMap.get(customer.id) ?? { totalKobo: 0, count: 0 };
                return (
                  <tr key={customer.id} className="border-t border-[var(--color-border)]">
                    <td className="px-5 py-3">
                      <div className="text-[var(--color-ink)]">
                        {customer.name ?? customer.email}
                      </div>
                      {customer.name && (
                        <div className="text-xs text-[var(--color-muted)]">
                          {customer.email}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[var(--color-muted)]">
                      {customer.createdAt.toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-right money">{stats.count}</td>
                    <td className="px-5 py-3 text-right">
                      <Money amountKobo={stats.totalKobo} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
