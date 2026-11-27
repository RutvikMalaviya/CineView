import type { BookingSeatSnapshot, ConcessionItem, Offer } from "@/types/domain";

export interface BookingPriceBreakdown {
  seatsSubtotal: number;
  concessionsSubtotal: number;
  convenienceFee: number;
  discount: number;
  total: number;
}

const CONVENIENCE_FEE_PER_SEAT = 1.75;

/**
 * Computes the demo booking summary totals from selected seats, concessions, and an optional offer.
 * Frontend demo calculation only — not authoritative payment logic.
 */
export function calculateBookingTotals(
  seats: BookingSeatSnapshot[],
  concessions: ConcessionItem[] = [],
  appliedOffer?: Offer | null,
): BookingPriceBreakdown {
  const seatsSubtotal = seats.reduce((sum, seat) => sum + seat.price, 0);
  const concessionsSubtotal = concessions.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const convenienceFee = Number((seats.length * CONVENIENCE_FEE_PER_SEAT).toFixed(2));

  let discount = 0;
  if (appliedOffer && seats.length >= appliedOffer.minTickets) {
    if (appliedOffer.discountType === "percentage") {
      discount = Number(((seatsSubtotal * appliedOffer.discountValue) / 100).toFixed(2));
    } else if (appliedOffer.discountType === "fixed") {
      discount = Math.min(appliedOffer.discountValue, seatsSubtotal);
    }
  }

  const total = Math.max(
    0,
    Number((seatsSubtotal + concessionsSubtotal + convenienceFee - discount).toFixed(2)),
  );

  return {
    seatsSubtotal: Number(seatsSubtotal.toFixed(2)),
    concessionsSubtotal: Number(concessionsSubtotal.toFixed(2)),
    convenienceFee,
    discount,
    total,
  };
}
