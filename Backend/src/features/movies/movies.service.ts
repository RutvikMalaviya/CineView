import { Op } from "sequelize";
import { HTTP_STATUS } from "../../shared/constants/http-status";
import { AppError } from "../../shared/errors/app-error";
import { MovieModel, type MovieAttributes } from "./movie.model";
import type { CreateMovieInput, ListMoviesQuery } from "./movies.validator";

export async function listMovies(filters: ListMoviesQuery): Promise<{
  movies: MovieAttributes[];
  total: number;
  page: number;
  limit: number;
}> {
  const all = await MovieModel.findAll({
    where: {
      isDeleted: false,
      isActive: true,
      ...(filters.status ? { status: filters.status } : {}),
    },
    order: [["popularityScore", "DESC"]],
  });

  let filtered = all.map((m) => m.get({ plain: true }));

  if (filters.genre && filters.genre !== "All") {
    filtered = filtered.filter((m) => m.genres.includes(filters.genre!));
  }
  if (filters.format && filters.format !== "All Formats") {
    filtered = filtered.filter((m) => m.formats.includes(filters.format!));
  }
  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.tagline.toLowerCase().includes(q) ||
        m.genres.some((g) => g.toLowerCase().includes(q)),
    );
  }

  const total = filtered.length;
  const offset = (filters.page - 1) * filters.limit;
  const movies = filtered.slice(offset, offset + filters.limit);

  return { movies, total, page: filters.page, limit: filters.limit };
}

export async function getMovieByIdOrSlug(idOrSlug: string): Promise<MovieAttributes> {
  const movie = await MovieModel.findOne({
    where: {
      isDeleted: false,
      isActive: true,
      [Op.or]: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
  });

  if (!movie) {
    throw new AppError("Movie not found", HTTP_STATUS.NOT_FOUND, "MOVIE_NOT_FOUND");
  }

  return movie.get({ plain: true });
}

export async function createMovie(
  input: CreateMovieInput,
  actorId: string,
): Promise<MovieAttributes> {
  const now = Math.floor(Date.now() / 1000);
  const movie = await MovieModel.create({
    ...input,
    createdAt: now,
    createdBy: actorId,
  });
  return movie.get({ plain: true });
}
