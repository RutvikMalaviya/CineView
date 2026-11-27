"use client";

import { Info, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormatBadge } from "@/components/ui/FormatBadge";

const FORMAT_GUIDES = [
  {
    format: "IMAX with Laser" as const,
    aspect: "1.43:1 / 1.90:1 Expanded",
    fov: "50°–65° Ideal FOV",
    notes: "Dual 4K laser projection on a massive curved screen. Rows D–F center offer maximum immersion without neck strain.",
  },
  {
    format: "Dolby Cinema" as const,
    aspect: "2.39:1 / 1.85:1 Vision HDR",
    fov: "40°–50° Ideal FOV",
    notes: "Ultra-high contrast Dolby Vision + 64/128-channel overhead Atmos. Center rows C–E hit the acoustic sweet spot.",
  },
  {
    format: "70mm Film" as const,
    aspect: "2.20:1 Analog Celluloid",
    fov: "38°–48° Ideal FOV",
    notes: "Authentic photochemical 70mm print with warm grain and dynamic range. Mid-rear center seats preserve full-frame clarity.",
  },
  {
    format: "ScreenX 270°" as const,
    aspect: "270° Panoramic Wing Walls",
    fov: "40°–48° Center Seat",
    notes: "Extends scenes onto the left and right auditorium walls. Center-back rows let you take in all three walls comfortably.",
  },
];

export function FormatGuideButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Info className="h-3.5 w-3.5 text-[#06B6D4]" />
        Format &amp; Seating Guide
      </Button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Cinema Format and Seating Guide"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
        >
          <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4CD7F6]">
                  Cinema Geometry Guide
                </p>
                <h2 className="font-display text-xl font-bold text-white">
                  Formats, FOV &amp; Best Seats
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close guide"
                onClick={() => setOpen(false)}
                className="rounded-[4px] border border-white/15 p-1.5 text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {FORMAT_GUIDES.map((item) => (
                <div key={item.format} className="glass-card rounded-xl p-4 space-y-2">
                  <FormatBadge format={item.format} />
                  <p className="text-xs font-semibold text-[#CEBDFF]">
                    {item.aspect} • {item.fov}
                  </p>
                  <p className="text-xs leading-relaxed text-[#94A3B8]">{item.notes}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-white/10 bg-[#0B0C10]/70 p-3 text-xs text-[#CAC4D4]">
              <strong>THX / SMPTE Rule of Thumb:</strong> Aim for a horizontal Field of View
              between <strong>36° and 55°</strong> and a vertical neck tilt under{" "}
              <strong>15°</strong>. Use the <strong>Score Heatmap</strong> or{" "}
              <strong>Best Seats for N</strong> finder to lock in the top-rated rows.
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
