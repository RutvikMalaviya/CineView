import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env";
import { HTTP_STATUS } from "../constants/http-status";
import { AppError } from "../errors/app-error";
import { catchError } from "../utils/catch-error";

export function notFoundMiddleware(_req: Request, res: Response): void {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: typeof res.__ === "function" ? res.__("responses.not_found") : "Not found",
    code: "NOT_FOUND",
  });
}

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(env.NODE_ENV === "development" && err.details ? { details: err.details } : {}),
    });
    return;
  }

  catchError(err, "error.middleware", req.path, req.requestId);

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message:
      typeof res.__ === "function" ? res.__("responses.server_error") : "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
}
