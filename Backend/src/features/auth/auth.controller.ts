import type { Request, Response } from "express";
import { env } from "../../config/env";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { sendSuccess } from "../../shared/utils/response";
import {
  authenticateUser,
  getCurrentUser,
  registerCustomer,
  requestPasswordReset,
  resetPasswordWithToken,
  verifyEmailToken,
} from "./auth.service";
import type { LoginInput, RegisterInput } from "./auth.validator";

function regenerateSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function destroySession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export const authController = {
  register: async (req: Request, res: Response): Promise<void> => {
    const { user, verificationToken } = await registerCustomer(req.body as RegisterInput);

    await regenerateSession(req);
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.email = user.email;
    req.session.name = user.name;

    sendSuccess(res, HTTP_STATUS.CREATED, "responses.success", {
      user,
      ...(env.NODE_ENV !== "production" ? { verificationToken } : {}),
    });
  },

  login: async (req: Request, res: Response): Promise<void> => {
    const user = await authenticateUser(req.body as LoginInput);

    await regenerateSession(req);
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.email = user.email;
    req.session.name = user.name;

    sendSuccess(res, HTTP_STATUS.OK, "responses.success", { user });
  },

  logout: async (req: Request, res: Response): Promise<void> => {
    await destroySession(req);
    res.clearCookie(env.SESSION_COOKIE_NAME);
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", { loggedOut: true });
  },

  me: async (req: Request, res: Response): Promise<void> => {
    const user = await getCurrentUser(req.user!.id);
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", { user });
  },

  verifyEmail: async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body as { token: string };
    await verifyEmailToken(token);
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", { verified: true });
  },

  forgotPassword: async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body as { email: string };
    const result = await requestPasswordReset(email);
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", {
      message: "If an account exists, password reset instructions have been issued.",
      ...(env.NODE_ENV !== "production" && result.resetToken
        ? { resetToken: result.resetToken }
        : {}),
    });
  },

  resetPassword: async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body as { token: string; newPassword: string };
    await resetPasswordWithToken(token, newPassword);
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", { reset: true });
  },
};
