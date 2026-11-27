import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { sendSuccess } from "../../shared/utils/response";
import { getUserProfile, updateUserProfile } from "./users.service";
import type { UpdateProfileInput } from "./users.validator";

export const usersController = {
  getProfile: async (req: Request, res: Response): Promise<void> => {
    const profile = await getUserProfile(req.user!.id);
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", profile);
  },

  updateProfile: async (req: Request, res: Response): Promise<void> => {
    const updated = await updateUserProfile(req.user!.id, req.body as UpdateProfileInput);
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", updated);
  },
};
