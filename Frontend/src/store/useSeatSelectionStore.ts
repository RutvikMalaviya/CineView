import { create } from "zustand";
import type { Auditorium, Seat } from "@/types/domain";

interface SeatSelectionState {
  showtimeId: string | null;
  auditorium: Auditorium | null;
  seats: Seat[];
  selectedSeatIds: string[];
  /** Seat currently driving the 3D eye-level camera */
  activeCameraSeatId: string | null;
  /** Up to 2–3 seats selected for side-by-side comparison */
  comparisonSeatIds: string[];
  setLayout: (showtimeId: string, auditorium: Auditorium, seats: Seat[]) => void;
  toggleSeat: (seatId: string) => void;
  setActiveCameraSeat: (seatId: string | null) => void;
  toggleComparisonSeat: (seatId: string) => void;
  clearSelection: () => void;
}

const MAX_SEATS_PER_BOOKING = 8;

export const useSeatSelectionStore = create<SeatSelectionState>((set, get) => ({
  showtimeId: null,
  auditorium: null,
  seats: [],
  selectedSeatIds: [],
  activeCameraSeatId: null,
  comparisonSeatIds: [],

  setLayout: (showtimeId, auditorium, seats) => {
    const isSameShowtime = get().showtimeId === showtimeId;
    set({
      showtimeId,
      auditorium,
      seats,
      selectedSeatIds: isSameShowtime ? get().selectedSeatIds : [],
      activeCameraSeatId: isSameShowtime ? get().activeCameraSeatId : null,
      comparisonSeatIds: isSameShowtime ? get().comparisonSeatIds : [],
    });
  },

  toggleSeat: (seatId) => {
    const { seats, selectedSeatIds, activeCameraSeatId } = get();
    const target = seats.find((s) => s.id === seatId);
    if (!target || target.status !== "available") return;

    const alreadySelected = selectedSeatIds.includes(seatId);
    if (alreadySelected) {
      const next = selectedSeatIds.filter((id) => id !== seatId);
      set({
        selectedSeatIds: next,
        activeCameraSeatId:
          activeCameraSeatId === seatId ? (next[next.length - 1] ?? null) : activeCameraSeatId,
      });
    } else {
      if (selectedSeatIds.length >= MAX_SEATS_PER_BOOKING) return;
      const next = [...selectedSeatIds, seatId];
      set({
        selectedSeatIds: next,
        activeCameraSeatId: seatId,
      });
    }
  },

  setActiveCameraSeat: (seatId) => set({ activeCameraSeatId: seatId }),

  toggleComparisonSeat: (seatId) => {
    const { comparisonSeatIds } = get();
    if (comparisonSeatIds.includes(seatId)) {
      set({ comparisonSeatIds: comparisonSeatIds.filter((id) => id !== seatId) });
    } else if (comparisonSeatIds.length < 3) {
      set({ comparisonSeatIds: [...comparisonSeatIds, seatId] });
    } else {
      set({ comparisonSeatIds: [...comparisonSeatIds.slice(1), seatId] });
    }
  },

  clearSelection: () =>
    set({
      selectedSeatIds: [],
      activeCameraSeatId: null,
    }),
}));
