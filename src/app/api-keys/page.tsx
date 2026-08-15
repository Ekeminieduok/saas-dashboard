import { prisma } from "@/lib/prisma";
import { ApiKeysManager } from "@/components/api-keys-manager";

export default async function ApiKeysPage() {
  const merchant = await prisma.merchant.findFirst();
  const keys = await prisma.apiKey.findMany({
    where: { merchantId: merchant?.id },
    orderBy: { createdAt: "desc" },
  });

  // Only plain, serializable data can cross from a Server Component into
  // a Client Component -- Date objects don't survive that boundary, so
  // they're converted to strings here before being passed as props.
  const serializedKeys = keys.map((k) => ({
    id: k.id,
    name: k.name,
    prefix: k.prefix,
    createdAt: k.createdAt.toISOString(),
    revokedAt: k.revokedAt?.toISOString() ?? null,
  }));

  return (
    <div className="px-8 py-8">
      <header className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-ink)]">
          API keys
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Keys for programmatic access to your own dashboard&apos;s data —
          not to be confused with your Paystack secret key, which lives in
          Settings.
        </p>
      </header>

      <ApiKeysManager initialKeys={serializedKeys} />
    </div>
  );
}
