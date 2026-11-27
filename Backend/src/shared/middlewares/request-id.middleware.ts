import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header("x-request-id");
  const requestId =
    incoming && /^[a-zA-Z0-9_-]{8,64}$/.test(incoming) ? incoming : crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}
