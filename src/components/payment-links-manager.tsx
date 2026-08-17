"use client";

import { useState, useTransition } from "react";
import { createPaymentLink, togglePaymentLink } from "@/app/payment-links/actions";
import { Money } from "@/components/money";

type LinkRow = {
  id: string;
  name: string;
  slug: string;
  amountKobo: number | null;
  active: boolean;
};

export function PaymentLinksManager({ initialLinks }: { initialLinks: LinkRow[] }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        await createPaymentLink(name.trim(), amount ? Number(amount) : null);
        setName("");
        setAmount("");
      } catch (err) {
        // This is a real network call to Paystack, so it can genuinely
        // fail -- wrong/expired key, network issue, invalid input. The
        // error message Paystack sends back is shown directly, since
        // it's usually specific enough to act on ("Invalid key" etc.).
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <div>
      <form
        onSubmit={handleCreate}
        className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      >
        {error && (
          <p className="mb-3 rounded-md bg-[var(--color-danger-soft)] px-3 py-2 text-xs text-[var(--color-danger)]">
            {error}
          </p>
        )}
        <div className="mb-3 flex gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Consulting session"
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-jade)]"
            />
          </div>
          <div className="w-40">
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
              Amount (₦, optional)
            </label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              placeholder="Any amount"
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-jade)]"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-[var(--color-jade)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Creating on Paystack…" : "Create payment link"}
        </button>
      </form>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        {initialLinks.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">
            No payment links yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <th className="px-5 py-3 font-normal">Name</th>
                <th className="px-5 py-3 font-normal">Link</th>
                <th className="px-5 py-3 font-normal">Amount</th>
                <th className="px-5 py-3 font-normal">Status</th>
                <th className="px-5 py-3 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {initialLinks.map((link) => {
                const url = `https://paystack.com/pay/${link.slug}`;
                return (
                  <tr key={link.id} className="border-t border-[var(--color-border)]">
                    <td className="px-5 py-3 text-[var(--color-ink)]">{link.name}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => navigator.clipboard.writeText(url)}
                        className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-jade)] underline"
                      >
                        {url}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      {link.amountKobo ? (
                        <Money amountKobo={link.amountKobo} />
                      ) : (
                        <span className="text-[var(--color-muted)]">Any amount</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          link.active
                            ? "bg-[var(--color-jade-soft)] text-[var(--color-jade)]"
                            : "bg-[var(--color-border)] text-[var(--color-muted)]"
                        }`}
                      >
                        {link.active ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() =>
                          startTransition(() => togglePaymentLink(link.id, !link.active))
                        }
                        className="text-xs text-[var(--color-ink)] underline"
                      >
                        {link.active ? "Pause" : "Resume"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
