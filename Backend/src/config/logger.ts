import pino from "pino";
import { env } from "./env";

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "req.headers['x-csrf-token']",
      "res.headers['set-cookie']",
      "*.password",
      "*.passwordHash",
      "*.token",
      "*.secret",
    ],
    censor: "[REDACTED]",
  },
});
