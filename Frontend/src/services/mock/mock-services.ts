import { z } from "zod";
import { AUDITORIUMS_DATA } from "@/data/auditoriums";
import { CINEMAS_DATA } from "@/data/cinemas";
import { MOVIES_DATA } from "@/data/movies";
import {
  DEFAULT_USER_PROFILE,
  INITIAL_BOOKINGS_DATA,
  OFFERS_DATA,
} from "@/data/offers-and-users";
import { SHOWTIMES_DATA } from "@/data/showtimes";
import { calculateBookingTotals } from "@/lib/pricing";
import { readDemoStorage, writeDemoStorage } from "@/lib/storage";
import type {
  AdminService,
  AuditoriumService,
  AuthService,
  BookingService,
  CinemaService,
  ConcessionService,
  CreateDemoBookingPayload,
  MovieFilterParams,
  MovieService,
  OfferService,
  SeatReservationService,
  SeatService,
  ShowtimeService,
  TicketService,
  UserService,
} from "@/services/contracts";
import type { Auditorium, Booking, Seat, UserProfile } from "@/types/domain";

const BOOKINGS_KEY = "bookings";
const PROFILE_KEY = "profile";
const AUDITORIUMS_KEY = "auditoriums";

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const createBookingSchema = z.object({
  movieId: z.string().min(1),
  cinemaId: z.string().min(1),
  auditoriumId: z.string().min(1),
  showtimeId: z.string().min(1),
  seats: z.array(z.object({ id: z.string(), label: z.string(), category: z.enum(["standard", "premium", "vip", "accessible"]), price: z.number().nonnegative() })).min(1),
  concessions: z.array(z.object({ id: z.string(), name: z.string(), price: z.number().nonnegative(), quantity: z.number().int().positive() })),
  offerCode: z.string().optional(),
  paymentMethodLabel: z.string().min(1),
  simulateFailure: z.boolean().optional(),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
});

function generateSeatsForAuditorium(auditorium: Auditorium, basePrice: number, showtimeId: string): Seat[] {
  const seats: Seat[] = [];
  const seed = showtimeId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  for (const row of auditorium.rows) {
    const totalSlots = row.seatCount + row.aisleAfterSeats.length;
    let xCursor = -((totalSlots - 1) * 0.85) / 2;

    for (let num = 1; num <= row.seatCount; num++) {
      const id = `${row.rowLabel}-${num}`;
      // Deterministic demo booked seats
      const hash = (seed + num * 17 + row.rowLabel.charCodeAt(0) * 31) % 19;
      const isBooked = hash === 0 || hash === 1 || (row.rowLabel === "D" && (num === 6 || num === 7));

      const seatPrice = Number((basePrice * row.priceMultiplier).toFixed(2));
      const [sx, , sz] = auditorium.screenPosition;
      const dx = sx - xCursor;
      const dz = sz - row.zOffset;
      // Seat front faces -Z in local space, so rotate toward (dx, dz) using atan2(-dx, -dz)
      const orientationRad = Math.atan2(-dx, -dz);

      seats.push({
        id,
        row: row.rowLabel,
        number: num,
        label: id,
        category: row.category,
        status: isBooked ? "booked" : "available",
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

function getStoredAuditoriums(): Auditorium[] {
  return readDemoStorage<Auditorium[]>(AUDITORIUMS_KEY, AUDITORIUMS_DATA);
}

export const mockMovieService: MovieService = {
  async getAllMovies(filters?: MovieFilterParams) {
    await delay(80);
    let results = [...MOVIES_DATA];
    if (filters?.status) {
      results = results.filter((m) => m.status === filters.status);
    }
    if (filters?.genre && filters.genre !== "All") {
      results = results.filter((m) => m.genres.includes(filters.genre!));
    }
    if (filters?.format && filters.format !== "All Formats") {
      results = results.filter((m) => m.formats.some((f) => f === filters.format));
    }
    if (filters?.query?.trim()) {
      const q = filters.query.trim().toLowerCase();
      results = results.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.tagline.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q)),
      );
    }
    return results;
  },
  async getMovieById(id: string) {
    await delay(60);
    return MOVIES_DATA.find((m) => m.id === id || m.slug === id) ?? null;
  },
};

export const mockCinemaService: CinemaService = {
  async getCinemas(city?: string) {
    await delay(80);
    if (!city || city === "All Cities") return [...CINEMAS_DATA];
    return CINEMAS_DATA.filter((c) => c.city.toLowerCase() === city.toLowerCase());
  },
  async getCinemaById(id: string) {
    await delay(60);
    return CINEMAS_DATA.find((c) => c.id === id) ?? null;
  },
};

export const mockAuditoriumService: AuditoriumService = {
  async getAuditoriumById(id: string) {
    await delay(60);
    return getStoredAuditoriums().find((a) => a.id === id) ?? null;
  },
  async getAuditoriumsByCinema(cinemaId: string) {
    await delay(60);
    return getStoredAuditoriums().filter((a) => a.cinemaId === cinemaId);
  },
  async saveAuditoriumConfig(auditorium: Auditorium) {
    await delay(100);
    const list = getStoredAuditoriums();
    const updated = list.map((a) => (a.id === auditorium.id ? auditorium : a));
    writeDemoStorage(AUDITORIUMS_KEY, updated);
    return auditorium;
  },
  async resetAuditoriumConfig(id: string) {
    await delay(80);
    const original = AUDITORIUMS_DATA.find((a) => a.id === id) ?? null;
    if (!original) return null;
    const list = getStoredAuditoriums().map((a) => (a.id === id ? original : a));
    writeDemoStorage(AUDITORIUMS_KEY, list);
    return original;
  },
};

export const mockShowtimeService: ShowtimeService = {
  async getShowtimes(movieId?: string, cinemaId?: string, date?: string) {
    await delay(80);
    return SHOWTIMES_DATA.filter((st) => {
      if (movieId && st.movieId !== movieId) return false;
      if (cinemaId && st.cinemaId !== cinemaId) return false;
      if (date && st.date !== date) return false;
      return true;
    });
  },
  async getShowtimeById(id: string) {
    await delay(60);
    return SHOWTIMES_DATA.find((st) => st.id === id) ?? null;
  },
};

export const mockSeatService: SeatService = {
  async getSeatLayout(showtimeId: string) {
    await delay(100);
    const showtime = SHOWTIMES_DATA.find((st) => st.id === showtimeId);
    if (!showtime) return null;
    const auditorium = getStoredAuditoriums().find((a) => a.id === showtime.auditoriumId);
    if (!auditorium) return null;
    return {
      auditorium,
      seats: generateSeatsForAuditorium(auditorium, showtime.basePrice, showtime.id),
    };
  },
};

export const mockBookingService: BookingService = {
  async createDemoBooking(payload: CreateDemoBookingPayload) {
    await delay(280);
    const parsed = createBookingSchema.parse(payload);

    if (parsed.simulateFailure) {
      throw new Error("Simulated demo payment decline. Try another demo payment method.");
    }

    const movie = MOVIES_DATA.find((m) => m.id === parsed.movieId);
    const cinema = CINEMAS_DATA.find((c) => c.id === parsed.cinemaId);
    const auditorium = getStoredAuditoriums().find((a) => a.id === parsed.auditoriumId);
    const showtime = SHOWTIMES_DATA.find((st) => st.id === parsed.showtimeId);

    if (!movie || !cinema || !auditorium || !showtime) {
      throw new Error("Invalid booking selection.");
    }

    const offer = parsed.offerCode
      ? OFFERS_DATA.find((o) => o.code.toUpperCase() === parsed.offerCode?.toUpperCase())
      : undefined;

    const breakdown = calculateBookingTotals(parsed.seats, parsed.concessions, offer);
    const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();

    const newBooking: Booking = {
      id: `bkg-${Date.now()}`,
      referenceCode: `CV-2099-${suffix}`,
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
      seats: parsed.seats,
      concessions: parsed.concessions,
      subtotal: breakdown.seatsSubtotal + breakdown.concessionsSubtotal,
      convenienceFee: breakdown.convenienceFee,
      discount: breakdown.discount,
      total: breakdown.total,
      status: "confirmed",
      paymentMethodLabel: parsed.paymentMethodLabel,
      contactName: parsed.contactName,
      contactEmail: parsed.contactEmail,
      createdAt: new Date().toISOString(),
    };

    const existing = readDemoStorage<Booking[]>(BOOKINGS_KEY, INITIAL_BOOKINGS_DATA);
    writeDemoStorage(BOOKINGS_KEY, [newBooking, ...existing]);

    return {
      booking: newBooking,
      payment: {
        success: true,
        transactionRef: `DEMO-TXN-${suffix}`,
        message: "Demo payment authorized (no real charge made).",
      },
    };
  },

  async getMyBookings() {
    await delay(90);
    return readDemoStorage<Booking[]>(BOOKINGS_KEY, INITIAL_BOOKINGS_DATA);
  },

  async getBookingById(id: string) {
    await delay(60);
    const list = readDemoStorage<Booking[]>(BOOKINGS_KEY, INITIAL_BOOKINGS_DATA);
    return list.find((b) => b.id === id || b.referenceCode === id) ?? null;
  },

  async cancelDemoBooking(id: string) {
    await delay(140);
    const list = readDemoStorage<Booking[]>(BOOKINGS_KEY, INITIAL_BOOKINGS_DATA);
    let updatedBooking: Booking | null = null;
    const next = list.map((b) => {
      if (b.id === id) {
        updatedBooking = { ...b, status: "cancelled" };
        return updatedBooking;
      }
      return b;
    });
    writeDemoStorage(BOOKINGS_KEY, next);
    return updatedBooking;
  },
};

export const mockTicketService: TicketService = {
  async getDigitalTicket(bookingId: string) {
    await delay(80);
    const booking = await mockBookingService.getBookingById(bookingId);
    if (!booking) return null;
    return {
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
      gate: "WEST ATRIUM • LOUNGE ACCESS",
      qrPayload: `CINEVIEW-DEMO|${booking.referenceCode}|${booking.seats.map((s) => s.label).join(",")}`,
      voucherCode: "ARTISAN-POPCORN-DEMO",
      isDemoCredential: true,
    };
  },
};

export const mockUserService: UserService = {
  async getDemoProfile() {
    await delay(70);
    return readDemoStorage<UserProfile>(PROFILE_KEY, DEFAULT_USER_PROFILE);
  },
  async updateDemoProfile(patch: Partial<UserProfile>) {
    await delay(100);
    const current = readDemoStorage<UserProfile>(PROFILE_KEY, DEFAULT_USER_PROFILE);
    const next = { ...current, ...patch };
    writeDemoStorage(PROFILE_KEY, next);
    return next;
  },
};

export const mockOfferService: OfferService = {
  async getOffers() {
    await delay(60);
    return [...OFFERS_DATA];
  },
  async validateOfferCode(code: string) {
    await delay(80);
    return (
      OFFERS_DATA.find((o) => o.code.toUpperCase() === code.trim().toUpperCase()) ?? null
    );
  },
};

export const mockConcessionService: ConcessionService = {
  async getConcessions() {
    await delay(60);
    return [
      { id: "con-popcorn", name: "Artisan Truffle Popcorn (Demo)", price: 9.5, category: "snack" },
      { id: "con-lounge", name: "West Atrium Cocktail Lounge Pass", price: 14.0, category: "lounge" },
    ];
  },
};

export const mockSeatReservationService: SeatReservationService = {
  async reserveSeats(_showtimeId: string, seatLabels: string[]) {
    await delay(80);
    return {
      reservationGroupId: `demo-res-${Date.now()}`,
      expiresAt: Math.floor(Date.now() / 1000) + 600,
      seatLabels,
    };
  },
};

export const mockAuthService: AuthService = {
  async login() {
    await delay(100);
    return readDemoStorage<UserProfile>(PROFILE_KEY, DEFAULT_USER_PROFILE);
  },
  async register(input) {
    await delay(100);
    const next = { ...DEFAULT_USER_PROFILE, name: input.name, email: input.email };
    writeDemoStorage(PROFILE_KEY, next);
    return next;
  },
  async logout() {
    await delay(50);
  },
  async getCurrentUser() {
    await delay(50);
    return readDemoStorage<UserProfile>(PROFILE_KEY, DEFAULT_USER_PROFILE);
  },
};

export const mockAdminService: AdminService = {
  async getMyCinemas() {
    await delay(40);
    return [...CINEMAS_DATA];
  },
  async getOverview() {
    await delay(60);
    const bookings = readDemoStorage<Booking[]>(BOOKINGS_KEY, INITIAL_BOOKINGS_DATA);
    const confirmed = bookings.filter((b) => b.status !== "cancelled");
    return {
      moviesCount: MOVIES_DATA.length,
      cinemasCount: CINEMAS_DATA.length,
      showtimesCount: SHOWTIMES_DATA.length,
      bookingsCount: bookings.length,
      confirmedBookingsCount: confirmed.length,
      totalRevenue: Number(confirmed.reduce((sum, b) => sum + b.total, 0).toFixed(2)),
    };
  },
  async getBookings() {
    await delay(60);
    return readDemoStorage<Booking[]>(BOOKINGS_KEY, INITIAL_BOOKINGS_DATA);
  },
  async getUsers() {
    await delay(60);
    return [{ ...DEFAULT_USER_PROFILE, role: "SUPER_ADMIN" }];
  },
  async createAuditorium(payload) {
    await delay(60);
    return {
      id: `aud-demo-${Date.now()}`,
      cinemaId: payload.cinemaId,
      name: payload.name,
      format: payload.format as never,
      screenWidth: 18,
      screenHeight: 10,
      screenPosition: [0, 5.2, -12],
      screenCurveRadius: 40,
      speakerCount: 32,
      acousticProfile: "Dolby Atmos 32-Channel",
      rows: [],
    };
  },
  async createShowtime(payload) {
    await delay(60);
    return {
      id: `st-demo-${Date.now()}`,
      movieId: payload.movieId,
      cinemaId: payload.cinemaId,
      auditoriumId: payload.auditoriumId,
      date: payload.date,
      time: payload.time,
      format: payload.format as never,
      language: payload.language ?? "English",
      basePrice: payload.basePrice,
      seatsAvailable: 66,
      totalSeats: 66,
      badge: payload.badge,
    };
  },
  async updateShowtime(id, patch) {
    await delay(60);
    const base = SHOWTIMES_DATA.find((s) => s.id === id) ?? SHOWTIMES_DATA[0];
    return { ...base, ...patch, format: (patch.format ?? base.format) as never };
  },
  async deleteShowtime() {
    await delay(60);
  },
  async getScreenTypes() {
    await delay(40);
    return [
      { id: "st-type-imax", name: "IMAX with Laser", description: "Dual 4K laser projection" },
      { id: "st-type-dolby", name: "Dolby Cinema", description: "Dolby Vision + Atmos" },
      { id: "st-type-70mm", name: "70mm Film", description: "Analog celluloid" },
      { id: "st-type-screenx", name: "ScreenX 270°", description: "Three-wall projection" },
      { id: "st-type-2d", name: "Standard 2D", description: "Digital 4K projection" },
    ];
  },
  async createScreenType(payload) {
    await delay(40);
    return {
      id: `st-type-${Date.now()}`,
      name: payload.name,
      description: payload.description ?? "",
    };
  },
  async updateScreenType(id, patch) {
    await delay(40);
    return { id, name: patch.name ?? "Updated", description: patch.description ?? "" };
  },
  async deleteScreenType() {
    await delay(40);
  },
  async createUser(payload) {
    await delay(40);
    return { ...DEFAULT_USER_PROFILE, id: `usr-${Date.now()}`, name: payload.name, email: payload.email, role: payload.role };
  },
  async updateUserRole(userId, role) {
    await delay(40);
    return { ...DEFAULT_USER_PROFILE, id: userId, role };
  },
  async updateUser(userId, patch) {
    await delay(40);
    return { ...DEFAULT_USER_PROFILE, id: userId, ...patch };
  },
  async assignCinemaAdmin(cinemaId, adminUserId) {
    await delay(40);
    const c = CINEMAS_DATA.find((x) => x.id === cinemaId) ?? CINEMAS_DATA[0];
    return { ...c, adminUserId };
  },
};
