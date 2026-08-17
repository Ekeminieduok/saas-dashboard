"use client";

import { useState, useTransition } from "react";
import { createApiKey, revokeApiKey } from "@/app/api-keys/actions";

type ApiKeyRow = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  revokedAt: string | null;
};

export function ApiKeysManager({ initialKeys }: { initialKeys: ApiKeyRow[] }) {
  const [name, setName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      const fullKey = await createApiKey(name.trim());
      setRevealedKey(fullKey);
      setName("");
    });
  }

  return (
    <div>
      {revealedKey && (
        <div className="mb-5 rounded-lg border border-[var(--color-amber)] bg-[var(--color-amber-soft)] p-4">
          <p className="text-sm font-medium text-[var(--color-ink)]">
            Copy this key now — it won&apos;t be shown again.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded bg-white px-3 py-2 font-[family-name:var(--font-mono)] text-xs">
              {revealedKey}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(revealedKey)}
              className="rounded-md bg-[var(--color-ink)] px-3 py-2 text-xs text-white"
            >
              Copy
            </button>
          </div>
          <button
            onClick={() => setRevealedKey(null)}
            className="mt-2 text-xs text-[var(--color-muted)] underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Key name, e.g. Production key"
          className="flex-1 rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-jade)]"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-[var(--color-jade)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Creating…" : "Create key"}
        </button>
      </form>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        {initialKeys.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[var(--color-muted)]">
            No API keys yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <th className="px-5 py-3 font-normal">Name</th>
                <th className="px-5 py-3 font-normal">Key</th>
                <th className="px-5 py-3 font-normal">Created</th>
                <th className="px-5 py-3 font-normal">Status</th>
                <th className="px-5 py-3 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {initialKeys.map((key) => (
                <tr key={key.id} className="border-t border-[var(--color-border)]">
                  <td className="px-5 py-3 text-[var(--color-ink)]">{key.name}</td>
                  <td className="px-5 py-3 font-[family-name:var(--font-mono)] text-xs text-[var(--color-muted)]">
                    {key.prefix}…
                  </td>
                  <td className="px-5 py-3 text-[var(--color-muted)]">
                    {new Date(key.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    {key.revokedAt ? (
                      <span className="inline-block rounded-full bg-[var(--color-danger-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-danger)]">
                        Revoked
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-[var(--color-jade-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-jade)]">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {!key.revokedAt && (
                      <button
                        onClick={() => startTransition(() => revokeApiKey(key.id))}
                        className="text-xs text-[var(--color-danger)] underline"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
