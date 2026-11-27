"use client";

import {
  CheckCircle2,
  Copy,
  Download,
  Layers,
  Plus,
  Radio,
  RotateCcw,
  Save,
  ShieldCheck,
  Sliders,
  Speaker,
  Trash2,
  View,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/StateViews";
import { computeSeatViewMetrics } from "@/lib/seat-geometry";
import { auditoriumService, adminService } from "@/services";
import { useUserStore } from "@/store/useUserStore";
import type { Auditorium, AuditoriumRowConfig, Cinema, Seat, SeatCategory } from "@/types/domain";

const IS_API_MODE = process.env.NEXT_PUBLIC_DATA_SOURCE === "api";

const Auditorium3DCanvas = dynamic(
  () =>
    import("@/features/seat-view/components/Auditorium3DCanvas").then(
      (mod) => mod.Auditorium3DCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[460px] items-center justify-center bg-[#07080C] text-xs text-[#94A3B8]">
        Loading 3D Spatial Raytrace...
      </div>
    ),
  },
);

const PALETTE_CATEGORIES: {
  id: SeatCategory;
  name: string;
  sub: string;
  price: string;
  swatchColor: string;
  badgeClass: string;
}[] = [
  {
    id: "standard",
    name: "Standard Lumbar",
    sub: "Ivory-Slate • Base tier",
    price: "$22.00",
    swatchColor: "#DCE3EE",
    badgeClass: "border-[#3F4458] bg-[#13151B] text-[#CAC4D4]",
  },
  {
    id: "vip",
    name: "VIP Motor Recliner",
    sub: "Gold Leather • Footrest",
    price: "$31.90",
    swatchColor: "#F59E0B",
    badgeClass: "border-[#F59E0B] bg-[#F59E0B]/15 text-[#FFB95F]",
  },
  {
    id: "accessible",
    name: "ADA Access Bay",
    sub: "Emerald Bay • Companion zone",
    price: "$19.80",
    swatchColor: "#10B981",
    badgeClass: "border-emerald-400 bg-emerald-500/15 text-emerald-300",
  },
  {
    id: "premium",
    name: "Premium Acoustic",
    sub: "Cyan Velvet • Sweet-spot tier",
    price: "$25.30",
    swatchColor: "#0EA5E9",
    badgeClass: "border-[#06B6D4] bg-[#06B6D4]/15 text-[#4CD7F6]",
  },
];

export function AuditoriumEditorView({ auditoriumId }: { auditoriumId: string }) {
  const router = useRouter();
  const [auditorium, setAuditorium] = useState<Auditorium | null>(null);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [allAuditoriums, setAllAuditoriums] = useState<Auditorium[]>([]);
  const [noScreensNotice, setNoScreensNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRowIdx, setSelectedRowIdx] = useState(4);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [admin3DCameraSeatId, setAdmin3DCameraSeatId] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showRiserGrid, setShowRiserGrid] = useState(true);
  const [demandSurge, setDemandSurge] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      auditoriumService.getAuditoriumById(auditoriumId),
      adminService.getMyCinemas().catch(() => []),
    ])
      .then(async ([res, cinemaList]) => {
        setAuditorium(res);
        setCinemas(cinemaList);
        const hallLists = await Promise.all(
          cinemaList.map((c) => auditoriumService.getAuditoriumsByCinema(c.id)),
        );
        setAllAuditoriums(hallLists.flat());
        if (res && res.rows.length > 0) {
          setSelectedRowIdx(Math.min(4, res.rows.length - 1));
        }
      })
      .finally(() => setLoading(false));
  }, [auditoriumId]);

  const generatedSeats = useMemo<Seat[]>(() => {
    if (!auditorium) return [];
    const list: Seat[] = [];
    for (const row of auditorium.rows) {
      const totalSlots = row.seatCount + row.aisleAfterSeats.length;
      let xCursor = -((totalSlots - 1) * 0.85) / 2;
      for (let num = 1; num <= row.seatCount; num++) {
        const id = `${row.rowLabel}-${num}`;
        const [sx, , sz] = auditorium.screenPosition;
        const orientationRad = Math.atan2(-(sx - xCursor), -(sz - row.zOffset));
        list.push({
          id,
          row: row.rowLabel,
          number: num,
          label: id,
          category: row.category,
          status: "available",
          price: Number((22 * row.priceMultiplier).toFixed(2)),
          position: [Number(xCursor.toFixed(2)), row.elevationY, row.zOffset],
          orientationRad,
        });
        xCursor += 0.85;
        if (row.aisleAfterSeats.includes(num)) xCursor += 0.85;
      }
    }
    return list;
  }, [auditorium]);

  const { isAuthenticated, isLoaded, profile } = useUserStore();
  const isAdmin =
    !IS_API_MODE ||
    (isAuthenticated && (profile.role === "CINEMA_ADMIN" || profile.role === "SUPER_ADMIN"));

  if (IS_API_MODE && isLoaded && !isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="rounded-xl border border-white/10 bg-[#13151B] p-8 space-y-4">
          <ShieldCheck className="mx-auto h-10 w-10 text-[#A78BFA]" />
          <h1 className="font-display text-2xl font-bold text-white">
            Admin Terminal Access Required
          </h1>
          <p className="text-sm text-[#94A3B8]">
            Modifying auditorium seat layouts requires a{" "}
            <span className="text-[#FFB95F] font-semibold">CINEMA_ADMIN</span> or{" "}
            <span className="text-[#4CD7F6] font-semibold">SUPER_ADMIN</span> account.
          </p>
          <div className="pt-2">
            <Link href="/login">
              <Button variant="primary">Sign In to Admin Terminal</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !auditorium) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <LoadingState label="Loading Hall CAD Studio..." />
      </div>
    );
  }

  const activeRow = auditorium.rows[selectedRowIdx] ?? auditorium.rows[0];
  const centerSeatOfRow = generatedSeats.find(
    (s) => s.row === activeRow?.rowLabel && s.number === Math.ceil((activeRow?.seatCount ?? 1) / 2),
  );
  const activeMetrics = centerSeatOfRow
    ? computeSeatViewMetrics(centerSeatOfRow, auditorium)
    : null;

  const totalCapacity = auditorium.rows.reduce((sum, r) => sum + r.seatCount, 0);
  const vipCount = auditorium.rows
    .filter((r) => r.category === "vip")
    .reduce((sum, r) => sum + r.seatCount, 0);
  const vipRatio = totalCapacity > 0 ? ((vipCount / totalCapacity) * 100).toFixed(1) : "0.0";

  const updateRow = (idx: number, patch: Partial<AuditoriumRowConfig>) => {
    setStatusMessage(null);
    setAuditorium((prev) => {
      if (!prev) return prev;
      const rows = prev.rows.map((r, i) => (i === idx ? { ...r, ...patch } : r));
      return { ...prev, rows };
    });
  };

  const duplicateRow = () => {
    if (!activeRow) return;
    setStatusMessage(null);
    const nextChar = String.fromCharCode(65 + auditorium.rows.length);
    const last = auditorium.rows[auditorium.rows.length - 1];
    const cloned: AuditoriumRowConfig = {
      ...activeRow,
      rowLabel: nextChar,
      elevationY: Number(((last?.elevationY ?? 0) + 0.55).toFixed(2)),
      zOffset: Number(((last?.zOffset ?? 0) + 1.5).toFixed(2)),
    };
    setAuditorium({ ...auditorium, rows: [...auditorium.rows, cloned] });
    setSelectedRowIdx(auditorium.rows.length);
  };

  const removeRow = (idx: number) => {
    if (auditorium.rows.length <= 1) return;
    setStatusMessage(null);
    const nextRows = auditorium.rows.filter((_, i) => i !== idx);
    setAuditorium({ ...auditorium, rows: nextRows });
    setSelectedRowIdx(Math.max(0, idx - 1));
  };

  const handleSave = async () => {
    const saved = await auditoriumService.saveAuditoriumConfig(auditorium);
    setAuditorium(saved);
    setStatusMessage("Blueprint published to browser demo storage.");
  };

  const handleReset = async () => {
    const reset = await auditoriumService.resetAuditoriumConfig(auditorium.id);
    if (reset) {
      setAuditorium(reset);
      setStatusMessage("Blueprint discarded and restored to default.");
    }
  };

  const handleExportCad = () => {
    const blob = new Blob([JSON.stringify(auditorium, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${auditorium.id}-cad-blueprint.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 px-4 py-6 sm:px-6">
      {/* Studio Top Bar (Matches Stitch Hall CAD Studio) */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#A78BFA]">
            Hall CAD Studio
          </span>
          <span className="text-white/30">/</span>
          <select
            aria-label="Select Cinema"
            value={auditorium.cinemaId}
            onChange={(e) => {
              const cid = e.target.value;
              const firstHall = allAuditoriums.find((a) => a.cinemaId === cid);
              if (firstHall) {
                setNoScreensNotice(null);
                router.push(`/admin/auditoriums/${firstHall.id}`);
              } else {
                const cinemaName = cinemas.find((c) => c.id === cid)?.name ?? "This cinema";
                setNoScreensNotice(`${cinemaName} has 0 screens yet. Add a screen in Operations Console.`);
              }
            }}
            className="rounded border border-white/15 bg-[#0B0C10] px-2.5 py-1 text-xs font-semibold text-white"
          >
            {cinemas.map((c) => {
              const count = allAuditoriums.filter((a) => a.cinemaId === c.id).length;
              return (
                <option key={c.id} value={c.id}>
                  {c.name} ({count} {count === 1 ? "screen" : "screens"})
                </option>
              );
            })}
          </select>
          <span className="text-white/30">/</span>
          <select
            aria-label="Select Screen"
            value={auditorium.id}
            onChange={(e) => {
              router.push(`/admin/auditoriums/${e.target.value}`);
            }}
            className="rounded border border-[#A78BFA]/40 bg-[#0B0C10] px-2.5 py-1 text-xs font-bold text-[#CEBDFF]"
          >
            {allAuditoriums
              .filter((a) => a.cinemaId === auditorium.cinemaId)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.format})
                </option>
              ))}
          </select>
          <span className="rounded-[4px] border border-[#06B6D4]/40 bg-[#06B6D4]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#4CD7F6]">
            CAD REV 4.2 • LIVE SYNC
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {noScreensNotice ? (
            <Link
              href="/admin"
              className="rounded border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-[11px] font-medium text-amber-200 hover:bg-amber-500/25"
            >
              {noScreensNotice}
            </Link>
          ) : null}
          <div className="inline-flex rounded-lg border border-white/15 bg-[#0B0C10]/80 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("2d")}
              className={`inline-flex items-center gap-1 rounded-[6px] px-3 py-1 text-xs font-semibold cursor-pointer ${
                viewMode === "2d"
                  ? "bg-[#A78BFA] text-[#0B0C10]"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> 2D Blueprint
            </button>
            <button
              type="button"
              onClick={() => setViewMode("3d")}
              className={`inline-flex items-center gap-1 rounded-[6px] px-3 py-1 text-xs font-semibold cursor-pointer ${
                viewMode === "3d"
                  ? "bg-[#A78BFA] text-[#0B0C10]"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              <View className="h-3.5 w-3.5" /> 3D Spatial Raytrace
            </button>
          </div>

          <Button variant="ghost" size="sm" onClick={handleExportCad}>
            <Download className="h-3.5 w-3.5" /> Export CAD
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" /> Discard
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            <Save className="h-3.5 w-3.5" /> Publish Blueprint
          </Button>
        </div>
      </div>

      {statusMessage ? (
        <div className="flex items-center justify-between rounded-lg border border-[#06B6D4]/40 bg-[#06B6D4]/15 px-4 py-2 text-xs text-[#4CD7F6]">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> {statusMessage}
          </span>
          <Link href="/admin" className="font-semibold underline">
            Back to Cinema Management
          </Link>
        </div>
      ) : null}

      {/* 3-Column CAD Studio Grid */}
      <div className="grid gap-4 xl:grid-cols-[290px_minmax(0,1fr)_320px]">
        {/* LEFT PANEL: Acoustic & Seating Palette */}
        <aside className="glass-panel space-y-5 rounded-xl p-4 self-start">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
              Engine 01 // Architecture
            </p>
            <h2 className="font-display text-lg font-bold text-white">
              Acoustic &amp; Seating Palette
            </h2>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-[#CEBDFF]">
              <span>01. Seating Matrices</span>
              <span>4 Types</span>
            </div>
            {PALETTE_CATEGORIES.map((cat) => {
              const active = activeRow?.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateRow(selectedRowIdx, { category: cat.id })}
                  className={`flex w-full items-center justify-between rounded-lg border p-2.5 text-left transition-all cursor-pointer ${
                    active
                      ? "border-[#A78BFA] bg-[#A78BFA]/15"
                      : "border-white/10 bg-[#0B0C10]/60 hover:border-white/25"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-4 w-4 shrink-0 rounded border border-white/25 shadow-inner"
                      style={{ backgroundColor: cat.swatchColor }}
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{cat.name}</p>
                      <p className="text-[10px] text-[#94A3B8]">{cat.sub}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#FFB95F]">
                    {cat.price}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-[#4CD7F6]">
              <span>02. Spatial Nodes &amp; AV</span>
              <span>Dolby / Meyer</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0B0C10]/60 p-2.5">
                <span className="inline-flex items-center gap-2 text-white">
                  <Radio className="h-3.5 w-3.5 text-[#06B6D4]" /> Dolby Atmos Wavefield
                </span>
                <span className="text-[10px] text-[#4CD7F6]">{auditorium.speakerCount}ch</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0B0C10]/60 p-2.5">
                <span className="inline-flex items-center gap-2 text-white">
                  <Speaker className="h-3.5 w-3.5 text-[#F59E0B]" /> Sub-Bass 18Hz Array
                </span>
                <span className="text-[10px] text-[#FFB95F]">Active</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0B0C10]/60 p-2.5">
                <span className="inline-flex items-center gap-2 text-white">
                  <Sliders className="h-3.5 w-3.5 text-[#A78BFA]" /> Laser Throw Optics
                </span>
                <span className="text-[10px] text-[#CEBDFF]">{auditorium.screenWidth}m</span>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={duplicateRow} className="w-full">
            <Plus className="h-3.5 w-3.5" /> Add Seating Row
          </Button>
        </aside>

        {/* CENTER PANEL: 2D CAD Blueprint / 3D Spatial Raytrace Canvas */}
        <section className="glass-panel flex flex-col justify-between gap-4 rounded-xl p-4">
          {/* Top Telemetry Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 text-[11px]">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[#94A3B8]">
                ARC RADIUS:{" "}
                <strong className="font-mono text-white">
                  {auditorium.screenCurveRadius || 48}.0 M
                </strong>
              </span>
              <span className="text-[#94A3B8]">
                SCREEN:{" "}
                <strong className="font-mono text-[#4CD7F6]">
                  {auditorium.screenWidth}M × {auditorium.screenHeight}M
                </strong>
              </span>
              <span className="text-[#94A3B8]">
                RAKE ELEV:{" "}
                <strong className="font-mono text-[#FFB95F]">
                  +{activeRow?.elevationY ?? 0}M
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-[#94A3B8]">
              <span>Std</span>
              <span className="text-[#FFB95F]">VIP</span>
              <span className="text-emerald-300">ADA</span>
              <span className="text-[#CEBDFF]">Selected Row</span>
            </div>
          </div>

          {viewMode === "3d" ? (
            <div className="relative h-[480px] overflow-hidden rounded-xl border border-white/10 bg-[#07080C]">
              <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-1.5 rounded-lg border border-white/15 bg-[#0B0C10]/85 px-2.5 py-1.5 text-[11px] backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setAdmin3DCameraSeatId(null)}
                  className={`rounded px-2 py-0.5 font-semibold cursor-pointer ${
                    admin3DCameraSeatId === null
                      ? "bg-[#A78BFA] text-[#0B0C10]"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  Hall Overview
                </button>
                <button
                  type="button"
                  onClick={() => setAdmin3DCameraSeatId(centerSeatOfRow?.id ?? null)}
                  className={`rounded px-2 py-0.5 font-semibold cursor-pointer ${
                    admin3DCameraSeatId !== null
                      ? "bg-[#06B6D4] text-[#0B0C10]"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  Row {activeRow?.rowLabel ?? ""} Eye-View
                </button>
                <span className="hidden text-[10px] text-[#94A3B8] sm:inline">
                  Drag to orbit • Scroll to zoom • Click any seat
                </span>
              </div>
              <Auditorium3DCanvas
                auditorium={auditorium}
                seats={generatedSeats}
                selectedSeatIds={
                  activeRow
                    ? generatedSeats
                        .filter((s) => s.row === activeRow.rowLabel)
                        .map((s) => s.id)
                    : []
                }
                activeCameraSeatId={admin3DCameraSeatId}
                showAcousticRays={showHeatmap}
                onSelectSeat={(seatId) =>
                  setAdmin3DCameraSeatId((prev) => (prev === seatId ? null : seatId))
                }
              />
            </div>
          ) : (
            <div
              className={`relative overflow-x-auto rounded-xl border border-white/10 p-5 ${
                showRiserGrid
                  ? "bg-[#08090E] bg-[radial-gradient(rgba(167,139,250,0.12)_1px,transparent_1px)] [background-size:20px_20px]"
                  : "bg-[#08090E]"
              }`}
            >
              {/* Curved Screen Arc */}
              <div className="mx-auto mb-6 max-w-lg text-center">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                  CURVED {auditorium.format.toUpperCase()} CANVAS ({auditorium.screenWidth}M)
                </p>
                <div className="h-2.5 w-full rounded-t-full border-t-2 border-[#CEBDFF] bg-gradient-to-b from-[#A78BFA]/35 to-transparent shadow-[0_-6px_24px_rgba(167,139,250,0.35)]" />
              </div>

              {/* Seat Matrix */}
              <div
                className="mx-auto flex w-max flex-col gap-2 transition-transform origin-top"
                style={{ transform: `scale(${zoom})` }}
              >
                {auditorium.rows.map((row, idx) => {
                  const isRowSelected = idx === selectedRowIdx;
                  const rowSeats = generatedSeats.filter((s) => s.row === row.rowLabel);
                  return (
                    <div
                      key={`${row.rowLabel}-${idx}`}
                      onClick={() => setSelectedRowIdx(idx)}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-all cursor-pointer ${
                        isRowSelected
                          ? "bg-[#A78BFA]/15 ring-1 ring-[#A78BFA]/60"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <span className="w-5 font-mono text-xs font-bold text-[#94A3B8]">
                        {row.rowLabel}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {rowSeats.map((s) => {
                          const hasAisle = row.aisleAfterSeats.includes(s.number);
                          const colorClass = isRowSelected
                            ? "border-[#C4B5FD] bg-[#A78BFA] text-[#0B0C10] font-bold seat-glow"
                            : row.category === "vip"
                              ? "border-[#F59E0B] bg-[#F59E0B]/20 text-[#FFB95F]"
                              : row.category === "accessible"
                                ? "border-emerald-400 bg-emerald-500/20 text-emerald-200"
                                : row.category === "premium"
                                  ? "border-[#06B6D4] bg-[#06B6D4]/20 text-[#4CD7F6]"
                                  : "border-[#3F4458] bg-[#13151B] text-[#CAC4D4]";
                          return (
                            <span
                              key={s.id}
                              className={`flex h-7 w-7 items-center justify-center rounded-[4px] border font-mono text-[10px] ${colorClass} ${
                                hasAisle ? "mr-4" : ""
                              }`}
                            >
                              {isRowSelected ? s.id : s.number}
                            </span>
                          );
                        })}
                      </div>
                      <span className="w-5 font-mono text-xs font-bold text-[#94A3B8]">
                        {row.rowLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Canvas Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.75, Number((z - 0.1).toFixed(2))))}
                className="rounded border border-white/15 bg-[#0B0C10] px-2 py-1 text-white"
              >
                -
              </button>
              <span className="font-mono text-[#CAC4D4]">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.25, Number((z + 0.1).toFixed(2))))}
                className="rounded border border-white/15 bg-[#0B0C10] px-2 py-1 text-white"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="rounded border border-white/15 bg-[#0B0C10] px-2 py-1 text-[#94A3B8] hover:text-white"
              >
                FIT
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setShowHeatmap((v) => !v)}
                className={`rounded-[4px] border px-2.5 py-1 cursor-pointer ${
                  showHeatmap
                    ? "border-[#06B6D4] bg-[#06B6D4]/15 text-[#4CD7F6]"
                    : "border-white/15 text-[#94A3B8]"
                }`}
              >
                Acoustics Heatmap
              </button>
              <button
                type="button"
                onClick={() => setShowRiserGrid((v) => !v)}
                className={`rounded-[4px] border px-2.5 py-1 cursor-pointer ${
                  showRiserGrid
                    ? "border-[#A78BFA] bg-[#A78BFA]/15 text-[#CEBDFF]"
                    : "border-white/15 text-[#94A3B8]"
                }`}
              >
                Riser Grid
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#94A3B8]">
            <span>
              TOTAL CAPACITY: {totalCapacity} SEATS • VIP RATIO: {vipRatio}% •{" "}
              {auditorium.rows.length} ROWS
            </span>
            <span className="text-[#CEBDFF]">MEYER SOUND CALIBRATION ENGINE ONLINE</span>
          </div>
        </section>

        {/* RIGHT PANEL: 03 // Row Inspector */}
        {activeRow ? (
          <aside className="glass-panel space-y-4 rounded-xl p-4 self-start">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
                  03 // Row Inspector
                </p>
                <h2 className="font-display text-lg font-bold text-white">
                  Row {activeRow.rowLabel} —{" "}
                  {activeRow.category === "vip" ? "VIP Tier" : "Meridian"}
                </h2>
              </div>
              <span className="rounded-[4px] border border-[#A78BFA]/40 bg-[#A78BFA]/15 px-2 py-0.5 font-mono text-[10px] font-bold text-[#CEBDFF]">
                {activeRow.seatCount} SEATS
              </span>
            </div>

            {/* Geometric Alignment */}
            <div className="space-y-3 border-t border-white/10 pt-3 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Geometric Alignment
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="row-label" className="mb-1 block text-[11px] text-[#94A3B8]">
                    Row Label
                  </label>
                  <input
                    id="row-label"
                    value={activeRow.rowLabel}
                    onChange={(e) =>
                      updateRow(selectedRowIdx, { rowLabel: e.target.value.toUpperCase() })
                    }
                    className="w-full rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] px-2.5 py-1.5 font-mono font-bold text-white"
                  />
                </div>
                <div>
                  <label htmlFor="row-seats" className="mb-1 block text-[11px] text-[#94A3B8]">
                    Seat Count
                  </label>
                  <input
                    id="row-seats"
                    type="number"
                    min={4}
                    max={24}
                    value={activeRow.seatCount}
                    onChange={(e) =>
                      updateRow(selectedRowIdx, {
                        seatCount: Math.max(4, Math.min(24, Number(e.target.value) || 8)),
                      })
                    }
                    className="w-full rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] px-2.5 py-1.5 font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="text-[#94A3B8]">Riser Elevation</span>
                  <span className="font-mono text-[#CEBDFF]">+{activeRow.elevationY}m</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.15}
                  value={activeRow.elevationY}
                  onChange={(e) =>
                    updateRow(selectedRowIdx, { elevationY: Number(e.target.value) })
                  }
                  className="w-full accent-[#A78BFA]"
                />
              </div>

              <div>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="text-[#94A3B8]">Screen Width (Curvature)</span>
                  <span className="font-mono text-[#4CD7F6]">{auditorium.screenWidth}m</span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={28}
                  step={0.5}
                  value={auditorium.screenWidth}
                  onChange={(e) =>
                    setAuditorium({ ...auditorium, screenWidth: Number(e.target.value) })
                  }
                  className="w-full accent-[#06B6D4]"
                />
              </div>
            </div>

            {/* Commercial Pricing Matrix */}
            <div className="space-y-2 border-t border-white/10 pt-3 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                Commercial Pricing Matrix
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-[#A78BFA]/50 bg-[#A78BFA]/20 p-2.5">
                  <p className="text-[9px] uppercase text-[#CEBDFF]">Active Price</p>
                  <p className="font-display text-lg font-bold text-white">
                    ${(22 * activeRow.priceMultiplier).toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#0B0C10]/70 p-2.5">
                  <p className="text-[9px] uppercase text-[#94A3B8]">Multiplier</p>
                  <input
                    type="number"
                    step="0.05"
                    aria-label="Row price multiplier"
                    value={activeRow.priceMultiplier}
                    onChange={(e) =>
                      updateRow(selectedRowIdx, {
                        priceMultiplier: Number(e.target.value) || 1,
                      })
                    }
                    className="mt-0.5 w-full bg-transparent font-mono text-sm font-bold text-[#FFB95F] focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0B0C10]/60 px-3 py-2 text-[11px] cursor-pointer">
                <span className="text-[#CAC4D4]">Dynamic Demand Surge (+12%)</span>
                <input
                  type="checkbox"
                  checked={demandSurge}
                  onChange={(e) => setDemandSurge(e.target.checked)}
                  className="accent-[#A78BFA]"
                />
              </label>
            </div>

            {/* Sightline & Immersion Score */}
            {activeMetrics ? (
              <div className="space-y-2 border-t border-white/10 pt-3 text-xs">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#94A3B8]">
                  Sightline &amp; Immersion • SMPTE
                </p>
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#0B0C10]/60 p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#A78BFA] font-display text-lg font-extrabold text-white">
                    {activeMetrics.overallScore}
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white">
                      {activeMetrics.viewQualityLabel}
                    </p>
                    <p className="text-[11px] text-[#4CD7F6]">
                      FOV {activeMetrics.horizontalFovDeg}° • Tilt{" "}
                      {activeMetrics.verticalAngleDeg}°
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Row Actions */}
            <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
              <Button variant="ghost" size="sm" onClick={duplicateRow}>
                <Copy className="h-3.5 w-3.5" /> Duplicate Row
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeRow(selectedRowIdx)}
                disabled={auditorium.rows.length <= 1}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Row
              </Button>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
