import {
  httpAdminService,
  httpAuditoriumService,
  httpAuthService,
  httpBookingService,
  httpCinemaService,
  httpConcessionService,
  httpMovieService,
  httpOfferService,
  httpSeatReservationService,
  httpSeatService,
  httpShowtimeService,
  httpTicketService,
  httpUserService,
} from "@/services/adapters/http-services";
import {
  mockAdminService,
  mockAuditoriumService,
  mockAuthService,
  mockBookingService,
  mockCinemaService,
  mockConcessionService,
  mockMovieService,
  mockOfferService,
  mockSeatReservationService,
  mockSeatService,
  mockShowtimeService,
  mockTicketService,
  mockUserService,
} from "@/services/mock/mock-services";

const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock";
const USE_API = DATA_SOURCE === "api";

export const movieService = USE_API ? httpMovieService : mockMovieService;
export const cinemaService = USE_API ? httpCinemaService : mockCinemaService;
export const auditoriumService = USE_API ? httpAuditoriumService : mockAuditoriumService;
export const showtimeService = USE_API ? httpShowtimeService : mockShowtimeService;
export const seatService = USE_API ? httpSeatService : mockSeatService;
export const bookingService = USE_API ? httpBookingService : mockBookingService;
export const ticketService = USE_API ? httpTicketService : mockTicketService;
export const userService = USE_API ? httpUserService : mockUserService;
export const offerService = USE_API ? httpOfferService : mockOfferService;
export const concessionService = USE_API ? httpConcessionService : mockConcessionService;
export const seatReservationService = USE_API
  ? httpSeatReservationService
  : mockSeatReservationService;
export const authService = USE_API ? httpAuthService : mockAuthService;
export const adminService = USE_API ? httpAdminService : mockAdminService;
