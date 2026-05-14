"use client";

import Link from "next/link";

import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CalendarDays,
  Car,
  CheckCircle,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  Search,
  UserRound,
  Wrench,
} from "lucide-react";

import { bookingService, BookingStatus } from "@/services/booking.service";

interface MechanicBooking {
  id: number;
  booking_code: string;

  user_id?: number;
  vehicle_id?: number;
  service_id?: number;
  mechanic_id?: number | null;

  customer_name?: string;
  customer_email?: string;

  brand: string;
  model: string;
  license_plate?: string;

  service_name: string;

  preferred_date: string;
  preferred_time: string;

  complaint?: string;
  priority: "low" | "medium" | "high";
  status: BookingStatus;

  created_at: string;
  updated_at?: string;
}

const statusConfig: Record<
  BookingStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: typeof Clock;
  }
> = {
  pending: {
    label: "Pending",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
    icon: Clock,
  },

  accepted: {
    label: "Accepted",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.25)",
    icon: CheckCircle2,
  },

  inspection: {
    label: "Inspection",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.25)",
    icon: AlertCircle,
  },

  in_progress: {
    label: "In Progress",
    color: "#C2692A",
    bg: "rgba(194,105,42,0.12)",
    border: "rgba(194,105,42,0.25)",
    icon: Loader2,
  },

  completed: {
    label: "Completed",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.25)",
    icon: CheckCircle,
  },

  cancelled: {
    label: "Cancelled",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.25)",
    icon: AlertCircle,
  },
};

const priorityConfig = {
  low: {
    label: "Low",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.25)",
  },

  medium: {
    label: "Medium",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
  },

  high: {
    label: "High",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.25)",
  },
};

const filters = ["All", "pending", "accepted", "inspection", "in_progress"];

export default function MechanicBookingsPage() {
  const [bookings, setBookings] = useState<MechanicBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptLoading, setAcceptLoading] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);

        const response = await bookingService.getMechanicIncomingBookings();

        setBookings(response.data || []);
      } catch (error) {
        console.error("Failed fetch assigned jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const refreshBookings = async () => {
    const response = await bookingService.getMechanicIncomingBookings();

    setBookings(response.data || []);
  };

  const stats = useMemo(() => {
    const pending = bookings.filter((booking) => {
      return booking.status === "pending";
    }).length;

    const activeJobs = bookings.filter((booking) => {
      return ["accepted", "inspection", "in_progress"].includes(booking.status);
    });

    const accepted = activeJobs.filter((booking) => {
      return booking.status === "accepted";
    }).length;

    const inspection = activeJobs.filter((booking) => {
      return booking.status === "inspection";
    }).length;

    const inProgress = activeJobs.filter((booking) => {
      return booking.status === "in_progress";
    }).length;

    return {
      total: activeJobs.length,
      pending,
      accepted,
      inspection,
      inProgress,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const keyword = search.toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        (booking.booking_code || "").toLowerCase().includes(keyword) ||
        (booking.customer_name || "").toLowerCase().includes(keyword) ||
        (booking.customer_email || "").toLowerCase().includes(keyword) ||
        (booking.brand || "").toLowerCase().includes(keyword) ||
        (booking.model || "").toLowerCase().includes(keyword) ||
        (booking.license_plate || "").toLowerCase().includes(keyword) ||
        (booking.service_name || "").toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "All" || booking.status === statusFilter;

      const shouldShowJob = [
        "pending",
        "accepted",
        "inspection",
        "in_progress",
      ].includes(booking.status);

      return matchesSearch && matchesStatus && shouldShowJob;
    });
  }, [bookings, search, statusFilter]);

  const summaryCards = [
    {
      title: "Pending Requests",
      value: stats.pending,
      description: "Waiting to be accepted",
      icon: Clock,
    },
    {
      title: "Active Jobs",
      value: stats.total,
      description: "Jobs currently assigned",
      icon: Wrench,
    },
    {
      title: "Inspection",
      value: stats.inspection,
      description: "Vehicle inspection phase",
      icon: AlertCircle,
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      description: "Currently being repaired",
      icon: Loader2,
    },
  ];

  const formatDate = (date?: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return "-";

    return time.slice(0, 5);
  };

  const getStatus = (status: BookingStatus) => {
    return statusConfig[status] || statusConfig.pending;
  };

  const handleAcceptBooking = async (id: number) => {
    const confirmAccept = window.confirm(
      "Are you sure you want to accept this booking?",
    );

    if (!confirmAccept) return;

    try {
      setAcceptLoading(id);

      await bookingService.acceptBooking(id);

      await refreshBookings();
    } catch (error) {
      console.error("Failed to accept booking:", error);
      alert("Failed to accept booking");
    } finally {
      setAcceptLoading(null);
    }
  };

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="mb-8 flex items-start justify-between gap-5">
        <div>
          <p className="mb-2 text-sm font-medium text-[#C2692A]">
            Mechanic Workspace
          </p>

          <h1 className="text-3xl font-bold tracking-tight">Assigned Jobs</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Accept pending customer requests and manage assigned vehicle service
            jobs.
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>

                  <h2 className="mt-2 text-3xl font-bold">
                    {loading ? "-" : card.value}
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#522C1430] bg-[#522C1415]">
                  <Icon
                    size={22}
                    className={
                      card.title === "In Progress"
                        ? "animate-spin text-[#C2692A]"
                        : "text-[#C2692A]"
                    }
                  />
                </div>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* SEARCH + FILTER */}
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex h-11 w-full items-center gap-3 rounded-xl border border-border bg-card px-4 xl:max-w-md">
          <Search size={15} className="text-muted-foreground" />

          <input
            type="text"
            placeholder="Search booking, customer, vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border-none bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`h-9 rounded-lg border px-4 text-xs font-medium capitalize transition-all ${
                statusFilter === filter
                  ? "border-[#522C14] bg-[#522C1415] text-[#C2692A]"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {filter === "in_progress" ? "In Progress" : filter}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex h-72 items-center justify-center rounded-3xl border border-border bg-card">
          <Loader2 className="animate-spin text-[#C2692A]" />
        </div>
      )}

      {/* EMPTY */}
      {!loading && filteredBookings.length === 0 && (
        <div className="flex h-72 flex-col items-center justify-center rounded-3xl border border-border bg-card px-5 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#522C1430] bg-[#522C1415]">
            <Wrench size={28} className="text-[#C2692A]" />
          </div>

          <h2 className="font-semibold">No jobs found</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Pending requests and assigned jobs will appear here.
          </p>
        </div>
      )}

      {/* JOB CARDS */}
      {!loading && filteredBookings.length > 0 && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredBookings.map((booking) => {
            const status = getStatus(booking.status);
            const StatusIcon = status.icon;

            const priority =
              priorityConfig[booking.priority] || priorityConfig.medium;

            const isPending = booking.status === "pending";

            return (
              <div
                key={booking.id}
                className="rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold">
                        {booking.booking_code}
                      </h2>

                      <div
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-1"
                        style={{
                          background: status.bg,
                          borderColor: status.border,
                        }}
                      >
                        <StatusIcon
                          size={13}
                          color={status.color}
                          className={
                            booking.status === "in_progress"
                              ? "animate-spin"
                              : ""
                          }
                        />

                        <span
                          className="text-xs font-semibold"
                          style={{
                            color: status.color,
                          }}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Created at {formatDate(booking.created_at)}
                    </p>
                  </div>

                  <Link
                    href={`/mechanics/bookings/${booking.id}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border transition hover:bg-accent"
                  >
                    <Eye size={16} />
                  </Link>
                </div>

                {/* INFO */}
                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Customer</p>

                    <div className="mt-2 flex items-center gap-2">
                      <UserRound size={15} className="text-[#C2692A]" />

                      <p className="truncate text-sm font-semibold">
                        {booking.customer_name || "-"}
                      </p>
                    </div>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {booking.customer_email || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Vehicle</p>

                    <div className="mt-2 flex items-center gap-2">
                      <Car size={15} className="text-[#C2692A]" />

                      <p className="truncate text-sm font-semibold">
                        {booking.brand} {booking.model}
                      </p>
                    </div>

                    <p className="mt-1 text-xs uppercase text-muted-foreground">
                      {booking.license_plate || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Service</p>

                    <div className="mt-2 flex items-center gap-2">
                      <Wrench size={15} className="text-[#C2692A]" />

                      <p className="truncate text-sm font-semibold">
                        {booking.service_name}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Schedule</p>

                    <div className="mt-2 flex items-center gap-2">
                      <CalendarDays size={15} className="text-[#C2692A]" />

                      <p className="truncate text-sm font-semibold">
                        {formatDate(booking.preferred_date)} at{" "}
                        {formatTime(booking.preferred_time)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* BOTTOM */}
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div
                    className="inline-flex w-fit items-center rounded-lg border px-3 py-1.5 text-xs font-semibold"
                    style={{
                      background: priority.bg,
                      borderColor: priority.border,
                      color: priority.color,
                    }}
                  >
                    {priority.label} Priority
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleAcceptBooking(booking.id)}
                        disabled={acceptLoading === booking.id}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 text-sm font-medium text-green-400 transition hover:bg-green-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {acceptLoading === booking.id ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={15} />
                            Accept Booking
                          </>
                        )}
                      </button>
                    )}

                    {!isPending && (
                      <Link
                        href={`/mechanics/bookings/${booking.id}`}
                        className="flex h-10 items-center gap-2 rounded-xl bg-[#522C14] px-4 text-sm font-medium text-white transition hover:bg-[#6B3818]"
                      >
                        Open Job
                        <Eye size={15} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
