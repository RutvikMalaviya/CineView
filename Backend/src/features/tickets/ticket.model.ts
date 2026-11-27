import { DataTypes, type Model } from "sequelize";
import { sequelize } from "../../config/database";
import { defaultModelAttributes } from "../../shared/utils/model-attributes";

export interface TicketAttributes {
  id: string;
  isActive: boolean;
  createdAt: number;
  createdBy: string;
  updatedAt?: number | null;
  updatedBy?: string | null;
  deletedAt?: number | null;
  deletedBy?: string | null;
  isDeleted: boolean;
  bookingId: string;
  userId: string;
  referenceCode: string;
  gate: string;
  qrPayload: string;
  voucherCode: string;
  status: "VALID" | "USED" | "CANCELLED";
  verifiedAt?: number | null;
}

export type TicketInstance = Model<TicketAttributes, Partial<TicketAttributes>> & TicketAttributes;

export const TicketModel = sequelize.define<TicketInstance>(
  "ticket",
  {
    ...defaultModelAttributes,
    bookingId: { type: DataTypes.STRING(40), allowNull: false, field: "booking_id" },
    userId: { type: DataTypes.STRING(40), allowNull: false, field: "user_id" },
    referenceCode: { type: DataTypes.STRING(32), allowNull: false, field: "reference_code" },
    gate: { type: DataTypes.STRING(120), allowNull: false },
    qrPayload: { type: DataTypes.STRING(500), allowNull: false, field: "qr_payload" },
    voucherCode: { type: DataTypes.STRING(60), allowNull: false, field: "voucher_code" },
    status: {
      type: DataTypes.ENUM("VALID", "USED", "CANCELLED"),
      allowNull: false,
      defaultValue: "VALID",
    },
    verifiedAt: { type: DataTypes.BIGINT, allowNull: true, field: "verified_at" },
  },
  { tableName: "tickets", timestamps: false },
);
