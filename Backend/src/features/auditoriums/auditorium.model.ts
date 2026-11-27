import { DataTypes, type Model } from "sequelize";
import { sequelize } from "../../config/database";
import { defaultModelAttributes } from "../../shared/utils/model-attributes";

export interface AuditoriumRowConfig {
  rowLabel: string;
  seatCount: number;
  aisleAfterSeats: number[];
  category: "standard" | "premium" | "vip" | "accessible";
  priceMultiplier: number;
  elevationY: number;
  zOffset: number;
}

export interface AuditoriumAttributes {
  id: string;
  isActive: boolean;
  createdAt: number;
  createdBy: string;
  updatedAt?: number | null;
  updatedBy?: string | null;
  deletedAt?: number | null;
  deletedBy?: string | null;
  isDeleted: boolean;
  cinemaId: string;
  name: string;
  format: string;
  screenWidth: number;
  screenHeight: number;
  screenPosition: [number, number, number];
  screenCurveRadius: number;
  speakerCount: number;
  acousticProfile: string;
  rows: AuditoriumRowConfig[];
  defaultRows: AuditoriumRowConfig[];
}

export type AuditoriumInstance = Model<AuditoriumAttributes, Partial<AuditoriumAttributes>> &
  AuditoriumAttributes;

export const AuditoriumModel = sequelize.define<AuditoriumInstance>(
  "auditorium",
  {
    ...defaultModelAttributes,
    cinemaId: { type: DataTypes.STRING(40), allowNull: false, field: "cinema_id" },
    name: { type: DataTypes.STRING(150), allowNull: false },
    format: { type: DataTypes.STRING(60), allowNull: false },
    screenWidth: { type: DataTypes.FLOAT, allowNull: false, field: "screen_width" },
    screenHeight: { type: DataTypes.FLOAT, allowNull: false, field: "screen_height" },
    screenPosition: { type: DataTypes.JSONB, allowNull: false, field: "screen_position" },
    screenCurveRadius: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 48,
      field: "screen_curve_radius",
    },
    speakerCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 16,
      field: "speaker_count",
    },
    acousticProfile: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: "Dolby Atmos 64-Channel",
      field: "acoustic_profile",
    },
    rows: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    defaultRows: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      field: "default_rows",
    },
  },
  { tableName: "auditoriums", timestamps: false },
);
