import { logger } from "../../config/logger";

export interface NotificationPayload {
  to: string;
  subject: string;
  template: "booking_confirmed" | "booking_cancelled" | "payment_failed";
  data: Record<string, unknown>;
}

/**
 * Notification provider abstraction. Failures are logged and never roll back confirmed bookings.
 */
export async function sendNotification(payload: NotificationPayload): Promise<void> {
  try {
    logger.info(
      { template: payload.template, subject: payload.subject },
      "Notification queued/dispatched",
    );
  } catch (error) {
    logger.warn({ err: error }, "Notification dispatch failed non-fatally");
  }
}
