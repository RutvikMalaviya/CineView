import { HTTP_STATUS } from "../../shared/constants/http-status";
import { AppError } from "../../shared/errors/app-error";
import { getPaymentProvider } from "./payment-provider";
import { PaymentModel, PaymentWebhookEventModel, type PaymentAttributes } from "./payment.model";

export async function createOrGetPaymentIntent(input: {
  bookingId: string;
  userId: string;
  amountCents: number;
  idempotencyKey: string;
}): Promise<PaymentAttributes> {
  const existing = await PaymentModel.findOne({
    where: { idempotencyKey: input.idempotencyKey, isDeleted: false },
  });
  if (existing) {
    return existing.get({ plain: true });
  }

  const provider = getPaymentProvider();
  const intent = await provider.createPaymentIntent({
    amountCents: input.amountCents,
    currency: "usd",
    idempotencyKey: input.idempotencyKey,
    metadata: { bookingId: input.bookingId, userId: input.userId },
  });

  const now = Math.floor(Date.now() / 1000);
  const created = await PaymentModel.create({
    bookingId: input.bookingId,
    userId: input.userId,
    provider: intent.provider,
    paymentIntentId: intent.paymentIntentId,
    clientSecret: intent.clientSecret,
    amountCents: input.amountCents,
    currency: "usd",
    status: intent.status,
    idempotencyKey: input.idempotencyKey,
    createdAt: now,
    createdBy: input.userId,
  });

  return created.get({ plain: true });
}

export async function confirmPaymentForBooking(input: {
  paymentIntentId: string;
  userId: string;
  simulateFailure?: boolean;
}): Promise<PaymentAttributes> {
  const payment = await PaymentModel.findOne({
    where: {
      paymentIntentId: input.paymentIntentId,
      userId: input.userId,
      isDeleted: false,
    },
  });

  if (!payment) {
    throw new AppError("Payment intent not found", HTTP_STATUS.NOT_FOUND, "PAYMENT_NOT_FOUND");
  }

  if (payment.status === "succeeded") {
    return payment.get({ plain: true });
  }

  const provider = getPaymentProvider();
  const result = await provider.confirmPaymentIntent({
    paymentIntentId: payment.paymentIntentId,
    clientSecret: payment.clientSecret,
    simulateFailure: input.simulateFailure,
  });

  const now = Math.floor(Date.now() / 1000);
  await payment.update({
    status: result.status,
    failureReason: result.failureReason ?? null,
    updatedAt: now,
    updatedBy: input.userId,
  });

  return payment.get({ plain: true });
}

export async function recordWebhookEvent(input: {
  eventId: string;
  eventType: string;
  payloadString: string;
  signatureHeader: string;
  payload: Record<string, unknown>;
}): Promise<{ duplicate: boolean }> {
  const provider = getPaymentProvider();
  const validSig = provider.verifyWebhookSignature(input.payloadString, input.signatureHeader);
  if (!validSig) {
    throw new AppError("Invalid webhook signature", HTTP_STATUS.UNAUTHORIZED, "INVALID_WEBHOOK_SIGNATURE");
  }

  const existing = await PaymentWebhookEventModel.findOne({
    where: { eventId: input.eventId },
  });
  if (existing) {
    return { duplicate: true };
  }

  const now = Math.floor(Date.now() / 1000);
  await PaymentWebhookEventModel.create({
    eventId: input.eventId,
    provider: provider.providerName,
    eventType: input.eventType,
    payload: input.payload,
    processedAt: now,
    createdAt: now,
    createdBy: "webhook",
  });

  return { duplicate: false };
}
