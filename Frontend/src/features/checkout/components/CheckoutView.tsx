"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Clock, CreditCard, Loader2, ShieldAlert, TicketPercent } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/StateViews";
import { calculateBookingTotals } from "@/lib/pricing";
import { bookingService, concessionService, offerService } from "@/services";
import type { ConcessionOption } from "@/services/contracts";
import { useBookingStore } from "@/store/useBookingStore";
import { useSeatSelectionStore } from "@/store/useSeatSelectionStore";
import { useUserStore } from "@/store/useUserStore";

const checkoutSchema = z.object({
  contactName: z.string().min(2, "Enter your full name"),
  contactEmail: z.string().email("Enter a valid email address"),
  paymentMethodLabel: z.string().min(1, "Select a demo payment option"),
  simulateFailure: z.boolean().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const DEFAULT_DEMO_PAYMENT_METHODS = [
  { id: "pm-card-demo", label: "Stripe Demo •••• 4242", type: "demo_card" as const },
  { id: "pm-apple-demo", label: "Apple Pay (Demo)", type: "demo_wallet" as const },
  { id: "pm-pass-demo", label: "Director's Circle Pass", type: "demo_pass" as const },
];

export function CheckoutView() {
  const router = useRouter();
  const { profile } = useUserStore();
  const paymentMethods = profile.demoPaymentMethods?.length
    ? profile.demoPaymentMethods
    : DEFAULT_DEMO_PAYMENT_METHODS;
  const { seats, selectedSeatIds, auditorium, clearSelection } = useSeatSelectionStore();
  const {
    selectedMovie,
    selectedCinema,
    selectedShowtime,
    concessions,
    appliedOffer,
    toggleConcession,
    setAppliedOffer,
    setLastConfirmedBooking,
    resetDraft,
  } = useBookingStore();

  const [promoInput, setPromoInput] = useState("");
  const [promoFeedback, setPromoFeedback] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [holdSeconds, setHoldSeconds] = useState(522);
  const [concessionOptions, setConcessionOptions] = useState<ConcessionOption[]>([]);

  useEffect(() => {
    void concessionService.getConcessions().then(setConcessionOptions).catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setHoldSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const holdMin = String(Math.floor(holdSeconds / 60)).padStart(2, "0");
  const holdSec = String(holdSeconds % 60).padStart(2, "0");

  const selectedSeats = useMemo(
    () =>
      selectedSeatIds
        .map((id) => seats.find((s) => s.id === id))
        .filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [selectedSeatIds, seats],
  );

  const totals = useMemo(
    () =>
      calculateBookingTotals(
        selectedSeats.map((s) => ({
          id: s.id,
          label: s.label,
          category: s.category,
          price: s.price,
        })),
        concessions,
        appliedOffer,
      ),
    [selectedSeats, concessions, appliedOffer],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      contactName: profile.name,
      contactEmail: profile.email,
      paymentMethodLabel: paymentMethods[0]?.label ?? "Stripe Demo •••• 4242",
      simulateFailure: false,
    },
  });

  if (!selectedMovie || !selectedCinema || !selectedShowtime || !auditorium || selectedSeats.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <EmptyState
          title="No seats in your demo cart"
          description="Select a screening and pick seats in the 3D auditorium before proceeding to demo checkout."
          action={
            <Link href="/seat-view">
              <Button variant="primary">Launch 3D Seat View</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleApplyPromo = async () => {
    setPromoFeedback(null);
    const offer = await offerService.validateOfferCode(promoInput);
    if (!offer) {
      setAppliedOffer(null);
      setPromoFeedback("Invalid demo code. Try CINE15 or VIP10.");
      return;
    }
    setAppliedOffer(offer);
    setPromoFeedback(`Applied ${offer.code}: ${offer.title}`);
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    setSubmitError(null);
    try {
      const result = await bookingService.createDemoBooking({
        movieId: selectedMovie.id,
        cinemaId: selectedCinema.id,
        auditoriumId: auditorium.id,
        showtimeId: selectedShowtime.id,
        seats: selectedSeats.map((s) => ({
          id: s.id,
          label: s.label,
          category: s.category,
          price: s.price,
        })),
        concessions,
        offerCode: appliedOffer?.code,
        paymentMethodLabel: values.paymentMethodLabel,
        simulateFailure: values.simulateFailure,
        contactName: values.contactName,
        contactEmail: values.contactEmail,
      });

      setLastConfirmedBooking(result.booking);
      clearSelection();
      resetDraft();
      router.push(`/confirmation/${result.booking.id}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Demo checkout failed. Please try again.",
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Stitch 4-Step Progress & Seat Hold Timer */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-[#94A3B8]">
          <span>01 Auditorium</span>
          <span>›</span>
          <span>02 3D Seat Map ({selectedSeats.map((s) => s.label).join(", ")})</span>
          <span>›</span>
          <span className="font-bold text-[#CEBDFF]">03 Checkout</span>
          <span>›</span>
          <span>04 Digital Pass</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#F59E0B]/40 bg-[#F59E0B]/15 px-2.5 py-1 font-mono font-bold text-[#FFB95F]">
            <Clock className="h-3.5 w-3.5" /> Holding Seats {holdMin}:{holdSec}
          </span>
          <button
            type="button"
            onClick={() => setHoldSeconds((s) => s + 300)}
            className="rounded-[4px] border border-white/15 px-2 py-1 text-[11px] font-semibold text-white hover:bg-white/10 cursor-pointer"
          >
            Extend (+5m)
          </button>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A78BFA]">
            Checkout
          </p>
          <h1 className="font-display text-3xl font-extrabold text-white">
            Complete Your Booking
          </h1>
        </div>
        <span className="rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-3 py-1 text-xs font-semibold text-[#FFB95F]">
          Demo Mode • No Real Charge
        </span>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-8 lg:grid-cols-[1.35fr_1fr]"
      >
        {/* Left Column */}
        <div className="space-y-6">
          {/* Contact Details */}
          <section className="space-y-4 rounded-xl border border-white/10 bg-[#13151B] p-6">
            <h2 className="font-display text-xl font-bold text-white">
              1. Contact Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contactName" className="mb-1 block text-xs text-[#94A3B8]">
                  Full Name
                </label>
                <input
                  id="contactName"
                  {...register("contactName")}
                  className="w-full rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] px-3 py-2 text-sm text-white focus:border-[#A78BFA] focus:outline-none"
                />
                {errors.contactName ? (
                  <p className="mt-1 text-xs text-[#FFB4AB]">{errors.contactName.message}</p>
                ) : null}
              </div>

              <div>
                <label htmlFor="contactEmail" className="mb-1 block text-xs text-[#94A3B8]">
                  Email for Demo Ticket
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  {...register("contactEmail")}
                  className="w-full rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] px-3 py-2 text-sm text-white focus:border-[#A78BFA] focus:outline-none"
                />
                {errors.contactEmail ? (
                  <p className="mt-1 text-xs text-[#FFB4AB]">{errors.contactEmail.message}</p>
                ) : null}
              </div>
            </div>
          </section>

          {/* Concessions */}
          <section className="space-y-4 rounded-xl border border-white/10 bg-[#13151B] p-6">
            <h2 className="font-display text-xl font-bold text-white">
              2. Lounge &amp; Concession Add-ons (Optional)
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {concessionOptions.map((item) => {
                const added = concessions.some((c) => c.id === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleConcession(item)}
                    className={`flex items-center justify-between rounded-[4px] border p-3.5 text-left text-xs cursor-pointer ${
                      added
                        ? "border-[#A78BFA] bg-[#A78BFA]/15 text-white"
                        : "border-[#2A2E3D] bg-[#0B0C10] text-[#CAC4D4]"
                    }`}
                  >
                    <span className="font-semibold">{item.name}</span>
                    <span className="font-mono text-[#CEBDFF]">+${item.price.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Demo Payment Method */}
          <section className="space-y-4 rounded-xl border border-white/10 bg-[#13151B] p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-white">
                3. Demo Payment Selection
              </h2>
              <CreditCard className="h-5 w-5 text-[#A78BFA]" />
            </div>
            <p className="text-xs text-[#94A3B8]">
              Select a simulated payment method. No real card numbers, CVV, or banking details are
              collected.
            </p>

            <div className="space-y-2">
              {paymentMethods.map((pm) => (
                <label
                  key={pm.id}
                  className="flex items-center gap-3 rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] p-3 text-sm text-white cursor-pointer hover:border-[#A78BFA]/60"
                >
                  <input
                    type="radio"
                    value={pm.label}
                    {...register("paymentMethodLabel")}
                    className="accent-[#A78BFA]"
                  />
                  <span>{pm.label}</span>
                </label>
              ))}
            </div>

            <label className="flex items-center gap-2 rounded-[4px] border border-[#FFB4AB]/25 bg-[#93000A]/15 p-3 text-xs text-[#FFDAD6] cursor-pointer">
              <input type="checkbox" {...register("simulateFailure")} className="accent-[#FFB4AB]" />
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Simulate demo payment failure (test error handling)</span>
            </label>
          </section>
        </div>

        {/* Right Column — Sticky Order Summary */}
        <aside className="space-y-4">
          <div className="glass-panel rounded-xl p-6 space-y-5 lg:sticky lg:top-20">
            <h2 className="font-display text-xl font-bold text-white">Order Summary</h2>

            <div className="flex gap-3 border-b border-white/10 pb-4">
              <Image
                src={selectedMovie.posterUrl}
                alt={selectedMovie.title}
                width={56}
                height={80}
                className="h-20 w-14 rounded-[4px] object-cover"
              />
              <div className="space-y-1 text-xs">
                <p className="font-display text-sm font-bold text-white">
                  {selectedMovie.title}
                </p>
                <p className="text-[#94A3B8]">{selectedCinema.name}</p>
                <p className="text-[#CEBDFF]">
                  {auditorium.name} • {selectedShowtime.date} • {selectedShowtime.time}
                </p>
                <p className="font-mono text-white">
                  Seats: {selectedSeats.map((s) => s.label).join(", ")}
                </p>
              </div>
            </div>

            {/* Promo Code */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Promo code (e.g. CINE15)"
                  aria-label="Promo code"
                  className="flex-1 rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] px-3 py-1.5 text-xs text-white"
                />
                <Button type="button" variant="ghost" size="sm" onClick={handleApplyPromo}>
                  <TicketPercent className="h-3.5 w-3.5" /> Apply
                </Button>
              </div>
              {promoFeedback ? (
                <p className="inline-flex items-center gap-1 text-[11px] text-[#4CD7F6]">
                  <CheckCircle2 className="h-3 w-3" /> {promoFeedback}
                </p>
              ) : null}
            </div>

            {/* Breakdown */}
            <div className="space-y-2 border-t border-white/10 pt-4 text-xs text-[#CAC4D4]">
              <div className="flex justify-between">
                <span>Tickets ({selectedSeats.length})</span>
                <span>${totals.seatsSubtotal.toFixed(2)}</span>
              </div>
              {totals.concessionsSubtotal > 0 ? (
                <div className="flex justify-between">
                  <span>Add-ons</span>
                  <span>${totals.concessionsSubtotal.toFixed(2)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Convenience Fee</span>
                <span>${totals.convenienceFee.toFixed(2)}</span>
              </div>
              {totals.discount > 0 ? (
                <div className="flex justify-between text-[#4CD7F6]">
                  <span>Demo Discount ({appliedOffer?.code})</span>
                  <span>-${totals.discount.toFixed(2)}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold text-white">
                <span>Demo Total</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>

            {submitError ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-[4px] border border-[#FFB4AB]/40 bg-[#93000A]/30 p-3 text-xs text-[#FFDAD6]"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Confirming Booking...
                </>
              ) : (
                `Complete Booking ($${totals.total.toFixed(2)})`
              )}
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}
