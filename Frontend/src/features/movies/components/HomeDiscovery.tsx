"use client";

import {
  ArrowRight,
  Building2,
  MapPin,
  Play,
  Radio,
  Search,
  Sparkles,
  Star,
  View,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MovieCard } from "@/components/shared/MovieCard";
import { Button } from "@/components/ui/Button";
import { FormatBadge } from "@/components/ui/FormatBadge";
import { EmptyState } from "@/components/ui/StateViews";
import { useCinemaStore } from "@/store/useCinemaStore";
import type { Cinema, Movie } from "@/types/domain";

const GENRES = ["All", "Sci-Fi", "Action", "Noir", "Thriller", "Drama", "Adventure"];

const PREVIEW_ROWS = [
  { row: "A", tier: "standard", seats: [1, 2, 3, 4, 5, 6, 7, 8] },
  { row: "B", tier: "premium", seats: [1, 2, 3, 4, 5, 6, 7, 8] },
  { row: "C", tier: "vip", seats: [1, 2, 3, 4, 5, 6, 7, 8] },
];

export function HomeDiscovery({
  movies,
  cinemas,
}: {
  movies: Movie[];
  cinemas: Cinema[];
}) {
  const { selectedCity, setSelectedCity } = useCinemaStore();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [previewSeat, setPreviewSeat] = useState("B-4");

  const featured = movies[0];
  const filteredNowShowing = useMemo(() => {
    return movies.filter((m) => {
      if (m.status !== "now_showing") return false;
      if (genre !== "All" && !m.genres.includes(genre)) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [movies, genre, query]);

  const comingSoon = useMemo(
    () => movies.filter((m) => m.status === "coming_soon"),
    [movies],
  );

  const recommended = useMemo(
    () => movies.filter((m) => m.recommended),
    [movies],
  );

  return (
    <div className="space-y-16 pb-20">
      {/* Section 1: Stitch Hero Banner */}
      {featured ? (
        <section className="relative overflow-hidden border-b border-white/10 bg-[#0B0C10]">
          <div className="absolute inset-0">
            <Image
              src={featured.backdropUrl}
              alt={featured.title}
              fill
              priority
              loading="eager"
              sizes="100vw"
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0C10] via-[#0B0C10]/85 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C10] via-transparent to-transparent" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.35fr_0.65fr] lg:items-end lg:px-8">
            <div className="max-w-2xl space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-[4px] border border-[#F59E0B]/40 bg-[#F59E0B]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#FFB95F]">
                  <Star className="h-3 w-3 fill-current" /> 9.6 Critic Score
                </span>
                <span className="rounded-[4px] border border-[#A78BFA]/40 bg-[#A78BFA]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#CEBDFF]">
                  {featured.durationMinutes} MIN · {featured.genres[0]} · {featured.rating}
                </span>
                <FormatBadge format="IMAX with Laser" />
                <FormatBadge format="Dolby Cinema" />
              </div>

              <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[56px] lg:leading-[60px]">
                {featured.title}
              </h1>

              <p className="text-base text-[#CAC4D4] sm:text-lg">{featured.tagline}</p>

              <p className="text-sm leading-relaxed text-[#94A3B8]">{featured.description}</p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/seats/st-dune-imax-1915">
                  <Button variant="primary" size="lg">
                    <View className="h-4 w-4" />
                    Book Tickets (Instant 3D Seat View)
                  </Button>
                </Link>
                <Button variant="ghost" size="lg" onClick={() => setTrailerOpen(true)}>
                  <Play className="h-4 w-4 text-[#A78BFA]" />
                  Watch 4K Trailer ({featured.trailerDuration})
                </Button>
              </div>
            </div>

            {/* Stitch Hero Quick Specs Card */}
            <div className="glass-panel hidden rounded-2xl p-5 space-y-3 lg:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4CD7F6]">
                Premiere Auditorium #01
              </p>
              <h2 className="font-display text-lg font-bold text-white">
                CineView Premiere Dome
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-white/10 bg-black/30 p-2.5">
                  <p className="text-[10px] text-[#94A3B8]">Projection</p>
                  <p className="font-semibold text-white">Dual 4K Laser</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 p-2.5">
                  <p className="text-[10px] text-[#94A3B8]">Audio Array</p>
                  <p className="font-semibold text-[#4CD7F6]">128-Ch Atmos</p>
                </div>
              </div>
              <Link
                href="/seats/st-dune-imax-1915"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#CEBDFF] hover:text-white"
              >
                Explore 3D Sightlines <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Trailer Modal */}
      {trailerOpen && featured ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${featured.title} Trailer Preview`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
        >
          <div className="glass-panel w-full max-w-2xl rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-white">
                {featured.title} — Official Trailer
              </h2>
              <button
                type="button"
                onClick={() => setTrailerOpen(false)}
                className="rounded-[4px] border border-white/15 px-3 py-1 text-xs text-white hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-[#0B0C10]">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${featured.trailerYoutubeId}?autoplay=1&rel=0`}
                title={`${featured.title} Official Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Search, City & Genre Controls */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="glass-panel flex flex-col gap-4 rounded-xl p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search films, directors, or genres..."
              aria-label="Search movies"
              className="w-full rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10]/80 py-2 pl-9 pr-3 text-sm text-white placeholder:text-[#94A3B8] focus:border-[#A78BFA] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#A78BFA]" />
            <select
              aria-label="Select city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10]/80 px-3 py-2 text-xs font-semibold text-white focus:border-[#A78BFA] focus:outline-none"
            >
              <option value="Los Angeles">Los Angeles</option>
              <option value="All Cities">All Cities</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by genre">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenre(g)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                genre === g
                  ? "bg-[#A78BFA] text-[#0B0C10]"
                  : "border border-white/10 bg-[#13151B]/80 text-[#94A3B8] hover:text-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </section>

      {/* Section 2: Curated Film Repertory */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A78BFA]">
              Now Projecting Across All Auditoriums
            </p>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Curated Film Repertory
            </h2>
          </div>
          <Link
            href="/movies"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#CEBDFF] hover:text-white"
          >
            Full Film Catalog <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {filteredNowShowing.length === 0 ? (
          <EmptyState
            title="No matching screenings"
            description="Try clearing your search query or switching to All genres."
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setGenre("All");
                }}
              >
                Reset Filters
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredNowShowing.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      {/* Section 3: Stitch Live Top-Down Seat Matrix Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-panel grid gap-8 rounded-2xl p-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#4CD7F6]">
              <Radio className="h-3.5 w-3.5" /> Live Top-Down Matrix
            </div>
            <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
              Auditorium Alpha • IMAX Dome
            </h2>
            <p className="text-sm text-[#94A3B8]">
              Preview real-time seat geometry before you book. Click any seat below to preview
              its coordinates, then jump straight into the full 3D theater simulator.
            </p>

            {/* Interactive Mini Matrix */}
            <div className="space-y-2 rounded-xl border border-white/10 bg-[#0B0C10]/70 p-4">
              <div className="mx-auto mb-3 max-w-xs text-center">
                <div className="h-1.5 w-full rounded-t-full border-t-2 border-white/75 bg-gradient-to-b from-[#A78BFA]/30 to-transparent" />
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                  Curved Laser Screen (68 ft)
                </span>
              </div>
              {PREVIEW_ROWS.map((r) => (
                <div key={r.row} className="flex items-center justify-center gap-1.5">
                  <span className="w-4 font-mono text-[10px] text-[#94A3B8]">{r.row}</span>
                  {r.seats.map((num) => {
                    const id = `${r.row}-${num}`;
                    const selected = previewSeat === id;
                    const reserved = r.row === "B" && num === 6;
                    return (
                      <button
                        key={id}
                        type="button"
                        disabled={reserved}
                        onClick={() => setPreviewSeat(id)}
                        className={`h-7 w-7 rounded-[4px] border font-mono text-[10px] transition-all cursor-pointer ${
                          reserved
                            ? "border-transparent bg-[#1E212B] opacity-40 cursor-not-allowed"
                            : selected
                              ? "border-[#C4B5FD] bg-[#A78BFA] font-bold text-[#0B0C10] seat-glow scale-110"
                              : r.tier === "vip"
                                ? "border-[#F59E0B] bg-[#F59E0B]/10 text-[#FFB95F]"
                                : "border-[#3F4458] bg-[#13151B] text-[#CAC4D4] hover:border-[#A78BFA]"
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card flex flex-col justify-between gap-5 rounded-xl p-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FFB95F]">
                Selected Preview Seat
              </span>
              <h3 className="font-display text-3xl font-extrabold text-white">
                Seat {previewSeat}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Instant 3D camera alignment + Dolby Atmos L/R spatial balance + THX viewing angle
                score ready in the full simulator.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg border border-white/10 bg-black/30 p-2.5">
                <p className="text-[10px] text-[#94A3B8]">FOV</p>
                <p className="font-bold text-[#CEBDFF]">48°</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/30 p-2.5">
                <p className="text-[10px] text-[#94A3B8]">Atmos</p>
                <p className="font-bold text-[#4CD7F6]">96/100</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/30 p-2.5">
                <p className="text-[10px] text-[#94A3B8]">Tilt</p>
                <p className="font-bold text-white">4.2°</p>
              </div>
            </div>
            <Link href="/seats/st-dune-imax-1915">
              <Button variant="primary" size="lg" className="w-full">
                <View className="h-4 w-4" />
                Launch Full 3D Seat View
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recommended Picks */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#06B6D4]">
            Best in IMAX &amp; Dolby
          </p>
          <h2 className="font-display text-2xl font-bold text-white">Popular Picks</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {recommended.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Section 4: Future Attractions & Festival Slate */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#F59E0B]">
              <Sparkles className="h-3.5 w-3.5" /> Future Attractions &amp; Festival Slate
            </p>
            <h2 className="font-display text-2xl font-bold text-white">
              Anticipated Releases
            </h2>
          </div>
          <Link
            href="/movies"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#CEBDFF] hover:text-white"
          >
            Full Calendar <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {comingSoon.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Section 5: Flagship Architectural Palaces */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#F59E0B]">
              <Building2 className="h-3.5 w-3.5" /> Flagship Architectural Palaces
            </p>
            <h2 className="font-display text-2xl font-bold text-white">
              The CineView Network
            </h2>
          </div>
          <Link
            href="/cinemas"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#CEBDFF] hover:text-white"
          >
            View Blueprints <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {cinemas.map((cinema, idx) => (
            <Link
              key={cinema.id}
              href={`/cinemas/${cinema.id}`}
              className="glass-card group overflow-hidden rounded-xl"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-[#0D0E12]">
                <Image
                  src={cinema.imageUrl}
                  alt={cinema.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="space-y-2 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#FFB95F]">
                  FLAGSHIP ARCH 0{idx + 1} • {cinema.tier}
                </p>
                <h3 className="font-display text-base font-bold text-white group-hover:text-[#CEBDFF]">
                  {cinema.name}
                </h3>
                <p className="text-xs text-[#94A3B8]">{cinema.address}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
