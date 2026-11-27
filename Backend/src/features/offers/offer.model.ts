import { DataTypes, type Model } from "sequelize";
import { sequelize } from "../../config/database";
import { defaultModelAttributes } from "../../shared/utils/model-attributes";

export interface OfferAttributes {
  id: string;
  isActive: boolean;
  createdAt: number;
  createdBy: string;
  updatedAt?: number | null;
  updatedBy?: string | null;
  deletedAt?: number | null;
  deletedBy?: string | null;
  isDeleted: boolean;
  code: string;
  title: string;
  description: string;
  discountType: "percentage" | "fixed" | "perk";
  discountValue: number;
  minTickets: number;
  accent: "primary" | "secondary" | "tertiary";
}

export type OfferInstance = Model<OfferAttributes, Partial<OfferAttributes>> & OfferAttributes;

export const OfferModel = sequelize.define<OfferInstance>(
  "offer",
  {
    ...defaultModelAttributes,
    code: { type: DataTypes.STRING(40), allowNull: false },
    title: { type: DataTypes.STRING(160), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    discountType: {
      type: DataTypes.ENUM("percentage", "fixed", "perk"),
      allowNull: false,
      field: "discount_type",
    },
    discountValue: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      field: "discount_value",
    },
    minTickets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: "min_tickets",
    },
    accent: {
      type: DataTypes.ENUM("primary", "secondary", "tertiary"),
      allowNull: false,
      defaultValue: "primary",
    },
  },
  { tableName: "offers", timestamps: false },
);
