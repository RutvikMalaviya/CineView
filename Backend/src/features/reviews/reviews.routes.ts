import type { Request, Response } from "express";
import { Router } from "express";
import { DataTypes, type Model } from "sequelize";
import { z } from "zod";
import { sequelize } from "../../config/database";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { requireAuth } from "../../shared/middlewares/auth.middleware";
import { validateRequest } from "../../shared/middlewares/validate.middleware";
import { asyncHandler } from "../../shared/utils/async-handler";
import { defaultModelAttributes } from "../../shared/utils/model-attributes";
import { sendSuccess } from "../../shared/utils/response";

export interface ReviewAttributes {
  id: string;
  isActive: boolean;
  createdAt: number;
  createdBy: string;
  updatedAt?: number | null;
  updatedBy?: string | null;
  deletedAt?: number | null;
  deletedBy?: string | null;
  isDeleted: boolean;
  movieId: string;
  userId: string;
  rating: number;
  comment: string;
}

export type ReviewInstance = Model<ReviewAttributes, Partial<ReviewAttributes>> & ReviewAttributes;

export const ReviewModel = sequelize.define<ReviewInstance>(
  "review",
  {
    ...defaultModelAttributes,
    movieId: { type: DataTypes.STRING(40), allowNull: false, field: "movie_id" },
    userId: { type: DataTypes.STRING(40), allowNull: false, field: "user_id" },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: false },
  },
  { tableName: "reviews", timestamps: false },
);

const createReviewSchema = z.object({
  movieId: z.string().min(1).max(40),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(1000),
});

export const reviewsRouter = Router();

reviewsRouter.get(
  "/movie/:movieId",
  asyncHandler(async (req: Request, res: Response) => {
    const reviews = await ReviewModel.findAll({
      where: { movieId: String(req.params.movieId), isDeleted: false, isActive: true },
      order: [["createdAt", "DESC"]],
    });
    sendSuccess(
      res,
      HTTP_STATUS.OK,
      "responses.success",
      reviews.map((r) => r.get({ plain: true })),
    );
  }),
);

reviewsRouter.post(
  "/",
  requireAuth,
  validateRequest({ body: createReviewSchema }),
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as z.infer<typeof createReviewSchema>;
    const now = Math.floor(Date.now() / 1000);
    const created = await ReviewModel.create({
      movieId: body.movieId,
      userId: req.user!.id,
      rating: body.rating,
      comment: body.comment,
      createdAt: now,
      createdBy: req.user!.id,
    });
    sendSuccess(res, HTTP_STATUS.CREATED, "responses.success", created.get({ plain: true }));
  }),
);
