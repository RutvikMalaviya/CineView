import { DataTypes, type Model } from "sequelize";
import { sequelize } from "../../config/database";
import { defaultModelAttributes } from "../../shared/utils/model-attributes";

export interface CinemaAttributes {
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
  tier: string;
  city: string;
  address: string;
  distanceMiles: number;
  facilities: string[];
  imageUrl: string;
  parkingInfo: string;
  adminUserId?: string | null;
}

export type CinemaInstance = Model<CinemaAttributes, Partial<CinemaAttributes>> & CinemaAttributes;

export const CinemaModel = sequelize.define<CinemaInstance>(
  "cinema",
  {
    ...defaultModelAttributes,
    name: { type: DataTypes.STRING(180), allowNull: false },
    tier: { type: DataTypes.STRING(80), allowNull: false, defaultValue: "Flagship" },
    city: { type: DataTypes.STRING(100), allowNull: false },
    address: { type: DataTypes.STRING(300), allowNull: false },
    distanceMiles: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1.0,
      field: "distance_miles",
    },
    facilities: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    imageUrl: { type: DataTypes.STRING(500), allowNull: false, field: "image_url" },
    parkingInfo: {
      type: DataTypes.STRING(300),
      allowNull: false,
      defaultValue: "",
      field: "parking_info",
    },
    adminUserId: { type: DataTypes.STRING(40), allowNull: true, field: "admin_user_id" },
  },
  { tableName: "cinemas", timestamps: false },
);
