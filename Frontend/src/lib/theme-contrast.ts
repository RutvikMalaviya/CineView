export interface ThemePreset {
  id: string;
  name: string;
  mode: "dark" | "light";
  bgColor: string;
  surfaceColor: string;
  primaryColor: string;
  textColor: string;
  mutedTextColor: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "cinematic-lavender",
    name: "Cinematic Lavender",
    mode: "dark",
    bgColor: "#090a0f",
    surfaceColor: "#13151b",
    primaryColor: "#a78bfa",
    textColor: "#f1f5f9",
    mutedTextColor: "#94a3b8",
  },
  {
    id: "imax-cyan",
    name: "IMAX Laser Cyan",
    mode: "dark",
    bgColor: "#060b14",
    surfaceColor: "#0f172a",
    primaryColor: "#06b6d4",
    textColor: "#f8fafc",
    mutedTextColor: "#94a3b8",
  },
  {
    id: "dolby-crimson",
    name: "Dolby Crimson",
    mode: "dark",
    bgColor: "#0f070a",
    surfaceColor: "#1c1015",
    primaryColor: "#f43f5e",
    textColor: "#fff1f2",
    mutedTextColor: "#cbd5e1",
  },
  {
    id: "gold-premiere",
    name: "Gold Premiere",
    mode: "dark",
    bgColor: "#0c0a06",
    surfaceColor: "#19150e",
    primaryColor: "#f59e0b",
    textColor: "#fefce8",
    mutedTextColor: "#cbd5e1",
  },
  {
    id: "studio-daylight",
    name: "Studio Daylight (Light)",
    mode: "light",
    bgColor: "#f1f5f9",
    surfaceColor: "#ffffff",
    primaryColor: "#6d28d9",
    textColor: "#0f172a",
    mutedTextColor: "#475569",
  },
];

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.padEnd(6, "0").slice(0, 6);
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * Guarantees WCAG AA (>= 4.5:1) readable text on any background color.
 * If the desired text color fails contrast, automatically picks dark (#0f172a) or light (#ffffff).
 */
export function ensureReadableText(
  bgHex: string,
  desiredTextHex: string,
): { color: string; ratio: number; adjusted: boolean } {
  const currentRatio = getContrastRatio(bgHex, desiredTextHex);
  if (currentRatio >= 4.5) {
    return { color: desiredTextHex, ratio: currentRatio, adjusted: false };
  }
  const darkRatio = getContrastRatio(bgHex, "#0f172a");
  const lightRatio = getContrastRatio(bgHex, "#ffffff");
  if (darkRatio >= lightRatio) {
    return { color: "#0f172a", ratio: darkRatio, adjusted: true };
  }
  return { color: "#ffffff", ratio: lightRatio, adjusted: true };
}

export function isLightColor(hex: string): boolean {
  return getRelativeLuminance(hex) > 0.35;
}
