"use client";

import Link from "next/link";

import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Car,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  Search,
  UserRound,
  Wrench,
} from "lucide-react";

import { bookingService } from "@/services/booking.service";

type BookingStatus =
  | "pending"
  | "accepted"
  | "inspection"
  | "in_progress"
  | "completed"
  | "cancelled";

interface MechanicBooking {
  id: number;
  booking_code: string;

  user_id: number;
  vehicle_id: number;
  service_id: number;
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
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
    icon: Clock,
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

export default function MechanicDashboardPage() {
  const [bookings, setBookings] = useState<MechanicBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const response = await bookingService.getMechanicBookings();

      setBookings(response.data || []);
    } catch (error) {
      console.error("Failed fetch mechanic bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadBookings = async () => {
      try {
        await fetchBookings();
      } catch (error) {
        console.error("Failed to load mechanic bookings:", error);
      }
    };

    void loadBookings();
  }, []);

  const stats = useMemo(() => {
    const total = bookings.length;

    const accepted = bookings.filter(
      (booking) => booking.status === "accepted",
    ).length;

    const inspection = bookings.filter(
      (booking) => booking.status === "inspection",
    ).length;

    const inProgress = bookings.filter(
      (booking) => booking.status === "in_progress",
    ).length;

    const completed = bookings.filter(
      (booking) => booking.status === "completed",
    ).length;

    const active = accepted + inspection + inProgress;

    return {
      total,
      active,
      accepted,
      inspection,
      inProgress,
      completed,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const keyword = search.toLowerCase();

      return (
        (booking.booking_code || "").toLowerCase().includes(keyword) ||
        (booking.customer_name || "").toLowerCase().includes(keyword) ||
        (booking.brand || "").toLowerCase().includes(keyword) ||
        (booking.model || "").toLowerCase().includes(keyword) ||
        (booking.service_name || "").toLowerCase().includes(keyword)
      );
    });
  }, [bookings, search]);

  const activeBookings = filteredBookings.filter((booking) =>
    ["accepted", "inspection", "in_progress"].includes(booking.status),
  );

  const recentJobs = activeBookings.slice(0, 5);

  const currentJob = activeBookings.find(
    (booking) =>
      booking.status === "in_progress" ||
      booking.status === "inspection" ||
      booking.status === "accepted",
  );

  const summaryCards = [
    {
      title: "Assigned Jobs",
      value: stats.total,
      description: "All jobs assigned to you",
      icon: CalendarDays,
    },
    {
      title: "Active Jobs",
      value: stats.active,
      description: "Accepted, inspection, progress",
      icon: Activity,
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      description: "Currently being handled",
      icon: Loader2,
    },
    {
      title: "Completed",
      value: stats.completed,
      description: "Finished repair jobs",
      icon: CheckCircle,
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

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-5 mb-8">
        <div>
          <p className="text-sm text-[#C2692A] font-medium mb-2">
            Mechanic Dashboard
          </p>

          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>

          <p className="text-muted-foreground text-sm mt-1">
            Track assigned jobs, update service progress, and manage completed
            work.
          </p>
        </div>

        <Link
          href="/mechanics/bookings"
          className="h-11 px-5 rounded-xl bg-[#522C14] hover:bg-[#6B3818] transition-all text-white text-sm font-medium flex items-center gap-2"
        >
          View Assigned Jobs
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
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

                  <h2 className="text-3xl font-bold mt-2">
                    {loading ? "-" : card.value}
                  </h2>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center">
                  <Icon
                    size={22}
                    className={
                      card.title === "In Progress"
                        ? "text-[#C2692A] animate-spin"
                        : "text-[#C2692A]"
                    }
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* CURRENT JOB + STATUS */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 mb-8">
        {/* CURRENT JOB */}
        <div className="rounded-3xl border border-border bg-card p-7 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-52 h-52 bg-[#C2692A]/10 blur-3xl rounded-full" />

          <div className="relative z-10 flex items-start justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Current Job</p>

              {currentJob ? (
                <>
                  <h2 className="text-2xl font-bold mt-2">
                    {currentJob.brand} {currentJob.model}
                  </h2>

                  <p className="text-sm text-muted-foreground mt-2">
                    {currentJob.service_name}
                  </p>

                  <div className="mt-5 flex items-center gap-3 flex-wrap">
                    {(() => {
                      const status = getStatus(currentJob.status);
                      const StatusIcon = status.icon;

                      return (
                        <div
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border"
                          style={{
                            background: status.bg,
                            borderColor: status.border,
                          }}
                        >
                          <StatusIcon
                            size={14}
                            color={status.color}
                            className={
                              currentJob.status === "in_progress"
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
                      );
                    })()}

                    <span className="text-xs text-muted-foreground">
                      {currentJob.booking_code}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">Customer</p>

                      <p className="text-sm font-semibold mt-1 truncate">
                        {currentJob.customer_name || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">
                        License Plate
                      </p>

                      <p className="text-sm font-semibold mt-1 uppercase">
                        {currentJob.license_plate || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">Schedule</p>

                      <p className="text-sm font-semibold mt-1">
                        {formatDate(currentJob.preferred_date)}{" "}
                        {formatTime(currentJob.preferred_time)}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mt-2">No Active Job</h2>

                  <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                    You do not have active service jobs right now. Assigned jobs
                    will appear here when available.
                  </p>
                </>
              )}
            </div>

            {currentJob && (
              <Link
                href={`/mechanics/bookings/${currentJob.id}`}
                className="hidden md:flex h-11 px-4 rounded-xl border border-border hover:bg-accent transition items-center gap-2 text-sm"
              >
                Open Job
                <ArrowRight size={15} />
              </Link>
            )}
          </div>
        </div>

        {/* STATUS BREAKDOWN */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <h3 className="font-semibold">Job Status</h3>

          <div className="space-y-4 mt-5">
            {(
              [
                "accepted",
                "inspection",
                "in_progress",
                "completed",
              ] as BookingStatus[]
            ).map((statusKey) => {
              const status = getStatus(statusKey);
              const StatusIcon = status.icon;

              const count =
                statusKey === "accepted"
                  ? stats.accepted
                  : statusKey === "inspection"
                    ? stats.inspection
                    : statusKey === "in_progress"
                      ? stats.inProgress
                      : stats.completed;

              return (
                <div
                  key={statusKey}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl border flex items-center justify-center"
                      style={{
                        background: status.bg,
                        borderColor: status.border,
                      }}
                    >
                      <StatusIcon
                        size={16}
                        color={status.color}
                        className={
                          statusKey === "in_progress" ? "animate-spin" : ""
                        }
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium">{status.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {count} job
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RECENT JOBS HEADER */}
      <div className="flex items-center justify-between gap-5 mb-5">
        <div>
          <h2 className="text-xl font-bold">Assigned Jobs</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Latest jobs assigned to you.
          </p>
        </div>

        <Link
          href="/mechanics/bookings"
          className="text-sm text-[#C2692A] hover:underline flex items-center gap-1"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* SEARCH */}
      <div className="mb-5 flex items-center gap-3 h-11 max-w-md rounded-xl border border-border bg-card px-4">
        <Search size={15} className="text-muted-foreground" />

        <input
          type="text"
          placeholder="Search assigned jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none border-none flex-1 text-sm"
        />
      </div>

      {/* TABLE */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        <div className="hidden md:grid grid-cols-12 px-6 py-4 border-b border-border text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
          <div className="col-span-3">Booking</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-3">Vehicle</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {loading && (
          <div className="h-72 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#C2692A]" />
          </div>
        )}

        {!loading && recentJobs.length === 0 && (
          <div className="h-72 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center mb-4">
              <Wrench size={28} className="text-[#C2692A]" />
            </div>

            <h3 className="font-semibold">No assigned jobs</h3>

            <p className="text-sm text-muted-foreground mt-1">
              Your assigned jobs will appear here.
            </p>
          </div>
        )}

        {!loading &&
          recentJobs.map((booking) => {
            const status = getStatus(booking.status);
            const StatusIcon = status.icon;
            const priority =
              priorityConfig[booking.priority] || priorityConfig.medium;

            return (
              <div
                key={booking.id}
                className="grid grid-cols-1 md:grid-cols-12 md:items-center gap-4 px-6 py-5 border-b border-border/60 hover:bg-accent/40 transition-all"
              >
                {/* BOOKING */}
                <div className="md:col-span-3">
                  <div className="text-sm font-semibold">
                    {booking.booking_code}
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(booking.created_at)}
                  </div>
                </div>

                {/* CUSTOMER */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <UserRound size={15} className="text-muted-foreground" />

                    <span className="text-sm truncate">
                      {booking.customer_name || "-"}
                    </span>
                  </div>
                </div>

                {/* VEHICLE */}
                <div className="md:col-span-3">
                  <div className="flex items-center gap-2">
                    <Car size={15} className="text-muted-foreground" />

                    <span className="text-sm truncate">
                      {booking.brand} {booking.model}
                    </span>
                  </div>

                  <div
                    className="mt-2 inline-flex px-2.5 py-1 rounded-lg border text-[11px] font-semibold uppercase"
                    style={{
                      background: priority.bg,
                      borderColor: priority.border,
                      color: priority.color,
                    }}
                  >
                    {priority.label} Priority
                  </div>
                </div>

                {/* STATUS */}
                <div className="md:col-span-2">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border"
                    style={{
                      background: status.bg,
                      borderColor: status.border,
                    }}
                  >
                    <StatusIcon
                      size={13}
                      color={status.color}
                      className={
                        booking.status === "in_progress" ? "animate-spin" : ""
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

                {/* ACTION */}
                <div className="md:col-span-2 flex md:justify-end">
                  <Link
                    href={`/mechanics/bookings/${booking.id}`}
                    className="w-9 h-9 rounded-lg border border-border hover:bg-accent transition flex items-center justify-center"
                  >
                    <Eye size={15} />
                  </Link>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
