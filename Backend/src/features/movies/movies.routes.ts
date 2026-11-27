import { Router } from "express";
import { ROLES } from "../../shared/constants/roles";
import { requireAuth } from "../../shared/middlewares/auth.middleware";
import { requireRole } from "../../shared/middlewares/role.middleware";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { moviesController } from "./movies.controller";
import { createMovieSchema, listMoviesQuerySchema } from "./movies.validator";

export const moviesRouter = Router();

moviesRouter.get(
  "/",
  validateRequest({ query: listMoviesQuerySchema }),
  asyncHandler(moviesController.list),
);
moviesRouter.get("/:id", asyncHandler(moviesController.getOne));
moviesRouter.post(
  "/",
  requireAuth,
  requireRole(ROLES.SUPER_ADMIN, ROLES.CINEMA_ADMIN),
  validateRequest({ body: createMovieSchema }),
  asyncHandler(moviesController.create),
);
