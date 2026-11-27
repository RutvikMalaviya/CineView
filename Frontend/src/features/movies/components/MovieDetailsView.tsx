"use client";

import { Calendar, Clock, Globe, Play, Users, View } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormatBadge } from "@/components/ui/FormatBadge";
import { EmptyState } from "@/components/ui/StateViews";
import type { Cinema, Movie, Showtime } from "@/types/domain";

export function MovieDetailsView({
  movie,
  showtimes,
  cinemas,
}: {
  movie: Movie;
  showtimes: Showtime[];
  cinemas: Cinema[];
}) {
  const availableDates = useMemo(() => {
    const unique = Array.from(new Set(showtimes.map((s) => s.date)));
    return unique.length > 0 ? unique : ["2026-11-26"];
  }, [showtimes]);

  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const [selectedFormat, setSelectedFormat] = useState<string>("All");
  const [showTrailer, setShowTrailer] = useState(false);

  const filteredShowtimes = useMemo(() => {
    return showtimes.filter((st) => {
      if (st.date !== selectedDate) return false;
      if (selectedFormat !== "All" && st.format !== selectedFormat) return false;
      return true;
    });
  }, [showtimes, selectedDate, selectedFormat]);

  const groupedByCinema = useMemo(() => {
    return cinemas
      .map((cinema) => ({
        cinema,
        times: filteredShowtimes.filter((st) => st.cinemaId === cinema.id),
      }))
      .filter((group) => group.times.length > 0);
  }, [cinemas, filteredShowtimes]);

  return (
    <div className="pb-20">
      {/* Backdrop Hero */}
      <section className="relative border-b border-white/10 bg-[#0B0C10]">
        <div className="absolute inset-0">
          <Image
            src={movie.backdropUrl}
            alt={movie.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-[#0B0C10]/80 to-transparent" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-white/15 bg-[#13151B] shadow-2xl">
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill
              sizes="(max-width: 1024px) 100vw, 260px"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-end space-y-5">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-[4px] border border-white/20 bg-[#13151B] px-2.5 py-0.5 text-xs font-bold text-white">
                {movie.rating}
              </span>
              {movie.formats.map((f) => (
                <FormatBadge key={f} format={f} />
              ))}
            </div>

            <h1 className="font-display text-3xl font-extrabold text-white sm:text-5xl">
              {movie.title}
            </h1>
            <p className="text-base text-[#CEBDFF]">{movie.tagline}</p>
            <p className="max-w-3xl text-sm leading-relaxed text-[#94A3B8]">
              {movie.description}
            </p>

            <div className="flex flex-wrap gap-6 text-xs text-[#CAC4D4]">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#A78BFA]" />
                {movie.durationMinutes} min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-[#06B6D4]" />
                {movie.language}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#F59E0B]" />
                Release: {movie.releaseDate}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-[#A78BFA]" />
                Director: {movie.director}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.cast.map((member) => (
                <span
                  key={member.name}
                  className="rounded-[4px] border border-white/10 bg-[#13151B] px-2.5 py-1 text-xs text-[#E3E2E8]"
                >
                  {member.name} <span className="text-[#94A3B8]">as {member.role}</span>
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {filteredShowtimes[0] ? (
                <Link href={`/seats/${filteredShowtimes[0].id}`}>
                  <Button variant="primary" size="lg">
                    <View className="h-4 w-4" />
                    Book Tickets &amp; 3D Seat Preview
                  </Button>
                </Link>
              ) : null}
              <Button variant="ghost" size="lg" onClick={() => setShowTrailer((v) => !v)}>
                <Play className="h-4 w-4 text-[#A78BFA]" />
                {showTrailer ? "Hide Trailer Preview" : `Trailer (${movie.trailerDuration})`}
              </Button>
            </div>

            {showTrailer ? (
              <div className="glass-panel mt-4 overflow-hidden rounded-xl p-3">
                <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${movie.trailerYoutubeId}?autoplay=1&rel=0`}
                    title={`${movie.title} Official Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Stitch Section 2: Narrative Continuum & Technical Projection Specs */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="glass-panel grid gap-6 rounded-2xl p-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4CD7F6]">
              The Narrative Continuum
            </p>
            <h2 className="font-display text-2xl font-bold text-white">{movie.tagline}</h2>
            <p className="text-sm leading-relaxed text-[#CAC4D4]">{movie.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-white/10 bg-black/30 p-3">
              <p className="text-[10px] uppercase text-[#94A3B8]">Master Format</p>
              <p className="font-semibold text-white">{movie.formats[0] ?? "IMAX Laser"}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-3">
              <p className="text-[10px] uppercase text-[#94A3B8]">Runtime</p>
              <p className="font-semibold text-[#CEBDFF]">{movie.durationMinutes} min</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-3">
              <p className="text-[10px] uppercase text-[#94A3B8]">Sound Mix</p>
              <p className="font-semibold text-[#4CD7F6]">Dolby Atmos 128-Ch</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-3">
              <p className="text-[10px] uppercase text-[#94A3B8]">Rating</p>
              <p className="font-semibold text-[#FFB95F]">{movie.rating}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Showtimes Matrix */}
      <section className="mx-auto max-w-7xl space-y-6 px-4 pt-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A78BFA]">
              Reserve Your Perspective
            </p>
            <h2 className="font-display text-2xl font-bold text-white">
              Select Date, Format &amp; Showtime
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableDates.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDate(d)}
                className={`rounded-[4px] px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  selectedDate === d
                    ? "bg-[#A78BFA] text-[#0B0C10]"
                    : "border border-white/10 bg-[#13151B] text-[#94A3B8] hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {["All", ...movie.formats].map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setSelectedFormat(fmt)}
              className={`rounded-[4px] px-3 py-1 text-xs font-semibold cursor-pointer ${
                selectedFormat === fmt
                  ? "border border-[#06B6D4] bg-[#06B6D4]/15 text-[#4CD7F6]"
                  : "border border-white/10 bg-[#13151B] text-[#94A3B8]"
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>

        {groupedByCinema.length === 0 ? (
          <EmptyState
            title="No showtimes for this filter"
            description="Select another date or format to view available 3D seat maps."
          />
        ) : (
          <div className="space-y-4">
            {groupedByCinema.map(({ cinema, times }) => (
              <div
                key={cinema.id}
                className="rounded-lg border border-white/10 bg-[#13151B] p-5 space-y-4"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <Link
                      href={`/cinemas/${cinema.id}`}
                      className="font-display text-lg font-bold text-white hover:text-[#CEBDFF]"
                    >
                      {cinema.name}
                    </Link>
                    <p className="text-xs text-[#94A3B8]">{cinema.address}</p>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#FFB95F]">
                    {cinema.tier}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {times.map((st) => (
                    <Link
                      key={st.id}
                      href={`/seats/${st.id}`}
                      className="group flex flex-col justify-between gap-2 rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] p-3.5 transition-all hover:border-[#A78BFA] hover:shadow-[0_0_16px_rgba(167,139,250,0.2)]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-lg font-bold text-white">
                          {st.time}
                        </span>
                        <span className="text-xs font-semibold text-[#CEBDFF]">
                          ${st.basePrice.toFixed(2)}
                        </span>
                      </div>
                      <FormatBadge format={st.format} />
                      <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
                        <span>{st.seatsAvailable} seats open</span>
                        <span className="font-semibold text-[#A78BFA] group-hover:translate-x-0.5 transition-transform">
                          3D Map →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
