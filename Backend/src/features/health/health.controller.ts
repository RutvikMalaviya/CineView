import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { sendSuccess } from "../../shared/utils/response";
import { getHealthStatus } from "./health.service";

export const healthController = {
  liveness: async (_req: Request, res: Response): Promise<void> => {
    const report = await getHealthStatus(false);
    sendSuccess(res, HTTP_STATUS.OK, "responses.healthy", report);
  },

  readiness: async (_req: Request, res: Response): Promise<void> => {
    const report = await getHealthStatus(true);
    const statusCode =
      report.status === "ok" ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;
    res.status(statusCode).json({
      success: report.status === "ok",
      message: res.__("responses.healthy"),
      data: report,
    });
  },
};
