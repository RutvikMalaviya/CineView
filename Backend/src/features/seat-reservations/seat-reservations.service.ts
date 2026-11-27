import crypto from "crypto";
import { Op, UniqueConstraintError } from "sequelize";
import { sequelize } from "../../config/database";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { AppError } from "../../shared/errors/app-error";
import { SeatReservationModel } from "./seat-reservation.model";

const RESERVATION_TTL_SECONDS = 600; // 10 minutes

export async function expireStaleReservations(): Promise<number> {
  const now = Math.floor(Date.now() / 1000);
  const [affected] = await SeatReservationModel.update(
    { status: "EXPIRED", updatedAt: now, updatedBy: "system-expiry-job" },
    {
      where: {
        status: "RESERVED",
        expiresAt: { [Op.lt]: now },
        isDeleted: false,
      },
    },
  );
  return affected;
}

export async function getActiveOccupiedSeatLabels(showtimeId: string): Promise<Set<string>> {
  const now = Math.floor(Date.now() / 1000);
  const rows = await SeatReservationModel.findAll({
    where: {
      showtimeId,
      isDeleted: false,
      [Op.or]: [
        { status: "CONFIRMED" },
        { status: "RESERVED", expiresAt: { [Op.gte]: now } },
      ],
    },
    attributes: ["seatLabel"],
  });
  return new Set(rows.map((r) => r.seatLabel));
}

export async function reserveSeatsForShowtime(input: {
  showtimeId: string;
  userId: string;
  seatLabels: string[];
}): Promise<{ reservationGroupId: string; expiresAt: number; seatLabels: string[] }> {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + RESERVATION_TTL_SECONDS;
  const reservationGroupId = crypto.randomUUID();
  const uniqueLabels = Array.from(new Set(input.seatLabels));

  try {
    await sequelize.transaction(async (transaction) => {
      // Expire any stale holds on these seats first inside the transaction
      await SeatReservationModel.update(
        { status: "EXPIRED", updatedAt: now, updatedBy: "system" },
        {
          where: {
            showtimeId: input.showtimeId,
            seatLabel: uniqueLabels,
            status: "RESERVED",
            expiresAt: { [Op.lt]: now },
            isDeleted: false,
          },
          transaction,
        },
      );

      // Check existing active holds/bookings
      const existing = await SeatReservationModel.findAll({
        where: {
          showtimeId: input.showtimeId,
          seatLabel: uniqueLabels,
          status: ["RESERVED", "CONFIRMED"],
          isDeleted: false,
        },
        transaction,
      });

      if (existing.length > 0) {
        throw new AppError(
          "One or more selected seats are no longer available",
          HTTP_STATUS.CONFLICT,
          "SEATS_UNAVAILABLE",
          { unavailableSeats: existing.map((e) => e.seatLabel) },
        );
      }

      await SeatReservationModel.bulkCreate(
        uniqueLabels.map((seatLabel) => ({
          reservationGroupId,
          showtimeId: input.showtimeId,
          userId: input.userId,
          seatLabel,
          status: "RESERVED" as const,
          expiresAt,
          createdAt: now,
          createdBy: input.userId,
        })),
        { transaction },
      );
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new AppError(
        "One or more selected seats were just reserved by another customer",
        HTTP_STATUS.CONFLICT,
        "SEATS_UNAVAILABLE",
      );
    }
    throw error;
  }

  return { reservationGroupId, expiresAt, seatLabels: uniqueLabels };
}

export async function confirmSeatReservations(input: {
  showtimeId: string;
  userId: string;
  seatLabels: string[];
}): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await sequelize.transaction(async (transaction) => {
    const existing = await SeatReservationModel.findAll({
      where: {
        showtimeId: input.showtimeId,
        seatLabel: input.seatLabels,
        status: ["RESERVED", "CONFIRMED"],
        isDeleted: false,
      },
      transaction,
    });

    // If any seat is held/booked by someone else, reject
    const conflict = existing.find((r) => r.userId !== input.userId || r.status === "CONFIRMED");
    if (conflict) {
      throw new AppError(
        "The selected seats are no longer available",
        HTTP_STATUS.CONFLICT,
        "SEATS_UNAVAILABLE",
      );
    }

    const existingLabels = new Set(existing.map((e) => e.seatLabel));
    const missing = input.seatLabels.filter((l) => !existingLabels.has(l));

    if (existing.length > 0) {
      await SeatReservationModel.update(
        { status: "CONFIRMED", updatedAt: now, updatedBy: input.userId },
        {
          where: {
            id: existing.map((e) => e.id),
          },
          transaction,
        },
      );
    }

    if (missing.length > 0) {
      const groupId = crypto.randomUUID();
      await SeatReservationModel.bulkCreate(
        missing.map((seatLabel) => ({
          reservationGroupId: groupId,
          showtimeId: input.showtimeId,
          userId: input.userId,
          seatLabel,
          status: "CONFIRMED" as const,
          expiresAt: now + RESERVATION_TTL_SECONDS,
          createdAt: now,
          createdBy: input.userId,
        })),
        { transaction },
      );
    }
  });
}

export async function releaseSeatsForBooking(
  showtimeId: string,
  seatLabels: string[],
  actorId: string,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await SeatReservationModel.update(
    { status: "RELEASED", updatedAt: now, updatedBy: actorId },
    {
      where: {
        showtimeId,
        seatLabel: seatLabels,
        status: ["RESERVED", "CONFIRMED"],
        isDeleted: false,
      },
    },
  );
}
