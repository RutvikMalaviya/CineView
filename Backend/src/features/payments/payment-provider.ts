import crypto from "crypto";
import { env } from "../../config/env";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { AppError } from "../../shared/errors/app-error";

export interface PaymentIntentResult {
  provider: "demo_stripe" | "stripe";
  paymentIntentId: string;
  clientSecret: string;
  status: "requires_confirmation" | "succeeded" | "failed";
  failureReason?: string;
}

export interface PaymentProvider {
  readonly providerName: "demo_stripe" | "stripe";
  createPaymentIntent(input: {
    amountCents: number;
    currency: string;
    idempotencyKey: string;
    metadata: Record<string, string>;
  }): Promise<PaymentIntentResult>;

  confirmPaymentIntent(input: {
    paymentIntentId: string;
    clientSecret: string;
    simulateFailure?: boolean;
  }): Promise<PaymentIntentResult>;

  verifyWebhookSignature(payloadString: string, signatureHeader: string): boolean;
}

class DemoStripeProvider implements PaymentProvider {
  public readonly providerName = "demo_stripe" as const;

  async createPaymentIntent(_input: {
    amountCents: number;
    currency: string;
    idempotencyKey: string;
    metadata: Record<string, string>;
  }): Promise<PaymentIntentResult> {
    const id = `pi_demo_${crypto.randomBytes(12).toString("hex")}`;
    const secret = `${id}_secret_${crypto.randomBytes(16).toString("hex")}`;
    return {
      provider: this.providerName,
      paymentIntentId: id,
      clientSecret: secret,
      status: "requires_confirmation",
    };
  }

  async confirmPaymentIntent(input: {
    paymentIntentId: string;
    clientSecret: string;
    simulateFailure?: boolean;
  }): Promise<PaymentIntentResult> {
    if (input.simulateFailure) {
      return {
        provider: this.providerName,
        paymentIntentId: input.paymentIntentId,
        clientSecret: input.clientSecret,
        status: "failed",
        failureReason: "Your demo card was declined (simulated card_declined).",
      };
    }

    return {
      provider: this.providerName,
      paymentIntentId: input.paymentIntentId,
      clientSecret: input.clientSecret,
      status: "succeeded",
    };
  }

  verifyWebhookSignature(payloadString: string, signatureHeader: string): boolean {
    const parts = Object.fromEntries(
      signatureHeader.split(",").map((kv) => {
        const [k, v] = kv.trim().split("=");
        return [k, v];
      }),
    );

    const timestamp = parts["t"];
    const sig = parts["v1"];
    if (!timestamp || !sig) return false;

    const expected = crypto
      .createHmac("sha256", env.STRIPE_WEBHOOK_SECRET)
      .update(`${timestamp}.${payloadString}`)
      .digest("hex");

    const sigBuf = Buffer.from(sig, "utf8");
    const expBuf = Buffer.from(expected, "utf8");
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  }
}

export function getPaymentProvider(): PaymentProvider {
  if (env.PAYMENT_PROVIDER === "stripe") {
    if (!env.STRIPE_SECRET_KEY) {
      throw new AppError(
        "STRIPE_SECRET_KEY is required when PAYMENT_PROVIDER=stripe",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "PAYMENT_PROVIDER_MISCONFIGURED",
      );
    }
    // Future: return new StripeProvider(env.STRIPE_SECRET_KEY)
  }
  return new DemoStripeProvider();
}
