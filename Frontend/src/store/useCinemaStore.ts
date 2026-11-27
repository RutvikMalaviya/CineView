import { create } from "zustand";
import { readDemoStorage, writeDemoStorage } from "@/lib/storage";

interface CinemaStoreState {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  hydrateCity: () => void;
}

export const useCinemaStore = create<CinemaStoreState>((set) => ({
  selectedCity: "Los Angeles",
  setSelectedCity: (city) => {
    writeDemoStorage("city", city);
    set({ selectedCity: city });
  },
  hydrateCity: () => {
    const saved = readDemoStorage<string>("city", "Los Angeles");
    set({ selectedCity: saved });
  },
}));
