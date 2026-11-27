import { DataTypes, type Model } from "sequelize";
import { sequelize } from "../../config/database";
import { defaultModelAttributes } from "../../shared/utils/model-attributes";

export interface AuthTokenAttributes {
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
  tokenHash: string;
  expiresAt: number;
  usedAt?: number | null;
}

export type AuthTokenInstance = Model<AuthTokenAttributes, Partial<AuthTokenAttributes>> &
  AuthTokenAttributes;

const tokenFields = {
  ...defaultModelAttributes,
  userId: {
    type: DataTypes.STRING(40),
    allowNull: false,
    field: "user_id",
  },
  tokenHash: {
    type: DataTypes.STRING(128),
    allowNull: false,
    field: "token_hash",
  },
  expiresAt: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: "expires_at",
  },
  usedAt: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: "used_at",
  },
};

export const EmailVerificationModel = sequelize.define<AuthTokenInstance>(
  "email_verification",
  tokenFields,
  { tableName: "email_verifications", timestamps: false },
);

export const PasswordResetModel = sequelize.define<AuthTokenInstance>(
  "password_reset",
  tokenFields,
  { tableName: "password_resets", timestamps: false },
);
