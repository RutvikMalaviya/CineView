import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0B0C10] text-[#94A3B8]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <h3 className="font-display text-lg font-extrabold text-white">CINEVIEW</h3>
            <p className="text-xs leading-relaxed text-[#94A3B8]">
              Choose Your Seat. Experience Your View. Architectural 3D auditorium previews and
              precision ticket booking.
            </p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#A78BFA]">
              Frontend Demo Mode • Dummy Data Only
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-white">
              Network
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/cinemas" className="hover:text-white">
                  CineView Premiere Dome
                </Link>
              </li>
              <li>
                <Link href="/cinemas/cin-sunset-suites" className="hover:text-white">
                  Sunset Boulevard Suites
                </Link>
              </li>
              <li>
                <Link href="/cinemas/cin-century-pavilion" className="hover:text-white">
                  Century City Tech Pavilion
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-white">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/movies" className="hover:text-white">
                  Film Repertory
                </Link>
              </li>
              <li>
                <Link href="/seat-view" className="hover:text-white">
                  3D Seat View Simulator
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" className="hover:text-white">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white">
                  Hall Studio Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-white">
              Exclusive Screenings
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/offers" className="hover:text-white">
                  Director&apos;s Circle Offers
                </Link>
              </li>
              <li>
                <Link href="/showtimes" className="hover:text-white">
                  IMAX with Laser &amp; 70mm
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white">
                  Demo Member Preferences
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-[11px] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} CineView Spatial Cinema. Demo frontend only.</p>
          <div className="flex flex-wrap gap-4">
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
            <span>3D Seat Approximation Notice</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
