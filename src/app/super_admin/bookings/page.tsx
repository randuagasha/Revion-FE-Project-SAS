"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  AlertCircle,
  CalendarCheck,
  Car,
  Clock3,
  Eye,
  Loader2,
  Search,
  Trash2,
  User,
  Wrench,
} from "lucide-react";

import {
  bookingService,
  type Booking,
  type BookingStatus,
} from "@/services/booking.service";

const formatLabel = (value?: string) => {
  if (!value) return "-";

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (date?: string) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const formatTime = (time?: string) => {
  if (!time) return "-";

  return time.slice(0, 5);
};

const getStatusClass = (status?: string) => {
  switch (status) {
    case "pending":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
    case "accepted":
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";
    case "inspection":
      return "border-indigo-500/20 bg-indigo-500/10 text-indigo-400";
    case "in_progress":
      return "border-purple-500/20 bg-purple-500/10 text-purple-400";
    case "completed":
      return "border-green-500/20 bg-green-500/10 text-green-400";
    case "cancelled":
      return "border-red-500/20 bg-red-500/10 text-red-400";
    default:
      return "border-white/10 bg-white/5 text-muted-foreground";
  }
};

const getPriorityClass = (priority?: string) => {
  switch (priority) {
    case "high":
      return "border-red-500/20 bg-red-500/10 text-red-400";
    case "medium":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
    case "low":
      return "border-green-500/20 bg-green-500/10 text-green-400";
    default:
      return "border-white/10 bg-white/5 text-muted-foreground";
  }
};

export default function SuperAdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [pageError, setPageError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all",
  );

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setPageError("");

        const response = await bookingService.getAllBookings({
          limit: 100,
        });

        setBookings(response.data || []);
      } catch (error) {
        console.error("Failed to fetch super admin bookings:", error);
        setBookings([]);
        setPageError(
          "Gagal mengambil data bookings. Cek endpoint GET /bookings di backend.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !keyword ||
        booking.booking_code?.toLowerCase().includes(keyword) ||
        booking.customer_name?.toLowerCase().includes(keyword) ||
        booking.customer_email?.toLowerCase().includes(keyword) ||
        booking.brand?.toLowerCase().includes(keyword) ||
        booking.model?.toLowerCase().includes(keyword) ||
        booking.license_plate?.toLowerCase().includes(keyword) ||
        booking.service_name?.toLowerCase().includes(keyword) ||
        booking.mechanic_name?.toLowerCase().includes(keyword) ||
        booking.status?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const totalPending = useMemo(() => {
    return bookings.filter((booking) => booking.status === "pending").length;
  }, [bookings]);

  const totalActive = useMemo(() => {
    return bookings.filter((booking) => {
      return (
        booking.status === "accepted" ||
        booking.status === "inspection" ||
        booking.status === "in_progress"
      );
    }).length;
  }, [bookings]);

  const totalCompleted = useMemo(() => {
    return bookings.filter((booking) => booking.status === "completed").length;
  }, [bookings]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      })
      .slice(0, 5);
  }, [bookings]);

  const handleDeleteBooking = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this booking?",
    );

    if (!confirmDelete) return;

    try {
      setDeleteLoading(id);

      await bookingService.deleteBooking(id);

      setBookings((prev) => prev.filter((booking) => booking.id !== id));
    } catch (error) {
      console.error("Failed to delete booking:", error);
      alert("Failed to delete booking");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white shadow-lg shadow-[#522C14]/20">
              <CalendarCheck size={22} />
            </div>

            <p className="mb-2 text-sm text-muted-foreground">
              Booking Management
            </p>

            <h1 className="max-w-2xl text-2xl font-bold leading-tight text-white md:text-3xl">
              Monitor customer booking requests.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              View recent bookings, track customer requests, and manage booking
              data across Revion.
            </p>
          </div>
        </div>

        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#522C14]/20 blur-3xl" />
      </section>

      {/* STATS */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white">
            <CalendarCheck size={21} />
          </div>

          <p className="text-sm text-muted-foreground">Total Bookings</p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            {bookings.length}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            All customer requests
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white">
            <Clock3 size={21} />
          </div>

          <p className="text-sm text-muted-foreground">Pending</p>
          <h2 className="mt-2 text-3xl font-bold text-white">{totalPending}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Waiting for review
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white">
            <Wrench size={21} />
          </div>

          <p className="text-sm text-muted-foreground">Active Progress</p>
          <h2 className="mt-2 text-3xl font-bold text-white">{totalActive}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Accepted or in repair
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white">
            <AlertCircle size={21} />
          </div>

          <p className="text-sm text-muted-foreground">Completed</p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            {totalCompleted}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Finished services
          </p>
        </div>
      </section>

      {/* RECENT BOOKINGS */}
      <section className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest customer bookings submitted to the system.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-border">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="animate-spin" size={22} />
              <span className="text-sm font-medium">Loading bookings...</span>
            </div>
          </div>
        ) : pageError ? (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-red-500/20 bg-red-500/5 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10">
              <AlertCircle size={24} className="text-red-400" />
            </div>

            <h3 className="text-lg font-bold text-white">
              Failed to load bookings
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {pageError}
            </p>
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent">
              <CalendarCheck size={24} className="text-muted-foreground" />
            </div>

            <h3 className="text-lg font-bold text-white">No bookings yet</h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Recent bookings will appear here after customers create booking
              requests.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-225 text-left text-sm">
              <thead className="bg-accent/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-4 font-medium">Booking</th>
                  <th className="px-4 py-4 font-medium">Customer</th>
                  <th className="px-4 py-4 font-medium">Vehicle</th>
                  <th className="px-4 py-4 font-medium">Service</th>
                  <th className="px-4 py-4 font-medium">Mechanic</th>
                  <th className="px-4 py-4 font-medium">Schedule</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-t border-border transition hover:bg-accent/40"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">
                        {booking.booking_code || `Booking #${booking.id}`}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        ID: {booking.id}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#522C14] text-white">
                          <User size={17} />
                        </div>

                        <div>
                          <p className="font-medium text-white">
                            {booking.customer_name || "Customer"}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {booking.customer_email || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Car size={17} className="text-muted-foreground" />

                        <div>
                          <p className="font-medium text-white">
                            {booking.brand || "-"} {booking.model || ""}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {booking.license_plate || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-muted-foreground">
                      {booking.service_name || "-"}
                    </td>

                    <td className="px-4 py-4 text-muted-foreground">
                      {booking.mechanic_name || "Not assigned"}
                    </td>

                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDate(booking.preferred_date)} •{" "}
                      {formatTime(booking.preferred_time)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                          booking.status,
                        )}`}
                      >
                        {formatLabel(booking.status)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end">
                        <Link
                          href={`/super_admin/bookings/${booking.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-[#522C14] hover:text-white"
                          title="View booking detail"
                        >
                          <Eye size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ALL BOOKINGS */}
      <section className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-bold text-white">All Bookings</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search and filter all booking requests from customers.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex h-11 items-center gap-3 rounded-xl border border-border bg-background/40 px-4 md:w-80">
              <Search size={17} className="text-muted-foreground" />

              <input
                type="text"
                placeholder="Search booking..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as BookingStatus | "all")
              }
              className="h-11 rounded-xl border border-border bg-background/40 px-4 text-sm font-medium text-white outline-none"
            >
              <option className="bg-[#0A0A0A]" value="all">
                All Status
              </option>
              <option className="bg-[#0A0A0A]" value="pending">
                Pending
              </option>
              <option className="bg-[#0A0A0A]" value="accepted">
                Accepted
              </option>
              <option className="bg-[#0A0A0A]" value="inspection">
                Inspection
              </option>
              <option className="bg-[#0A0A0A]" value="in_progress">
                In Progress
              </option>
              <option className="bg-[#0A0A0A]" value="completed">
                Completed
              </option>
              <option className="bg-[#0A0A0A]" value="cancelled">
                Cancelled
              </option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-border">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="animate-spin" size={22} />
              <span className="text-sm font-medium">Loading bookings...</span>
            </div>
          </div>
        ) : pageError ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-red-500/20 bg-red-500/5 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10">
              <AlertCircle size={24} className="text-red-400" />
            </div>

            <h3 className="text-lg font-bold text-white">
              Failed to load bookings
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {pageError}
            </p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent">
              <AlertCircle size={24} className="text-muted-foreground" />
            </div>

            <h3 className="text-lg font-bold text-white">No bookings found</h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Try adjusting your search keyword or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-275 text-left text-sm">
              <thead className="bg-accent/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-4 font-medium">Booking</th>
                  <th className="px-4 py-4 font-medium">Customer</th>
                  <th className="px-4 py-4 font-medium">Vehicle</th>
                  <th className="px-4 py-4 font-medium">Service</th>
                  <th className="px-4 py-4 font-medium">Mechanic</th>
                  <th className="px-4 py-4 font-medium">Schedule</th>
                  <th className="px-4 py-4 font-medium">Priority</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-t border-border transition hover:bg-accent/40"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">
                        {booking.booking_code || `Booking #${booking.id}`}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        ID: {booking.id}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium text-white">
                        {booking.customer_name || "Customer"}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {booking.customer_email || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-medium text-white">
                        {booking.brand || "-"} {booking.model || ""}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {booking.license_plate || "-"}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-muted-foreground">
                      {booking.service_name || "-"}
                    </td>

                    <td className="px-4 py-4 text-muted-foreground">
                      {booking.mechanic_name || "Not assigned"}
                    </td>

                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDate(booking.preferred_date)} •{" "}
                      {formatTime(booking.preferred_time)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityClass(
                          booking.priority,
                        )}`}
                      >
                        {formatLabel(booking.priority)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                          booking.status,
                        )}`}
                      >
                        {formatLabel(booking.status)}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/super_admin/bookings/${booking.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-[#522C14] hover:text-white"
                          title="View booking detail"
                        >
                          <Eye size={16} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDeleteBooking(booking.id)}
                          disabled={deleteLoading === booking.id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          title="Delete booking"
                        >
                          {deleteLoading === booking.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
