import { describe, it, expect } from "vitest";
import { createPaymentSession } from "./payment";

describe("createPaymentSession (stub)", () => {
  it("returns a stub session id, provider 'stub', and null redirectUrl", async () => {
    const r = await createPaymentSession({
      orderId: "order_abc",
      amountCents: 5085,
      customerEmail: "test@example.com",
      description: "Test order",
    });
    expect(r.provider).toBe("stub");
    expect(r.redirectUrl).toBeNull();
    expect(r.paymentSessionId).toMatch(/^stub_order_abc_\d+$/);
  });

  it("returns a different session id for repeated calls", async () => {
    const a = await createPaymentSession({
      orderId: "order_x",
      amountCents: 1,
      customerEmail: "a@b.c",
      description: "x",
    });
    // Small delay to ensure Date.now() advances on fast machines (ms precision).
    await new Promise((res) => setTimeout(res, 2));
    const b = await createPaymentSession({
      orderId: "order_x",
      amountCents: 1,
      customerEmail: "a@b.c",
      description: "x",
    });
    expect(a.paymentSessionId).not.toBe(b.paymentSessionId);
  });
});
