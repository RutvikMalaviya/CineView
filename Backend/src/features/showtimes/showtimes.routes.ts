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
import { getAuditoriumById } from "../auditoriums";
import { getCinemaById } from "../cinemas";
import { getActiveOccupiedSeatLabels } from "../seat-reservations";

async function assertShowtimeCinemaAccess(req: Request, cinemaId: string): Promise<void> {
  if (req.user?.role === ROLES.SUPER_ADMIN) return;
  const cinema = await getCinemaById(cinemaId);
  if (cinema.adminUserId !== req.user?.id) {
    throw new AppError(
      "You are not assigned to manage showtimes for this cinema",
      HTTP_STATUS.FORBIDDEN,
      "CINEMA_ACCESS_DENIED",
    );
  }
}
import { buildSeatsForAuditorium } from "../seats";
import { ShowtimeModel, type ShowtimeAttributes } from "./showtime.model";

const listShowtimesQuerySchema = z.object({
  movieId: z.string().trim().max(40).optional(),
  cinemaId: z.string().trim().max(40).optional(),
  date: z.string().trim().max(20).optional(),
});

const createShowtimeSchema = z.object({
  movieId: z.string().min(1).max(40),
  cinemaId: z.string().min(1).max(40),
  auditoriumId: z.string().min(1).max(40),
  date: z.string().min(4).max(20),
  time: z.string().min(3).max(10),
  format: z.string().min(2).max(60),
  language: z.string().min(2).max(40).default("English"),
  basePrice: z.number().positive(),
  badge: z.string().max(60).optional(),
});

export async function getShowtimeById(id: string): Promise<ShowtimeAttributes> {
  const st = await ShowtimeModel.findOne({
    where: { id, isDeleted: false, isActive: true },
  });
  if (!st) {
    throw new AppError("Showtime not found", HTTP_STATUS.NOT_FOUND, "SHOWTIME_NOT_FOUND");
  }
  return st.get({ plain: true });
}

export const showtimesRouter = Router();

showtimesRouter.get(
  "/",
  validateRequest({ query: listShowtimesQuerySchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const { movieId, cinemaId, date } = req.query as z.infer<typeof listShowtimesQuerySchema>;
    const where: Record<string, unknown> = { isDeleted: false, isActive: true };
    if (movieId) where.movieId = movieId;
    if (cinemaId) where.cinemaId = cinemaId;
    if (date) where.date = date;

    const list = await ShowtimeModel.findAll({
      where,
      order: [
        ["date", "ASC"],
        ["time", "ASC"],
      ],
    });

    const enriched = await Promise.all(
      list.map(async (st) => {
        const plain = st.get({ plain: true });
        const occupied = await getActiveOccupiedSeatLabels(plain.id);
        return {
          ...plain,
          seatsAvailable: Math.max(0, plain.totalSeats - occupied.size),
        };
      }),
    );

    sendSuccess(res, HTTP_STATUS.OK, "responses.success", enriched);
  }),
);

showtimesRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const plain = await getShowtimeById(String(req.params.id));
    const occupied = await getActiveOccupiedSeatLabels(plain.id);
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", {
      ...plain,
      seatsAvailable: Math.max(0, plain.totalSeats - occupied.size),
    });
  }),
);

showtimesRouter.get(
  "/:id/seats",
  asyncHandler(async (req: Request, res: Response) => {
    const showtime = await getShowtimeById(String(req.params.id));
    const auditorium = await getAuditoriumById(showtime.auditoriumId);
    const occupied = await getActiveOccupiedSeatLabels(showtime.id);
    const seats = buildSeatsForAuditorium(auditorium, showtime.basePrice, occupied);
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", { auditorium, seats });
  }),
);

showtimesRouter.post(
  "/",
  requireAuth,
  requireRole(ROLES.SUPER_ADMIN, ROLES.CINEMA_ADMIN),
  validateRequest({ body: createShowtimeSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as z.infer<typeof createShowtimeSchema>;
    await assertShowtimeCinemaAccess(req, body.cinemaId);
    const overlap = await ShowtimeModel.findOne({
      where: {
        auditoriumId: body.auditoriumId,
        date: body.date,
        time: body.time,
        isDeleted: false,
      },
    });
    if (overlap) {
      throw new AppError(
        "Auditorium already has a showtime scheduled at this date and time",
        HTTP_STATUS.CONFLICT,
        "SHOWTIME_OVERLAP",
      );
    }

    const aud = await getAuditoriumById(body.auditoriumId);
    const totalSeats = aud.rows.reduce((sum, r) => sum + r.seatCount, 0);
    const now = Math.floor(Date.now() / 1000);
    const created = await ShowtimeModel.create({
      ...body,
      totalSeats,
      createdAt: now,
      createdBy: req.user!.id,
    });
    sendSuccess(res, HTTP_STATUS.CREATED, "responses.success", created.get({ plain: true }));
  }),
);

const updateShowtimeSchema = createShowtimeSchema.partial();

showtimesRouter.patch(
  "/:id",
  requireAuth,
  requireRole(ROLES.SUPER_ADMIN, ROLES.CINEMA_ADMIN),
  validateRequest({ body: updateShowtimeSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const showtime = await ShowtimeModel.findOne({
      where: { id: String(req.params.id), isDeleted: false },
    });
    if (!showtime) {
      throw new AppError("Showtime not found", HTTP_STATUS.NOT_FOUND, "SHOWTIME_NOT_FOUND");
    }
    await assertShowtimeCinemaAccess(req, showtime.cinemaId);
    const body = req.body as z.infer<typeof updateShowtimeSchema>;
    await showtime.update({
      ...body,
      updatedAt: Math.floor(Date.now() / 1000),
      updatedBy: req.user!.id,
    });
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", showtime.get({ plain: true }));
  }),
);

showtimesRouter.delete(
  "/:id",
  requireAuth,
  requireRole(ROLES.SUPER_ADMIN, ROLES.CINEMA_ADMIN),
  asyncHandler(async (req: Request, res: Response) => {
    const showtime = await ShowtimeModel.findOne({
      where: { id: String(req.params.id), isDeleted: false },
    });
    if (!showtime) {
      throw new AppError("Showtime not found", HTTP_STATUS.NOT_FOUND, "SHOWTIME_NOT_FOUND");
    }
    await assertShowtimeCinemaAccess(req, showtime.cinemaId);
    const now = Math.floor(Date.now() / 1000);
    await showtime.update({
      isDeleted: true,
      isActive: false,
      deletedAt: now,
      deletedBy: req.user!.id,
    });
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", { deleted: true, id: showtime.id });
  }),
);
