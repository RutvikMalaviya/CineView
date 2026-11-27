import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { env } from "../../config/env";
import { redis } from "../../config/redis";

export function createRateLimiter(options?: { windowMs?: number; max?: number; prefix?: string }) {
  const windowMs = options?.windowMs ?? 15 * 60 * 1000;
  const max = options?.max ?? 200;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please try again shortly.",
      code: "RATE_LIMITED",
    },
    ...(env.NODE_ENV !== "test"
      ? {
          store: new RedisStore({
            prefix: options?.prefix ?? "rl:cineview:",
            sendCommand: (...args: string[]) =>
              redis.call(args[0], ...args.slice(1)) as Promise<number>,
          }),
        }
      : {}),
  });
}

export const globalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  prefix: "rl:global:",
});
