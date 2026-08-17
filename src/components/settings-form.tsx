"use client";

import { useState, useTransition } from "react";
import { updateMerchantProfile } from "@/app/settings/actions";

export function SettingsForm({
  initialBusinessName,
  initialEmail,
}: {
  initialBusinessName: string;
  initialEmail: string;
}) {
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [email, setEmail] = useState(initialEmail);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await updateMerchantProfile(businessName, email);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
    >
      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
          Business name
        </label>
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-jade)]"
        />
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
          Email
        </label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-jade)]"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-[var(--color-jade)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-xs text-[var(--color-jade)]">Saved</span>}
      </div>
    </form>
  );
}
