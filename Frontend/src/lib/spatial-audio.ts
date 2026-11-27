import type { SeatViewMetrics } from "@/lib/seat-geometry";
import type { Seat } from "@/types/domain";

export type AudioPreset = "dolby_atmos" | "imax_grand" | "cinema_action" | "dialogue";

export interface SpatialBalanceProfile {
  pan: number;
  leftPercent: number;
  rightPercent: number;
  clarityPercent: number;
  wallDelayMs: number;
  label: string;
}

export const AUDIO_PRESET_LABELS: Record<AudioPreset, string> = {
  dolby_atmos: "Dolby Atmos 7.1",
  imax_grand: "IMAX Grand Hall",
  cinema_action: "Cinema Action (Bass+)",
  dialogue: "Dialogue Clear",
};

/**
 * Computes left/right stereo balance, clarity, and physical wall delay for a seat.
 */
export function getSeatSpatialBalance(
  seat: Seat,
  metrics: SeatViewMetrics,
): SpatialBalanceProfile {
  const pan = Math.max(-0.9, Math.min(0.9, seat.position[0] / 6.0));
  const leftPercent = Math.round(((1 - pan) / 2) * 100);
  const rightPercent = 100 - leftPercent;
  const clarityPercent = metrics.acousticScore;
  const wallDelayMs = Math.round(18 + metrics.distanceMeters * 2.8);

  let label = "Balanced Center Sweet Spot";
  if (pan <= -0.25) {
    label = "Left-Channel Dominant";
  } else if (pan >= 0.25) {
    label = "Right-Channel Dominant";
  }

  return {
    pan,
    leftPercent,
    rightPercent,
    clarityPercent,
    wallDelayMs,
    label,
  };
}

/**
 * Plays an audible, room-modeled Dolby Atmos spatial test with wall reflection delay,
 * preset EQ shaping, and L/R stereo panning tuned to the selected seat.
 */
export function playSeatDolbyPreview(
  seat: Seat,
  metrics: SeatViewMetrics,
  preset: AudioPreset = "dolby_atmos",
): void {
  if (typeof window === "undefined") return;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  try {
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const balance = getSeatSpatialBalance(seat, metrics);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.35, now + 0.08);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);

    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(balance.pan, now);

    // Preset EQ & Filter
    const filter = ctx.createBiquadFilter();
    filter.type = preset === "dialogue" ? "bandpass" : "lowpass";
    const baseCutoff = 1400 + ((metrics.acousticScore - 60) / 40) * 4800;
    filter.frequency.setValueAtTime(
      preset === "dialogue" ? 1800 : Math.max(1200, baseCutoff),
      now,
    );

    // Physical wall reflection DelayNode
    const delayNode = ctx.createDelay(0.5);
    const delaySec =
      preset === "imax_grand"
        ? balance.wallDelayMs / 750
        : balance.wallDelayMs / 1000;
    delayNode.delayTime.setValueAtTime(delaySec, now);

    const reverbGain = ctx.createGain();
    reverbGain.gain.setValueAtTime(preset === "dialogue" ? 0.12 : 0.32, now);

    masterGain.connect(filter);
    filter.connect(panner);
    // Wet room reflection path
    filter.connect(delayNode);
    delayNode.connect(reverbGain);
    reverbGain.connect(panner);

    panner.connect(ctx.destination);

    const bassBoost = preset === "cinema_action" ? 0.68 : 0.42;
    const notes =
      preset === "dialogue" ? [220, 330, 440] : [98, 196, 293.66, 392];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.025, now + 0.5);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.985, now + 1.25);

      const g = ctx.createGain();
      g.gain.setValueAtTime(idx === 0 ? bassBoost : 0.16, now);
      osc.connect(g);
      g.connect(masterGain);
      osc.start(now);
      osc.stop(now + 1.38);
    });

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1550);
  } catch {
    // Ignore if audio context is blocked
  }
}
