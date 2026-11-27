import crypto from "crypto";
import { Op } from "sequelize";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { AppError } from "../../shared/errors/app-error";
import { getAuditoriumById } from "../auditoriums";
import { getCinemaById } from "../cinemas";
import { getConcessionsByIds } from "../concessions";
import { getMovieByIdOrSlug } from "../movies";
import { findOfferByCode } from "../offers";
import { confirmPaymentForBooking, createOrGetPaymentIntent } from "../payments";
import { confirmSeatReservations, releaseSeatsForBooking } from "../seat-reservations";
import { buildSeatsForAuditorium } from "../seats";
import { getShowtimeById } from "../showtimes";
import { BookingModel, type BookingAttributes, type BookingConcessionSnapshot } from "./booking.model";

const CONVENIENCE_FEE_PER_SEAT = 1.75;

export interface CreateBookingRequestInput {
  userId: string;
  showtimeId: string;
  seatIds: string[];
  concessions: Array<{ id: string; quantity: number }>;
  offerCode?: string;
  paymentMethodLabel: string;
  simulateFailure?: boolean;
  contactName: string;
  contactEmail: string;
  idempotencyKey?: string;
}

export async function createBookingWithPayment(input: CreateBookingRequestInput): Promise<{
  booking: BookingAttributes;
  payment: {
    success: boolean;
    transactionRef: string;
    clientSecret: string;
    status: string;
    message: string;
  };
}> {
  const showtime = await getShowtimeById(input.showtimeId);
  const [movie, cinema, auditorium] = await Promise.all([
    getMovieByIdOrSlug(showtime.movieId),
    getCinemaById(showtime.cinemaId),
    getAuditoriumById(showtime.auditoriumId),
  ]);

  // Authoritative server-side seat price lookup
  const allSeats = buildSeatsForAuditorium(auditorium, showtime.basePrice, new Set());
  const seatMap = new Map(allSeats.map((s) => [s.id, s]));

  const selectedSeats = input.seatIds.map((id) => {
    const found = seatMap.get(id);
    if (!found) {
      throw new AppError(`Invalid seat ${id}`, HTTP_STATUS.BAD_REQUEST, "INVALID_SEAT");
    }
    return {
      id: found.id,
      label: found.label,
      category: found.category,
      price: found.price,
    };
  });

  // Authoritative server-side concessions lookup
  const concessionIds = input.concessions.map((c) => c.id);
  const dbConcessions = await getConcessionsByIds(concessionIds);
  const concessionMap = new Map(dbConcessions.map((c) => [c.id, c]));

  const selectedConcessions: BookingConcessionSnapshot[] = input.concessions.map((item) => {
    const found = concessionMap.get(item.id);
    if (!found) {
      throw new AppError(
        `Invalid concession item ${item.id}`,
        HTTP_STATUS.BAD_REQUEST,
        "INVALID_CONCESSION",
      );
    }
    return {
      id: found.id,
      name: found.name,
      price: found.price,
      quantity: item.quantity,
    };
  });

  // Authoritative server-side offer & total calculation
  const seatsSubtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const concessionsSubtotal = selectedConcessions.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const convenienceFee = Number((selectedSeats.length * CONVENIENCE_FEE_PER_SEAT).toFixed(2));

  let discount = 0;
  let validOfferCode: string | null = null;
  if (input.offerCode) {
    const offer = await findOfferByCode(input.offerCode);
    if (offer && selectedSeats.length >= offer.minTickets) {
      validOfferCode = offer.code;
      if (offer.discountType === "percentage") {
        discount = Number(((seatsSubtotal * offer.discountValue) / 100).toFixed(2));
      } else if (offer.discountType === "fixed") {
        discount = Math.min(offer.discountValue, seatsSubtotal);
      }
    }
  }

  const subtotal = Number((seatsSubtotal + concessionsSubtotal).toFixed(2));
  const total = Math.max(0, Number((subtotal + convenienceFee - discount).toFixed(2)));
  const amountCents = Math.round(total * 100);

  // Confirm atomic seat lock before charging
  await confirmSeatReservations({
    showtimeId: showtime.id,
    userId: input.userId,
    seatLabels: selectedSeats.map((s) => s.label),
  });

  const now = Math.floor(Date.now() / 1000);
  const refSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  const booking = await BookingModel.create({
    userId: input.userId,
    referenceCode: `CV-2099-${refSuffix}`,
    movieId: movie.id,
    movieTitle: movie.title,
    posterUrl: movie.posterUrl,
    cinemaId: cinema.id,
    cinemaName: cinema.name,
    auditoriumId: auditorium.id,
    auditoriumName: auditorium.name,
    showtimeId: showtime.id,
    format: showtime.format,
    date: showtime.date,
    time: showtime.time,
    seats: selectedSeats,
    concessions: selectedConcessions,
    offerCode: validOfferCode,
    subtotal,
    convenienceFee,
    discount,
    total,
    status: "pending_payment",
    paymentMethodLabel: input.paymentMethodLabel,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    createdAt: now,
    createdBy: input.userId,
  });

  const idempotencyKey = input.idempotencyKey ?? `idem_${booking.id}`;
  const paymentIntent = await createOrGetPaymentIntent({
    bookingId: booking.id,
    userId: input.userId,
    amountCents,
    idempotencyKey,
  });

  const confirmedPayment = await confirmPaymentForBooking({
    paymentIntentId: paymentIntent.paymentIntentId,
    userId: input.userId,
    simulateFailure: input.simulateFailure,
  });

  if (confirmedPayment.status !== "succeeded") {
    await releaseSeatsForBooking(
      showtime.id,
      selectedSeats.map((s) => s.label),
      input.userId,
    );
    await booking.update({
      status: "cancelled",
      updatedAt: Math.floor(Date.now() / 1000),
      updatedBy: input.userId,
    });
    throw new AppError(
      confirmedPayment.failureReason ?? "Payment was declined",
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      "PAYMENT_FAILED",
    );
  }

  await booking.update({
    status: "confirmed",
    updatedAt: Math.floor(Date.now() / 1000),
    updatedBy: input.userId,
  });

  return {
    booking: booking.get({ plain: true }),
    payment: {
      success: true,
      transactionRef: confirmedPayment.paymentIntentId,
      clientSecret: confirmedPayment.clientSecret,
      status: confirmedPayment.status,
      message: "Payment authorized via Stripe-compatible demo provider.",
    },
  };
}

export async function getUserBookings(userId: string): Promise<BookingAttributes[]> {
  const rows = await BookingModel.findAll({
    where: { userId, isDeleted: false },
    order: [["createdAt", "DESC"]],
  });
  return rows.map((r) => r.get({ plain: true }));
}

export async function getBookingByIdForUser(
  idOrRef: string,
  userId: string,
): Promise<BookingAttributes> {
  const booking = await BookingModel.findOne({
    where: {
      userId,
      isDeleted: false,
      [Op.or]: [{ id: idOrRef }, { referenceCode: idOrRef }],
    },
  });
  if (!booking) {
    throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND, "BOOKING_NOT_FOUND");
  }
  return booking.get({ plain: true });
}

export async function cancelBookingForUser(
  id: string,
  userId: string,
): Promise<BookingAttributes> {
  const booking = await BookingModel.findOne({
    where: { id, userId, isDeleted: false },
  });
  if (!booking) {
    throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND, "BOOKING_NOT_FOUND");
  }
  if (booking.status === "cancelled") {
    return booking.get({ plain: true });
  }
  await releaseSeatsForBooking(
    booking.showtimeId,
    booking.seats.map((s) => s.label),
    userId,
  );
  await booking.update({
    status: "cancelled",
    updatedAt: Math.floor(Date.now() / 1000),
    updatedBy: userId,
  });
  return booking.get({ plain: true });
}
