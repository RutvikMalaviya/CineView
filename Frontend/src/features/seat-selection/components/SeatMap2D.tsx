"use client";

import { Bell, Flame, GitCompare, RotateCcw, Users, ZoomIn, ZoomOut } from "lucide-react";
import { useMemo, useState } from "react";
import { computeSeatViewMetrics, findBestGroupSeats } from "@/lib/seat-geometry";
import { useSeatSelectionStore } from "@/store/useSeatSelectionStore";
import type { Seat } from "@/types/domain";

type SeatFilter = "all" | "center" | "no_front" | "vip";

function getSeatButtonClasses(
  seat: Seat,
  isSelected: boolean,
  isCameraActive: boolean,
  heatmapMode: boolean,
  score: number,
  matchesFilter: boolean,
) {
  if (seat.status !== "available") {
    return "bg-[#1E212B] border-transparent text-[#94A3B8]/30 opacity-45 cursor-not-allowed";
  }
  if (isSelected) {
    return `bg-[#A78BFA] border-[#C4B5FD] text-[#0B0C10] font-bold seat-glow ${
      isCameraActive ? "ring-2 ring-white/80 scale-110" : ""
    }`;
  }
  const dim = matchesFilter ? "" : "opacity-25";
  if (heatmapMode) {
    if (score >= 90) {
      return `bg-emerald-500/25 border-emerald-400 text-emerald-200 hover:scale-110 ${dim}`;
    }
    if (score >= 78) {
      return `bg-[#06B6D4]/20 border-[#06B6D4] text-[#4CD7F6] hover:scale-110 ${dim}`;
    }
    return `bg-[#F59E0B]/15 border-[#F59E0B]/70 text-[#FFB95F] hover:scale-110 ${dim}`;
  }
  if (seat.category === "vip") {
    return `bg-[#F59E0B]/10 border-[#F59E0B] text-[#FFB95F] hover:bg-[#F59E0B]/25 hover:scale-110 ${dim}`;
  }
  if (seat.category === "premium") {
    return `bg-[#06B6D4]/10 border-[#06B6D4]/70 text-[#4CD7F6] hover:border-[#4CD7F6] hover:scale-110 ${dim}`;
  }
  if (seat.category === "accessible") {
    return `bg-emerald-500/10 border-emerald-400/70 text-emerald-300 hover:scale-110 ${dim}`;
  }
  return `bg-[#13151B] border-[#3F4458] text-[#CAC4D4] hover:border-[#A78BFA] hover:scale-110 ${dim}`;
}

export function SeatMap2D() {
  const {
    auditorium,
    seats,
    selectedSeatIds,
    activeCameraSeatId,
    comparisonSeatIds,
    toggleSeat,
    toggleComparisonSeat,
    clearSelection,
    setActiveCameraSeat,
  } = useSeatSelectionStore();

  const [zoom, setZoom] = useState(1);
  const [compareMode, setCompareMode] = useState(false);
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [seatFilter, setSeatFilter] = useState<SeatFilter>("all");
  const [alertSaved, setAlertSaved] = useState(false);

  const seatScores = useMemo(() => {
    const map = new Map<string, number>();
    if (!auditorium) return map;
    for (const s of seats) {
      map.set(s.id, computeSeatViewMetrics(s, auditorium).overallScore);
    }
    return map;
  }, [seats, auditorium]);

  if (!auditorium) return null;

  const handleFindBestGroup = (groupSize: number) => {
    const best = findBestGroupSeats(seats, auditorium, groupSize);
    if (best.length === 0) return;
    clearSelection();
    best.forEach((s) => toggleSeat(s.id));
    const middle = best[Math.floor(best.length / 2)];
    if (middle) setActiveCameraSeat(middle.id);
  };

  return (
    <div className="glass-panel space-y-4 rounded-xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold text-white">
            Choose Your Seats
          </h2>
          <p className="text-xs text-[#94A3B8]">
            {compareMode
              ? "Compare mode: tap seats to compare angles and distance."
              : heatmapMode
                ? "Heatmap mode: green = 90+ Sweet Spot, cyan = 78–89, amber = <78."
                : "Tap any seat to select it and preview the screen view in 3D."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setHeatmapMode((v) => !v)}
            aria-pressed={heatmapMode}
            className={`inline-flex items-center gap-1 rounded-[4px] border px-2.5 py-1 text-xs font-semibold cursor-pointer ${
              heatmapMode
                ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                : "border-white/15 bg-[#0B0C10] text-[#CAC4D4] hover:text-white"
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            Score Heatmap
          </button>
          <button
            type="button"
            onClick={() => setCompareMode((v) => !v)}
            aria-pressed={compareMode}
            className={`inline-flex items-center gap-1 rounded-[4px] border px-2.5 py-1 text-xs font-semibold cursor-pointer ${
              compareMode
                ? "border-[#06B6D4] bg-[#06B6D4]/15 text-[#4CD7F6]"
                : "border-white/15 bg-[#0B0C10] text-[#CAC4D4] hover:text-white"
            }`}
          >
            <GitCompare className="h-3.5 w-3.5" />
            Compare
          </button>
          <button
            type="button"
            aria-label="Zoom out seat map"
            onClick={() => setZoom((z) => Math.max(0.75, Number((z - 0.15).toFixed(2))))}
            className="rounded-[4px] border border-white/15 bg-[#0B0C10] p-1.5 text-white hover:border-[#A78BFA]"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Zoom in seat map"
            onClick={() => setZoom((z) => Math.min(1.45, Number((z + 0.15).toFixed(2))))}
            className="rounded-[4px] border border-white/15 bg-[#0B0C10] p-1.5 text-white hover:border-[#A78BFA]"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Reset seat map zoom"
            onClick={() => setZoom(1)}
            className="rounded-[4px] border border-white/15 bg-[#0B0C10] p-1.5 text-white hover:border-[#A78BFA]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Best Group Seat Finder + Smart Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#0B0C10]/60 px-3 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#CEBDFF]">
            <Users className="h-3.5 w-3.5 text-[#A78BFA]" /> Best Seats for:
          </span>
          {[1, 2, 3, 4].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => handleFindBestGroup(count)}
              className="rounded-[4px] border border-[#A78BFA]/35 bg-[#A78BFA]/10 px-2 py-0.5 text-[11px] font-bold text-[#CEBDFF] hover:bg-[#A78BFA] hover:text-[#0B0C10] cursor-pointer"
            >
              {count}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {(
            [
              ["all", "All"],
              ["center", "Center Only"],
              ["no_front", "No Front Row"],
              ["vip", "VIP"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSeatFilter(key)}
              className={`rounded-[4px] px-2 py-0.5 text-[10px] font-semibold cursor-pointer ${
                seatFilter === key
                  ? "bg-[#A78BFA] text-[#0B0C10]"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAlertSaved((v) => !v)}
            className={`ml-1 inline-flex items-center gap-1 rounded-[4px] border px-2 py-0.5 text-[10px] font-semibold cursor-pointer ${
              alertSaved
                ? "border-[#F59E0B] bg-[#F59E0B]/15 text-[#FFB95F]"
                : "border-white/10 text-[#94A3B8] hover:text-white"
            }`}
          >
            <Bell className="h-3 w-3" />
            {alertSaved ? "Alert Active" : "Seat Alert"}
          </button>
        </div>
      </div>

      {/* Screen Arc */}
      <div className="mx-auto max-w-md pt-1 text-center">
        <div className="h-2 w-full rounded-t-full border-t-2 border-white/80 bg-gradient-to-b from-[#A78BFA]/30 to-transparent" />
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#94A3B8]">
          Screen • {auditorium.name}
        </p>
      </div>

      {/* Scrollable/Zoomable Seat Grid */}
      <div className="overflow-x-auto pb-2">
        <div
          className="mx-auto flex w-max flex-col gap-2 transition-transform origin-top"
          style={{ transform: `scale(${zoom})` }}
        >
          {auditorium.rows.map((row) => {
            const rowSeats = seats.filter((s) => s.row === row.rowLabel);
            return (
              <div key={row.rowLabel} className="flex items-center gap-2">
                <span className="w-5 text-center font-mono text-xs font-bold text-[#94A3B8]">
                  {row.rowLabel}
                </span>

                <div className="flex items-center gap-1.5">
                  {rowSeats.map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    const isCameraActive = activeCameraSeatId === seat.id;
                    const isCompared = comparisonSeatIds.includes(seat.id);
                    const hasAisleAfter = row.aisleAfterSeats.includes(seat.number);
                    const score = seatScores.get(seat.id) ?? 80;

                    const matchesFilter =
                      seatFilter === "all"
                        ? true
                        : seatFilter === "center"
                          ? Math.abs(seat.position[0]) <= 2.6
                          : seatFilter === "no_front"
                            ? seat.row !== "A" && seat.row !== "B"
                            : seat.category === "vip";

                    return (
                      <div key={seat.id} className={hasAisleAfter ? "mr-4" : ""}>
                        <button
                          type="button"
                          disabled={seat.status !== "available"}
                          title={`Seat ${seat.label} • Score ${score}/100 • $${seat.price.toFixed(2)}`}
                          aria-label={`Seat ${seat.label}, ${seat.category}, $${seat.price.toFixed(2)}, score ${score}, ${
                            seat.status !== "available"
                              ? "booked"
                              : isSelected
                                ? "selected"
                                : "available"
                          }`}
                          aria-pressed={isSelected}
                          onClick={() =>
                            compareMode
                              ? toggleComparisonSeat(seat.id)
                              : toggleSeat(seat.id)
                          }
                          className={`relative flex h-7 w-7 items-center justify-center rounded-[4px] border text-[10px] font-mono transition-all cursor-pointer ${getSeatButtonClasses(
                            seat,
                            isSelected,
                            isCameraActive,
                            heatmapMode,
                            score,
                            matchesFilter,
                          )} ${isCompared ? "ring-2 ring-[#06B6D4]" : ""}`}
                        >
                          {heatmapMode && seat.status === "available" && !isSelected
                            ? score
                            : seat.number}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <span className="w-5 text-center font-mono text-xs font-bold text-[#94A3B8]">
                  {row.rowLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seat Category Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 border-t border-white/10 pt-3 text-[11px] text-[#94A3B8]">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[2px] border border-[#3F4458] bg-[#13151B]" />
          Standard
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[2px] border border-[#06B6D4] bg-[#06B6D4]/15" />
          Premium
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[2px] border border-[#F59E0B] bg-[#F59E0B]/15" />
          VIP Recliner
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[2px] border border-emerald-400 bg-emerald-500/15" />
          Accessible
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[2px] bg-[#A78BFA]" />
          Selected
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[2px] bg-[#1E212B] opacity-45" />
          Booked
        </span>
      </div>
    </div>
  );
}
