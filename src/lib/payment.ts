// Payment provider hook — a single function the rest of the checkout
// pipeline talks to. v1 returns a stub session id so we can ship the order
// flow before wiring real Mollie/Pay.nl. Future implementations branch on
// MOLLIE_API_KEY / PAYNL_TOKEN env vars.
//
// Spec: docs/superpowers/specs/2026-05-13-lexi-cart-checkout-design.md §6

export type CreatePaymentInput = {
  orderId: string;
  amountCents: number;
  customerEmail: string;
  description: string;
};

export type CreatePaymentResult = {
  paymentSessionId: string;
  provider: "stub" | "mollie" | "paynl";
  /** Redirect URL if the provider needs a hosted checkout; null for stub. */
  redirectUrl: string | null;
};

export async function createPaymentSession(
  input: CreatePaymentInput,
): Promise<CreatePaymentResult> {
  // v1: stub. Real implementation flips on MOLLIE_API_KEY / PAYNL_TOKEN env vars.
  return {
    paymentSessionId: `stub_${input.orderId}_${Date.now()}`,
    provider: "stub",
    redirectUrl: null,
  };
}
