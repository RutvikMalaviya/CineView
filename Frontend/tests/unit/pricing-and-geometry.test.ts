import { describe, expect, it } from "vitest";
import { AUDITORIUMS_DATA } from "@/data/auditoriums";
import { calculateBookingTotals } from "@/lib/pricing";
import { computeSeatViewMetrics, findBestGroupSeats } from "@/lib/seat-geometry";
import type { Offer, Seat } from "@/types/domain";

describe("calculateBookingTotals", () => {
  const seats = [
    { id: "E-7", label: "E-7", category: "premium" as const, price: 25.3 },
    { id: "E-8", label: "E-8", category: "premium" as const, price: 25.3 },
  ];

  it("computes subtotal, convenience fee, and total without discount", () => {
    const result = calculateBookingTotals(seats);
    expect(result.seatsSubtotal).toBe(50.6);
    expect(result.convenienceFee).toBe(3.5);
    expect(result.discount).toBe(0);
    expect(result.total).toBe(54.1);
  });

  it("applies percentage offer when minTickets is met", () => {
    const offer: Offer = {
      id: "off-cine15",
      code: "CINE15",
      title: "15% Off",
      description: "Test",
      discountType: "percentage",
      discountValue: 15,
      minTickets: 2,
      accent: "primary",
    };
    const result = calculateBookingTotals(seats, [], offer);
    expect(result.discount).toBe(7.59);
    expect(result.total).toBe(46.51);
  });
});

describe("computeSeatViewMetrics", () => {
  const auditorium = AUDITORIUMS_DATA[0];

  it("derives eye-level camera position and viewing angle from seat geometry", () => {
    const centerSeat: Seat = {
      id: "E-7",
      row: "E",
      number: 7,
      label: "E-7",
      category: "premium",
      status: "available",
      price: 25.3,
      position: [0, 2.2, 0.8],
      orientationRad: 0,
    };

    const sideSeat: Seat = {
      ...centerSeat,
      id: "E-1",
      number: 1,
      label: "E-1",
      position: [-6.5, 2.2, 0.8],
    };

    const centerMetrics = computeSeatViewMetrics(centerSeat, auditorium);
    const sideMetrics = computeSeatViewMetrics(sideSeat, auditorium);

    expect(centerMetrics.eyeLevelPosition[1]).toBeCloseTo(3.32, 2);
    expect(centerMetrics.horizontalAngleDeg).toBe(0);
    expect(centerMetrics.horizontalFovDeg).toBeGreaterThan(35);
    expect(centerMetrics.overallScore).toBeGreaterThanOrEqual(sideMetrics.overallScore);
    expect(sideMetrics.horizontalAngleDeg).toBeGreaterThan(centerMetrics.horizontalAngleDeg);
    expect(centerMetrics.acousticScore).toBeGreaterThanOrEqual(sideMetrics.acousticScore);
  });

  it("finds the best contiguous group of available seats", () => {
    const seats: Seat[] = [
      { id: "E-1", row: "E", number: 1, label: "E-1", category: "premium", status: "available", price: 25, position: [-5, 2.2, 0.8], orientationRad: 0 },
      { id: "E-2", row: "E", number: 2, label: "E-2", category: "premium", status: "available", price: 25, position: [-4, 2.2, 0.8], orientationRad: 0 },
      { id: "E-5", row: "E", number: 5, label: "E-5", category: "premium", status: "available", price: 25, position: [-0.4, 2.2, 0.8], orientationRad: 0 },
      { id: "E-6", row: "E", number: 6, label: "E-6", category: "premium", status: "available", price: 25, position: [0.4, 2.2, 0.8], orientationRad: 0 },
    ];
    const best = findBestGroupSeats(seats, auditorium, 2);
    expect(best.map((s) => s.id)).toEqual(["E-5", "E-6"]);
  });
});
