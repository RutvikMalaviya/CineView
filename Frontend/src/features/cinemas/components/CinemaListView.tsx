"use client";

import { MapPin, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FormatBadge } from "@/components/ui/FormatBadge";
import { EmptyState } from "@/components/ui/StateViews";
import type { Cinema, Movie, Showtime } from "@/types/domain";

export function CinemaListView({
  cinemas,
  showtimes,
  movies,
}: {
  cinemas: Cinema[];
  showtimes: Showtime[];
  movies: Movie[];
}) {
  const [facilityFilter, setFacilityFilter] = useState("All");

  const filtered = useMemo(() => {
    if (facilityFilter === "All") return cinemas;
    return cinemas.filter((c) =>
      c.facilities.some((f) => f.toLowerCase().includes(facilityFilter.toLowerCase())),
    );
  }, [cinemas, facilityFilter]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A78BFA]">
          Cinemas &amp; Showtimes
        </p>
        <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
          Select Cinema &amp; Screening
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {["All", "IMAX", "Dolby", "Recliner", "ScreenX", "Valet"].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setFacilityFilter(tag)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
              facilityFilter === tag
                ? "bg-[#A78BFA] text-[#0B0C10]"
                : "border border-white/10 bg-[#13151B] text-[#94A3B8] hover:text-white"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No cinemas match this amenity"
          description="Select All to view every flagship CineView theater."
        />
      ) : (
        <div className="space-y-6">
          {filtered.map((cinema) => {
            const cinemaShowtimes = showtimes.filter((s) => s.cinemaId === cinema.id);
            return (
              <div
                key={cinema.id}
                className="rounded-xl border border-white/10 bg-[#13151B] overflow-hidden"
              >
                <div className="grid gap-6 p-6 lg:grid-cols-[320px_1fr]">
                  <Link
                    href={`/cinemas/${cinema.id}`}
                    className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-[#0B0C10]"
                  >
                    <Image
                      src={cinema.imageUrl}
                      alt={cinema.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 320px"
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <div className="space-y-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#FFB95F]">
                          <Sparkles className="h-3 w-3" /> {cinema.tier} • {cinema.distanceMiles} mi
                        </span>
                        <h2 className="font-display text-2xl font-bold text-white mt-1">
                          <Link href={`/cinemas/${cinema.id}`} className="hover:text-[#CEBDFF]">
                            {cinema.name}
                          </Link>
                        </h2>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-[#94A3B8]">
                          <MapPin className="h-3.5 w-3.5 text-[#A78BFA]" />
                          {cinema.address}
                        </p>
                      </div>

                      <Link
                        href={`/cinemas/${cinema.id}`}
                        className="rounded-[4px] border border-[#A78BFA]/40 bg-[#A78BFA]/10 px-3 py-1.5 text-xs font-semibold text-[#CEBDFF] hover:bg-[#A78BFA]/20"
                      >
                        Cinema Details &amp; Blueprints →
                      </Link>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {cinema.facilities.map((fac) => (
                        <span
                          key={fac}
                          className="rounded-[4px] border border-white/10 bg-[#0B0C10] px-2.5 py-1 text-[11px] text-[#CAC4D4]"
                        >
                          {fac}
                        </span>
                      ))}
                    </div>

                    <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
                      {cinemaShowtimes.slice(0, 6).map((st) => {
                        const movie = movies.find((m) => m.id === st.movieId);
                        return (
                          <Link
                            key={st.id}
                            href={`/seats/${st.id}`}
                            className="rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] p-3 hover:border-[#A78BFA] transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-display text-sm font-bold text-white">
                                {st.time}
                              </span>
                              <span className="text-xs font-semibold text-[#CEBDFF]">
                                ${st.basePrice.toFixed(2)}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-xs text-[#E3E2E8]">
                              {movie?.title ?? "Screening"}
                            </p>
                            <div className="mt-2">
                              <FormatBadge format={st.format} />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
