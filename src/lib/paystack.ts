const PAYSTACK_BASE_URL = "https://api.paystack.co";

// Paystack wraps every response the same way: { status, message, data }.
// This helper unwraps that once, so every call site doesn't repeat the
// same "check status, throw on failure, return .data" boilerplate.
export async function paystackRequest<T>(
  secretKey: string,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const json = await res.json();
  if (!res.ok || json.status === false) {
    throw new Error(json.message ?? `Paystack request failed: ${res.status}`);
  }
  return json.data as T;
}
