import crypto from "node:crypto";

// Generates a raw API key like: mk_live_a1b2c3d4e5f6...
// "mk" = your product's prefix (Merchant + Ledger). Real platforms
// prefix keys this way so a key found in a leaked file (e.g. committed
// to GitHub by mistake) is instantly identifiable as "this is a
// Ledger key" -- useful for automated leak-scanning tools.
export function generateApiKey() {
  const raw = crypto.randomBytes(24).toString("base64url"); // 32 chars, URL-safe
  const fullKey = `mk_live_${raw}`;
  const prefix = fullKey.slice(0, 12); // shown in the UI so merchants can tell keys apart
  return { fullKey, prefix };
}

// One-way hash for storage. Same principle as password hashing: given
// the hash, you cannot recover the original key. When a request comes
// in with a key, you hash *that* and compare hashes -- never store or
// compare the raw key itself.
export function hashApiKey(key: string) {
  return crypto.createHash("sha256").update(key).digest("hex");
}
