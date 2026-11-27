import { Car, MapPin, Speaker, View } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FormatBadge } from "@/components/ui/FormatBadge";
import type { Auditorium, Cinema, Movie, Showtime } from "@/types/domain";

export function CinemaDetailsView({
  cinema,
  auditoriums,
  showtimes,
  movies,
}: {
  cinema: Cinema;
  auditoriums: Auditorium[];
  showtimes: Showtime[];
  movies: Movie[];
}) {
  return (
    <div className="pb-20 space-y-12">
      <section className="relative border-b border-white/10 bg-[#0B0C10]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-[4px] border border-[#F59E0B]/40 bg-[#F59E0B]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#FFB95F]">
                {cinema.tier}
              </span>
              <span className="rounded-[4px] border border-[#06B6D4]/40 bg-[#06B6D4]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4CD7F6]">
                Acoustics ISO 2969 Spec
              </span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-white sm:text-5xl">
              {cinema.name}
            </h1>
            <p className="inline-flex items-center gap-2 text-sm text-[#CAC4D4]">
              <MapPin className="h-4 w-4 text-[#A78BFA]" />
              {cinema.address} • Open until 01:30 AM
            </p>
            <p className="inline-flex items-center gap-2 text-xs text-[#94A3B8]">
              <Car className="h-4 w-4 text-[#06B6D4]" />
              {cinema.parkingInfo} • Concierge: +1 (213) 555-DOME
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
              <div className="glass-card rounded-lg p-3">
                <p className="text-[10px] uppercase text-[#94A3B8]">Auditoriums</p>
                <p className="font-bold text-white">{auditoriums.length} Active</p>
              </div>
              <div className="glass-card rounded-lg p-3">
                <p className="text-[10px] uppercase text-[#94A3B8]">Projection</p>
                <p className="font-bold text-[#CEBDFF]">4K Laser Engines</p>
              </div>
              <div className="glass-card rounded-lg p-3">
                <p className="text-[10px] uppercase text-[#94A3B8]">Audio</p>
                <p className="font-bold text-[#4CD7F6]">128-Ch Atmos</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {cinema.facilities.map((fac) => (
                <span
                  key={fac}
                  className="rounded-[4px] border border-white/10 bg-[#13151B] px-3 py-1 text-xs text-[#E3E2E8]"
                >
                  {fac}
                </span>
              ))}
            </div>
          </div>

          <div className="relative aspect-video overflow-hidden rounded-xl border border-white/15 bg-[#13151B]">
            <Image
              src={cinema.imageUrl}
              alt={cinema.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Auditoriums */}
      <section className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#06B6D4]">
            Auditorium Blueprints
          </p>
          <h2 className="font-display text-2xl font-bold text-white">
            Available Auditoriums &amp; 3D Sightlines
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {auditoriums.map((aud) => {
            const firstShowtime = showtimes.find((s) => s.auditoriumId === aud.id);
            const totalSeats = aud.rows.reduce((sum, r) => sum + r.seatCount, 0);
            return (
              <div
                key={aud.id}
                className="flex flex-col justify-between gap-4 rounded-lg border border-white/10 bg-[#13151B] p-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-bold text-white">{aud.name}</h3>
                    <FormatBadge format={aud.format} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 rounded-[4px] border border-white/10 bg-[#0B0C10] p-3 text-xs">
                    <div>
                      <p className="text-[10px] uppercase text-[#94A3B8]">Screen</p>
                      <p className="font-semibold text-white">
                        {aud.screenWidth}m × {aud.screenHeight}m
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-[#94A3B8]">Capacity</p>
                      <p className="font-semibold text-white">{totalSeats} Seats</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-[#94A3B8]">Acoustics</p>
                      <p className="inline-flex items-center gap-1 font-semibold text-[#4CD7F6]">
                        <Speaker className="h-3 w-3" /> {aud.speakerCount} Ch
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[#94A3B8]">{aud.acousticProfile}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {firstShowtime ? (
                    <Link href={`/seats/${firstShowtime.id}`}>
                      <Button variant="primary" size="sm">
                        <View className="h-3.5 w-3.5" />
                        Launch 3D Seat View
                      </Button>
                    </Link>
                  ) : null}
                  <Link href={`/admin/auditoriums/${aud.id}`}>
                    <Button variant="ghost" size="sm">
                      Inspect Blueprint
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cinema Showtimes */}
      <section className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-bold text-white">Screening Schedule</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {showtimes.map((st) => {
            const movie = movies.find((m) => m.id === st.movieId);
            return (
              <Link
                key={st.id}
                href={`/seats/${st.id}`}
                className="flex flex-col justify-between gap-3 rounded-lg border border-white/10 bg-[#13151B] p-4 hover:border-[#A78BFA]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">{st.date}</span>
                  <span className="font-display text-lg font-bold text-white">{st.time}</span>
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white">
                    {movie?.title ?? "Screening"}
                  </h3>
                  <p className="text-xs text-[#94A3B8]">{st.language}</p>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <FormatBadge format={st.format} />
                  <span className="text-xs font-semibold text-[#A78BFA]">
                    From ${st.basePrice.toFixed(2)} →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
