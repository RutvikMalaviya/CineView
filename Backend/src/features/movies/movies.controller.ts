import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { sendSuccess } from "../../shared/utils/response";
import { createMovie, getMovieByIdOrSlug, listMovies } from "./movies.service";
import type { CreateMovieInput, ListMoviesQuery } from "./movies.validator";

export const moviesController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ListMoviesQuery;
    const result = await listMovies(query);
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", result.movies, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  },

  getOne: async (req: Request, res: Response): Promise<void> => {
    const movie = await getMovieByIdOrSlug(String(req.params.id));
    sendSuccess(res, HTTP_STATUS.OK, "responses.success", movie);
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const movie = await createMovie(req.body as CreateMovieInput, req.user!.id);
    sendSuccess(res, HTTP_STATUS.CREATED, "responses.success", movie);
  },
};
