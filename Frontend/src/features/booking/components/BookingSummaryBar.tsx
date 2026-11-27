"use client";

import { ArrowRight, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { calculateBookingTotals } from "@/lib/pricing";
import { useBookingStore } from "@/store/useBookingStore";
import { useSeatSelectionStore } from "@/store/useSeatSelectionStore";
import type { Auditorium, Cinema, Movie, Showtime } from "@/types/domain";

export function BookingSummaryBar({
  movie,
  cinema,
  auditorium,
  showtime,
}: {
  movie: Movie;
  cinema: Cinema;
  auditorium: Auditorium;
  showtime: Showtime;
}) {
  const router = useRouter();
  const { seats, selectedSeatIds, toggleSeat, clearSelection, setActiveCameraSeat } =
    useSeatSelectionStore();
  const { concessions, appliedOffer, setSelectedMovie, setSelectedCinema, setSelectedShowtime } =
    useBookingStore();

  const selectedSeats = useMemo(
    () =>
      selectedSeatIds
        .map((id) => seats.find((s) => s.id === id))
        .filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [selectedSeatIds, seats],
  );

  const totals = useMemo(
    () =>
      calculateBookingTotals(
        selectedSeats.map((s) => ({
          id: s.id,
          label: s.label,
          category: s.category,
          price: s.price,
        })),
        concessions,
        appliedOffer,
      ),
    [selectedSeats, concessions, appliedOffer],
  );

  const handleContinue = () => {
    setSelectedMovie(movie);
    setSelectedCinema(cinema);
    setSelectedShowtime(showtime);
    router.push("/checkout");
  };

  return (
    <div className="glass-panel rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-col justify-between gap-3 border-b border-white/10 pb-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#A78BFA]">
            Booking Summary
          </p>
          <h3 className="font-display text-lg font-bold text-white">
            {movie.title} • {showtime.time}
          </h3>
          <p className="text-xs text-[#94A3B8]">
            {cinema.name} • {auditorium.name} • {showtime.date}
          </p>
        </div>

        {selectedSeats.length > 0 ? (
          <button
            type="button"
            onClick={clearSelection}
            className="inline-flex items-center gap-1 self-start rounded-[4px] border border-white/15 px-2.5 py-1 text-xs text-[#94A3B8] hover:text-white cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Selection
          </button>
        ) : null}
      </div>

      {selectedSeats.length === 0 ? (
        <p className="text-xs text-[#94A3B8]">
          No seats selected yet. Click any available seat on the 2D map or inside the 3D
          auditorium to preview your view and add tickets.
        </p>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#A78BFA]/40 bg-[#A78BFA]/15 px-2.5 py-1 text-xs font-semibold text-white"
              >
                <button
                  type="button"
                  onClick={() => setActiveCameraSeat(s.id)}
                  className="hover:text-[#CEBDFF] cursor-pointer"
                >
                  {s.label} (${s.price.toFixed(2)})
                </button>
                <button
                  type="button"
                  aria-label={`Remove seat ${s.label}`}
                  onClick={() => toggleSeat(s.id)}
                  className="text-[#CAC4D4] hover:text-white cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <div className="text-xs text-[#94A3B8]">
              <span>
                Tickets ({selectedSeats.length}):{" "}
                <strong className="text-white">${totals.seatsSubtotal.toFixed(2)}</strong>
              </span>
              <span className="mx-2">•</span>
              <span>
                Fees: <strong className="text-white">${totals.convenienceFee.toFixed(2)}</strong>
              </span>
              <span className="mx-2">•</span>
              <span className="text-sm text-[#CEBDFF]">
                Total: <strong className="text-white">${totals.total.toFixed(2)}</strong>
              </span>
            </div>

            <Button variant="primary" size="md" onClick={handleContinue}>
              Proceed to Checkout ({selectedSeats.length})
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
