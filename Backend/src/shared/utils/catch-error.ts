import { logger } from "../../config/logger";

export function catchError(
  error: unknown,
  fileName: string,
  methodName: string,
  requestId?: string,
): void {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error(
    {
      fileName,
      methodName,
      requestId,
      errorName: err.name,
      errorMessage: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
    "Unhandled operation error",
  );
}
