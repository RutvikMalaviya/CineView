import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { requireAuth } from "../../shared/middlewares/auth.middleware";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { sendSuccess } from "../../shared/utils/response";
import {
  cancelBookingForUser,
  createBookingWithPayment,
  getBookingByIdForUser,
  getUserBookings,
} from "./bookings.service";

const createBookingSchema = z.object({
  showtimeId: z.string().min(1).max(40),
  seatIds: z.array(z.string().min(1).max(16)).min(1).max(12),
  concessions: z
    .array(z.object({ id: z.string().min(1).max(40), quantity: z.number().int().min(1).max(20) }))
    .default([]),
  offerCode: z.string().trim().max(40).optional(),
  paymentMethodLabel: z.string().trim().min(1).max(100),
  simulateFailure: z.boolean().optional(),
  contactName: z.string().trim().min(2).max(120),
  contactEmail: z.string().trim().email().max(255),
  idempotencyKey: z.string().trim().max(100).optional(),
});

export const bookingsRouter = Router();

bookingsRouter.use(requireAuth);

bookingsRouter.post(
  "/",
  validateRequest({ body: createBookingSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as z.infer<typeof createBookingSchema>;
    const result = await createBookingWithPayment({
      ...body,
      userId: req.user!.id,
    });
    sendSuccess(res, HTTP_STATUS.CREATED, "responses.success", result);
  }),
);

bookingsRouter.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const bookings = await getUserBookings(req.user!.id);
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", bookings);
  }),
);

bookingsRouter.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const booking = await getBookingByIdForUser(String(req.params.id), req.user!.id);
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", booking);
  }),
);

bookingsRouter.post(
  "/:id/cancel",
  asyncHandler(async (req: Request, res: Response) => {
    const booking = await cancelBookingForUser(String(req.params.id), req.user!.id);
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", booking);
  }),
);
