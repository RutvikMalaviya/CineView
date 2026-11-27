"use client";

import { Download, Printer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormatBadge } from "@/components/ui/FormatBadge";
import { EmptyState, LoadingState } from "@/components/ui/StateViews";
import { ticketService } from "@/services";
import { useUserStore } from "@/store/useUserStore";
import type { DigitalTicket } from "@/types/domain";

const IS_API_MODE = process.env.NEXT_PUBLIC_DATA_SOURCE === "api";

function DemoQrSvg({ payload }: { payload: string }) {
  // Deterministic visual 9x9 QR-style matrix for demo reference only
  const cells = Array.from({ length: 81 }, (_, i) => {
    const ch = payload.charCodeAt(i % payload.length);
    return (ch + i * 7) % 3 !== 0;
  });

  return (
    <svg
      viewBox="0 0 90 90"
      className="h-36 w-36 rounded-lg bg-white p-2"
      role="img"
      aria-label={`Demo QR code for ${payload}`}
    >
      {cells.map((filled, idx) => {
        const x = (idx % 9) * 10;
        const y = Math.floor(idx / 9) * 10;
        return filled ? <rect key={idx} x={x} y={y} width={9} height={9} fill="#0B0C10" /> : null;
      })}
    </svg>
  );
}

export function DigitalTicketView({ bookingId }: { bookingId: string }) {
  const { isAuthenticated, isLoaded } = useUserStore();
  const [ticket, setTicket] = useState<DigitalTicket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (IS_API_MODE && !isAuthenticated) {
      return;
    }
    ticketService
      .getDigitalTicket(bookingId)
      .then((res) => setTicket(res))
      .catch(() => setTicket(null))
      .finally(() => setLoading(false));
  }, [bookingId, isAuthenticated]);

  if (IS_API_MODE && isLoaded && !isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <EmptyState
          title="Sign in to view your Digital Ticket"
          description="Your QR e-pass and lounge voucher are protected by your CineView session."
          action={
            <Link href="/login">
              <Button variant="primary">Sign In</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (loading) return <LoadingState label="Loading digital pass..." />;
  if (!ticket) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <EmptyState
          title="No Digital Ticket Found"
          description="Select a confirmed booking from My Bookings to view its QR e-pass."
          action={
            <Link href="/my-bookings">
              <Button variant="primary">Go to My Bookings</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(ticket, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ticket.referenceCode}-demo-ticket.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
      <div className="glass-panel flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-xs">
        <span className="font-semibold text-emerald-300">
          ✓ Booking Confirmed &amp; Dispatched
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-[4px] border border-[#06B6D4]/40 bg-[#06B6D4]/15 px-2 py-0.5 text-[10px] font-bold uppercase text-[#4CD7F6]">
            Fast-Track RFID Lane
          </span>
          <span className="rounded-[4px] border border-[#F59E0B]/40 bg-[#F59E0B]/15 px-2 py-0.5 text-[10px] font-bold uppercase text-[#FFB95F]">
            VIP Noir Patron Tier
          </span>
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4CD7F6]">
          Digital E-Pass
        </p>
        <h1 className="font-display text-3xl font-extrabold text-white">
          CineView Digital Ticket
        </h1>
      </div>

      <div className="glass-panel overflow-hidden rounded-xl border border-[#A78BFA]/30">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between border-b border-dashed border-white/20">
          <div className="flex items-center gap-4">
            <Image
              src={ticket.posterUrl}
              alt={ticket.movieTitle}
              width={64}
              height={96}
              className="h-24 w-16 rounded-[4px] object-cover"
            />
            <div className="space-y-1.5">
              <FormatBadge format={ticket.format} />
              <h2 className="font-display text-xl font-bold text-white">
                {ticket.movieTitle}
              </h2>
              <p className="text-xs text-[#94A3B8]">{ticket.cinemaName}</p>
              <p className="text-xs text-[#CEBDFF]">{ticket.auditoriumName}</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <DemoQrSvg payload={ticket.qrPayload} />
            <span className="font-mono text-xs font-bold text-white">
              {ticket.referenceCode}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-[#0B0C10]/70 p-6 text-xs sm:grid-cols-4">
          <div>
            <p className="text-[10px] uppercase text-[#94A3B8]">Date</p>
            <p className="font-semibold text-white">{ticket.date}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-[#94A3B8]">Showtime</p>
            <p className="font-semibold text-white">{ticket.time}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-[#94A3B8]">Seats</p>
            <p className="font-mono font-bold text-[#CEBDFF]">
              {ticket.seatLabels.join(", ")}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-[#94A3B8]">Entry Gate</p>
            <p className="font-semibold text-[#FFB95F]">{ticket.gate}</p>
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#13151B] px-6 py-3 text-center text-[11px] text-[#94A3B8]">
          Demo Reference Only — This QR code is a frontend simulation and not a real theater
          entry credential.
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="primary" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print Ticket
        </Button>
        <Button variant="ghost" onClick={handleDownloadJson}>
          <Download className="h-4 w-4" />
          Download Demo Pass
        </Button>
      </div>
    </div>
  );
}
