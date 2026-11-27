"use client";

import { CheckCircle2, QrCode, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormatBadge } from "@/components/ui/FormatBadge";
import { ErrorState, LoadingState } from "@/components/ui/StateViews";
import { bookingService } from "@/services";
import type { Booking } from "@/types/domain";

export function BookingConfirmationView({ bookingId }: { bookingId: string }) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService
      .getBookingById(bookingId)
      .then((res) => setBooking(res))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <LoadingState label="Loading demo confirmation..." />;
  if (!booking) return <ErrorState message="Demo booking reference not found." />;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#94A3B8]">
        <span>Home / Movies / Seats / <strong className="text-white">Confirmation</strong></span>
        <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
          Live Projection Pass Synced • Vault Secured
        </span>
      </div>

      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#A78BFA]/20 text-[#CEBDFF] seat-glow">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#4CD7F6]">
          Booking Confirmed
        </p>
        <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
          You&apos;re All Set!
        </h1>
        <p className="font-mono text-sm text-[#CEBDFF]">
          Reference: <strong>{booking.referenceCode}</strong>
        </p>
      </div>

      <div className="glass-panel rounded-xl p-6 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Image
            src={booking.posterUrl}
            alt={booking.movieTitle}
            width={80}
            height={112}
            className="h-28 w-20 rounded-[4px] object-cover"
          />
          <div className="space-y-1.5">
            <FormatBadge format={booking.format} />
            <h2 className="font-display text-2xl font-bold text-white">
              {booking.movieTitle}
            </h2>
            <p className="text-xs text-[#94A3B8]">
              {booking.cinemaName} • {booking.auditoriumName}
            </p>
            <p className="text-xs text-[#E3E2E8]">
              {booking.date} at {booking.time}
            </p>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg border border-white/10 bg-[#0B0C10] p-4 text-xs sm:grid-cols-3">
          <div>
            <p className="text-[10px] uppercase text-[#94A3B8]">Seats</p>
            <p className="font-mono font-bold text-white">
              {booking.seats.map((s) => s.label).join(", ")}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-[#94A3B8]">Payment (Demo)</p>
            <p className="font-semibold text-[#CAC4D4]">{booking.paymentMethodLabel}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-[#94A3B8]">Demo Amount Paid</p>
            <p className="font-bold text-[#CEBDFF]">${booking.total.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href={`/tickets/${booking.id}`}>
            <Button variant="primary" size="lg">
              <QrCode className="h-4 w-4" />
              View Digital Ticket (Demo QR)
            </Button>
          </Link>
          <Link href="/my-bookings">
            <Button variant="ghost" size="lg">
              <Ticket className="h-4 w-4" />
              Go to My Bookings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
