/**
 * Payment provider abstraction. Implementations:
 *   - mock: instantly credits coins (for sandbox / dev)
 *   - buymeacoffee: real payments via Buy Me a Coffee shop/extras
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
    return {
      paymentId: "",
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

class BuyMeACoffeeProvider implements PaymentProvider {
  name = "buymeacoffee";
  private productMap: Record<number, string>;
  private username: string;

  constructor() {
    this.username = process.env.BUYMEACOFFEE_USERNAME || "";
    this.productMap = {
      500: process.env.BUYMEACOFFEE_PRODUCT_500 || "",
      1500: process.env.BUYMEACOFFEE_PRODUCT_1500 || "",
      5000: process.env.BUYMEACOFFEE_PRODUCT_5000 || "",
      12000: process.env.BUYMEACOFFEE_PRODUCT_12000 || "",
    };
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const productSlug = this.productMap[input.coins];
    if (!productSlug) {
      throw new Error(`No Buy Me a Coffee product configured for ${input.coins} coins`);
    }
    if (!this.username) {
      throw new Error("BUYMEACOFFEE_USERNAME is not configured");
    }
    const paymentId = input.metadata?.paymentId || `bmac_${input.userId}_${Date.now()}`;
    const checkoutUrl = `https://www.buymeacoffee.com/${this.username}/products/${productSlug}`;
    return {
      paymentId,
      provider: "buymeacoffee",
      providerRef: paymentId,
      checkoutUrl,
      status: "PENDING",
    };
  }

  async verifyPayment(_providerRef: string): Promise<VerifyPaymentResult> {
    return { status: "PENDING" };
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
  if (name === "buymeacoffee" || name === "bmac") return new BuyMeACoffeeProvider();
  if (name === "stripe") return new StripeProvider();
  return new MockProvider();
}
