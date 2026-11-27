"use client";

import {
  Building2,
  CalendarClock,
  DollarSign,
  Plus,
  ShieldCheck,
  Sliders,
  Speaker,
  Ticket,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormatBadge } from "@/components/ui/FormatBadge";
import { adminService } from "@/services";
import type { AdminOverview, ScreenTypeItem } from "@/services/contracts";
import { useUserStore } from "@/store/useUserStore";
import type { Auditorium, Booking, Cinema, Movie, Showtime, UserProfile } from "@/types/domain";

const IS_API_MODE = process.env.NEXT_PUBLIC_DATA_SOURCE === "api";

export function CinemaManagementView({
  cinemas,
  auditoriums,
  initialShowtimes,
  movies,
}: {
  cinemas: Cinema[];
  auditoriums: Auditorium[];
  initialShowtimes: Showtime[];
  movies: Movie[];
}) {
  const { isAuthenticated, isLoaded, profile } = useUserStore();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [scopedCinemas, setScopedCinemas] = useState<Cinema[]>(cinemas);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>(initialShowtimes);
  const [auditoriumsList, setAuditoriumsList] = useState<Auditorium[]>(auditoriums);
  const [screenTypes, setScreenTypes] = useState<ScreenTypeItem[]>([]);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeDesc, setNewTypeDesc] = useState("");
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editingTypeName, setEditingTypeName] = useState("");
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const [addingScreenForCinemaId, setAddingScreenForCinemaId] = useState<string | null>(null);
  const [screenName, setScreenName] = useState("Screen 2 • Dolby Atmos");
  const [screenFormat, setScreenFormat] = useState("Dolby Cinema");
  const [screenRows, setScreenRows] = useState("6");
  const [screenSeatsPerRow, setScreenSeatsPerRow] = useState("12");

  const [newMovieId, setNewMovieId] = useState(movies[0]?.id ?? "");
  const [selectedCinemaId, setSelectedCinemaId] = useState(cinemas[0]?.id ?? "");
  const [newAuditoriumId, setNewAuditoriumId] = useState(
    auditoriums.find((a) => a.cinemaId === cinemas[0]?.id)?.id ?? auditoriums[0]?.id ?? "",
  );
  const [newDate, setNewDate] = useState("2026-11-29");
  const [newTime, setNewTime] = useState("20:00");
  const [newPrice, setNewPrice] = useState("24.00");
  const [newBadge, setNewBadge] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"CUSTOMER" | "CINEMA_ADMIN" | "SUPER_ADMIN">(
    "CINEMA_ADMIN",
  );
  const [newUserCinemaId, setNewUserCinemaId] = useState(cinemas[0]?.id ?? "");
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserPhone, setEditUserPhone] = useState("");
  const [editUserCity, setEditUserCity] = useState("");
  const [editUserTier, setEditUserTier] = useState("");
  const [editUserRole, setEditUserRole] = useState<"CUSTOMER" | "CINEMA_ADMIN" | "SUPER_ADMIN">(
    "CUSTOMER",
  );
  const [editUserCinemaId, setEditUserCinemaId] = useState("");

  const isAdmin =
    !IS_API_MODE ||
    (isAuthenticated && (profile.role === "CINEMA_ADMIN" || profile.role === "SUPER_ADMIN"));
  const isSuperAdmin = !IS_API_MODE || profile.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!isAdmin) return;
    void adminService
      .getMyCinemas()
      .then((list) => {
        setScopedCinemas(list);
        if (list[0]) {
          setSelectedCinemaId(list[0].id);
          const firstHall = auditoriums.find((a) => a.cinemaId === list[0].id);
          if (firstHall) setNewAuditoriumId(firstHall.id);
        }
      })
      .catch(() => {});
    void adminService.getOverview().then(setOverview).catch(() => {});
    void adminService.getBookings().then(setBookings).catch(() => {});
    void adminService
      .getScreenTypes()
      .then((types) => {
        setScreenTypes(types);
        if (types[0]) setScreenFormat(types[0].name);
      })
      .catch(() => {});
    if (isSuperAdmin) {
      void adminService.getUsers().then(setUsers).catch(() => {});
    }
  }, [isAdmin, isSuperAdmin, auditoriums]);

  const handleCreateAuditorium = async (cinemaId: string, e: React.FormEvent) => {
    e.preventDefault();
    const created = await adminService.createAuditorium({
      cinemaId,
      name: screenName.trim() || "Screen New",
      format: screenFormat,
      rowCount: Number(screenRows) || 6,
      seatsPerRow: Number(screenSeatsPerRow) || 12,
    });
    setAuditoriumsList((prev) => [...prev, created]);
    setAddingScreenForCinemaId(null);
    if (selectedCinemaId === cinemaId) {
      setNewAuditoriumId(created.id);
    }
  };

  const handleCreateShowtime = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleError(null);
    const aud = auditoriumsList.find((a) => a.id === newAuditoriumId);
    if (!aud || !newMovieId) return;
    try {
      const created = await adminService.createShowtime({
        movieId: newMovieId,
        cinemaId: aud.cinemaId,
        auditoriumId: aud.id,
        date: newDate,
        time: newTime,
        format: aud.format,
        basePrice: Number(newPrice) || 22,
        badge: newBadge.trim() || undefined,
      });
      setShowtimes((prev) => [...prev, created]);
      setNewBadge("");
    } catch (err) {
      setScheduleError(err instanceof Error ? err.message : "Failed to schedule showtime");
    }
  };

  const handleAdjustPrice = async (st: Showtime, delta: number) => {
    const nextPrice = Math.max(5, Number((st.basePrice + delta).toFixed(2)));
    const updated = await adminService.updateShowtime(st.id, { basePrice: nextPrice });
    setShowtimes((prev) => prev.map((s) => (s.id === st.id ? { ...s, basePrice: updated.basePrice } : s)));
  };

  const handleDeleteShowtime = async (id: string) => {
    await adminService.deleteShowtime(id);
    setShowtimes((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCreateScreenType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    const created = await adminService.createScreenType({
      name: newTypeName.trim(),
      description: newTypeDesc.trim(),
    });
    setScreenTypes((prev) => [...prev, created]);
    setNewTypeName("");
    setNewTypeDesc("");
  };

  const handleSaveScreenType = async (id: string) => {
    if (!editingTypeName.trim()) return;
    const updated = await adminService.updateScreenType(id, { name: editingTypeName.trim() });
    setScreenTypes((prev) => prev.map((t) => (t.id === id ? updated : t)));
    setEditingTypeId(null);
  };

  const handleDeleteScreenType = async (id: string) => {
    await adminService.deleteScreenType(id);
    setScreenTypes((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);
    if (!newUserName.trim() || !newUserEmail.trim() || newUserPassword.length < 8) {
      setUserFormError("Enter name, valid email, and password (min 8 chars).");
      return;
    }
    try {
      const created = await adminService.createUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
        role: newUserRole,
        cinemaId: newUserRole === "CINEMA_ADMIN" ? newUserCinemaId : undefined,
      });
      setUsers((prev) => [created, ...prev]);
      if (newUserRole === "CINEMA_ADMIN" && newUserCinemaId) {
        setScopedCinemas((prev) =>
          prev.map((c) => (c.id === newUserCinemaId ? { ...c, adminUserId: created.id } : c)),
        );
      }
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
    } catch (err) {
      setUserFormError(err instanceof Error ? err.message : "Failed to create user");
    }
  };

  const handleChangeUserRole = async (
    userId: string,
    role: "CUSTOMER" | "CINEMA_ADMIN" | "SUPER_ADMIN",
  ) => {
    const updated = await adminService.updateUserRole(userId, role);
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
  };

  const handleAssignCinemaAdmin = async (cinemaId: string, adminUserId: string) => {
    const updated = await adminService.assignCinemaAdmin(cinemaId, adminUserId);
    setScopedCinemas((prev) => prev.map((c) => (c.id === cinemaId ? { ...c, adminUserId: updated.adminUserId } : c)));
  };

  const handleStartEditUser = (u: UserProfile) => {
    const assigned = scopedCinemas.find((c) => c.adminUserId === u.id);
    setEditingUserId(u.id);
    setEditUserName(u.name);
    setEditUserEmail(u.email);
    setEditUserPhone(u.phone ?? "");
    setEditUserCity(u.city ?? "");
    setEditUserTier(u.tier ?? "");
    setEditUserRole(u.role ?? "CUSTOMER");
    setEditUserCinemaId(assigned?.id ?? scopedCinemas[0]?.id ?? "");
    setUserFormError(null);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    setUserFormError(null);
    try {
      const updated = await adminService.updateUser(editingUserId, {
        name: editUserName.trim(),
        email: editUserEmail.trim(),
        phone: editUserPhone.trim(),
        city: editUserCity.trim(),
        tier: editUserTier.trim(),
        role: editUserRole,
        cinemaId: editUserRole === "CINEMA_ADMIN" ? editUserCinemaId : undefined,
      });
      setUsers((prev) => prev.map((u) => (u.id === editingUserId ? updated : u)));
      if (editUserRole === "CINEMA_ADMIN" && editUserCinemaId) {
        setScopedCinemas((prev) =>
          prev.map((c) => (c.id === editUserCinemaId ? { ...c, adminUserId: editingUserId } : c)),
        );
      }
      setEditingUserId(null);
    } catch (err) {
      setUserFormError(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  if (IS_API_MODE && isLoaded && !isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="rounded-xl border border-white/10 bg-[#13151B] p-8 space-y-4">
          <ShieldCheck className="mx-auto h-10 w-10 text-[#A78BFA]" />
          <h1 className="font-display text-2xl font-bold text-white">
            Admin Terminal Access Required
          </h1>
          <p className="text-sm text-[#94A3B8]">
            Sign in with a <span className="text-[#FFB95F] font-semibold">CINEMA_ADMIN</span> or{" "}
            <span className="text-[#4CD7F6] font-semibold">SUPER_ADMIN</span> account to manage
            venues, auditoriums, bookings, and platform operations.
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

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A78BFA]">
            CineView Operations / {profile.role ?? "ADMIN"} / Cinema &amp; Platform Management
          </p>
          <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
            Hall Studio Admin — Operations Console
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Auditorium CAD configuration, live revenue &amp; bookings telemetry, and role-based
            venue administration.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-400/35 bg-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-300">
            {profile.role ?? "ADMIN"} • {IS_API_MODE ? "Live Backend" : "Mock Mode"}
          </span>
          {auditoriums[0] ? (
            <Link href={`/admin/auditoriums/${auditoriums[0].id}`}>
              <Button variant="primary">
                <Sliders className="h-4 w-4" />
                Open Auditorium Editor
              </Button>
            </Link>
          ) : null}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-[#13151B] p-4">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#94A3B8]">Active Venues</p>
          <p className="mt-1 font-display text-2xl font-bold text-white">
            {overview?.cinemasCount ?? cinemas.length}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#13151B] p-4">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#94A3B8]">
            Confirmed Bookings
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-[#CEBDFF]">
            {overview?.confirmedBookingsCount ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#13151B] p-4">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#94A3B8]">
            Scheduled Showtimes
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-[#4CD7F6]">
            {overview?.showtimesCount ?? showtimes.length}
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#13151B] p-4">
          <p className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-[#94A3B8]">
            <DollarSign className="h-3 w-3 text-[#FFB95F]" /> Gross Revenue
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-[#FFB95F]">
            ${(overview?.totalRevenue ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Venues & Auditoriums */}
      <div className="space-y-6">
        {scopedCinemas.map((cinema) => {
          const cinemaHalls = auditoriumsList.filter((a) => a.cinemaId === cinema.id);
          const isAddingScreen = addingScreenForCinemaId === cinema.id;
          return (
            <div
              key={cinema.id}
              className="rounded-xl border border-white/10 bg-[#13151B] p-6 space-y-4"
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-[#A78BFA]" />
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">{cinema.name}</h2>
                    <p className="text-xs text-[#94A3B8]">
                      {cinema.address} • {cinemaHalls.length} Screen(s)
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {isSuperAdmin && users.length > 0 ? (
                    <select
                      aria-label={`Assign admin for ${cinema.name}`}
                      value={cinema.adminUserId ?? ""}
                      onChange={(e) => void handleAssignCinemaAdmin(cinema.id, e.target.value)}
                      className="rounded border border-white/15 bg-[#0B0C10] px-2 py-1 text-[11px] text-[#CEBDFF]"
                    >
                      <option value="" disabled>
                        Assign Cinema Admin...
                      </option>
                      {users
                        .filter((u) => u.role === "CINEMA_ADMIN" || u.role === "SUPER_ADMIN")
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            Admin: {u.name}
                          </option>
                        ))}
                    </select>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setAddingScreenForCinemaId(isAddingScreen ? null : cinema.id)
                    }
                  >
                    <Plus className="h-3.5 w-3.5 text-[#4CD7F6]" />
                    {isAddingScreen ? "Cancel" : "Add Screen"}
                  </Button>
                  <Link
                    href={`/cinemas/${cinema.id}`}
                    className="text-xs font-semibold text-[#CEBDFF] hover:text-white"
                  >
                    View Public Page →
                  </Link>
                </div>
              </div>

              {isAddingScreen ? (
                <form
                  onSubmit={(e) => void handleCreateAuditorium(cinema.id, e)}
                  className="grid gap-3 rounded-lg border border-[#A78BFA]/30 bg-[#0B0C10] p-4 sm:grid-cols-2 lg:grid-cols-5"
                >
                  <input
                    type="text"
                    value={screenName}
                    onChange={(e) => setScreenName(e.target.value)}
                    placeholder="Screen Name (e.g. Screen 3)"
                    className="rounded border border-white/10 bg-[#13151B] px-2.5 py-2 text-xs text-white"
                  />
                  <select
                    value={screenFormat}
                    onChange={(e) => setScreenFormat(e.target.value)}
                    className="rounded border border-white/10 bg-[#13151B] px-2.5 py-2 text-xs text-white"
                  >
                    {screenTypes.map((st) => (
                      <option key={st.id} value={st.name}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="2"
                    max="16"
                    value={screenRows}
                    onChange={(e) => setScreenRows(e.target.value)}
                    placeholder="Rows (e.g. 6)"
                    className="rounded border border-white/10 bg-[#13151B] px-2.5 py-2 text-xs text-white"
                  />
                  <input
                    type="number"
                    min="4"
                    max="24"
                    value={screenSeatsPerRow}
                    onChange={(e) => setScreenSeatsPerRow(e.target.value)}
                    placeholder="Seats/Row (e.g. 12)"
                    className="rounded border border-white/10 bg-[#13151B] px-2.5 py-2 text-xs text-white"
                  />
                  <Button type="submit" variant="primary" size="sm">
                    Create Screen
                  </Button>
                </form>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                {cinemaHalls.map((hall) => {
                  const totalSeats = hall.rows.reduce((sum, r) => sum + r.seatCount, 0);
                  return (
                    <div
                      key={hall.id}
                      className="flex flex-col justify-between gap-3 rounded-lg border border-[#2A2E3D] bg-[#0B0C10] p-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-display text-base font-bold text-white">
                            {hall.name}
                          </h3>
                          <FormatBadge format={hall.format} />
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-[#94A3B8]">
                          <span>{hall.rows.length} Rows</span>
                          <span>{totalSeats} Seats</span>
                          <span>
                            Screen: {hall.screenWidth}m × {hall.screenHeight}m
                          </span>
                          <span className="inline-flex items-center gap-1 text-[#4CD7F6]">
                            <Speaker className="h-3 w-3" /> {hall.speakerCount} Ch
                          </span>
                        </div>
                      </div>

                      <Link href={`/admin/auditoriums/${hall.id}`}>
                        <Button variant="ghost" size="sm">
                          <Sliders className="h-3.5 w-3.5 text-[#A78BFA]" />
                          Edit Seat Layout &amp; 3D Blueprint
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Screen Types Manager (CRUD) */}
      <div className="rounded-xl border border-white/10 bg-[#13151B] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-[#4CD7F6]" />
          <h2 className="font-display text-lg font-bold text-white">Screen Types Manager</h2>
        </div>

        <form onSubmit={(e) => void handleCreateScreenType(e)} className="grid gap-3 sm:grid-cols-3">
          <input
            type="text"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            placeholder="Screen Type (e.g. 4DX, Gold Class)"
            className="rounded border border-white/10 bg-[#0B0C10] px-2.5 py-2 text-xs text-white"
          />
          <input
            type="text"
            value={newTypeDesc}
            onChange={(e) => setNewTypeDesc(e.target.value)}
            placeholder="Description (optional)"
            className="rounded border border-white/10 bg-[#0B0C10] px-2.5 py-2 text-xs text-white"
          />
          <Button type="submit" variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5" /> Add Screen Type
          </Button>
        </form>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {screenTypes.map((st) => (
            <div
              key={st.id}
              className="flex items-center justify-between gap-2 rounded border border-white/10 bg-[#0B0C10] px-3 py-2 text-xs"
            >
              {editingTypeId === st.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="text"
                    value={editingTypeName}
                    onChange={(e) => setEditingTypeName(e.target.value)}
                    className="w-full rounded border border-[#A78BFA]/50 bg-[#13151B] px-2 py-1 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSaveScreenType(st.id)}
                    className="rounded bg-[#A78BFA] px-2 py-1 text-[10px] font-semibold text-[#0B0C10]"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{st.name}</p>
                  {st.description ? (
                    <p className="truncate text-[10px] text-[#94A3B8]">{st.description}</p>
                  ) : null}
                </div>
              )}
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTypeId(st.id);
                    setEditingTypeName(st.name);
                  }}
                  className="rounded border border-white/10 px-2 py-1 text-[10px] text-[#CEBDFF] hover:border-[#A78BFA]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteScreenType(st.id)}
                  aria-label={`Delete ${st.name}`}
                  className="rounded border border-red-500/30 bg-red-500/10 p-1 text-red-300 hover:bg-red-500/20"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Showtime Schedule Manager */}
      <div id="showtimes" className="rounded-xl border border-white/10 bg-[#13151B] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-[#A78BFA]" />
          <h2 className="font-display text-lg font-bold text-white">Showtime Schedule Manager</h2>
        </div>

        {scheduleError ? (
          <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {scheduleError}
          </div>
        ) : null}

        <form onSubmit={handleCreateShowtime} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          <select
            value={newMovieId}
            onChange={(e) => setNewMovieId(e.target.value)}
            className="rounded border border-white/10 bg-[#0B0C10] px-2.5 py-2 text-xs text-white"
          >
            {movies.slice(0, 25).map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
          <select
            value={selectedCinemaId}
            onChange={(e) => {
              const cid = e.target.value;
              setSelectedCinemaId(cid);
              const firstHall = auditoriumsList.find((a) => a.cinemaId === cid);
              setNewAuditoriumId(firstHall?.id ?? "");
            }}
            className="rounded border border-white/10 bg-[#0B0C10] px-2.5 py-2 text-xs text-white"
          >
            {scopedCinemas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={newAuditoriumId}
            onChange={(e) => setNewAuditoriumId(e.target.value)}
            className="rounded border border-white/10 bg-[#0B0C10] px-2.5 py-2 text-xs text-white"
          >
            {auditoriumsList
              .filter((a) => a.cinemaId === selectedCinemaId)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.format})
                </option>
              ))}
          </select>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="rounded border border-white/10 bg-[#0B0C10] px-2.5 py-2 text-xs text-white"
          />
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="rounded border border-white/10 bg-[#0B0C10] px-2.5 py-2 text-xs text-white"
          />
          <input
            type="number"
            step="0.5"
            min="5"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder="Base Price ($)"
            className="rounded border border-white/10 bg-[#0B0C10] px-2.5 py-2 text-xs text-white"
          />
          <Button type="submit" variant="primary" size="sm">
            <Plus className="h-3.5 w-3.5" /> Add Showtime
          </Button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#94A3B8]">
                <th className="py-2 pr-4">Movie</th>
                <th className="py-2 pr-4">Auditorium</th>
                <th className="py-2 pr-4">Date &amp; Time</th>
                <th className="py-2 pr-4">Base Price</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {showtimes
                .filter((st) => scopedCinemas.some((c) => c.id === st.cinemaId))
                .map((st) => {
                const movieTitle = movies.find((m) => m.id === st.movieId)?.title ?? st.movieId;
                const cinemaName = cinemas.find((c) => c.id === st.cinemaId)?.name ?? st.cinemaId;
                const audName =
                  auditoriumsList.find((a) => a.id === st.auditoriumId)?.name ?? st.auditoriumId;
                return (
                  <tr key={st.id} className="border-b border-white/5 text-[#E3E2E8]">
                    <td className="py-2 pr-4 font-semibold">{movieTitle}</td>
                    <td className="py-2 pr-4 text-[#94A3B8]">
                      <span className="text-white">{cinemaName}</span> • {audName}
                    </td>
                    <td className="py-2 pr-4 font-mono">
                      {st.date} • {st.time}
                    </td>
                    <td className="py-2 pr-4">
                      <span className="font-semibold text-[#FFB95F]">${st.basePrice.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => void handleAdjustPrice(st, 2)}
                        className="ml-2 rounded border border-white/10 px-1.5 py-0.5 text-[10px] hover:border-[#A78BFA]"
                      >
                        +$2
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleAdjustPrice(st, -2)}
                        className="ml-1 rounded border border-white/10 px-1.5 py-0.5 text-[10px] hover:border-[#A78BFA]"
                      >
                        -$2
                      </button>
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => void handleDeleteShowtime(st.id)}
                        aria-label={`Delete showtime ${st.id}`}
                        className="inline-flex items-center gap-1 rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="rounded-xl border border-white/10 bg-[#13151B] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-[#4CD7F6]" />
          <h2 className="font-display text-lg font-bold text-white">Recent Platform Bookings</h2>
        </div>
        {bookings.length === 0 ? (
          <p className="text-xs text-[#94A3B8]">No bookings recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#94A3B8]">
                  <th className="py-2 pr-4">Ref</th>
                  <th className="py-2 pr-4">Movie</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Seats</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 text-[#E3E2E8]">
                    <td className="py-2 pr-4 font-mono text-[#CEBDFF]">{b.referenceCode}</td>
                    <td className="py-2 pr-4">{b.movieTitle}</td>
                    <td className="py-2 pr-4 text-[#94A3B8]">{b.contactEmail}</td>
                    <td className="py-2 pr-4">{b.seats.map((s) => s.label).join(", ")}</td>
                    <td className="py-2 pr-4 font-semibold text-[#FFB95F]">${b.total.toFixed(2)}</td>
                    <td className="py-2 uppercase text-[10px] font-bold">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Super Admin User Directory */}
      {isSuperAdmin ? (
        <div className="rounded-xl border border-white/10 bg-[#13151B] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#A78BFA]" />
            <h2 className="font-display text-lg font-bold text-white">
              Super Admin — User, Role &amp; Cinema Assignment
            </h2>
          </div>

          {userFormError ? (
            <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {userFormError}
            </div>
          ) : null}

          <form onSubmit={(e) => void handleCreateUser(e)} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Full Name"
              className="rounded border border-white/10 bg-[#0B0C10] px-2.5 py-2 text-xs text-white"
            />
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="Email address"
              className="rounded border border-white/10 bg-[#0B0C10] px-2.5 py-2 text-xs text-white"
            />
            <input
              type="password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              placeholder="Password (min 8 chars)"
              className="rounded border border-white/10 bg-[#0B0C10] px-2.5 py-2 text-xs text-white"
            />
            <select
              value={newUserRole}
              onChange={(e) =>
                setNewUserRole(e.target.value as "CUSTOMER" | "CINEMA_ADMIN" | "SUPER_ADMIN")
              }
              className="rounded border border-white/10 bg-[#0B0C10] px-2.5 py-2 text-xs text-white"
            >
              <option value="CINEMA_ADMIN">CINEMA_ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="CUSTOMER">CUSTOMER</option>
            </select>
            {newUserRole === "CINEMA_ADMIN" ? (
              <select
                value={newUserCinemaId}
                onChange={(e) => setNewUserCinemaId(e.target.value)}
                className="rounded border border-white/10 bg-[#0B0C10] px-2.5 py-2 text-xs text-white"
              >
                {scopedCinemas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center px-2 text-[11px] text-[#64748B]">
                No cinema scope needed
              </div>
            )}
            <Button type="submit" variant="primary" size="sm">
              <Plus className="h-3.5 w-3.5" /> Create User
            </Button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#94A3B8]">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Assigned Cinemas</th>
                  <th className="py-2 pr-4">Tier</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const assignedCinemas = scopedCinemas
                    .filter((c) => c.adminUserId === u.id)
                    .map((c) => c.name);
                  return (
                    <tr key={u.id} className="border-b border-white/5 text-[#E3E2E8]">
                      <td className="py-2 pr-4 font-semibold">{u.name}</td>
                      <td className="py-2 pr-4 text-[#94A3B8]">{u.email}</td>
                      <td className="py-2 pr-4">
                        <select
                          aria-label={`Role for ${u.email}`}
                          value={u.role ?? "CUSTOMER"}
                          onChange={(e) =>
                            void handleChangeUserRole(
                              u.id,
                              e.target.value as "CUSTOMER" | "CINEMA_ADMIN" | "SUPER_ADMIN",
                            )
                          }
                          className="rounded border border-white/10 bg-[#0B0C10] px-2 py-1 font-mono text-[11px] text-[#4CD7F6]"
                        >
                          <option value="CUSTOMER">CUSTOMER</option>
                          <option value="CINEMA_ADMIN">CINEMA_ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                      </td>
                      <td className="py-2 pr-4 text-[#CEBDFF]">
                        {assignedCinemas.length > 0 ? assignedCinemas.join(", ") : "—"}
                      </td>
                      <td className="py-2 pr-4">{u.tier}</td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleStartEditUser(u)}
                          className="rounded border border-white/15 px-2.5 py-1 text-[10px] font-semibold text-[#CEBDFF] hover:border-[#A78BFA]"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {editingUserId ? (
            <form
              onSubmit={(e) => void handleSaveEditUser(e)}
              className="grid gap-3 rounded-lg border border-[#A78BFA]/40 bg-[#0B0C10] p-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <input
                type="text"
                value={editUserName}
                onChange={(e) => setEditUserName(e.target.value)}
                placeholder="Full Name"
                className="rounded border border-white/10 bg-[#13151B] px-2.5 py-2 text-xs text-white"
              />
              <input
                type="email"
                value={editUserEmail}
                onChange={(e) => setEditUserEmail(e.target.value)}
                placeholder="Email"
                className="rounded border border-white/10 bg-[#13151B] px-2.5 py-2 text-xs text-white"
              />
              <input
                type="text"
                value={editUserPhone}
                onChange={(e) => setEditUserPhone(e.target.value)}
                placeholder="Phone"
                className="rounded border border-white/10 bg-[#13151B] px-2.5 py-2 text-xs text-white"
              />
              <input
                type="text"
                value={editUserCity}
                onChange={(e) => setEditUserCity(e.target.value)}
                placeholder="City"
                className="rounded border border-white/10 bg-[#13151B] px-2.5 py-2 text-xs text-white"
              />
              <input
                type="text"
                value={editUserTier}
                onChange={(e) => setEditUserTier(e.target.value)}
                placeholder="Tier"
                className="rounded border border-white/10 bg-[#13151B] px-2.5 py-2 text-xs text-white"
              />
              <select
                value={editUserRole}
                onChange={(e) =>
                  setEditUserRole(e.target.value as "CUSTOMER" | "CINEMA_ADMIN" | "SUPER_ADMIN")
                }
                className="rounded border border-white/10 bg-[#13151B] px-2.5 py-2 text-xs text-white"
              >
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="CINEMA_ADMIN">CINEMA_ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
              {editUserRole === "CINEMA_ADMIN" ? (
                <select
                  value={editUserCinemaId}
                  onChange={(e) => setEditUserCinemaId(e.target.value)}
                  className="rounded border border-white/10 bg-[#13151B] px-2.5 py-2 text-xs text-white"
                >
                  {scopedCinemas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center px-2 text-[11px] text-[#64748B]">
                  No cinema assignment
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button type="submit" variant="primary" size="sm">
                  Save User
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingUserId(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
