"use client";

import { View } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FormatBadge } from "@/components/ui/FormatBadge";
import { EmptyState } from "@/components/ui/StateViews";
import type { Cinema, Movie, Showtime } from "@/types/domain";

export function ShowtimeSelectorView({
  movies,
  cinemas,
  showtimes,
}: {
  movies: Movie[];
  cinemas: Cinema[];
  showtimes: Showtime[];
}) {
  const dates = useMemo(
    () => Array.from(new Set(showtimes.map((s) => s.date))),
    [showtimes],
  );
  const [date, setDate] = useState(dates[0] ?? "2026-11-26");
  const [movieId, setMovieId] = useState("all");
  const [cinemaId, setCinemaId] = useState("all");

  const filtered = useMemo(() => {
    return showtimes.filter((st) => {
      if (st.date !== date) return false;
      if (movieId !== "all" && st.movieId !== movieId) return false;
      if (cinemaId !== "all" && st.cinemaId !== cinemaId) return false;
      return true;
    });
  }, [showtimes, date, movieId, cinemaId]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A78BFA]">
          Showtime Selection
        </p>
        <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
          Choose Date, Cinema &amp; Format
        </h1>
      </div>

      <div className="grid gap-4 rounded-lg border border-white/10 bg-[#13151B] p-4 md:grid-cols-3">
        <div>
          <label htmlFor="st-date" className="mb-1 block text-[11px] font-bold uppercase tracking-[0.1em] text-[#94A3B8]">
            Date
          </label>
          <select
            id="st-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] px-3 py-2 text-sm text-white"
          >
            {dates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="st-movie" className="mb-1 block text-[11px] font-bold uppercase tracking-[0.1em] text-[#94A3B8]">
            Movie
          </label>
          <select
            id="st-movie"
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
            className="w-full rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] px-3 py-2 text-sm text-white"
          >
            <option value="all">All Films</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="st-cinema" className="mb-1 block text-[11px] font-bold uppercase tracking-[0.1em] text-[#94A3B8]">
            Cinema
          </label>
          <select
            id="st-cinema"
            value={cinemaId}
            onChange={(e) => setCinemaId(e.target.value)}
            className="w-full rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] px-3 py-2 text-sm text-white"
          >
            <option value="all">All Cinemas</option>
            {cinemas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No showtimes available"
          description="Try another date or reset your movie/cinema filter."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((st) => {
            const movie = movies.find((m) => m.id === st.movieId);
            const cinema = cinemas.find((c) => c.id === st.cinemaId);
            return (
              <Link
                key={st.id}
                href={`/seats/${st.id}`}
                className="flex flex-col justify-between gap-4 rounded-lg border border-white/10 bg-[#13151B] p-5 hover:border-[#A78BFA] transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl font-bold text-white">{st.time}</span>
                    <span className="text-sm font-semibold text-[#CEBDFF]">
                      ${st.basePrice.toFixed(2)}
                    </span>
                  </div>
                  <h2 className="font-display text-base font-bold text-white">
                    {movie?.title}
                  </h2>
                  <p className="text-xs text-[#94A3B8]">{cinema?.name}</p>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <FormatBadge format={st.format} />
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#A78BFA]">
                    <View className="h-3.5 w-3.5" /> Select Seats →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
