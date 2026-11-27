import type { AuditoriumAttributes } from "../auditoriums";

export interface GeneratedSeat {
  id: string;
  row: string;
  number: number;
  label: string;
  category: "standard" | "premium" | "vip" | "accessible";
  status: "available" | "booked" | "unavailable";
  price: number;
  position: [number, number, number];
  orientationRad: number;
}

/**
 * Generates 3D seat coordinates & pricing from an Auditorium's row geometry and Showtime basePrice.
 * Unavailable/booked seat IDs are overlaid from active reservations & confirmed bookings.
 */
export function buildSeatsForAuditorium(
  auditorium: AuditoriumAttributes,
  basePrice: number,
  occupiedSeatIds: Set<string>,
): GeneratedSeat[] {
  const seats: GeneratedSeat[] = [];

  for (const row of auditorium.rows) {
    const totalSlots = row.seatCount + row.aisleAfterSeats.length;
    let xCursor = -((totalSlots - 1) * 0.85) / 2;

    for (let num = 1; num <= row.seatCount; num++) {
      const id = `${row.rowLabel}-${num}`;
      const seatPrice = Number((basePrice * row.priceMultiplier).toFixed(2));
      const [sx, , sz] = auditorium.screenPosition;
      const dx = sx - xCursor;
      const dz = sz - row.zOffset;
      const orientationRad = Math.atan2(-dx, -dz);

      seats.push({
        id,
        row: row.rowLabel,
        number: num,
        label: id,
        category: row.category,
        status: occupiedSeatIds.has(id) ? "booked" : "available",
        price: seatPrice,
        position: [Number(xCursor.toFixed(2)), row.elevationY, row.zOffset],
        orientationRad,
      });

      xCursor += 0.85;
      if (row.aisleAfterSeats.includes(num)) {
        xCursor += 0.85;
      }
    }
  }

  return seats;
}
