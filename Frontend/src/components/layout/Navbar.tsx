"use client";

import { Bell, Eye, LogIn, LogOut, Menu, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeCustomizer } from "@/components/layout/ThemeCustomizer";
import { useUserStore } from "@/store/useUserStore";

const BASE_NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/cinemas", label: "Cinemas" },
  { href: "/seat-view", label: "3D Seat View" },
  { href: "/offers", label: "Offers" },
  { href: "/checkout", label: "Checkout" },
  { href: "/my-bookings", label: "My Bookings" },
];

const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Operations Console" },
  { href: "/admin#showtimes", label: "Showtime Scheduler" },
  { href: "/admin/auditoriums/aud-imax-gt", label: "Auditorium CAD" },
  { href: "/movies", label: "Public Catalog" },
];

const IS_API_MODE = process.env.NEXT_PUBLIC_DATA_SOURCE === "api";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, profile, checkSession, logout } = useUserStore();

  const isAdmin =
    !IS_API_MODE ||
    (isAuthenticated && (profile.role === "CINEMA_ADMIN" || profile.role === "SUPER_ADMIN"));

  const navItems =
    IS_API_MODE && isAuthenticated && (profile.role === "CINEMA_ADMIN" || profile.role === "SUPER_ADMIN")
      ? ADMIN_NAV_ITEMS
      : isAdmin
        ? [...BASE_NAV_ITEMS, { href: "/admin", label: "Hall Studio Admin" }]
        : BASE_NAV_ITEMS;

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/15 bg-[#10121A]/55 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-[#A78BFA] text-[#0B0C10] shadow-[0_0_16px_rgba(167,139,250,0.45)]">
            <Eye className="h-4 w-4 stroke-[2.5]" />
          </span>
          <div className="flex flex-col">
            <span className="font-display text-lg font-extrabold tracking-tight text-white leading-none">
              CINEVIEW
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
              3D Spatial Cinema
            </span>
          </div>
        </Link>

        <nav aria-label="Primary" className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-[4px] px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors ${
                  active
                    ? "bg-[#A78BFA]/15 text-[#CEBDFF] border border-[#A78BFA]/30"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeCustomizer />
          {!IS_API_MODE || isAuthenticated ? (
            <Link
              href="/tickets/bkg-demo-8472a"
              className="hidden sm:inline-flex items-center rounded-[4px] border border-white/10 bg-[#13151B] px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4CD7F6] hover:border-[#06B6D4]/50"
            >
              Digital Ticket
            </Link>
          ) : null}
          <Link
            href="/my-bookings"
            aria-label="Booking notifications"
            className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-white/10 bg-[#13151B] text-[#94A3B8] hover:text-white hover:border-[#A78BFA]/40"
          >
            <Bell className="h-4 w-4" />
          </Link>
          <Link
            href="/profile"
            aria-label="User Profile"
            className={`flex h-8 w-8 items-center justify-center rounded-[4px] border transition-colors ${
              isActive("/profile")
                ? "border-[#A78BFA] bg-[#A78BFA]/20 text-[#CEBDFF]"
                : "border-white/10 bg-[#13151B] text-[#94A3B8] hover:text-white"
            }`}
          >
            <User className="h-4 w-4" />
          </Link>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => void logout()}
              title={`Sign out (${profile.name})`}
              aria-label="Sign out"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-[4px] border border-white/10 bg-[#13151B] px-2.5 py-1.5 text-[11px] font-semibold text-[#94A3B8] hover:border-red-400/40 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#A78BFA] px-2.5 py-1.5 text-[11px] font-semibold text-[#0B0C10] hover:bg-[#CEBDFF]"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Link>
          )}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-white/10 bg-[#13151B] text-white lg:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          aria-label="Mobile Navigation"
          className="border-t border-white/10 bg-[#13151B] px-4 py-3 lg:hidden"
        >
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-[4px] px-3 py-2 text-xs font-semibold ${
                  isActive(item.href)
                    ? "bg-[#A78BFA]/20 text-[#CEBDFF] border border-[#A78BFA]/40"
                    : "bg-[#1A1B20] text-[#E3E2E8]"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/tickets/bkg-demo-8472a"
              onClick={() => setMobileOpen(false)}
              className="rounded-[4px] bg-[#1A1B20] px-3 py-2 text-xs font-semibold text-[#4CD7F6]"
            >
              Digital Ticket
            </Link>
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="rounded-[4px] bg-[#1A1B20] px-3 py-2 text-xs font-semibold text-[#FFB95F]"
            >
              User Profile
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
