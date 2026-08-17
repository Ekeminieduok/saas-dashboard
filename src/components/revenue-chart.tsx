"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type DailyRevenue = { date: string; revenueKobo: number };

export function RevenueChart({ data }: { data: DailyRevenue[] }) {
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-NG", { day: "numeric", month: "short" }),
    revenueNaira: d.revenueKobo / 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "var(--color-muted)" }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--color-muted)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: number) => [`₦${value.toLocaleString("en-NG")}`, "Revenue"]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid var(--color-border)",
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="revenueNaira"
          stroke="var(--color-jade)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
