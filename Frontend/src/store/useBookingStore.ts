import { create } from "zustand";
import type { Booking, Cinema, ConcessionItem, Movie, Offer, Showtime } from "@/types/domain";

interface BookingState {
  selectedMovie: Movie | null;
  selectedCinema: Cinema | null;
  selectedDate: string;
  selectedShowtime: Showtime | null;
  concessions: ConcessionItem[];
  appliedOffer: Offer | null;
  lastConfirmedBooking: Booking | null;
  setSelectedMovie: (movie: Movie | null) => void;
  setSelectedCinema: (cinema: Cinema | null) => void;
  setSelectedDate: (date: string) => void;
  setSelectedShowtime: (showtime: Showtime | null) => void;
  toggleConcession: (item: Omit<ConcessionItem, "quantity">) => void;
  setAppliedOffer: (offer: Offer | null) => void;
  setLastConfirmedBooking: (booking: Booking | null) => void;
  resetDraft: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedMovie: null,
  selectedCinema: null,
  selectedDate: "2026-11-26",
  selectedShowtime: null,
  concessions: [],
  appliedOffer: null,
  lastConfirmedBooking: null,

  setSelectedMovie: (selectedMovie) => set({ selectedMovie }),
  setSelectedCinema: (selectedCinema) => set({ selectedCinema }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSelectedShowtime: (selectedShowtime) => set({ selectedShowtime }),

  toggleConcession: (item) => {
    const existing = get().concessions;
    const found = existing.find((c) => c.id === item.id);
    if (found) {
      set({ concessions: existing.filter((c) => c.id !== item.id) });
    } else {
      set({ concessions: [...existing, { ...item, quantity: 1 }] });
    }
  },

  setAppliedOffer: (appliedOffer) => set({ appliedOffer }),
  setLastConfirmedBooking: (lastConfirmedBooking) => set({ lastConfirmedBooking }),

  resetDraft: () =>
    set({
      concessions: [],
      appliedOffer: null,
    }),
}));
