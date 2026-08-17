"use client";

import { useState, useTransition } from "react";
import {
  createWebhookEndpoint,
  toggleWebhookEndpoint,
  deleteWebhookEndpoint,
} from "@/app/webhooks/actions";

const EVENT_OPTIONS = ["transaction.success", "refund.processed"];

type EndpointRow = {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  createdAt: string;
};

export function WebhooksManager({ initialEndpoints }: { initialEndpoints: EndpointRow[] }) {
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([EVENT_OPTIONS[0]]);
  const [isPending, startTransition] = useTransition();

  function toggleEvent(event: string) {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || selectedEvents.length === 0) return;
    startTransition(async () => {
      await createWebhookEndpoint(url.trim(), selectedEvents);
      setUrl("");
    });
  }

  return (
    <div>
      <form
        onSubmit={handleCreate}
        className="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      >
        <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
          Endpoint URL
        </label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yourapp.com/webhooks/ledger"
          className="mb-3 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-jade)]"
        />
        <label className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
          Events to send
        </label>
        <div className="mb-3 flex gap-4">
          {EVENT_OPTIONS.map((event) => (
            <label key={event} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={selectedEvents.includes(event)}
                onChange={() => toggleEvent(event)}
              />
              <span className="font-[family-name:var(--font-mono)] text-xs">{event}</span>
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-[var(--color-jade)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add endpoint"}
        </button>
      </form>

      <div className="space-y-3">
        {initialEndpoints.length === 0 ? (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-10 text-center text-sm text-[var(--color-muted)]">
            No webhook endpoints registered yet.
          </div>
        ) : (
          initialEndpoints.map((endpoint) => (
            <div
              key={endpoint.id}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--color-ink)]">
                    {endpoint.url}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {endpoint.events.join(", ")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    endpoint.active
                      ? "bg-[var(--color-jade-soft)] text-[var(--color-jade)]"
                      : "bg-[var(--color-border)] text-[var(--color-muted)]"
                  }`}
                >
                  {endpoint.active ? "Active" : "Paused"}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 overflow-x-auto rounded bg-[var(--background)] px-2 py-1.5 font-[family-name:var(--font-mono)] text-xs text-[var(--color-muted)]">
                  {endpoint.secret}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(endpoint.secret)}
                  className="rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs"
                >
                  Copy
                </button>
              </div>

              <div className="mt-3 flex gap-4 text-xs">
                <button
                  onClick={() =>
                    startTransition(() =>
                      toggleWebhookEndpoint(endpoint.id, !endpoint.active)
                    )
                  }
                  className="text-[var(--color-ink)] underline"
                >
                  {endpoint.active ? "Pause" : "Resume"}
                </button>
                <button
                  onClick={() => startTransition(() => deleteWebhookEndpoint(endpoint.id))}
                  className="text-[var(--color-danger)] underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
