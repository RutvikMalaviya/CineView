import { z } from "zod";

export const listMoviesQuerySchema = z.object({
  query: z.string().trim().max(100).optional(),
  genre: z.string().trim().max(60).optional(),
  format: z.string().trim().max(60).optional(),
  status: z.enum(["now_showing", "coming_soon"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createMovieSchema = z.object({
  slug: z.string().trim().min(2).max(160),
  title: z.string().trim().min(1).max(200),
  tagline: z.string().trim().max(300).default(""),
  description: z.string().trim().min(10),
  genres: z.array(z.string().min(1)).min(1),
  durationMinutes: z.number().int().positive(),
  rating: z.string().trim().min(1).max(20),
  language: z.string().trim().min(1).max(60),
  releaseDate: z.string().trim().min(4).max(20),
  status: z.enum(["now_showing", "coming_soon"]).default("now_showing"),
  formats: z.array(z.string().min(1)).min(1),
  posterUrl: z.string().trim().min(1).max(500),
  backdropUrl: z.string().trim().min(1).max(500),
  trailerDuration: z.string().trim().max(20).default("2:15"),
  trailerYoutubeId: z.string().trim().max(40).default(""),
  director: z.string().trim().min(1).max(120),
  cast: z.array(z.object({ name: z.string().min(1), role: z.string().min(1) })).default([]),
  popularityScore: z.number().int().min(0).max(100).default(80),
  recommended: z.boolean().default(false),
});

export type ListMoviesQuery = z.infer<typeof listMoviesQuerySchema>;
export type CreateMovieInput = z.infer<typeof createMovieSchema>;
