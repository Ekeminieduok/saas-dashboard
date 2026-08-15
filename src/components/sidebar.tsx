"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Sales overview" },
  { href: "/payment-links", label: "Payment links" },
  { href: "/transactions", label: "Transactions" },
  { href: "/customers", label: "Customers" },
  { href: "/refunds", label: "Refunds" },
  { href: "/analytics", label: "Analytics" },
  { href: "/api-keys", label: "API keys" },
  { href: "/webhooks", label: "Webhooks" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-ink)]">
      <div className="px-5 py-6">
        <span className="font-[family-name:var(--font-display)] text-lg font-medium tracking-tight text-white">
          Ledger
        </span>
      </div>

      <nav className="flex-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-[var(--color-jade)]" />
              )}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-xs text-white/40">Test mode</p>
      </div>
    </aside>
  );
}
