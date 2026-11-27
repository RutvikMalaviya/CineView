import { RedisStore } from "connect-redis";
import session from "express-session";
import { env } from "../../config/env";
import { redis } from "../../config/redis";

export function createSessionMiddleware() {
  const isProd = env.NODE_ENV === "production";

  return session({
    name: env.SESSION_COOKIE_NAME,
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: isProd,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: env.SESSION_TTL_SECONDS * 1000,
    },
    ...(env.NODE_ENV !== "test"
      ? {
          store: new RedisStore({
            client: redis,
            prefix: "sess:cineview:",
          }),
        }
      : {}),
  });
}
