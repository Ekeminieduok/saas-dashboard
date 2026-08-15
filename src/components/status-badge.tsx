const STYLES: Record<string, string> = {
  success: "bg-[var(--color-jade-soft)] text-[var(--color-jade)]",
  pending: "bg-[var(--color-amber-soft)] text-[var(--color-amber)]",
  failed: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
  abandoned: "bg-[var(--color-border)] text-[var(--color-muted)]",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        STYLES[status] ?? STYLES.abandoned
      }`}
    >
      {status}
    </span>
  );
}
