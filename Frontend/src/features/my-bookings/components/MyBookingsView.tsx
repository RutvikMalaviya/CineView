"use client";

import { QrCode, View, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormatBadge } from "@/components/ui/FormatBadge";
import { EmptyState, LoadingState } from "@/components/ui/StateViews";
import { bookingService } from "@/services";
import { useUserStore } from "@/store/useUserStore";
import type { Booking } from "@/types/domain";

const IS_API_MODE = process.env.NEXT_PUBLIC_DATA_SOURCE === "api";

export function MyBookingsView() {
  const { isAuthenticated, isLoaded } = useUserStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"confirmed" | "completed" | "cancelled">("confirmed");

  useEffect(() => {
    if (IS_API_MODE && !isAuthenticated) {
      return;
    }
    bookingService
      .getMyBookings()
      .then((list) => setBookings(list))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const filtered = useMemo(
    () => bookings.filter((b) => b.status === tab),
    [bookings, tab],
  );

  const handleCancelDemo = async (id: string) => {
    const updated = await bookingService.cancelDemoBooking(id);
    if (updated) {
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    }
  };

  if (IS_API_MODE && isLoaded && !isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <EmptyState
          title="Sign in to view your bookings"
          description="Your tickets, QR passes, and booking history are protected by your CineView session."
          action={
            <Link href="/login">
              <Button variant="primary">Sign In</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <LoadingState label="Loading bookings..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A78BFA]">
            ACCOUNT // DISPATCH LEDGER • PATRON TIER: VIP NOIR
          </p>
          <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
            My Bookings &amp; Screening Archive
          </h1>
        </div>
        <span className="rounded-full border border-[#06B6D4]/40 bg-[#06B6D4]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#4CD7F6]">
          Dolby Atmos Sync: Active
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["confirmed", "Upcoming"],
            ["completed", "Past Screenings"],
            ["cancelled", "Cancelled"],
          ] as const
        ).map(([key, label]) => {
          const count = bookings.filter((b) => b.status === key).length;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-[4px] px-4 py-2 text-xs font-semibold cursor-pointer ${
                tab === key
                  ? "bg-[#A78BFA] text-[#0B0C10]"
                  : "border border-white/10 bg-[#13151B] text-[#94A3B8] hover:text-white"
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={`No ${tab} bookings`}
          description="Explore current screenings and reserve seats with the 3D simulator."
          action={
            <Link href="/movies">
              <Button variant="primary" size="sm">
                Browse Movies
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-[#13151B] p-5 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={b.posterUrl}
                  alt={b.movieTitle}
                  width={64}
                  height={96}
                  className="h-24 w-16 rounded-[4px] object-cover"
                />
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <FormatBadge format={b.format} />
                    <span className="font-mono text-xs text-[#CEBDFF]">
                      {b.referenceCode}
                    </span>
                  </div>
                  <h2 className="font-display text-xl font-bold text-white">
                    {b.movieTitle}
                  </h2>
                  <p className="text-xs text-[#94A3B8]">
                    {b.cinemaName} • {b.auditoriumName}
                  </p>
                  <p className="text-xs text-[#E3E2E8]">
                    {b.date} at {b.time} • Seats:{" "}
                    <strong className="font-mono">
                      {b.seats.map((s) => s.label).join(", ")}
                    </strong>{" "}
                    • Total: <strong>${b.total.toFixed(2)}</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href={`/tickets/${b.id}`}>
                  <Button variant="primary" size="sm">
                    <QrCode className="h-3.5 w-3.5" />
                    Digital Ticket
                  </Button>
                </Link>
                <Link href={`/seats/${b.showtimeId}`}>
                  <Button variant="ghost" size="sm">
                    <View className="h-3.5 w-3.5" />
                    3D View
                  </Button>
                </Link>
                {b.status === "confirmed" ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleCancelDemo(b.id)}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancel Booking
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
