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
import { ScreenTypeModel } from "./screen-type.model";

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(255).default(""),
});

const updateSchema = createSchema.partial();

export const screenTypesRouter = Router();

screenTypesRouter.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const rows = await ScreenTypeModel.findAll({
      where: { isDeleted: false, isActive: true },
      order: [["createdAt", "ASC"]],
    });
    sendSuccess(
      res,
      HTTP_STATUS.OK,
      "responses.success",
      rows.map((r) => r.get({ plain: true })),
    );
  }),
);

screenTypesRouter.post(
  "/",
  requireAuth,
  requireRole(ROLES.SUPER_ADMIN, ROLES.CINEMA_ADMIN),
  validateRequest({ body: createSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as z.infer<typeof createSchema>;
    const existing = await ScreenTypeModel.findOne({
      where: { name: body.name, isDeleted: false },
    });
    if (existing) {
      throw new AppError("Screen type already exists", HTTP_STATUS.CONFLICT, "SCREEN_TYPE_EXISTS");
    }
    const now = Math.floor(Date.now() / 1000);
    const created = await ScreenTypeModel.create({
      ...body,
      createdAt: now,
      createdBy: req.user!.id,
    });
    sendSuccess(res, HTTP_STATUS.CREATED, "responses.success", created.get({ plain: true }));
  }),
);

screenTypesRouter.patch(
  "/:id",
  requireAuth,
  requireRole(ROLES.SUPER_ADMIN, ROLES.CINEMA_ADMIN),
  validateRequest({ body: updateSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const row = await ScreenTypeModel.findOne({
      where: { id: String(req.params.id), isDeleted: false },
    });
    if (!row) {
      throw new AppError("Screen type not found", HTTP_STATUS.NOT_FOUND, "SCREEN_TYPE_NOT_FOUND");
    }
    await row.update({
      ...(req.body as z.infer<typeof updateSchema>),
      updatedAt: Math.floor(Date.now() / 1000),
      updatedBy: req.user!.id,
    });
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", row.get({ plain: true }));
  }),
);

screenTypesRouter.delete(
  "/:id",
  requireAuth,
  requireRole(ROLES.SUPER_ADMIN, ROLES.CINEMA_ADMIN),
  asyncHandler(async (req: Request, res: Response) => {
    const row = await ScreenTypeModel.findOne({
      where: { id: String(req.params.id), isDeleted: false },
    });
    if (!row) {
      throw new AppError("Screen type not found", HTTP_STATUS.NOT_FOUND, "SCREEN_TYPE_NOT_FOUND");
    }
    await row.update({
      isDeleted: true,
      isActive: false,
      deletedAt: Math.floor(Date.now() / 1000),
      deletedBy: req.user!.id,
    });
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", { deleted: true, id: row.id });
  }),
);
