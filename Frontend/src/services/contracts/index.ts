import type {
  Auditorium,
  Booking,
  BookingSeatSnapshot,
  Cinema,
  ConcessionItem,
  DigitalTicket,
  Movie,
  Offer,
  PaymentDemoResult,
  Seat,
  Showtime,
  UserProfile,
} from "@/types/domain";

export interface MovieFilterParams {
  query?: string;
  genre?: string;
  format?: string;
  status?: "now_showing" | "coming_soon";
}

export interface CreateDemoBookingPayload {
  movieId: string;
  cinemaId: string;
  auditoriumId: string;
  showtimeId: string;
  seats: BookingSeatSnapshot[];
  concessions: ConcessionItem[];
  offerCode?: string;
  paymentMethodLabel: string;
  simulateFailure?: boolean;
  contactName: string;
  contactEmail: string;
}

export interface MovieService {
  getAllMovies(filters?: MovieFilterParams): Promise<Movie[]>;
  getMovieById(id: string): Promise<Movie | null>;
}

export interface CinemaService {
  getCinemas(city?: string): Promise<Cinema[]>;
  getCinemaById(id: string): Promise<Cinema | null>;
}

export interface AuditoriumService {
  getAuditoriumById(id: string): Promise<Auditorium | null>;
  getAuditoriumsByCinema(cinemaId: string): Promise<Auditorium[]>;
  saveAuditoriumConfig(auditorium: Auditorium): Promise<Auditorium>;
  resetAuditoriumConfig(id: string): Promise<Auditorium | null>;
}

export interface ShowtimeService {
  getShowtimes(movieId?: string, cinemaId?: string, date?: string): Promise<Showtime[]>;
  getShowtimeById(id: string): Promise<Showtime | null>;
}

export interface SeatService {
  getSeatLayout(showtimeId: string): Promise<{ auditorium: Auditorium; seats: Seat[] } | null>;
}

export interface BookingService {
  createDemoBooking(
    payload: CreateDemoBookingPayload,
  ): Promise<{ booking: Booking; payment: PaymentDemoResult }>;
  getMyBookings(): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking | null>;
  cancelDemoBooking(id: string): Promise<Booking | null>;
}

export interface TicketService {
  getDigitalTicket(bookingId: string): Promise<DigitalTicket | null>;
}

export interface UserService {
  getDemoProfile(): Promise<UserProfile>;
  updateDemoProfile(patch: Partial<UserProfile>): Promise<UserProfile>;
}

export interface OfferService {
  getOffers(): Promise<Offer[]>;
  validateOfferCode(code: string): Promise<Offer | null>;
}

export interface ConcessionOption {
  id: string;
  name: string;
  price: number;
  category?: string;
}

export interface ConcessionService {
  getConcessions(): Promise<ConcessionOption[]>;
}

export interface SeatReservationService {
  reserveSeats(
    showtimeId: string,
    seatLabels: string[],
  ): Promise<{ reservationGroupId: string; expiresAt: number; seatLabels: string[] }>;
}

export interface AuthService {
  login(email: string, password: string): Promise<UserProfile>;
  register(input: { name: string; email: string; password: string }): Promise<UserProfile>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<UserProfile | null>;
}

export interface AdminOverview {
  moviesCount: number;
  cinemasCount: number;
  showtimesCount: number;
  bookingsCount: number;
  confirmedBookingsCount: number;
  totalRevenue: number;
}

export interface CreateShowtimePayload {
  movieId: string;
  cinemaId: string;
  auditoriumId: string;
  date: string;
  time: string;
  format: string;
  language?: string;
  basePrice: number;
  badge?: string;
}

export interface CreateAuditoriumPayload {
  cinemaId: string;
  name: string;
  format: string;
  rowCount?: number;
  seatsPerRow?: number;
}

export interface ScreenTypeItem {
  id: string;
  name: string;
  description: string;
}

export interface AdminService {
  getMyCinemas(): Promise<Cinema[]>;
  getOverview(): Promise<AdminOverview>;
  getBookings(): Promise<Booking[]>;
  getUsers(): Promise<UserProfile[]>;
  createAuditorium(payload: CreateAuditoriumPayload): Promise<Auditorium>;
  createShowtime(payload: CreateShowtimePayload): Promise<Showtime>;
  updateShowtime(id: string, patch: Partial<CreateShowtimePayload>): Promise<Showtime>;
  deleteShowtime(id: string): Promise<void>;
  getScreenTypes(): Promise<ScreenTypeItem[]>;
  createScreenType(payload: { name: string; description?: string }): Promise<ScreenTypeItem>;
  updateScreenType(id: string, patch: { name?: string; description?: string }): Promise<ScreenTypeItem>;
  deleteScreenType(id: string): Promise<void>;
  createUser(payload: {
    name: string;
    email: string;
    password: string;
    role: "CUSTOMER" | "CINEMA_ADMIN" | "SUPER_ADMIN";
    cinemaId?: string;
  }): Promise<UserProfile>;
  updateUserRole(
    userId: string,
    role: "CUSTOMER" | "CINEMA_ADMIN" | "SUPER_ADMIN",
  ): Promise<UserProfile>;
  updateUser(
    userId: string,
    patch: {
      name?: string;
      email?: string;
      phone?: string;
      city?: string;
      tier?: string;
      role?: "CUSTOMER" | "CINEMA_ADMIN" | "SUPER_ADMIN";
      cinemaId?: string;
    },
  ): Promise<UserProfile>;
  assignCinemaAdmin(cinemaId: string, adminUserId: string): Promise<Cinema>;
}
