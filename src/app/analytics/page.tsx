import { prisma } from "@/lib/prisma";
import { RevenueChart } from "@/components/revenue-chart";
import { Money } from "@/components/money";

type DailyRow = { day: Date; total: bigint | null };

export default async function AnalyticsPage() {
  const merchant = await prisma.merchant.findFirst();
  if (!merchant) {
    return (
      <div className="px-8 py-8 text-sm text-[var(--color-muted)]">
        No merchant configured.
      </div>
    );
  }

  // Prisma's groupBy groups by exact column values, not truncated dates --
  // there's no built-in "group revenue by day" operation. This needs raw
  // SQL. $queryRaw is a tagged template: values you interpolate (like
  // merchant.id below) are automatically parameterized, not string-
  // concatenated, so this is just as safe against SQL injection as a
  // normal Prisma query.
  const rows = await prisma.$queryRaw<DailyRow[]>`
    SELECT date_trunc('day', "paidAt") as day, SUM("amountKobo") as total
    FROM "Transaction"
    WHERE "merchantId" = ${merchant.id}
      AND status = 'success'
      AND "paidAt" >= NOW() - INTERVAL '30 days'
    GROUP BY day
    ORDER BY day ASC
  `;

  // Postgres SUM() returns a value Prisma maps to BigInt, and the query
  // above only returns days that actually had a transaction -- a day
  // with zero revenue is simply absent, not present with 0. Both need
  // fixing before this is chart-ready: fill in every day of the last
  // 30, defaulting missing ones to 0, and convert BigInt to Number
  // (BigInt can't be sent to a Client Component as a prop).
  const revenueByDay = new Map(
    rows.map((r) => [r.day.toISOString().slice(0, 10), Number(r.total ?? 0)])
  );

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const key = date.toISOString().slice(0, 10);
    return { date: key, revenueKobo: revenueByDay.get(key) ?? 0 };
  });

  const totalKobo = last30Days.reduce((sum, d) => sum + d.revenueKobo, 0);
  const bestDay = last30Days.reduce((max, d) => (d.revenueKobo > max.revenueKobo ? d : max), last30Days[0]);

  return (
    <div className="px-8 py-8">
      <header className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Revenue over the last 30 days.
        </p>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Last 30 days
          </p>
          <p className="mt-2 text-2xl font-medium text-[var(--color-ink)]">
            <Money amountKobo={totalKobo} />
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Best day
          </p>
          <p className="mt-2 text-2xl font-medium text-[var(--color-ink)]">
            <Money amountKobo={bestDay.revenueKobo} />
          </p>
        </div>
      </div>

      <section className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <RevenueChart data={last30Days} />
      </section>
    </div>
  );
}
