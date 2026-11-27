import argon2 from "argon2";
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
import { BookingModel } from "../bookings";
import { CinemaModel } from "../cinemas";
import { MovieModel } from "../movies";
import { ShowtimeModel } from "../showtimes";
import { createUserRecord, findActiveUserByEmail, toPublicUser, UserModel } from "../users";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(ROLES.CINEMA_ADMIN, ROLES.SUPER_ADMIN));

async function getScopedCinemaIds(req: Request): Promise<string[] | null> {
  if (req.user!.role === ROLES.SUPER_ADMIN) return null; // null = all cinemas
  const assigned = await CinemaModel.findAll({
    where: { adminUserId: req.user!.id, isDeleted: false, isActive: true },
    attributes: ["id"],
  });
  return assigned.map((c) => c.id);
}

adminRouter.get(
  "/cinemas",
  asyncHandler(async (req: Request, res: Response) => {
    const where =
      req.user!.role === ROLES.SUPER_ADMIN
        ? { isDeleted: false, isActive: true }
        : { adminUserId: req.user!.id, isDeleted: false, isActive: true };

    const cinemas = await CinemaModel.findAll({
      where,
      order: [["distanceMiles", "ASC"]],
    });
    sendSuccess(
      res,
      HTTP_STATUS.OK,
      "responses.success",
      cinemas.map((c) => c.get({ plain: true })),
    );
  }),
);

adminRouter.get(
  "/overview",
  asyncHandler(async (req: Request, res: Response) => {
    const scopedCinemaIds = await getScopedCinemaIds(req);
    const cinemaFilter = scopedCinemaIds ? { cinemaId: scopedCinemaIds } : {};

    const [moviesCount, cinemasCount, showtimesCount, bookings] = await Promise.all([
      MovieModel.count({ where: { isDeleted: false, isActive: true } }),
      CinemaModel.count({
        where: {
          isDeleted: false,
          isActive: true,
          ...(scopedCinemaIds ? { id: scopedCinemaIds } : {}),
        },
      }),
      ShowtimeModel.count({
        where: { isDeleted: false, isActive: true, ...cinemaFilter },
      }),
      BookingModel.findAll({
        where: { isDeleted: false, ...cinemaFilter },
      }),
    ]);

    const confirmedBookings = bookings.filter((b) => b.status !== "cancelled");
    const totalRevenue = Number(
      confirmedBookings.reduce((sum, b) => sum + b.total, 0).toFixed(2),
    );

    sendSuccess(res, HTTP_STATUS.OK, "responses.success", {
      moviesCount,
      cinemasCount,
      showtimesCount,
      bookingsCount: bookings.length,
      confirmedBookingsCount: confirmedBookings.length,
      totalRevenue,
    });
  }),
);

adminRouter.get(
  "/bookings",
  asyncHandler(async (req: Request, res: Response) => {
    const scopedCinemaIds = await getScopedCinemaIds(req);
    const bookings = await BookingModel.findAll({
      where: {
        isDeleted: false,
        ...(scopedCinemaIds ? { cinemaId: scopedCinemaIds } : {}),
      },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
    sendSuccess(
      res,
      HTTP_STATUS.OK,
      "responses.success",
      bookings.map((b) => b.get({ plain: true })),
    );
  }),
);

adminRouter.get(
  "/users",
  requireRole(ROLES.SUPER_ADMIN),
  asyncHandler(async (_req: Request, res: Response) => {
    const users = await UserModel.findAll({
      where: { isDeleted: false },
      order: [["createdAt", "DESC"]],
      limit: 100,
    });
    sendSuccess(
      res,
      HTTP_STATUS.OK,
      "responses.success",
      users.map((u) => toPublicUser(u)),
    );
  }),
);

const createAdminUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum([ROLES.CUSTOMER, ROLES.CINEMA_ADMIN, ROLES.SUPER_ADMIN]),
  cinemaId: z.string().min(1).max(40).optional(),
});

adminRouter.post(
  "/users",
  requireRole(ROLES.SUPER_ADMIN),
  validateRequest({ body: createAdminUserSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as z.infer<typeof createAdminUserSchema>;
    const existing = await findActiveUserByEmail(body.email);
    if (existing) {
      throw new AppError("Email already exists", HTTP_STATUS.CONFLICT, "EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await argon2.hash(body.password, { type: argon2.argon2id });
    const created = await createUserRecord({
      name: body.name,
      email: body.email,
      passwordHash,
      role: body.role,
    });

    if (body.cinemaId && body.role === ROLES.CINEMA_ADMIN) {
      await CinemaModel.update(
        {
          adminUserId: created.id,
          updatedAt: Math.floor(Date.now() / 1000),
          updatedBy: req.user!.id,
        },
        { where: { id: body.cinemaId, isDeleted: false } },
      );
    }

    sendSuccess(res, HTTP_STATUS.CREATED, "responses.success", toPublicUser(created));
  }),
);

adminRouter.patch(
  "/users/:id",
  requireRole(ROLES.SUPER_ADMIN),
  validateRequest({
    body: z.object({
      name: z.string().trim().min(2).max(120).optional(),
      email: z.string().trim().email().max(255).optional(),
      phone: z.string().trim().max(40).nullable().optional(),
      city: z.string().trim().max(100).nullable().optional(),
      tier: z.string().trim().max(80).optional(),
      role: z.enum([ROLES.CUSTOMER, ROLES.CINEMA_ADMIN, ROLES.SUPER_ADMIN]).optional(),
      cinemaId: z.string().min(1).max(40).optional(),
    }),
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await UserModel.findOne({
      where: { id: String(req.params.id), isDeleted: false },
    });
    if (!user) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND, "USER_NOT_FOUND");
    }

    const body = req.body as {
      name?: string;
      email?: string;
      phone?: string | null;
      city?: string | null;
      tier?: string;
      role?: "CUSTOMER" | "CINEMA_ADMIN" | "SUPER_ADMIN";
      cinemaId?: string;
    };

    if (body.email && body.email.toLowerCase() !== user.email.toLowerCase()) {
      const duplicate = await findActiveUserByEmail(body.email);
      if (duplicate) {
        throw new AppError("Email already exists", HTTP_STATUS.CONFLICT, "EMAIL_ALREADY_EXISTS");
      }
    }

    const now = Math.floor(Date.now() / 1000);
    await user.update({
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.email !== undefined ? { email: body.email.toLowerCase() } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
      ...(body.city !== undefined ? { city: body.city } : {}),
      ...(body.tier !== undefined ? { tier: body.tier } : {}),
      ...(body.role !== undefined ? { role: body.role } : {}),
      updatedAt: now,
      updatedBy: req.user!.id,
    });

    if (body.cinemaId && (body.role ?? user.role) === ROLES.CINEMA_ADMIN) {
      await CinemaModel.update(
        { adminUserId: user.id, updatedAt: now, updatedBy: req.user!.id },
        { where: { id: body.cinemaId, isDeleted: false } },
      );
    }

    sendSuccess(res, HTTP_STATUS.OK, "responses.success", toPublicUser(user));
  }),
);

adminRouter.patch(
  "/users/:id/role",
  requireRole(ROLES.SUPER_ADMIN),
  validateRequest({
    body: z.object({ role: z.enum([ROLES.CUSTOMER, ROLES.CINEMA_ADMIN, ROLES.SUPER_ADMIN]) }),
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await UserModel.findOne({
      where: { id: String(req.params.id), isDeleted: false },
    });
    if (!user) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND, "USER_NOT_FOUND");
    }
    await user.update({
      role: (req.body as { role: "CUSTOMER" | "CINEMA_ADMIN" | "SUPER_ADMIN" }).role,
      updatedAt: Math.floor(Date.now() / 1000),
      updatedBy: req.user!.id,
    });
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", toPublicUser(user));
  }),
);

adminRouter.patch(
  "/cinemas/:cinemaId/assign-admin",
  requireRole(ROLES.SUPER_ADMIN),
  validateRequest({ body: z.object({ adminUserId: z.string().min(1).max(40) }) }),
  asyncHandler(async (req: Request, res: Response) => {
    const cinema = await CinemaModel.findOne({
      where: { id: String(req.params.cinemaId), isDeleted: false },
    });
    if (!cinema) {
      throw new AppError("Cinema not found", HTTP_STATUS.NOT_FOUND, "CINEMA_NOT_FOUND");
    }
    const { adminUserId } = req.body as { adminUserId: string };
    await cinema.update({
      adminUserId,
      updatedAt: Math.floor(Date.now() / 1000),
      updatedBy: req.user!.id,
    });
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", cinema.get({ plain: true }));
  }),
);
