import { DataTypes, type Model } from "sequelize";
import { sequelize } from "../../config/database";
import { defaultModelAttributes } from "../../shared/utils/model-attributes";

export type PaymentIntentStatus =
  | "requires_payment_method"
  | "requires_confirmation"
  | "succeeded"
  | "failed"
  | "canceled";

export interface PaymentAttributes {
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
  provider: string;
  paymentIntentId: string;
  clientSecret: string;
  amountCents: number;
  currency: string;
  status: PaymentIntentStatus;
  idempotencyKey: string;
  failureReason?: string | null;
}

export type PaymentInstance = Model<PaymentAttributes, Partial<PaymentAttributes>> &
  PaymentAttributes;

export const PaymentModel = sequelize.define<PaymentInstance>(
  "payment",
  {
    ...defaultModelAttributes,
    bookingId: { type: DataTypes.STRING(40), allowNull: false, field: "booking_id" },
    userId: { type: DataTypes.STRING(40), allowNull: false, field: "user_id" },
    provider: { type: DataTypes.STRING(40), allowNull: false },
    paymentIntentId: {
      type: DataTypes.STRING(120),
      allowNull: false,
      field: "payment_intent_id",
    },
    clientSecret: { type: DataTypes.STRING(200), allowNull: false, field: "client_secret" },
    amountCents: { type: DataTypes.INTEGER, allowNull: false, field: "amount_cents" },
    currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: "usd" },
    status: {
      type: DataTypes.ENUM(
        "requires_payment_method",
        "requires_confirmation",
        "succeeded",
        "failed",
        "canceled",
      ),
      allowNull: false,
      defaultValue: "requires_confirmation",
    },
    idempotencyKey: { type: DataTypes.STRING(100), allowNull: false, field: "idempotency_key" },
    failureReason: { type: DataTypes.STRING(255), allowNull: true, field: "failure_reason" },
  },
  { tableName: "payments", timestamps: false },
);

export const PaymentWebhookEventModel = sequelize.define(
  "payment_webhook_event",
  {
    ...defaultModelAttributes,
    eventId: { type: DataTypes.STRING(120), allowNull: false, field: "event_id" },
    provider: { type: DataTypes.STRING(40), allowNull: false },
    eventType: { type: DataTypes.STRING(100), allowNull: false, field: "event_type" },
    payload: { type: DataTypes.JSONB, allowNull: false },
    processedAt: { type: DataTypes.BIGINT, allowNull: false, field: "processed_at" },
  },
  { tableName: "payment_webhook_events", timestamps: false },
);
