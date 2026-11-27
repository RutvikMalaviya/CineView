"use client";

import { useEffect } from "react";
import { FormatBadge } from "@/components/ui/FormatBadge";
import { BookingSummaryBar } from "@/features/booking/components/BookingSummaryBar";
import { SeatComparisonPanel } from "@/features/seat-comparison/components/SeatComparisonPanel";
import { FormatGuideButton } from "@/features/seat-selection/components/FormatGuideModal";
import { SeatMap2D } from "@/features/seat-selection/components/SeatMap2D";
import { SeatViewSimulator } from "@/features/seat-view/components/SeatViewSimulator";
import { useBookingStore } from "@/store/useBookingStore";
import { useSeatSelectionStore } from "@/store/useSeatSelectionStore";
import type { Auditorium, Cinema, Movie, Seat, Showtime } from "@/types/domain";

export function SeatBookingExperience({
  movie,
  cinema,
  auditorium,
  showtime,
  seats,
}: {
  movie: Movie;
  cinema: Cinema;
  auditorium: Auditorium;
  showtime: Showtime;
  seats: Seat[];
}) {
  const setLayout = useSeatSelectionStore((s) => s.setLayout);
  const { setSelectedMovie, setSelectedCinema, setSelectedShowtime } = useBookingStore();

  useEffect(() => {
    setLayout(showtime.id, auditorium, seats);
    setSelectedMovie(movie);
    setSelectedCinema(cinema);
    setSelectedShowtime(showtime);
  }, [
    showtime,
    auditorium,
    seats,
    movie,
    cinema,
    setLayout,
    setSelectedMovie,
    setSelectedCinema,
    setSelectedShowtime,
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A78BFA]">
            Interactive 3D Seat Selection
          </p>
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
            {movie.title}
          </h1>
          <p className="text-xs text-[#94A3B8]">
            {cinema.name} • {auditorium.name} • {showtime.date} at {showtime.time}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FormatGuideButton />
          <FormatBadge format={showtime.format} />
        </div>
      </div>

      {/* Synchronized 3D Simulator + 2D Seat Map */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <SeatViewSimulator />
        <SeatMap2D />
      </div>

      {/* Seat Comparison */}
      <SeatComparisonPanel />

      {/* Booking Summary */}
      <BookingSummaryBar
        movie={movie}
        cinema={cinema}
        auditorium={auditorium}
        showtime={showtime}
      />
    </div>
  );
}
