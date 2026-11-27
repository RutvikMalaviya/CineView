import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { requireAuth } from "../../shared/middlewares/auth.middleware";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { sendSuccess } from "../../shared/utils/response";
import { reserveSeatsForShowtime } from "./seat-reservations.service";

const reserveSchema = z.object({
  showtimeId: z.string().min(1).max(40),
  seatLabels: z.array(z.string().min(1).max(16)).min(1).max(12),
});

export const seatReservationsRouter = Router();

seatReservationsRouter.post(
  "/",
  requireAuth,
  validateRequest({ body: reserveSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as z.infer<typeof reserveSchema>;
    const result = await reserveSeatsForShowtime({
      showtimeId: body.showtimeId,
      userId: req.user!.id,
      seatLabels: body.seatLabels,
    });
    sendSuccess(res, HTTP_STATUS.CREATED, "responses.success", result);
  }),
);
