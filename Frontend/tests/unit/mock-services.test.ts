import { beforeEach, describe, expect, it } from "vitest";
import {
  auditoriumService,
  bookingService,
  cinemaService,
  movieService,
  offerService,
  seatService,
} from "@/services";

describe("mock services", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("retrieves movies and filters by query", async () => {
    const all = await movieService.getAllMovies();
    expect(all.length).toBeGreaterThanOrEqual(6);

    const filtered = await movieService.getAllMovies({ query: "Dune" });
    expect(filtered.length).toBeGreaterThanOrEqual(1);
    expect(filtered[0].id).toBe("mov-dune-part-two");
  });

  it("retrieves cinemas and seat layout for a showtime", async () => {
    const cinemas = await cinemaService.getCinemas();
    expect(cinemas.length).toBe(3);

    const layout = await seatService.getSeatLayout("st-dune-imax-1915");
    expect(layout).not.toBeNull();
    expect(layout?.seats.length).toBeGreaterThan(50);
  });

  it("validates promo codes and handles demo booking creation + failure", async () => {
    const offer = await offerService.validateOfferCode("CINE15");
    expect(offer?.code).toBe("CINE15");

    await expect(
      bookingService.createDemoBooking({
        movieId: "mov-dune-part-two",
        cinemaId: "cin-premiere-dome",
        auditoriumId: "aud-imax-gt",
        showtimeId: "st-dune-imax-1915",
        seats: [{ id: "E-7", label: "E-7", category: "premium", price: 25.3 }],
        concessions: [],
        paymentMethodLabel: "Apple Pay (Demo)",
        simulateFailure: true,
        contactName: "Alex Rivera",
        contactEmail: "alex@cineview.app",
      }),
    ).rejects.toThrow(/Simulated demo payment decline/);

    const created = await bookingService.createDemoBooking({
      movieId: "mov-dune-part-two",
      cinemaId: "cin-premiere-dome",
      auditoriumId: "aud-imax-gt",
      showtimeId: "st-dune-imax-1915",
      seats: [{ id: "E-7", label: "E-7", category: "premium", price: 25.3 }],
      concessions: [],
      paymentMethodLabel: "Apple Pay (Demo)",
      contactName: "Alex Rivera",
      contactEmail: "alex@cineview.app",
    });

    expect(created.payment.success).toBe(true);
    const bookings = await bookingService.getMyBookings();
    expect(bookings.some((b) => b.id === created.booking.id)).toBe(true);
  });

  it("persists and resets auditorium demo config", async () => {
    const aud = await auditoriumService.getAuditoriumById("aud-imax-gt");
    expect(aud).not.toBeNull();
    if (!aud) return;

    const saved = await auditoriumService.saveAuditoriumConfig({
      ...aud,
      screenWidth: 25,
    });
    expect(saved.screenWidth).toBe(25);

    const reset = await auditoriumService.resetAuditoriumConfig("aud-imax-gt");
    expect(reset?.screenWidth).toBe(21.5);
  });
});
