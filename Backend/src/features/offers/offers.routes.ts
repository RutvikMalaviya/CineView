import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { AppError } from "../../shared/errors/app-error";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { sendSuccess } from "../../shared/utils/response";
import { OfferModel, type OfferAttributes } from "./offer.model";

export async function listOffers(): Promise<OfferAttributes[]> {
  const rows = await OfferModel.findAll({
    where: { isDeleted: false, isActive: true },
    order: [["createdAt", "ASC"]],
  });
  return rows.map((r) => r.get({ plain: true }));
}

export async function findOfferByCode(code: string): Promise<OfferAttributes | null> {
  const offer = await OfferModel.findOne({
    where: { code: code.trim().toUpperCase(), isDeleted: false, isActive: true },
  });
  return offer ? offer.get({ plain: true }) : null;
}

export const offersRouter = Router();

offersRouter.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const offers = await listOffers();
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", offers);
  }),
);

offersRouter.post(
  "/validate",
  validateRequest({ body: z.object({ code: z.string().trim().min(1).max(40) }) }),
  asyncHandler(async (req: Request, res: Response) => {
    const offer = await findOfferByCode((req.body as { code: string }).code);
    if (!offer) {
      throw new AppError("Invalid or expired promo code", HTTP_STATUS.NOT_FOUND, "OFFER_NOT_FOUND");
    }
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", offer);
  }),
);
