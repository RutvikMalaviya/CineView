import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default("/api/v1"),

  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().default("cineview_dev"),
  DB_USER: z.string().default("cineview"),
  DB_PASSWORD: z.string().default(""),
  DB_SSL: z
    .string()
    .optional()
    .transform((v) => v === "true"),

  REDIS_URL: z.string().default("redis://localhost:6379"),

  SESSION_SECRET: z.string().min(32),
  SESSION_COOKIE_NAME: z.string().default("cineview.sid"),
  SESSION_TTL_SECONDS: z.coerce.number().int().positive().default(86400),
  CSRF_SECRET: z.string().min(32),
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),

  PAYMENT_PROVIDER: z.enum(["demo", "stripe"]).default("demo"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().default("whsec_demo_cineview_secret"),
  TICKET_QR_SECRET: z.string().default("demo_qr_hmac_secret_at_least_32_chars_long"),

  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
