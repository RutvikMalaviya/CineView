import { Router } from "express";
import { requireAuth } from "../../shared/middlewares/auth.middleware";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { usersController } from "./users.controller";
import { updateProfileSchema } from "./users.validator";

export const usersRouter = Router();

usersRouter.get("/profile", requireAuth, asyncHandler(usersController.getProfile));
usersRouter.patch(
  "/profile",
  requireAuth,
  validateRequest({ body: updateProfileSchema }),
  asyncHandler(usersController.updateProfile),
);
