import Redis from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: env.NODE_ENV === "test" ? 1 : 3,
  enableOfflineQueue: env.NODE_ENV !== "test",
});

redis.on("error", (err) => {
  if (env.NODE_ENV !== "test") {
    logger.error({ err: err.message }, "Redis connection error");
  }
});
