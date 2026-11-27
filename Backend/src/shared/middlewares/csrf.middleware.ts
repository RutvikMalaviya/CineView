import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env";
import { HTTP_STATUS } from "../constants/http-status";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_COOKIE_NAME = "cineview.csrf";
const CSRF_HEADER_NAME = "x-csrf-token";

function signToken(token: string): string {
  const hmac = crypto.createHmac("sha256", env.CSRF_SECRET).update(token).digest("hex");
  return `${token}.${hmac}`;
}

function verifySignedToken(value: string): boolean {
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [token, signature] = parts;
  if (!token || !signature) return false;
  const expected = crypto.createHmac("sha256", env.CSRF_SECRET).update(token).digest("hex");
  const sigBuf = Buffer.from(signature, "utf8");
  const expBuf = Buffer.from(expected, "utf8");
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

export function issueCsrfToken(_req: Request, res: Response): string {
  const raw = crypto.randomBytes(24).toString("hex");
  const signed = signToken(raw);
  res.cookie(CSRF_COOKIE_NAME, signed, {
    httpOnly: false, // Readable by FE to send in x-csrf-token header (double-submit cookie)
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return signed;
}

export function csrfProtectionMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  // Webhook endpoints use provider signature verification instead of CSRF
  if (req.path.startsWith("/payments/webhook")) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.header(CSRF_HEADER_NAME);

  if (
    typeof cookieToken !== "string" ||
    typeof headerToken !== "string" ||
    cookieToken !== headerToken ||
    !verifySignedToken(cookieToken)
  ) {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message:
        typeof res.__ === "function" ? res.__("responses.csrf_invalid") : "Invalid CSRF token",
      code: "CSRF_INVALID",
    });
    return;
  }

  next();
}
