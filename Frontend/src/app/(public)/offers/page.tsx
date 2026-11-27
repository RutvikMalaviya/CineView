import { TicketPercent } from "lucide-react";
import Link from "next/link";
import { offerService } from "@/services";

export default async function OffersPage() {
  const offers = await offerService.getOffers();

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#FFB95F]">
          Director&apos;s Circle &amp; Perks
        </p>
        <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
          Screening Offers &amp; Lounge Passes
        </h1>
        <p className="text-sm text-[#94A3B8]">
          Apply any demo promo code below during Checkout to preview calculated savings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="flex flex-col justify-between gap-4 rounded-lg border border-white/10 bg-[#13151B] p-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-[4px] border border-[#A78BFA]/40 bg-[#A78BFA]/15 px-2.5 py-1 font-mono text-xs font-bold text-[#CEBDFF]">
                  {offer.code}
                </span>
                <TicketPercent className="h-5 w-5 text-[#F59E0B]" />
              </div>
              <h2 className="font-display text-xl font-bold text-white">{offer.title}</h2>
              <p className="text-sm text-[#94A3B8]">{offer.description}</p>
            </div>
            <Link
              href="/movies"
              className="text-xs font-semibold text-[#A78BFA] hover:text-[#CEBDFF]"
            >
              Browse Eligible Screenings →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
