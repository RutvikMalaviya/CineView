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
import { getCinemaById } from "../cinemas";
import { AuditoriumModel, type AuditoriumAttributes } from "./auditorium.model";

async function assertCinemaAccess(req: Request, cinemaId: string): Promise<void> {
  if (req.user?.role === ROLES.SUPER_ADMIN) return;
  const cinema = await getCinemaById(cinemaId);
  if (cinema.adminUserId !== req.user?.id) {
    throw new AppError(
      "You are not assigned to manage this cinema",
      HTTP_STATUS.FORBIDDEN,
      "CINEMA_ACCESS_DENIED",
    );
  }
}

const rowConfigSchema = z.object({
  rowLabel: z.string().min(1).max(10),
  seatCount: z.number().int().min(1).max(40),
  aisleAfterSeats: z.array(z.number().int().min(1)),
  category: z.enum(["standard", "premium", "vip", "accessible"]),
  priceMultiplier: z.number().positive(),
  elevationY: z.number(),
  zOffset: z.number(),
});

const updateAuditoriumSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  format: z.string().min(1).max(60).optional(),
  screenWidth: z.number().positive().optional(),
  screenHeight: z.number().positive().optional(),
  screenPosition: z.tuple([z.number(), z.number(), z.number()]).optional(),
  screenCurveRadius: z.number().positive().optional(),
  speakerCount: z.number().int().positive().optional(),
  acousticProfile: z.string().min(1).max(120).optional(),
  rows: z.array(rowConfigSchema).min(1).optional(),
});

const createAuditoriumSchema = z.object({
  cinemaId: z.string().min(1).max(40),
  name: z.string().trim().min(2).max(150),
  format: z.string().trim().min(2).max(60).default("Standard 2D"),
  screenWidth: z.number().positive().default(18),
  screenHeight: z.number().positive().default(10),
  screenCurveRadius: z.number().positive().default(40),
  speakerCount: z.number().int().positive().default(32),
  acousticProfile: z.string().trim().min(2).max(120).default("Dolby Atmos 32-Channel"),
  rowCount: z.number().int().min(2).max(16).default(6),
  seatsPerRow: z.number().int().min(4).max(24).default(12),
});

function generateDefaultRows(rowCount: number, seatsPerRow: number) {
  const aisle = Math.floor(seatsPerRow / 2);
  return Array.from({ length: rowCount }, (_, idx) => {
    const rowLabel = String.fromCharCode(65 + idx);
    const isVip = idx >= rowCount - 2;
    const isPremium = !isVip && idx >= Math.floor(rowCount / 2);
    return {
      rowLabel,
      seatCount: seatsPerRow,
      aisleAfterSeats: [aisle],
      category: (isVip ? "vip" : isPremium ? "premium" : "standard") as
        | "standard"
        | "premium"
        | "vip",
      priceMultiplier: isVip ? 1.35 : isPremium ? 1.15 : 1.0,
      elevationY: Number((0.4 + idx * 0.4).toFixed(2)),
      zOffset: Number((-3.5 + idx * 1.5).toFixed(2)),
    };
  });
}

export async function getAuditoriumById(id: string): Promise<AuditoriumAttributes> {
  const aud = await AuditoriumModel.findOne({
    where: { id, isDeleted: false, isActive: true },
  });
  if (!aud) {
    throw new AppError("Auditorium not found", HTTP_STATUS.NOT_FOUND, "AUDITORIUM_NOT_FOUND");
  }
  return aud.get({ plain: true });
}

export async function getAuditoriumsByCinema(cinemaId: string): Promise<AuditoriumAttributes[]> {
  const rows = await AuditoriumModel.findAll({
    where: { cinemaId, isDeleted: false, isActive: true },
    order: [["name", "ASC"]],
  });
  return rows.map((r) => r.get({ plain: true }));
}

export const auditoriumsRouter = Router();

auditoriumsRouter.get(
  "/cinema/:cinemaId",
  asyncHandler(async (req: Request, res: Response) => {
    const list = await getAuditoriumsByCinema(String(req.params.cinemaId));
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", list);
  }),
);

auditoriumsRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const aud = await getAuditoriumById(String(req.params.id));
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", aud);
  }),
);

auditoriumsRouter.post(
  "/",
  requireAuth,
  requireRole(ROLES.SUPER_ADMIN, ROLES.CINEMA_ADMIN),
  validateRequest({ body: createAuditoriumSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as z.infer<typeof createAuditoriumSchema>;
    await assertCinemaAccess(req, body.cinemaId);
    const rows = generateDefaultRows(body.rowCount, body.seatsPerRow);
    const now = Math.floor(Date.now() / 1000);
    const created = await AuditoriumModel.create({
      cinemaId: body.cinemaId,
      name: body.name,
      format: body.format,
      screenWidth: body.screenWidth,
      screenHeight: body.screenHeight,
      screenPosition: [0, 5.2, -12],
      screenCurveRadius: body.screenCurveRadius,
      speakerCount: body.speakerCount,
      acousticProfile: body.acousticProfile,
      rows,
      defaultRows: rows,
      createdAt: now,
      createdBy: req.user!.id,
    });
    sendSuccess(res, HTTP_STATUS.CREATED, "responses.success", created.get({ plain: true }));
  }),
);

auditoriumsRouter.put(
  "/:id",
  requireAuth,
  requireRole(ROLES.SUPER_ADMIN, ROLES.CINEMA_ADMIN),
  validateRequest({ body: updateAuditoriumSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const aud = await AuditoriumModel.findOne({
      where: { id: String(req.params.id), isDeleted: false },
    });
    if (!aud) {
      throw new AppError("Auditorium not found", HTTP_STATUS.NOT_FOUND, "AUDITORIUM_NOT_FOUND");
    }
    await assertCinemaAccess(req, aud.cinemaId);
    await aud.update({
      ...(req.body as z.infer<typeof updateAuditoriumSchema>),
      updatedAt: Math.floor(Date.now() / 1000),
      updatedBy: req.user!.id,
    });
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", aud.get({ plain: true }));
  }),
);

auditoriumsRouter.post(
  "/:id/reset",
  requireAuth,
  requireRole(ROLES.SUPER_ADMIN, ROLES.CINEMA_ADMIN),
  asyncHandler(async (req: Request, res: Response) => {
    const aud = await AuditoriumModel.findOne({
      where: { id: String(req.params.id), isDeleted: false },
    });
    if (!aud) {
      throw new AppError("Auditorium not found", HTTP_STATUS.NOT_FOUND, "AUDITORIUM_NOT_FOUND");
    }
    await assertCinemaAccess(req, aud.cinemaId);
    await aud.update({
      rows: aud.defaultRows,
      updatedAt: Math.floor(Date.now() / 1000),
      updatedBy: req.user!.id,
    });
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", aud.get({ plain: true }));
  }),
);
