import { DataTypes, type Model } from "sequelize";
import { sequelize } from "../../config/database";
import { defaultModelAttributes } from "../../shared/utils/model-attributes";

export interface ShowtimeAttributes {
  id: string;
  isActive: boolean;
  createdAt: number;
  createdBy: string;
  updatedAt?: number | null;
  updatedBy?: string | null;
  deletedAt?: number | null;
  deletedBy?: string | null;
  isDeleted: boolean;
  movieId: string;
  cinemaId: string;
  auditoriumId: string;
  date: string;
  time: string;
  format: string;
  language: string;
  basePrice: number;
  totalSeats: number;
  badge?: string | null;
}

export type ShowtimeInstance = Model<ShowtimeAttributes, Partial<ShowtimeAttributes>> &
  ShowtimeAttributes;

export const ShowtimeModel = sequelize.define<ShowtimeInstance>(
  "showtime",
  {
    ...defaultModelAttributes,
    movieId: { type: DataTypes.STRING(40), allowNull: false, field: "movie_id" },
    cinemaId: { type: DataTypes.STRING(40), allowNull: false, field: "cinema_id" },
    auditoriumId: { type: DataTypes.STRING(40), allowNull: false, field: "auditorium_id" },
    date: { type: DataTypes.STRING(20), allowNull: false },
    time: { type: DataTypes.STRING(10), allowNull: false },
    format: { type: DataTypes.STRING(60), allowNull: false },
    language: { type: DataTypes.STRING(40), allowNull: false, defaultValue: "English" },
    basePrice: { type: DataTypes.FLOAT, allowNull: false, field: "base_price" },
    totalSeats: { type: DataTypes.INTEGER, allowNull: false, field: "total_seats" },
    badge: { type: DataTypes.STRING(60), allowNull: true },
  },
  { tableName: "showtimes", timestamps: false },
);
