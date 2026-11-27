import { DataTypes, type Model } from "sequelize";
import { sequelize } from "../../config/database";
import { ROLES, type Role } from "../../shared/constants/roles";
import { defaultModelAttributes } from "../../shared/utils/model-attributes";

export interface UserNotificationSettings {
  showtimeAlerts: boolean;
  premiereInvites: boolean;
  smsTicketUpdates: boolean;
}

export interface UserAttributes {
  id: string;
  isActive: boolean;
  createdAt: number;
  createdBy: string;
  updatedAt?: number | null;
  updatedBy?: string | null;
  deletedAt?: number | null;
  deletedBy?: string | null;
  isDeleted: boolean;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  emailVerified: boolean;
  phone?: string | null;
  city?: string | null;
  tier: string;
  points: number;
  preferredFormat: string;
  preferredRowZone: "front" | "center" | "rear";
  accessibilityNeeds: boolean;
  savedCinemaIds: string[];
  notifications: UserNotificationSettings;
}

export type UserInstance = Model<UserAttributes, Partial<UserAttributes>> & UserAttributes;

export const UserModel = sequelize.define<UserInstance>(
  "user",
  {
    ...defaultModelAttributes,
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "password_hash",
    },
    role: {
      type: DataTypes.ENUM(ROLES.CUSTOMER, ROLES.CINEMA_ADMIN, ROLES.SUPER_ADMIN),
      allowNull: false,
      defaultValue: ROLES.CUSTOMER,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "email_verified",
    },
    phone: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tier: {
      type: DataTypes.STRING(80),
      allowNull: false,
      defaultValue: "Cinephile • Member",
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    preferredFormat: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: "IMAX with Laser",
      field: "preferred_format",
    },
    preferredRowZone: {
      type: DataTypes.ENUM("front", "center", "rear"),
      allowNull: false,
      defaultValue: "center",
      field: "preferred_row_zone",
    },
    accessibilityNeeds: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "accessibility_needs",
    },
    savedCinemaIds: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      field: "saved_cinema_ids",
    },
    notifications: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        showtimeAlerts: true,
        premiereInvites: true,
        smsTicketUpdates: false,
      },
    },
  },
  {
    tableName: "users",
    timestamps: false,
  },
);
