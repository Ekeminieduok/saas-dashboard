import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const merchant = await prisma.merchant.findFirst();

  if (!merchant) {
    return (
      <div className="px-8 py-8 text-sm text-[var(--color-muted)]">
        No merchant configured.
      </div>
    );
  }

  const maskedKey = `${merchant.paystackSecretKey.slice(0, 10)}${"•".repeat(20)}`;

  return (
    <div className="px-8 py-8 max-w-xl">
      <header className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
          Settings
        </h1>
      </header>

      <h2 className="mb-2 text-sm font-medium text-[var(--color-ink)]">
        Business profile
      </h2>
      <SettingsForm
        initialBusinessName={merchant.businessName}
        initialEmail={merchant.email}
      />

      <h2 className="mb-2 mt-8 text-sm font-medium text-[var(--color-ink)]">
        Paystack connection
      </h2>
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="mb-1 text-xs font-medium text-[var(--color-muted)]">
          Secret key
        </p>
        <code className="block rounded bg-[var(--background)] px-3 py-2 font-[family-name:var(--font-mono)] text-xs text-[var(--color-muted)]">
          {maskedKey}
        </code>
        <p className="mt-3 text-xs text-[var(--color-amber)]">
          Stored as plain text in the database for now — fine for a local
          learning project, not for anything real. See the note below.
        </p>
      </div>
    </div>
  );
}
