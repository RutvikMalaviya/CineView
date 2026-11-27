import type {
  AdminOverview,
  AdminService,
  AuditoriumService,
  AuthService,
  BookingService,
  CinemaService,
  ConcessionOption,
  ConcessionService,
  CreateAuditoriumPayload,
  CreateDemoBookingPayload,
  CreateShowtimePayload,
  MovieFilterParams,
  MovieService,
  OfferService,
  ScreenTypeItem,
  SeatReservationService,
  SeatService,
  ShowtimeService,
  TicketService,
  UserService,
} from "@/services/contracts";
import type {
  Auditorium,
  Booking,
  Cinema,
  DigitalTicket,
  Movie,
  Offer,
  PaymentDemoResult,
  Seat,
  Showtime,
  UserProfile,
} from "@/types/domain";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

let cachedCsrfToken: string | null = null;

async function getCsrfToken(): Promise<string> {
  if (cachedCsrfToken) return cachedCsrfToken;
  const res = await fetch(`${API_BASE_URL}/csrf-token`, {
    credentials: "include",
  });
  const json = (await res.json()) as { data?: { csrfToken?: string } };
  if (!res.ok || !json.data?.csrfToken) {
    throw new Error("Failed to acquire CSRF token");
  }
  cachedCsrfToken = json.data.csrfToken;
  return cachedCsrfToken;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrf = await getCsrfToken();
    headers.set("X-CSRF-Token", csrf);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    headers,
    credentials: "include",
  });

  const json = (await res.json()) as {
    success: boolean;
    message?: string;
    data?: T;
  };

  if (!res.ok || !json.success) {
    if (res.status === 403) {
      cachedCsrfToken = null;
    }
    throw new Error(json.message ?? `Request failed (${res.status})`);
  }

  return json.data as T;
}

export const httpMovieService: MovieService = {
  async getAllMovies(filters?: MovieFilterParams) {
    const params = new URLSearchParams();
    params.set("limit", "100");
    if (filters?.query) params.set("query", filters.query);
    if (filters?.genre) params.set("genre", filters.genre);
    if (filters?.format) params.set("format", filters.format);
    if (filters?.status) params.set("status", filters.status);
    const qs = params.toString();
    return apiFetch<Movie[]>(`/movies${qs ? `?${qs}` : ""}`);
  },
  async getMovieById(id: string) {
    try {
      return await apiFetch<Movie>(`/movies/${encodeURIComponent(id)}`);
    } catch {
      return null;
    }
  },
};

export const httpCinemaService: CinemaService = {
  async getCinemas(city?: string) {
    const qs = city ? `?city=${encodeURIComponent(city)}` : "";
    return apiFetch<Cinema[]>(`/cinemas${qs}`);
  },
  async getCinemaById(id: string) {
    try {
      return await apiFetch<Cinema>(`/cinemas/${encodeURIComponent(id)}`);
    } catch {
      return null;
    }
  },
};

export const httpAuditoriumService: AuditoriumService = {
  async getAuditoriumById(id: string) {
    try {
      return await apiFetch<Auditorium>(`/auditoriums/${encodeURIComponent(id)}`);
    } catch {
      return null;
    }
  },
  async getAuditoriumsByCinema(cinemaId: string) {
    return apiFetch<Auditorium[]>(`/auditoriums/cinema/${encodeURIComponent(cinemaId)}`);
  },
  async saveAuditoriumConfig(auditorium: Auditorium) {
    return apiFetch<Auditorium>(`/auditoriums/${encodeURIComponent(auditorium.id)}`, {
      method: "PUT",
      body: JSON.stringify(auditorium),
    });
  },
  async resetAuditoriumConfig(id: string) {
    try {
      return await apiFetch<Auditorium>(`/auditoriums/${encodeURIComponent(id)}/reset`, {
        method: "POST",
      });
    } catch {
      return null;
    }
  },
};

export const httpShowtimeService: ShowtimeService = {
  async getShowtimes(movieId?: string, cinemaId?: string, date?: string) {
    const params = new URLSearchParams();
    if (movieId) params.set("movieId", movieId);
    if (cinemaId) params.set("cinemaId", cinemaId);
    if (date) params.set("date", date);
    const qs = params.toString();
    return apiFetch<Showtime[]>(`/showtimes${qs ? `?${qs}` : ""}`);
  },
  async getShowtimeById(id: string) {
    try {
      return await apiFetch<Showtime>(`/showtimes/${encodeURIComponent(id)}`);
    } catch {
      return null;
    }
  },
};

export const httpSeatService: SeatService = {
  async getSeatLayout(showtimeId: string) {
    try {
      return await apiFetch<{ auditorium: Auditorium; seats: Seat[] }>(
        `/showtimes/${encodeURIComponent(showtimeId)}/seats`,
      );
    } catch {
      return null;
    }
  },
};

export const httpBookingService: BookingService = {
  async createDemoBooking(payload: CreateDemoBookingPayload) {
    return apiFetch<{ booking: Booking; payment: PaymentDemoResult }>("/bookings", {
      method: "POST",
      body: JSON.stringify({
        showtimeId: payload.showtimeId,
        seatIds: payload.seats.map((s) => s.id),
        concessions: payload.concessions.map((c) => ({ id: c.id, quantity: c.quantity })),
        offerCode: payload.offerCode,
        paymentMethodLabel: payload.paymentMethodLabel,
        simulateFailure: payload.simulateFailure,
        contactName: payload.contactName,
        contactEmail: payload.contactEmail,
      }),
    });
  },
  async getMyBookings() {
    return apiFetch<Booking[]>("/bookings");
  },
  async getBookingById(id: string) {
    try {
      return await apiFetch<Booking>(`/bookings/${encodeURIComponent(id)}`);
    } catch {
      return null;
    }
  },
  async cancelDemoBooking(id: string) {
    try {
      return await apiFetch<Booking>(`/bookings/${encodeURIComponent(id)}/cancel`, {
        method: "POST",
      });
    } catch {
      return null;
    }
  },
};

export const httpTicketService: TicketService = {
  async getDigitalTicket(bookingId: string) {
    try {
      return await apiFetch<DigitalTicket>(`/tickets/${encodeURIComponent(bookingId)}`);
    } catch {
      return null;
    }
  },
};

export const httpUserService: UserService = {
  async getDemoProfile() {
    return apiFetch<UserProfile>("/users/profile");
  },
  async updateDemoProfile(patch: Partial<UserProfile>) {
    return apiFetch<UserProfile>("/users/profile", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },
};

export const httpOfferService: OfferService = {
  async getOffers() {
    return apiFetch<Offer[]>("/offers");
  },
  async validateOfferCode(code: string) {
    try {
      return await apiFetch<Offer>("/offers/validate", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
    } catch {
      return null;
    }
  },
};

export const httpConcessionService: ConcessionService = {
  async getConcessions() {
    return apiFetch<ConcessionOption[]>("/concessions");
  },
};

export const httpSeatReservationService: SeatReservationService = {
  async reserveSeats(showtimeId: string, seatLabels: string[]) {
    return apiFetch<{ reservationGroupId: string; expiresAt: number; seatLabels: string[] }>(
      "/seat-reservations",
      {
        method: "POST",
        body: JSON.stringify({ showtimeId, seatLabels }),
      },
    );
  },
};

export const httpAuthService: AuthService = {
  async login(email: string, password: string) {
    const res = await apiFetch<{ user: UserProfile }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return res.user;
  },
  async register(input) {
    const res = await apiFetch<{ user: UserProfile }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res.user;
  },
  async logout() {
    await apiFetch<{ loggedOut: boolean }>("/auth/logout", { method: "POST" });
  },
  async getCurrentUser() {
    try {
      const res = await apiFetch<{ user: UserProfile }>("/auth/me");
      return res.user;
    } catch {
      return null;
    }
  },
};

export const httpAdminService: AdminService = {
  async getMyCinemas() {
    return apiFetch<Cinema[]>("/admin/cinemas");
  },
  async getOverview() {
    return apiFetch<AdminOverview>("/admin/overview");
  },
  async getBookings() {
    return apiFetch<Booking[]>("/admin/bookings");
  },
  async getUsers() {
    return apiFetch<UserProfile[]>("/admin/users");
  },
  async createAuditorium(payload: CreateAuditoriumPayload) {
    return apiFetch<Auditorium>("/auditoriums", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async createShowtime(payload: CreateShowtimePayload) {
    return apiFetch<Showtime>("/showtimes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async updateShowtime(id: string, patch: Partial<CreateShowtimePayload>) {
    return apiFetch<Showtime>(`/showtimes/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },
  async deleteShowtime(id: string) {
    await apiFetch<{ deleted: boolean }>(`/showtimes/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
  async getScreenTypes() {
    return apiFetch<ScreenTypeItem[]>("/screen-types");
  },
  async createScreenType(payload) {
    return apiFetch<ScreenTypeItem>("/screen-types", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async updateScreenType(id: string, patch) {
    return apiFetch<ScreenTypeItem>(`/screen-types/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },
  async deleteScreenType(id: string) {
    await apiFetch<{ deleted: boolean }>(`/screen-types/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
  async createUser(payload) {
    return apiFetch<UserProfile>("/admin/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async updateUserRole(userId, role) {
    return apiFetch<UserProfile>(`/admin/users/${encodeURIComponent(userId)}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },
  async updateUser(userId, patch) {
    return apiFetch<UserProfile>(`/admin/users/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },
  async assignCinemaAdmin(cinemaId, adminUserId) {
    return apiFetch<Cinema>(`/admin/cinemas/${encodeURIComponent(cinemaId)}/assign-admin`, {
      method: "PATCH",
      body: JSON.stringify({ adminUserId }),
    });
  },
};
