"use client";

import { Eye, GitCompare, X } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { computeSeatViewMetrics } from "@/lib/seat-geometry";
import { useSeatSelectionStore } from "@/store/useSeatSelectionStore";

export function SeatComparisonPanel() {
  const {
    auditorium,
    seats,
    selectedSeatIds,
    comparisonSeatIds,
    setActiveCameraSeat,
    toggleComparisonSeat,
  } = useSeatSelectionStore();

  const targetIds = useMemo(() => {
    if (comparisonSeatIds.length > 0) return comparisonSeatIds;
    return selectedSeatIds.slice(0, 3);
  }, [comparisonSeatIds, selectedSeatIds]);

  const comparedSeats = useMemo(
    () =>
      targetIds
        .map((id) => seats.find((s) => s.id === id))
        .filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [targetIds, seats],
  );

  if (!auditorium || comparedSeats.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center gap-2 text-white">
          <GitCompare className="h-4 w-4 text-[#06B6D4]" />
          <h2 className="font-display text-lg font-bold">Compare Seats</h2>
        </div>
        <p className="mt-1 text-xs text-[#94A3B8]">
          Select 2 or more seats (or turn on Compare Mode) to compare viewing angles, FOV, neck
          tilt, and sound balance side by side.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel space-y-4 rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-[#06B6D4]" />
          <h2 className="font-display text-lg font-bold text-white">Compare Seats</h2>
        </div>
        <span className="text-xs text-[#94A3B8]">
          Comparing {comparedSeats.length} seat{comparedSeats.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {comparedSeats.map((seat) => {
          const metrics = computeSeatViewMetrics(seat, auditorium);
          return (
            <div
              key={seat.id}
              className="glass-card flex flex-col justify-between gap-3 rounded-lg p-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-xl font-bold text-white">
                      Seat {seat.label}
                    </span>
                    <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {metrics.overallScore}/100
                    </span>
                  </div>
                  {comparisonSeatIds.includes(seat.id) ? (
                    <button
                      type="button"
                      aria-label={`Remove ${seat.label} from comparison`}
                      onClick={() => toggleComparisonSeat(seat.id)}
                      className="text-[#94A3B8] hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[10px] uppercase text-[#94A3B8]">Category &amp; Price</p>
                    <p className="font-semibold capitalize text-[#FFB95F]">
                      {seat.category} • ${seat.price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[#94A3B8]">Field of View</p>
                    <p className="font-semibold text-[#CEBDFF]">
                      {metrics.horizontalFovDeg}° FOV
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[#94A3B8]">Screen Distance</p>
                    <p className="font-semibold text-white">{metrics.distanceMeters} m</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[#94A3B8]">Neck Tilt</p>
                    <p className="font-semibold text-white">
                      {metrics.verticalAngleDeg}° ({metrics.neckTiltLabel})
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[#94A3B8]">Dolby Acoustics</p>
                    <p className="font-semibold text-[#4CD7F6]">{metrics.acousticScore}/100</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-[#94A3B8]">Sightline</p>
                    <p className="font-semibold text-[#E3E2E8]">{metrics.viewQualityLabel}</p>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveCameraSeat(seat.id)}
                className="w-full"
              >
                <Eye className="h-3.5 w-3.5 text-[#A78BFA]" />
                Preview 3D View from {seat.label}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
