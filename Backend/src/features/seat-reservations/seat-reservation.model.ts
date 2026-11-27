import { DataTypes, type Model } from "sequelize";
import { sequelize } from "../../config/database";
import { defaultModelAttributes } from "../../shared/utils/model-attributes";

export type ReservationStatus = "RESERVED" | "CONFIRMED" | "EXPIRED" | "RELEASED";

export interface SeatReservationAttributes {
  id: string;
  isActive: boolean;
  createdAt: number;
  createdBy: string;
  updatedAt?: number | null;
  updatedBy?: string | null;
  deletedAt?: number | null;
  deletedBy?: string | null;
  isDeleted: boolean;
  reservationGroupId: string;
  showtimeId: string;
  userId: string;
  seatLabel: string;
  status: ReservationStatus;
  expiresAt: number;
}

export type SeatReservationInstance = Model<
  SeatReservationAttributes,
  Partial<SeatReservationAttributes>
> &
  SeatReservationAttributes;

export const SeatReservationModel = sequelize.define<SeatReservationInstance>(
  "seat_reservation",
  {
    ...defaultModelAttributes,
    reservationGroupId: {
      type: DataTypes.STRING(40),
      allowNull: false,
      field: "reservation_group_id",
    },
    showtimeId: { type: DataTypes.STRING(40), allowNull: false, field: "showtime_id" },
    userId: { type: DataTypes.STRING(40), allowNull: false, field: "user_id" },
    seatLabel: { type: DataTypes.STRING(16), allowNull: false, field: "seat_label" },
    status: {
      type: DataTypes.ENUM("RESERVED", "CONFIRMED", "EXPIRED", "RELEASED"),
      allowNull: false,
      defaultValue: "RESERVED",
    },
    expiresAt: { type: DataTypes.BIGINT, allowNull: false, field: "expires_at" },
  },
  { tableName: "seat_reservations", timestamps: false },
);
