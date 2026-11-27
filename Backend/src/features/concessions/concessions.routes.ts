import type { Request, Response } from "express";
import { Router } from "express";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { asyncHandler } from "../../shared/utils/async-handler";
import { sendSuccess } from "../../shared/utils/response";
import { ConcessionModel, type ConcessionAttributes } from "./concession.model";

export async function listConcessions(): Promise<ConcessionAttributes[]> {
  const rows = await ConcessionModel.findAll({
    where: { isDeleted: false, isActive: true },
    order: [["price", "ASC"]],
  });
  return rows.map((r) => r.get({ plain: true }));
}

export async function getConcessionsByIds(ids: string[]): Promise<ConcessionAttributes[]> {
  if (ids.length === 0) return [];
  const rows = await ConcessionModel.findAll({
    where: { id: ids, isDeleted: false, isActive: true },
  });
  return rows.map((r) => r.get({ plain: true }));
}

export const concessionsRouter = Router();

concessionsRouter.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const items = await listConcessions();
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", items);
  }),
);
