import type { Response } from "express";

export interface ApiSuccessMeta {
  page?: number;
  limit?: number;
  total?: number;
  [key: string]: unknown;
}

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  messageKey: string,
  data: T,
  meta?: ApiSuccessMeta,
): Response {
  return res.status(statusCode).json({
    success: true,
    message: typeof res.__ === "function" ? res.__(messageKey) : messageKey,
    data,
    ...(meta ? { meta } : {}),
  });
}
