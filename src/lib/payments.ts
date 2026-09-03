/**
 * Payment provider abstraction. Implementations:
 *   - mock: instantly credits coins (for sandbox / dev)
 *   - shkeeper: real crypto payments via SHKeeper (open-source)
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
  checkoutAddress?: string;
  checkoutAmount?: string;
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

class ShkeeperProvider implements PaymentProvider {
  name = "shkeeper";
  private apiKey: string;
  private baseUrl: string;
  private crypto: string;

  constructor() {
    this.apiKey = process.env.SHKEEPER_API_KEY || "";
    this.baseUrl = (process.env.SHKEEPER_BASE_URL || "https://demo.shkeeper.io").replace(/\/$/, "");
    this.crypto = process.env.SHKEEPER_CRYPTO || "BTC";
  }

  private async request(path: string, init: RequestInit): Promise<any> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-Shkeeper-Api-Key": this.apiKey,
        ...(init.headers || {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`SHKeeper API error ${res.status}: ${text}`);
    }
    const json = await res.json();
    if (json.status === "error") {
      throw new Error(json.message || "SHKeeper request failed");
    }
    return json;
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    if (!this.apiKey) throw new Error("SHKeeper credentials are not configured");

    const externalId = input.metadata?.paymentId || `sub2sub_${input.userId}_${Date.now()}`;
    const amount = (input.amountCents / 100).toFixed(2);
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/payments/shkeeper/webhook`;

    const body = {
      external_id: externalId,
      fiat: input.currency,
      amount,
      callback_url: callbackUrl,
    };

    const result = await this.request(`/api/v1/${encodeURIComponent(this.crypto)}/payment_request`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return {
      paymentId: externalId,
      provider: "shkeeper",
      providerRef: externalId,
      checkoutUrl: result.wallet,
      checkoutAddress: result.wallet,
      checkoutAmount: result.amount,
      status: "PENDING",
    };
  }

  async verifyPayment(providerRef: string): Promise<VerifyPaymentResult> {
    if (!this.apiKey) return { status: "PENDING" };
    try {
      const result = await this.request(`/api/v1/invoices/${encodeURIComponent(providerRef)}`, { method: "GET" });
      const invoices = result.invoices || [];
      const invoice = invoices[0];
      if (!invoice) return { status: "PENDING" };
      const status = invoice.status === "PAID" || invoice.status === "OVERPAID" ? "SUCCEEDED" : invoice.status === "FAILED" || invoice.status === "CANCELED" ? "FAILED" : "PENDING";
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
  if (name === "shkeeper") return new ShkeeperProvider();
  if (name === "stripe") return new StripeProvider();
  return new MockProvider();
}
