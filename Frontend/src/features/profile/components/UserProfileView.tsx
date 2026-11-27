"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Award, CheckCircle2, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/StateViews";
import { useUserStore } from "@/store/useUserStore";
import type { ScreeningFormat } from "@/types/domain";

const IS_API_MODE = process.env.NEXT_PUBLIC_DATA_SOURCE === "api";

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  city: z.string().min(2),
  preferredFormat: z.enum([
    "IMAX with Laser",
    "Dolby Cinema",
    "70mm Film",
    "ScreenX 270°",
    "Standard 2D",
  ]),
  preferredRowZone: z.enum(["front", "center", "rear"]),
  accessibilityNeeds: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function UserProfileView() {
  const { profile, isAuthenticated, isLoaded, loadProfile, updateProfile } = useUserStore();
  const [savedBanner, setSavedBanner] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      city: profile.city,
      preferredFormat: profile.preferredFormat,
      preferredRowZone: profile.preferredRowZone,
      accessibilityNeeds: profile.accessibilityNeeds,
    },
  });

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    reset({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      city: profile.city,
      preferredFormat: profile.preferredFormat,
      preferredRowZone: profile.preferredRowZone,
      accessibilityNeeds: profile.accessibilityNeeds,
    });
  }, [profile, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    setSavedBanner(false);
    await updateProfile(values);
    setSavedBanner(true);
  };

  if (IS_API_MODE && isLoaded && !isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <EmptyState
          title="Sign in to view your profile"
          description="Your loyalty tier, CinePoints, saved cinemas, and viewing preferences are protected by your CineView session."
          action={
            <Link href="/login">
              <Button variant="primary">Sign In</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#FFB95F]">
            Auditorium Identity / Patron Terminal ID: #CV-8842-AX
          </p>
          <h1 className="font-display text-3xl font-extrabold text-white">User Profile</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[#06B6D4]/40 bg-[#06B6D4]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#4CD7F6]">
            Spatial Sweetspot Synchronized
          </span>
          <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-300">
            Vault Encrypted
          </span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[310px_1fr]">
        {/* Left Card */}
        <aside className="glass-panel space-y-4 rounded-xl p-6 self-start">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#A78BFA]/20 font-display text-xl font-bold text-[#CEBDFF]">
            {profile.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">{profile.name}</h2>
            <p className="text-xs text-[#94A3B8]">{profile.email}</p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#F59E0B]/40 bg-[#F59E0B]/15 px-2.5 py-1 text-xs font-semibold text-[#FFB95F]">
            <Award className="h-3.5 w-3.5" />
            {profile.tier}
          </div>
          <div className="space-y-1.5 rounded-lg border border-white/10 bg-black/30 p-3 text-xs">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">CinePoints Balance</span>
              <strong className="text-white">{profile.points} / 3,000</strong>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#A78BFA]"
                style={{ width: `${Math.min(100, (profile.points / 3000) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#CEBDFF]">
              {Math.max(0, 3000 - profile.points)} pts to Auteur Diamond
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="rounded-lg border border-white/10 bg-black/30 p-2">
              <p className="text-[10px] text-[#94A3B8]">Screenings</p>
              <p className="font-bold text-white">42 Films</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 p-2">
              <p className="text-[10px] text-[#94A3B8]">Atmos Hours</p>
              <p className="font-bold text-[#4CD7F6]">98.5 hrs</p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-4">
            <Link
              href="/my-bookings"
              className="text-xs font-semibold text-[#A78BFA] hover:text-[#CEBDFF]"
            >
              View Booking History →
            </Link>
          </div>
        </aside>

        {/* Right Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-xl border border-white/10 bg-[#13151B] p-6"
        >
          <h2 className="font-display text-xl font-bold text-white">
            Personal &amp; Viewing Preferences
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="prof-name" className="mb-1 block text-xs text-[#94A3B8]">
                Full Name
              </label>
              <input
                id="prof-name"
                {...register("name")}
                className="w-full rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] px-3 py-2 text-sm text-white"
              />
              {errors.name ? (
                <p className="mt-1 text-xs text-[#FFB4AB]">{errors.name.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="prof-email" className="mb-1 block text-xs text-[#94A3B8]">
                Email
              </label>
              <input
                id="prof-email"
                {...register("email")}
                className="w-full rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] px-3 py-2 text-sm text-white"
              />
              {errors.email ? (
                <p className="mt-1 text-xs text-[#FFB4AB]">{errors.email.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="prof-phone" className="mb-1 block text-xs text-[#94A3B8]">
                Phone
              </label>
              <input
                id="prof-phone"
                {...register("phone")}
                className="w-full rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label htmlFor="prof-city" className="mb-1 block text-xs text-[#94A3B8]">
                Preferred City
              </label>
              <input
                id="prof-city"
                {...register("city")}
                className="w-full rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label htmlFor="prof-format" className="mb-1 block text-xs text-[#94A3B8]">
                Preferred Screening Format
              </label>
              <select
                id="prof-format"
                {...register("preferredFormat")}
                className="w-full rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] px-3 py-2 text-sm text-white"
              >
                {(
                  [
                    "IMAX with Laser",
                    "Dolby Cinema",
                    "70mm Film",
                    "ScreenX 270°",
                    "Standard 2D",
                  ] as ScreeningFormat[]
                ).map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="prof-zone" className="mb-1 block text-xs text-[#94A3B8]">
                Preferred Seat Zone
              </label>
              <select
                id="prof-zone"
                {...register("preferredRowZone")}
                className="w-full rounded-[4px] border border-[#2A2E3D] bg-[#0B0C10] px-3 py-2 text-sm text-white"
              >
                <option value="front">Immersive Front</option>
                <option value="center">Center Sweet Spot</option>
                <option value="rear">Elevated Rear</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-[#CAC4D4] cursor-pointer">
            <input
              type="checkbox"
              {...register("accessibilityNeeds")}
              className="accent-[#A78BFA]"
            />
            Prioritize wheelchair-accessible &amp; companion seating rows
          </label>

          {savedBanner ? (
            <p className="inline-flex items-center gap-1.5 text-xs text-[#4CD7F6]">
              <CheckCircle2 className="h-4 w-4" />
              Demo profile saved to browser storage.
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              <Save className="h-4 w-4" />
              Save Demo Preferences
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
