import { DataTypes, type Model } from "sequelize";
import { sequelize } from "../../config/database";
import { defaultModelAttributes } from "../../shared/utils/model-attributes";

export interface ScreenTypeAttributes {
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
  description: string;
}

export type ScreenTypeInstance = Model<ScreenTypeAttributes, Partial<ScreenTypeAttributes>> &
  ScreenTypeAttributes;

export const ScreenTypeModel = sequelize.define<ScreenTypeInstance>(
  "screen_type",
  {
    ...defaultModelAttributes,
    name: { type: DataTypes.STRING(80), allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: false, defaultValue: "" },
  },
  { tableName: "screen_types", timestamps: false },
);
