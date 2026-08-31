/**
 * Payment provider abstraction. Implementations:
 *   - mock: instantly credits coins (for sandbox / dev)
 *   - stripe: real Stripe checkout
 * Add more providers by implementing this interface.
 */

export type CreatePaymentInput = {
  userId: string;
  coins: number;
  amountCents: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

export type CreatePaymentResult = {
  paymentId: string; // our internal id
  provider: string;
  providerRef: string;
  checkoutUrl?: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED";
  mock?: boolean;
};

export type VerifyPaymentResult = {
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  providerRef?: string;
};

export interface PaymentProvider {
  name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyPayment(providerRef: string): Promise<VerifyPaymentResult>;
}

class MockProvider implements PaymentProvider {
  name = "mock";
  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    // For the mock provider, we create the Payment row already in SUCCEEDED
    // and return a "checkout URL" that the client treats as instant success.
    return {
      paymentId: "", // filled in by caller
      provider: "mock",
      providerRef: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      checkoutUrl: undefined,
      status: "SUCCEEDED",
      mock: true,
    };
  }
  async verifyPayment(_providerRef: string): Promise<VerifyPaymentResult> {
    return { status: "SUCCEEDED" };
  }
}

class StripeProvider implements PaymentProvider {
  name = "stripe";
  async createPayment(_input: CreatePaymentInput): Promise<CreatePaymentResult> {
    throw new Error("Stripe provider requires STRIPE_SECRET_KEY and a real checkout session. Configure env and implement.");
  }
  async verifyPayment(_providerRef: string): Promise<VerifyPaymentResult> {
    throw new Error("Not implemented");
  }
}

export function getPaymentProvider(): PaymentProvider {
  const name = (process.env.PAYMENT_PROVIDER || "mock").toLowerCase();
  if (name === "stripe") return new StripeProvider();
  return new MockProvider();
}
