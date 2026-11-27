import crypto from "crypto";
import type { Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { ROLES } from "../../shared/constants/roles";
import { AppError } from "../../shared/errors/app-error";
import { requireAuth } from "../../shared/middlewares/auth.middleware";
import { requireRole } from "../../shared/middlewares/role.middleware";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { sendSuccess } from "../../shared/utils/response";
import { getBookingByIdForUser } from "../bookings";
import { TicketModel } from "./ticket.model";

function signQrPayload(referenceCode: string): string {
  const sig = crypto
    .createHmac("sha256", env.TICKET_QR_SECRET)
    .update(referenceCode)
    .digest("hex")
    .slice(0, 16);
  return `CINEVIEW|${referenceCode}|${sig}`;
}

function verifyQrPayload(qrPayload: string): { referenceCode: string } | null {
  const parts = qrPayload.split("|");
  if (parts.length !== 3 || parts[0] !== "CINEVIEW") return null;
  const [, referenceCode, sig] = parts;
  if (!referenceCode || !sig) return null;
  const expected = crypto
    .createHmac("sha256", env.TICKET_QR_SECRET)
    .update(referenceCode)
    .digest("hex")
    .slice(0, 16);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return { referenceCode };
}

export const ticketsRouter = Router();

ticketsRouter.get(
  "/:bookingId",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const booking = await getBookingByIdForUser(String(req.params.bookingId), req.user!.id);

    let ticket = await TicketModel.findOne({
      where: { bookingId: booking.id, isDeleted: false },
    });

    if (!ticket) {
      const now = Math.floor(Date.now() / 1000);
      ticket = await TicketModel.create({
        bookingId: booking.id,
        userId: req.user!.id,
        referenceCode: booking.referenceCode,
        gate: "WEST ATRIUM • LOUNGE ACCESS",
        qrPayload: signQrPayload(booking.referenceCode),
        voucherCode: `SNACK-${booking.referenceCode.slice(-5)}`,
        status: booking.status === "cancelled" ? "CANCELLED" : "VALID",
        createdAt: now,
        createdBy: req.user!.id,
      });
    }

    sendSuccess(res, HTTP_STATUS.OK, "responses.success", {
      bookingId: booking.id,
      referenceCode: booking.referenceCode,
      movieTitle: booking.movieTitle,
      posterUrl: booking.posterUrl,
      cinemaName: booking.cinemaName,
      auditoriumName: booking.auditoriumName,
      format: booking.format,
      date: booking.date,
      time: booking.time,
      seatLabels: booking.seats.map((s) => s.label),
      gate: ticket.gate,
      qrPayload: ticket.qrPayload,
      voucherCode: ticket.voucherCode,
      status: ticket.status,
    });
  }),
);

ticketsRouter.post(
  "/verify",
  requireAuth,
  requireRole(ROLES.CINEMA_ADMIN, ROLES.SUPER_ADMIN),
  validateRequest({ body: z.object({ qrPayload: z.string().min(10).max(500) }) }),
  asyncHandler(async (req: Request, res: Response) => {
    const { qrPayload } = req.body as { qrPayload: string };
    const parsed = verifyQrPayload(qrPayload);
    if (!parsed) {
      throw new AppError("Invalid ticket QR signature", HTTP_STATUS.BAD_REQUEST, "INVALID_TICKET_QR");
    }

    const ticket = await TicketModel.findOne({
      where: { referenceCode: parsed.referenceCode, isDeleted: false },
    });
    if (!ticket) {
      throw new AppError("Ticket not found", HTTP_STATUS.NOT_FOUND, "TICKET_NOT_FOUND");
    }
    if (ticket.status !== "VALID") {
      throw new AppError(
        `Ticket cannot be used (status: ${ticket.status})`,
        HTTP_STATUS.CONFLICT,
        "TICKET_NOT_VALID",
      );
    }

    const now = Math.floor(Date.now() / 1000);
    await ticket.update({
      status: "USED",
      verifiedAt: now,
      updatedAt: now,
      updatedBy: req.user!.id,
    });

    sendSuccess(res, HTTP_STATUS.OK, "responses.success", {
      verified: true,
      referenceCode: ticket.referenceCode,
      verifiedAt: now,
    });
  }),
);
