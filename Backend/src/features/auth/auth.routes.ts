import { Router } from "express";
import { requireAuth } from "../../shared/middlewares/auth.middleware";
import { createRateLimiter } from "../../shared/middlewares/rate-limit.middleware";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { authController } from "./auth.controller";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.validator";

export const authRouter = Router();

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  prefix: "rl:auth:",
});

authRouter.post(
  "/register",
  authRateLimiter,
  validateRequest({ body: registerSchema }),
  asyncHandler(authController.register),
);
authRouter.post(
  "/login",
  authRateLimiter,
  validateRequest({ body: loginSchema }),
  asyncHandler(authController.login),
);
authRouter.post("/logout", requireAuth, asyncHandler(authController.logout));
authRouter.get("/me", requireAuth, asyncHandler(authController.me));
authRouter.post(
  "/verify-email",
  validateRequest({ body: verifyEmailSchema }),
  asyncHandler(authController.verifyEmail),
);
authRouter.post(
  "/forgot-password",
  authRateLimiter,
  validateRequest({ body: forgotPasswordSchema }),
  asyncHandler(authController.forgotPassword),
);
authRouter.post(
  "/reset-password",
  authRateLimiter,
  validateRequest({ body: resetPasswordSchema }),
  asyncHandler(authController.resetPassword),
);
