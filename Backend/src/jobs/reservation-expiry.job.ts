import { logger } from "../config/logger";
import { redis } from "../config/redis";
import { expireStaleReservations } from "../features/seat-reservations";

const LOCK_KEY = "lock:cineview:reservation-expiry";
const INTERVAL_MS = 60_000;

export function startReservationExpiryJob(): NodeJS.Timeout {
  return setInterval(async () => {
    try {
      // Multi-instance coordination via Redis SET NX EX
      const acquired = await redis.set(LOCK_KEY, "1", "EX", 50, "NX");
      if (!acquired) return;

      const expiredCount = await expireStaleReservations();
      if (expiredCount > 0) {
        logger.info({ expiredCount }, "Expired stale seat reservations");
      }
    } catch (error) {
      logger.error({ err: error }, "Reservation expiry job failed");
    }
  }, INTERVAL_MS);
}
