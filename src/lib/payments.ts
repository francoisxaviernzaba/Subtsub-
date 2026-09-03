/**
 * Payment provider abstraction. Implementations:
 *   - mock: instantly credits coins (for sandbox / dev)
 *   - cryptomus: real crypto payments via Cryptomus
 *   - stripe: real Stripe checkout
 * Add more providers by implementing this interface.
 */

import crypto from "node:crypto";

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

class CryptomusProvider implements PaymentProvider {
  name = "cryptomus";
  private merchantId: string;
  private apiKey: string;
  private baseUrl = "https://api.cryptomus.com/v1";

  constructor() {
    this.merchantId = process.env.CRYPTOMUS_MERCHANT_ID || "";
    this.apiKey = process.env.CRYPTOMUS_API_KEY || "";
  }

  private sign(params: Record<string, string>): string {
    const filtered: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) filtered[k] = String(v);
    }
    const data = Object.keys(filtered)
      .sort()
      .map((k) => `${k}${filtered[k]}`)
      .join("");
    return crypto.createHash("md5").update(`${this.merchantId}${this.apiKey}${data}`).digest("hex");
  }

  private async request(path: string, body: Record<string, any>) {
    const sign = this.sign(body);
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        merchant: this.merchantId,
        sign,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Cryptomus API error ${res.status}: ${text}`);
    }
    const json = await res.json();
    if (json.state !== 0) {
      throw new Error(json.message || "Cryptomus request failed");
    }
    return json.result;
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    if (!this.merchantId || !this.apiKey) {
      throw new Error("Cryptomus credentials are not configured");
    }
    const orderId = `sub2sub_${input.userId}_${Date.now()}`;
    const amount = (input.amountCents / 100).toFixed(2);
    const body: Record<string, string> = {
      amount,
      currency: input.currency,
      order_id: orderId,
      url_redirect: input.successUrl,
      url_callback: `${process.env.NEXTAUTH_URL}/api/payments/cryptomus/webhook`,
      lifetime: String(3600),
    };
    const result = await this.request("/payment", body);
    return {
      paymentId: result.uuid || orderId,
      provider: "cryptomus",
      providerRef: result.uuid || orderId,
      checkoutUrl: result.url,
      status: "PENDING",
    };
  }

  async verifyPayment(providerRef: string): Promise<VerifyPaymentResult> {
    if (!this.merchantId || !this.apiKey) {
      return { status: "PENDING" };
    }
    try {
      const result = await this.request(`/payment/${encodeURIComponent(providerRef)}`, {});
      const status = result.status === "paid" || result.status === "completed" ? "SUCCEEDED" : result.status === "failed" || result.status === "canceled" ? "FAILED" : "PENDING";
      return { status, providerRef };
    } catch {
      return { status: "PENDING" };
    }
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
  if (name === "cryptomus") return new CryptomusProvider();
  if (name === "stripe") return new StripeProvider();
  return new MockProvider();
}
