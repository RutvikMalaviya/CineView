import { create } from "zustand";
import { readDemoStorage, writeDemoStorage } from "@/lib/storage";
import {
  ensureReadableText,
  isLightColor,
  THEME_PRESETS,
  type ThemePreset,
} from "@/lib/theme-contrast";

interface ThemeState {
  presetId: string;
  bgColor: string;
  primaryColor: string;
  textColor: string;
  mode: "dark" | "light";
  contrastRatio: number;
  contrastAdjusted: boolean;
  setPreset: (presetId: string) => void;
  setCustomColors: (patch: {
    bgColor?: string;
    primaryColor?: string;
    textColor?: string;
  }) => void;
  hydrateTheme: () => void;
}

const DEFAULT_PRESET = THEME_PRESETS[0];

export function applyThemeToDocument(state: {
  bgColor: string;
  primaryColor: string;
  textColor: string;
  mode: "dark" | "light";
}) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const onPrimary = ensureReadableText(state.primaryColor, "#0b0c10").color;
  const muted = state.mode === "light" ? "#475569" : "#94a3b8";

  root.dataset.themeMode = state.mode;
  root.classList.toggle("dark", state.mode === "dark");
  root.style.setProperty("--cv-bg", state.bgColor);
  root.style.setProperty("--cv-primary", state.primaryColor);
  root.style.setProperty("--cv-on-primary", onPrimary);
  root.style.setProperty("--cv-text", state.textColor);
  root.style.setProperty("--cv-text-muted", muted);
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  presetId: DEFAULT_PRESET.id,
  bgColor: DEFAULT_PRESET.bgColor,
  primaryColor: DEFAULT_PRESET.primaryColor,
  textColor: DEFAULT_PRESET.textColor,
  mode: DEFAULT_PRESET.mode,
  contrastRatio: 16.5,
  contrastAdjusted: false,

  setPreset: (presetId) => {
    const preset: ThemePreset =
      THEME_PRESETS.find((p) => p.id === presetId) ?? DEFAULT_PRESET;
    const check = ensureReadableText(preset.bgColor, preset.textColor);
    const next = {
      presetId: preset.id,
      bgColor: preset.bgColor,
      primaryColor: preset.primaryColor,
      textColor: check.color,
      mode: preset.mode,
      contrastRatio: check.ratio,
      contrastAdjusted: check.adjusted,
    };
    writeDemoStorage("theme", next);
    applyThemeToDocument(next);
    set(next);
  },

  setCustomColors: (patch) => {
    const curr = get();
    const bgColor = patch.bgColor ?? curr.bgColor;
    const primaryColor = patch.primaryColor ?? curr.primaryColor;
    const desiredText = patch.textColor ?? curr.textColor;
    const mode = isLightColor(bgColor) ? "light" : "dark";
    const check = ensureReadableText(bgColor, desiredText);

    const next = {
      presetId: "custom",
      bgColor,
      primaryColor,
      textColor: check.color,
      mode: mode as "dark" | "light",
      contrastRatio: check.ratio,
      contrastAdjusted: check.adjusted,
    };
    writeDemoStorage("theme", next);
    applyThemeToDocument(next);
    set(next);
  },

  hydrateTheme: () => {
    const saved = readDemoStorage<Partial<ThemeState> | null>("theme", null);
    if (!saved || !saved.bgColor || !saved.primaryColor || !saved.textColor) {
      applyThemeToDocument(DEFAULT_PRESET);
      return;
    }
    const mode = isLightColor(saved.bgColor) ? "light" : "dark";
    const check = ensureReadableText(saved.bgColor, saved.textColor);
    const next = {
      presetId: saved.presetId ?? "custom",
      bgColor: saved.bgColor,
      primaryColor: saved.primaryColor,
      textColor: check.color,
      mode: mode as "dark" | "light",
      contrastRatio: check.ratio,
      contrastAdjusted: check.adjusted,
    };
    applyThemeToDocument(next);
    set(next);
  },
}));
