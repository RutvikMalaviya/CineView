import { DataTypes, type Model } from "sequelize";
import { sequelize } from "../../config/database";
import { defaultModelAttributes } from "../../shared/utils/model-attributes";

export interface ConcessionAttributes {
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
  price: number;
  category: string;
}

export type ConcessionInstance = Model<ConcessionAttributes, Partial<ConcessionAttributes>> &
  ConcessionAttributes;

export const ConcessionModel = sequelize.define<ConcessionInstance>(
  "concession",
  {
    ...defaultModelAttributes,
    name: { type: DataTypes.STRING(160), allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    category: { type: DataTypes.STRING(60), allowNull: false, defaultValue: "snack" },
  },
  { tableName: "concessions", timestamps: false },
);
