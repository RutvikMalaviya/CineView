import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ROLES } from "../../shared/constants/roles";
import { AppError } from "../../shared/errors/app-error";
import { requireAuth } from "../../shared/middlewares/auth.middleware";
import { requireRole } from "../../shared/middlewares/role.middleware";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { sendSuccess } from "../../shared/utils/response";
import { CinemaModel, type CinemaAttributes } from "./cinema.model";

const listCinemasQuerySchema = z.object({
  city: z.string().trim().max(100).optional(),
});

const createCinemaSchema = z.object({
  name: z.string().trim().min(2).max(180),
  tier: z.string().trim().max(80).default("Flagship"),
  city: z.string().trim().min(2).max(100),
  address: z.string().trim().min(4).max(300),
  distanceMiles: z.number().nonnegative().default(1.0),
  facilities: z.array(z.string()).default([]),
  imageUrl: z.string().trim().min(1).max(500),
  parkingInfo: z.string().trim().max(300).default(""),
});

export async function listCinemas(city?: string): Promise<CinemaAttributes[]> {
  const rows = await CinemaModel.findAll({
    where: { isDeleted: false, isActive: true },
    order: [["distanceMiles", "ASC"]],
  });
  const list = rows.map((r) => r.get({ plain: true }));
  if (!city || city === "All Cities") return list;
  return list.filter((c) => c.city.toLowerCase() === city.toLowerCase());
}

export async function getCinemaById(id: string): Promise<CinemaAttributes> {
  const cinema = await CinemaModel.findOne({
    where: { id, isDeleted: false, isActive: true },
  });
  if (!cinema) {
    throw new AppError("Cinema not found", HTTP_STATUS.NOT_FOUND, "CINEMA_NOT_FOUND");
  }
  return cinema.get({ plain: true });
}

export const cinemasRouter = Router();

cinemasRouter.get(
  "/",
  validateRequest({ query: listCinemasQuerySchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const cinemas = await listCinemas(req.query.city as string | undefined);
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", cinemas);
  }),
);

cinemasRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const cinema = await getCinemaById(String(req.params.id));
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", cinema);
  }),
);

cinemasRouter.post(
  "/",
  requireAuth,
  requireRole(ROLES.SUPER_ADMIN, ROLES.CINEMA_ADMIN),
  validateRequest({ body: createCinemaSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const now = Math.floor(Date.now() / 1000);
    const created = await CinemaModel.create({
      ...(req.body as z.infer<typeof createCinemaSchema>),
      adminUserId: req.user!.id,
      createdAt: now,
      createdBy: req.user!.id,
    });
    sendSuccess(res, HTTP_STATUS.CREATED, "responses.success", created.get({ plain: true }));
  }),
);
