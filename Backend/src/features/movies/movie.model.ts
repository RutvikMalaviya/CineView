import { DataTypes, type Model } from "sequelize";
import { sequelize } from "../../config/database";
import { defaultModelAttributes } from "../../shared/utils/model-attributes";

export interface MovieAttributes {
  id: string;
  isActive: boolean;
  createdAt: number;
  createdBy: string;
  updatedAt?: number | null;
  updatedBy?: string | null;
  deletedAt?: number | null;
  deletedBy?: string | null;
  isDeleted: boolean;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  genres: string[];
  durationMinutes: number;
  rating: string;
  language: string;
  releaseDate: string;
  status: "now_showing" | "coming_soon";
  formats: string[];
  posterUrl: string;
  backdropUrl: string;
  trailerDuration: string;
  trailerYoutubeId: string;
  director: string;
  cast: Array<{ name: string; role: string }>;
  popularityScore: number;
  recommended: boolean;
}

export type MovieInstance = Model<MovieAttributes, Partial<MovieAttributes>> & MovieAttributes;

export const MovieModel = sequelize.define<MovieInstance>(
  "movie",
  {
    ...defaultModelAttributes,
    slug: { type: DataTypes.STRING(160), allowNull: false },
    title: { type: DataTypes.STRING(200), allowNull: false },
    tagline: { type: DataTypes.STRING(300), allowNull: false, defaultValue: "" },
    description: { type: DataTypes.TEXT, allowNull: false },
    genres: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    durationMinutes: { type: DataTypes.INTEGER, allowNull: false, field: "duration_minutes" },
    rating: { type: DataTypes.STRING(20), allowNull: false },
    language: { type: DataTypes.STRING(60), allowNull: false },
    releaseDate: { type: DataTypes.STRING(20), allowNull: false, field: "release_date" },
    status: {
      type: DataTypes.ENUM("now_showing", "coming_soon"),
      allowNull: false,
      defaultValue: "now_showing",
    },
    formats: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    posterUrl: { type: DataTypes.STRING(500), allowNull: false, field: "poster_url" },
    backdropUrl: { type: DataTypes.STRING(500), allowNull: false, field: "backdrop_url" },
    trailerDuration: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "2:15",
      field: "trailer_duration",
    },
    trailerYoutubeId: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: "",
      field: "trailer_youtube_id",
    },
    director: { type: DataTypes.STRING(120), allowNull: false },
    cast: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    popularityScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 80,
      field: "popularity_score",
    },
    recommended: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { tableName: "movies", timestamps: false },
);
