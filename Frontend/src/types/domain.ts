export type ScreeningFormat =
  | "IMAX with Laser"
  | "Dolby Cinema"
  | "70mm Film"
  | "ScreenX 270°"
  | "Standard 2D";

export type SeatCategory = "standard" | "premium" | "vip" | "accessible";

export type SeatStatus = "available" | "booked" | "unavailable";

export interface CastMember {
  name: string;
  role: string;
}

export interface Movie {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  genres: string[];
  durationMinutes: number;
  rating: string;
  language: string;
  releaseDate: string;
  status: "now_showing" | "coming_soon";
  formats: ScreeningFormat[];
  posterUrl: string;
  backdropUrl: string;
  trailerDuration: string;
  trailerYoutubeId: string;
  director: string;
  cast: CastMember[];
  popularityScore: number;
  recommended: boolean;
}

export interface Cinema {
  id: string;
  name: string;
  tier: string;
  city: string;
  address: string;
  distanceMiles: number;
  facilities: string[];
  imageUrl: string;
  auditoriumIds: string[];
  parkingInfo: string;
  adminUserId?: string | null;
}

export interface AuditoriumRowConfig {
  rowLabel: string;
  seatCount: number;
  aisleAfterSeats: number[];
  category: SeatCategory;
  priceMultiplier: number;
  elevationY: number;
  zOffset: number;
}

export interface Auditorium {
  id: string;
  cinemaId: string;
  name: string;
  format: ScreeningFormat;
  screenWidth: number;
  screenHeight: number;
  screenPosition: [number, number, number];
  screenCurveRadius: number;
  speakerCount: number;
  acousticProfile: string;
  rows: AuditoriumRowConfig[];
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  label: string;
  category: SeatCategory;
  status: SeatStatus;
  price: number;
  /** 3D auditorium coordinates in meters relative to screen center (0, 0, 0) */
  position: [number, number, number];
  /** Yaw rotation in radians facing the screen */
  orientationRad: number;
}

export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  auditoriumId: string;
  date: string;
  time: string;
  format: ScreeningFormat;
  language: string;
  basePrice: number;
  seatsAvailable: number;
  totalSeats: number;
  badge?: string;
}

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed" | "perk";
  discountValue: number;
  minTickets: number;
  accent: "primary" | "secondary" | "tertiary";
}

export interface DemoPaymentMethod {
  id: string;
  label: string;
  type: "demo_wallet" | "demo_card" | "demo_pass";
  maskedLast4?: string;
}

export type UserRole = "CUSTOMER" | "CINEMA_ADMIN" | "SUPER_ADMIN";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  phone: string;
  city: string;
  tier: string;
  points: number;
  preferredFormat: ScreeningFormat;
  preferredRowZone: "front" | "center" | "rear";
  accessibilityNeeds: boolean;
  savedCinemaIds: string[];
  demoPaymentMethods?: DemoPaymentMethod[];
  notifications: {
    showtimeAlerts: boolean;
    premiereInvites: boolean;
    smsTicketUpdates: boolean;
  };
}

export interface BookingSeatSnapshot {
  id: string;
  label: string;
  category: SeatCategory;
  price: number;
}

export interface ConcessionItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Booking {
  id: string;
  referenceCode: string;
  movieId: string;
  movieTitle: string;
  posterUrl: string;
  cinemaId: string;
  cinemaName: string;
  auditoriumId: string;
  auditoriumName: string;
  showtimeId: string;
  format: ScreeningFormat;
  date: string;
  time: string;
  seats: BookingSeatSnapshot[];
  concessions: ConcessionItem[];
  subtotal: number;
  convenienceFee: number;
  discount: number;
  total: number;
  status: "confirmed" | "completed" | "cancelled";
  paymentMethodLabel: string;
  contactName: string;
  contactEmail: string;
  createdAt: string;
}

export interface DigitalTicket {
  bookingId: string;
  referenceCode: string;
  movieTitle: string;
  posterUrl: string;
  cinemaName: string;
  auditoriumName: string;
  format: ScreeningFormat;
  date: string;
  time: string;
  seatLabels: string[];
  gate: string;
  qrPayload: string;
  voucherCode: string;
  isDemoCredential: true;
}

export interface PaymentDemoResult {
  success: boolean;
  transactionRef: string;
  message: string;
}
