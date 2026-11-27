"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { MovieCard } from "@/components/shared/MovieCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/StateViews";
import type { Movie, ScreeningFormat } from "@/types/domain";

const FORMAT_FILTERS: ("All Formats" | ScreeningFormat)[] = [
  "All Formats",
  "IMAX with Laser",
  "Dolby Cinema",
  "70mm Film",
  "ScreenX 270°",
  "Standard 2D",
];

const GENRE_FILTERS = ["All", "Sci-Fi", "Action", "Noir", "Thriller", "Mystery", "Drama", "Festival"];

export function MoviesCatalog({ movies }: { movies: Movie[] }) {
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<"All Formats" | ScreeningFormat>("All Formats");
  const [genre, setGenre] = useState("All");
  const [status, setStatus] = useState<"all" | "now_showing" | "coming_soon">("all");
  const [selectedDay, setSelectedDay] = useState("TODAY");

  const DAYS = ["TODAY", "TOMORROW", "SAT", "SUN", "MON", "TUE"];

  const filtered = useMemo(() => {
    return movies.filter((m) => {
      if (status !== "all" && m.status !== status) return false;
      if (format !== "All Formats" && !m.formats.includes(format)) return false;
      if (genre !== "All" && !m.genres.includes(genre)) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.director.toLowerCase().includes(q) ||
          m.tagline.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [movies, status, format, genre, query]);

  return (
    <div className="mx-auto max-w-7xl space-y-7 px-4 py-10 sm:px-6 lg:px-8">
      {/* Stitch Top Telemetry & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-[#94A3B8]">
          CineView / <strong className="text-white">Film Repertory</strong> • {movies.length} Titles in Active 3D Sightline Rotation
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-[4px] border border-[#A78BFA]/35 bg-[#A78BFA]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#CEBDFF]">
            True 4K Dual Laser
          </span>
          <span className="rounded-[4px] border border-[#06B6D4]/35 bg-[#06B6D4]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#4CD7F6]">
            64-Ch Spatial Raycast Live
          </span>
        </div>
      </div>

      {/* Stitch Date Strip */}
      <div className="flex flex-wrap gap-2">
        {DAYS.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => setSelectedDay(day)}
            className={`rounded-lg border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] cursor-pointer transition-all ${
              selectedDay === day
                ? "border-[#A78BFA] bg-[#A78BFA] text-[#0B0C10]"
                : "border-white/10 bg-[#13151B]/70 text-[#94A3B8] hover:text-white"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A78BFA]">
          Master Repertoire • Curated Seasonal Showcase
        </p>
        <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
          Film Repertory &amp; Now Screening
        </h1>
        <p className="max-w-2xl text-sm text-[#94A3B8]">
          Architectural cinema presented in 70mm, IMAX Dual 4K Laser, and 64-Channel Dolby Atmos.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4 rounded-lg border border-white/10 bg-[#13151B] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by title or director..."
              aria-label="Filter movies"
              className="w-full rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] py-2 pl-9 pr-3 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#A78BFA] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All Releases"],
                ["now_showing", "Now Showing"],
                ["coming_soon", "Coming Soon"],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setStatus(val)}
                className={`rounded-[4px] px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  status === val
                    ? "bg-[#A78BFA] text-[#0B0C10]"
                    : "border border-white/10 bg-[#0B0C10] text-[#94A3B8] hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {FORMAT_FILTERS.map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setFormat(fmt)}
              className={`rounded-[4px] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] cursor-pointer ${
                format === fmt
                  ? "border border-[#06B6D4] bg-[#06B6D4]/15 text-[#4CD7F6]"
                  : "border border-white/10 bg-[#0B0C10] text-[#94A3B8] hover:text-white"
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {GENRE_FILTERS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenre(g)}
              className={`rounded-full px-3 py-1 text-xs font-medium cursor-pointer ${
                genre === g
                  ? "bg-[#A78BFA]/20 text-[#CEBDFF] border border-[#A78BFA]/40"
                  : "bg-[#1A1B20] text-[#94A3B8] hover:text-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No films match those filters"
          description="Adjust your format, genre, or search term to view available screenings."
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setFormat("All Formats");
                setGenre("All");
                setStatus("all");
              }}
            >
              Clear All Filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
