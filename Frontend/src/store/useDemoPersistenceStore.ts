import { create } from "zustand";
import { readDemoStorage, writeDemoStorage } from "@/lib/storage";

interface DemoPersistenceState {
  showAcousticRays: boolean;
  preferNon3DFallback: boolean;
  toggleAcousticRays: () => void;
  setPreferNon3DFallback: (val: boolean) => void;
  hydratePreferences: () => void;
}

export const useDemoPersistenceStore = create<DemoPersistenceState>((set, get) => ({
  showAcousticRays: true,
  preferNon3DFallback: false,

  toggleAcousticRays: () => {
    const next = !get().showAcousticRays;
    writeDemoStorage("acoustic_rays", next);
    set({ showAcousticRays: next });
  },

  setPreferNon3DFallback: (val) => {
    writeDemoStorage("non_3d_fallback", val);
    set({ preferNon3DFallback: val });
  },

  hydratePreferences: () => {
    set({
      showAcousticRays: readDemoStorage("acoustic_rays", true),
      preferNon3DFallback: readDemoStorage("non_3d_fallback", false),
    });
  },
}));
