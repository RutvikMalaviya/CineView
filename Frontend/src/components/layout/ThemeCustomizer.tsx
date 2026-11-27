"use client";

import { CheckCircle2, Palette, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { THEME_PRESETS } from "@/lib/theme-contrast";
import { useThemeStore } from "@/store/useThemeStore";

export function ThemeCustomizer() {
  const [open, setOpen] = useState(false);
  const {
    presetId,
    bgColor,
    primaryColor,
    textColor,
    contrastRatio,
    contrastAdjusted,
    setPreset,
    setCustomColors,
    hydrateTheme,
  } = useThemeStore();

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Customize theme and colors"
        title="Customize Theme & Text Colors"
        className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-white/15 bg-[#13151B]/80 text-[#CEBDFF] hover:border-[#A78BFA] cursor-pointer"
      >
        <Palette className="h-4 w-4" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Theme and Color Customizer"
          className="fixed inset-0 z-50 flex items-start justify-end bg-black/50 p-4 pt-16 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel w-full max-w-sm rounded-2xl p-5 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#A78BFA]">
                  Dynamic Theme
                </p>
                <h2 className="font-display text-lg font-bold">
                  Colors &amp; Contrast Guard
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close theme customizer"
                onClick={() => setOpen(false)}
                className="rounded-[4px] border border-white/15 p-1 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <p className="text-xs font-semibold opacity-80">Theme Presets</p>
              <div className="grid grid-cols-1 gap-2">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setPreset(preset.id)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer transition-all ${
                      presetId === preset.id
                        ? "border-[#A78BFA] bg-[#A78BFA]/20"
                        : "border-white/15 hover:border-white/30"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-4 w-4 rounded-full border border-white/30"
                        style={{ backgroundColor: preset.bgColor }}
                      />
                      <span
                        className="h-4 w-4 -ml-3 rounded-full border border-white/30"
                        style={{ backgroundColor: preset.primaryColor }}
                      />
                      {preset.name}
                    </span>
                    <span className="text-[10px] uppercase opacity-70">{preset.mode}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="space-y-3 border-t border-white/15 pt-4">
              <p className="text-xs font-semibold opacity-80">Custom Colors</p>
              <div className="grid grid-cols-3 gap-3 text-center text-[11px]">
                <label className="space-y-1 cursor-pointer">
                  <span className="block opacity-80">Background</span>
                  <input
                    type="color"
                    aria-label="Background color"
                    value={bgColor}
                    onChange={(e) => setCustomColors({ bgColor: e.target.value })}
                    className="h-9 w-full cursor-pointer rounded border border-white/20 bg-transparent"
                  />
                </label>
                <label className="space-y-1 cursor-pointer">
                  <span className="block opacity-80">Accent</span>
                  <input
                    type="color"
                    aria-label="Accent color"
                    value={primaryColor}
                    onChange={(e) => setCustomColors({ primaryColor: e.target.value })}
                    className="h-9 w-full cursor-pointer rounded border border-white/20 bg-transparent"
                  />
                </label>
                <label className="space-y-1 cursor-pointer">
                  <span className="block opacity-80">Text</span>
                  <input
                    type="color"
                    aria-label="Text color"
                    value={textColor}
                    onChange={(e) => setCustomColors({ textColor: e.target.value })}
                    className="h-9 w-full cursor-pointer rounded border border-white/20 bg-transparent"
                  />
                </label>
              </div>
            </div>

            {/* Contrast Status */}
            <div className="flex items-center justify-between rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Contrast {contrastRatio}:1 (AA Safe)
              </span>
              {contrastAdjusted ? (
                <span className="text-[10px] text-amber-300">Auto-adjusted for readability</span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setPreset("cinematic-lavender")}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/15 py-2 text-xs font-semibold hover:bg-white/10 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to Default Theme
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
