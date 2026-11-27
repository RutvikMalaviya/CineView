"use client";

import {
  Eye,
  Film,
  Lightbulb,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Speaker,
  Volume2,
  VolumeX,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { GraphicsQuality } from "@/features/seat-view/components/Auditorium3DCanvas";
import { computeSeatViewMetrics } from "@/lib/seat-geometry";
import {
  AUDIO_PRESET_LABELS,
  type AudioPreset,
  getSeatSpatialBalance,
  playSeatDolbyPreview,
} from "@/lib/spatial-audio";
import { useBookingStore } from "@/store/useBookingStore";
import { useDemoPersistenceStore } from "@/store/useDemoPersistenceStore";
import { useSeatSelectionStore } from "@/store/useSeatSelectionStore";

const Auditorium3DCanvas = dynamic(
  () =>
    import("@/features/seat-view/components/Auditorium3DCanvas").then(
      (mod) => mod.Auditorium3DCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#07080C] text-xs text-[#94A3B8]">
        Loading 3D theater view...
      </div>
    ),
  },
);

export function SeatViewSimulator() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlayingProjection, setIsPlayingProjection] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [houseLightsOn, setHouseLightsOn] = useState(true);
  const [graphicsQuality, setGraphicsQuality] = useState<GraphicsQuality>("medium");
  const [audioPreset, setAudioPreset] = useState<AudioPreset>("dolby_atmos");
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const selectedMovie = useBookingStore((s) => s.selectedMovie);

  const {
    auditorium,
    seats,
    selectedSeatIds,
    activeCameraSeatId,
    toggleSeat,
    setActiveCameraSeat,
  } = useSeatSelectionStore();

  const { showAcousticRays, preferNon3DFallback, setPreferNon3DFallback } =
    useDemoPersistenceStore();

  const activeSeat = useMemo(
    () => seats.find((s) => s.id === activeCameraSeatId) ?? null,
    [seats, activeCameraSeatId],
  );

  const metrics = useMemo(() => {
    if (!activeSeat || !auditorium) return null;
    return computeSeatViewMetrics(activeSeat, auditorium);
  }, [activeSeat, auditorium]);

  const spatialBalance = useMemo(() => {
    if (!activeSeat || !metrics) return null;
    return getSeatSpatialBalance(activeSeat, metrics);
  }, [activeSeat, metrics]);

  useEffect(() => {
    return () => {
      if (localVideoUrl) {
        URL.revokeObjectURL(localVideoUrl);
      }
    };
  }, [localVideoUrl]);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
        requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      }
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isFullscreen]);

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      try {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } catch {
        // Fallback CSS fixed fullscreen overlay remains active
      }
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    } else {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch {
        // Ignore
      }
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    }
  };

  const handleLocalVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);
    setLocalVideoUrl(URL.createObjectURL(file));
    setIsPlayingProjection(true);
  };

  if (!auditorium) {
    return (
      <div className="glass-panel flex h-[420px] items-center justify-center rounded-xl text-sm text-[#94A3B8]">
        Choose a showtime to preview the theater in 3D.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-[#07080C] p-3 sm:p-5"
          : "min-w-0 space-y-3"
      }
    >
      {/* Glass Toolbar */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-2 rounded-xl px-3.5 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <Eye className="h-4 w-4 text-[#A78BFA]" />
          <span className="text-xs font-semibold text-white">
            {activeSeat
              ? `Seat ${activeSeat.label}`
              : "Theater Overview"}
          </span>
          {metrics ? (
            <span className="rounded-full border border-[#06B6D4]/40 bg-[#06B6D4]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#4CD7F6]">
              Score {metrics.overallScore}/100 • {metrics.viewQualityLabel}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPlayingProjection((p) => !p)}
          >
            {isPlayingProjection ? (
              <>
                <Pause className="h-3.5 w-3.5 text-[#A78BFA]" /> Pause
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-[#A78BFA]" /> Play
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted((m) => !m)}
            aria-label={isMuted ? "Unmute trailer audio" : "Mute trailer audio"}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-3.5 w-3.5 text-[#F59E0B]" /> Unmute
              </>
            ) : (
              <>
                <Volume2 className="h-3.5 w-3.5 text-[#4CD7F6]" /> Mute
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHouseLightsOn((l) => !l)}
          >
            <Lightbulb className="h-3.5 w-3.5 text-[#FFB95F]" />
            {houseLightsOn ? "Movie Mode" : "Lights On"}
          </Button>

          <select
            aria-label="Graphics quality"
            value={graphicsQuality}
            onChange={(e) => setGraphicsQuality(e.target.value as GraphicsQuality)}
            className="rounded-[4px] border border-white/15 bg-[#0B0C10]/80 px-2 py-1 text-[11px] font-semibold text-white"
          >
            <option value="low">Low</option>
            <option value="medium">Med</option>
            <option value="high">High</option>
          </select>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleLocalVideoChange}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              localVideoUrl ? setLocalVideoUrl(null) : fileInputRef.current?.click()
            }
          >
            <Film className="h-3.5 w-3.5 text-[#CEBDFF]" />
            {localVideoUrl ? "Use Trailer" : "Local Video"}
          </Button>

          {activeSeat && metrics ? (
            <div className="inline-flex items-center gap-1">
              <select
                aria-label="Dolby audio preset"
                value={audioPreset}
                onChange={(e) => setAudioPreset(e.target.value as AudioPreset)}
                className="rounded-[4px] border border-white/15 bg-[#0B0C10]/80 px-2 py-1 text-[11px] font-semibold text-[#4CD7F6]"
              >
                {(Object.keys(AUDIO_PRESET_LABELS) as AudioPreset[]).map((key) => (
                  <option key={key} value={key}>
                    {AUDIO_PRESET_LABELS[key]}
                  </option>
                ))}
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => playSeatDolbyPreview(activeSeat, metrics, audioPreset)}
              >
                <Speaker className="h-3.5 w-3.5 text-[#06B6D4]" />
                Feel Dolby Sound
              </Button>
            </div>
          ) : null}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveCameraSeat(null)}
            disabled={!activeCameraSeatId}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Overview
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreferNon3DFallback(!preferNon3DFallback)}
          >
            {preferNon3DFallback ? "3D View" : "Text View"}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit full screen" : "View in full screen"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" /> Exit
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" /> Full Screen
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 3D Viewport or Accessible Fallback */}
      <div
        className={`relative w-full overflow-hidden rounded-xl border border-white/15 bg-[#07080C] shadow-[0_0_40px_rgba(167,139,250,0.12)] ${
          isFullscreen ? "mt-3 flex-1" : "h-[400px] sm:h-[460px]"
        }`}
      >
        {preferNon3DFallback ? (
          <div className="flex h-full flex-col justify-center gap-4 p-6 text-sm">
            <h3 className="font-display text-lg font-bold text-white">
              Seat Sightline Summary
            </h3>
            {activeSeat && metrics ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="glass-card rounded-lg p-3">
                  <p className="text-[10px] uppercase text-[#94A3B8]">Seat &amp; Score</p>
                  <p className="font-bold text-white">
                    {activeSeat.label} ({metrics.overallScore}/100)
                  </p>
                </div>
                <div className="glass-card rounded-lg p-3">
                  <p className="text-[10px] uppercase text-[#94A3B8]">FOV &amp; Distance</p>
                  <p className="font-bold text-[#CEBDFF]">
                    {metrics.horizontalFovDeg}° FOV • {metrics.distanceMeters} m
                  </p>
                </div>
                <div className="glass-card rounded-lg p-3">
                  <p className="text-[10px] uppercase text-[#94A3B8]">Neck Tilt</p>
                  <p className="font-bold text-white">
                    {metrics.verticalAngleDeg}° ({metrics.neckTiltLabel})
                  </p>
                </div>
                <div className="glass-card rounded-lg p-3">
                  <p className="text-[10px] uppercase text-[#94A3B8]">Dolby Balance</p>
                  <p className="font-bold text-[#4CD7F6]">
                    L {spatialBalance?.leftPercent}% / R {spatialBalance?.rightPercent}%
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[#94A3B8]">
                Tap any available seat on the seat map to see FOV, neck tilt, and Dolby balance.
              </p>
            )}
          </div>
        ) : (
          <Auditorium3DCanvas
            auditorium={auditorium}
            seats={seats}
            selectedSeatIds={selectedSeatIds}
            activeCameraSeatId={activeCameraSeatId}
            showAcousticRays={showAcousticRays}
            isPlayingProjection={isPlayingProjection}
            isMuted={isMuted}
            houseLightsOn={houseLightsOn}
            graphicsQuality={graphicsQuality}
            localVideoUrl={localVideoUrl}
            movieTitle={selectedMovie?.title ?? "Now Playing"}
            trailerYoutubeId={selectedMovie?.trailerYoutubeId ?? "Way9Dexny3w"}
            onSelectSeat={toggleSeat}
          />
        )}

        {/* Overlay Telemetry */}
        {metrics && !preferNon3DFallback ? (
          <div className="glass-panel pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-lg px-3.5 py-2 text-xs">
            <div className="flex flex-wrap items-center gap-3.5">
              <span className="text-[#E3E2E8]">
                FOV: <strong className="text-white">{metrics.horizontalFovDeg}°</strong>
              </span>
              <span className="text-[#E3E2E8]">
                Neck Tilt:{" "}
                <strong
                  className={
                    metrics.neckTiltLabel === "Neck Strain"
                      ? "text-[#FFB4AB]"
                      : "text-white"
                  }
                >
                  {metrics.verticalAngleDeg}° ({metrics.neckTiltLabel})
                </strong>
              </span>
              <span className="text-[#E3E2E8]">
                Distance: <strong className="text-white">{metrics.distanceMeters}m</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#4CD7F6]">
                <Volume2 className="h-3.5 w-3.5" />
                Dolby:{" "}
                <strong>
                  L {spatialBalance?.leftPercent ?? 50}% / R {spatialBalance?.rightPercent ?? 50}%
                </strong>{" "}
                • {spatialBalance?.wallDelayMs}ms reflection
              </span>
            </div>
            <span className="text-[11px] text-[#94A3B8]">
              Drag to look around • Scroll to zoom
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
