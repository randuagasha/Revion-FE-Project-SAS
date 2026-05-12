"use client";

import Link from "next/link";

import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
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

const filters = ["All", "accepted", "inspection", "in_progress"];

export default function MechanicBookingsPage() {
  const [bookings, setBookings] = useState<MechanicBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

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

  useEffect(() => {
    const loadBookings = async () => {
      try {
        await fetchBookings();
      } catch (error) {
        console.error("Failed to load assigned jobs:", error);
      }
    };

    void loadBookings();
  }, []);

  const stats = useMemo(() => {
    const activeJobs = bookings.filter((booking) =>
      ["accepted", "inspection", "in_progress"].includes(booking.status),
    );

    const accepted = activeJobs.filter(
      (booking) => booking.status === "accepted",
    ).length;

    const inspection = activeJobs.filter(
      (booking) => booking.status === "inspection",
    ).length;

    const inProgress = activeJobs.filter(
      (booking) => booking.status === "in_progress",
    ).length;

    return {
      total: activeJobs.length,
      accepted,
      inspection,
      inProgress,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const keyword = search.toLowerCase();

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

      const isActiveJob = ["accepted", "inspection", "in_progress"].includes(
        booking.status,
      );

      return matchesSearch && matchesStatus && isActiveJob;
    });
  }, [bookings, search, statusFilter]);

  const summaryCards = [
    {
      title: "Active Jobs",
      value: stats.total,
      description: "Jobs currently assigned",
      icon: Wrench,
    },
    {
      title: "Accepted",
      value: stats.accepted,
      description: "Waiting for inspection",
      icon: Clock,
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

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-5 mb-8">
        <div>
          <p className="text-sm text-[#C2692A] font-medium mb-2">
            Mechanic Workspace
          </p>

          <h1 className="text-3xl font-bold tracking-tight">Assigned Jobs</h1>

          <p className="text-muted-foreground text-sm mt-1">
            Manage assigned vehicle service jobs and continue progress updates.
          </p>
        </div>
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

      {/* SEARCH + FILTER */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 h-11 w-full xl:max-w-md rounded-xl border border-border bg-card px-4">
          <Search size={15} className="text-muted-foreground" />

          <input
            type="text"
            placeholder="Search booking, customer, vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none border-none flex-1 text-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 h-9 rounded-lg border text-xs font-medium transition-all capitalize ${
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
        <div className="h-72 rounded-3xl border border-border bg-card flex items-center justify-center">
          <Loader2 className="animate-spin text-[#C2692A]" />
        </div>
      )}

      {/* EMPTY */}
      {!loading && filteredBookings.length === 0 && (
        <div className="h-72 rounded-3xl border border-border bg-card flex flex-col items-center justify-center text-center px-5">
          <div className="w-16 h-16 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center mb-4">
            <Wrench size={28} className="text-[#C2692A]" />
          </div>

          <h2 className="font-semibold">No assigned jobs found</h2>

          <p className="text-sm text-muted-foreground mt-1">
            Jobs assigned to you will appear here.
          </p>
        </div>
      )}

      {/* JOB CARDS */}
      {!loading && filteredBookings.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredBookings.map((booking) => {
            const status = getStatus(booking.status);
            const StatusIcon = status.icon;

            const priority =
              priorityConfig[booking.priority] || priorityConfig.medium;

            return (
              <div
                key={booking.id}
                className="rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
              >
                {/* TOP */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold">
                        {booking.booking_code}
                      </h2>

                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border"
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

                    <p className="text-sm text-muted-foreground mt-1">
                      Created at {formatDate(booking.created_at)}
                    </p>
                  </div>

                  <Link
                    href={`/mechanics/bookings/${booking.id}`}
                    className="w-10 h-10 rounded-xl border border-border hover:bg-accent transition flex items-center justify-center shrink-0"
                  >
                    <Eye size={16} />
                  </Link>
                </div>

                {/* INFO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Customer</p>

                    <div className="flex items-center gap-2 mt-2">
                      <UserRound size={15} className="text-[#C2692A]" />

                      <p className="text-sm font-semibold truncate">
                        {booking.customer_name || "-"}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {booking.customer_email || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Vehicle</p>

                    <div className="flex items-center gap-2 mt-2">
                      <Car size={15} className="text-[#C2692A]" />

                      <p className="text-sm font-semibold truncate">
                        {booking.brand} {booking.model}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1 uppercase">
                      {booking.license_plate || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Service</p>

                    <div className="flex items-center gap-2 mt-2">
                      <Wrench size={15} className="text-[#C2692A]" />

                      <p className="text-sm font-semibold truncate">
                        {booking.service_name}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Schedule</p>

                    <div className="flex items-center gap-2 mt-2">
                      <CalendarDays size={15} className="text-[#C2692A]" />

                      <p className="text-sm font-semibold truncate">
                        {formatDate(booking.preferred_date)} at{" "}
                        {formatTime(booking.preferred_time)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* BOTTOM */}
                <div className="flex items-center justify-between gap-3 mt-5">
                  <div
                    className="inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-semibold"
                    style={{
                      background: priority.bg,
                      borderColor: priority.border,
                      color: priority.color,
                    }}
                  >
                    {priority.label} Priority
                  </div>

                  <Link
                    href={`/mechanics/bookings/${booking.id}`}
                    className="h-10 px-4 rounded-xl bg-[#522C14] hover:bg-[#6B3818] text-white text-sm font-medium flex items-center gap-2 transition"
                  >
                    Open Job
                    <Eye size={15} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
