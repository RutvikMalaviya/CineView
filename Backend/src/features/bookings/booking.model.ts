import { DataTypes, type Model } from "sequelize";
import { sequelize } from "../../config/database";
import { defaultModelAttributes } from "../../shared/utils/model-attributes";

export interface BookingSeatSnapshot {
  id: string;
  label: string;
  category: "standard" | "premium" | "vip" | "accessible";
  price: number;
}

export interface BookingConcessionSnapshot {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface BookingAttributes {
  id: string;
  isActive: boolean;
  createdAt: number;
  createdBy: string;
  updatedAt?: number | null;
  updatedBy?: string | null;
  deletedAt?: number | null;
  deletedBy?: string | null;
  isDeleted: boolean;
  userId: string;
  referenceCode: string;
  movieId: string;
  movieTitle: string;
  posterUrl: string;
  cinemaId: string;
  cinemaName: string;
  auditoriumId: string;
  auditoriumName: string;
  showtimeId: string;
  format: string;
  date: string;
  time: string;
  seats: BookingSeatSnapshot[];
  concessions: BookingConcessionSnapshot[];
  offerCode?: string | null;
  subtotal: number;
  convenienceFee: number;
  discount: number;
  total: number;
  status: "pending_payment" | "confirmed" | "completed" | "cancelled";
  paymentMethodLabel: string;
  contactName: string;
  contactEmail: string;
}

export type BookingInstance = Model<BookingAttributes, Partial<BookingAttributes>> &
  BookingAttributes;

export const BookingModel = sequelize.define<BookingInstance>(
  "booking",
  {
    ...defaultModelAttributes,
    userId: { type: DataTypes.STRING(40), allowNull: false, field: "user_id" },
    referenceCode: { type: DataTypes.STRING(32), allowNull: false, field: "reference_code" },
    movieId: { type: DataTypes.STRING(40), allowNull: false, field: "movie_id" },
    movieTitle: { type: DataTypes.STRING(200), allowNull: false, field: "movie_title" },
    posterUrl: { type: DataTypes.STRING(500), allowNull: false, field: "poster_url" },
    cinemaId: { type: DataTypes.STRING(40), allowNull: false, field: "cinema_id" },
    cinemaName: { type: DataTypes.STRING(180), allowNull: false, field: "cinema_name" },
    auditoriumId: { type: DataTypes.STRING(40), allowNull: false, field: "auditorium_id" },
    auditoriumName: { type: DataTypes.STRING(150), allowNull: false, field: "auditorium_name" },
    showtimeId: { type: DataTypes.STRING(40), allowNull: false, field: "showtime_id" },
    format: { type: DataTypes.STRING(60), allowNull: false },
    date: { type: DataTypes.STRING(20), allowNull: false },
    time: { type: DataTypes.STRING(10), allowNull: false },
    seats: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    concessions: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    offerCode: { type: DataTypes.STRING(40), allowNull: true, field: "offer_code" },
    subtotal: { type: DataTypes.FLOAT, allowNull: false },
    convenienceFee: { type: DataTypes.FLOAT, allowNull: false, field: "convenience_fee" },
    discount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    total: { type: DataTypes.FLOAT, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending_payment", "confirmed", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "pending_payment",
    },
    paymentMethodLabel: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "payment_method_label",
    },
    contactName: { type: DataTypes.STRING(120), allowNull: false, field: "contact_name" },
    contactEmail: { type: DataTypes.STRING(255), allowNull: false, field: "contact_email" },
  },
  { tableName: "bookings", timestamps: false },
);
