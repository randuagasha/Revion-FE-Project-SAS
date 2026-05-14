"use client";

import Link from "next/link";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  Car,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  Search,
  UserRound,
  Wrench,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { bookingService } from "@/services/booking.service";

interface LoggedInUser {
  id?: number;
  name?: string;
  email?: string;
  role?: "customer" | "mechanic" | "super_admin";
}

const subscribeUser = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("user-updated", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("user-updated", callback);
  };
};

const getUserSnapshot = () => {
  if (typeof window === "undefined") return "";

  return window.localStorage.getItem("user") || "";
};

const getServerUserSnapshot = () => "";

const parseUser = (rawUser: string): LoggedInUser | null => {
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as LoggedInUser;
  } catch (error) {
    console.error("Failed to parse user:", error);
    return null;
  }
};

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
    color: "#22C55E",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.25)",
    icon: CheckCircle,
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

const chartColors = {
  pending: "#F59E0B",
  accepted: "#22C55E",
  inspection: "#3B82F6",
  in_progress: "#C2692A",
  completed: "#10B981",
  cancelled: "#EF4444",
  low: "#22C55E",
  medium: "#F59E0B",
  high: "#EF4444",
};

const compactNumber = (value: number) => {
  return new Intl.NumberFormat("id-ID").format(value);
};

export default function MechanicDashboardPage() {
  const [bookings, setBookings] = useState<MechanicBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const rawUser = useSyncExternalStore(
    subscribeUser,
    getUserSnapshot,
    getServerUserSnapshot,
  );

  const currentUser = useMemo(() => {
    return parseUser(rawUser);
  }, [rawUser]);

  const displayName = currentUser?.name || "Mechanic";

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const [incomingResult, completedResult] = await Promise.allSettled([
        bookingService.getMechanicIncomingBookings(),
        bookingService.getMechanicCompletedBookings(),
      ]);

      const incomingBookings =
        incomingResult.status === "fulfilled"
          ? incomingResult.value.data || []
          : [];

      const completedBookings =
        completedResult.status === "fulfilled"
          ? completedResult.value.data || []
          : [];

      const mergedBookings = [...incomingBookings, ...completedBookings];

      const uniqueBookings = Array.from(
        new Map(
          mergedBookings.map((booking) => {
            return [booking.id, booking];
          }),
        ).values(),
      ) as MechanicBooking[];

      setBookings(uniqueBookings);
    } catch (error) {
      console.error("Failed fetch mechanic dashboard:", error);
      setBookings([]);
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
    const pending = bookings.filter(
      (booking) => booking.status === "pending",
    ).length;

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

    const cancelled = bookings.filter(
      (booking) => booking.status === "cancelled",
    ).length;

    const active = accepted + inspection + inProgress;

    return {
      total: bookings.length,
      pending,
      active,
      accepted,
      inspection,
      inProgress,
      completed,
      cancelled,
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

  const activeBookings = useMemo(() => {
    return filteredBookings.filter((booking) =>
      ["accepted", "inspection", "in_progress"].includes(booking.status),
    );
  }, [filteredBookings]);

  const recentJobs = useMemo(() => {
    return [...filteredBookings]
      .filter((booking) =>
        ["pending", "accepted", "inspection", "in_progress"].includes(
          booking.status,
        ),
      )
      .sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      })
      .slice(0, 5);
  }, [filteredBookings]);

  const currentJob = useMemo(() => {
    return activeBookings.find(
      (booking) =>
        booking.status === "in_progress" ||
        booking.status === "inspection" ||
        booking.status === "accepted",
    );
  }, [activeBookings]);

  const statusChartData = useMemo(() => {
    return [
      {
        name: "Pending",
        value: stats.pending,
        color: chartColors.pending,
      },
      {
        name: "Accepted",
        value: stats.accepted,
        color: chartColors.accepted,
      },
      {
        name: "Inspection",
        value: stats.inspection,
        color: chartColors.inspection,
      },
      {
        name: "In Progress",
        value: stats.inProgress,
        color: chartColors.in_progress,
      },
      {
        name: "Completed",
        value: stats.completed,
        color: chartColors.completed,
      },
    ].filter((item) => item.value > 0);
  }, [stats]);

  const priorityChartData = useMemo(() => {
    const low = bookings.filter((booking) => booking.priority === "low").length;
    const medium = bookings.filter(
      (booking) => booking.priority === "medium",
    ).length;
    const high = bookings.filter(
      (booking) => booking.priority === "high",
    ).length;

    return [
      {
        name: "Low",
        value: low,
        color: chartColors.low,
      },
      {
        name: "Medium",
        value: medium,
        color: chartColors.medium,
      },
      {
        name: "High",
        value: high,
        color: chartColors.high,
      },
    ];
  }, [bookings]);

  const weeklyCompletedData = useMemo(() => {
    const days = [
      {
        key: 0,
        name: "Sun",
        value: 0,
      },
      {
        key: 1,
        name: "Mon",
        value: 0,
      },
      {
        key: 2,
        name: "Tue",
        value: 0,
      },
      {
        key: 3,
        name: "Wed",
        value: 0,
      },
      {
        key: 4,
        name: "Thu",
        value: 0,
      },
      {
        key: 5,
        name: "Fri",
        value: 0,
      },
      {
        key: 6,
        name: "Sat",
        value: 0,
      },
    ];

    const now = new Date();
    const startOfWeek = new Date(now);

    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);

    endOfWeek.setDate(startOfWeek.getDate() + 7);

    bookings
      .filter((booking) => booking.status === "completed")
      .forEach((booking) => {
        const completedDate = new Date(
          booking.updated_at || booking.created_at,
        );

        if (completedDate >= startOfWeek && completedDate < endOfWeek) {
          const dayIndex = completedDate.getDay();

          days[dayIndex].value += 1;
        }
      });

    return days;
  }, [bookings]);

  const summaryCards = [
    {
      title: "Pending Requests",
      value: stats.pending,
      description: "Waiting to be accepted",
      icon: Clock,
      href: "/mechanics/bookings",
    },
    {
      title: "Active Jobs",
      value: stats.active,
      description: "Accepted, inspection, progress",
      icon: Activity,
      href: "/mechanics/bookings",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      description: "Currently being handled",
      icon: Loader2,
      href: "/mechanics/bookings",
    },
    {
      title: "Completed",
      value: stats.completed,
      description: "Finished repair jobs",
      icon: CheckCircle,
      href: "/mechanics/completed",
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
      <div className="mb-8 flex items-start justify-between gap-5">
        <div>
          <p className="mb-2 text-sm font-medium text-[#C2692A]">
            Mechanic Dashboard
          </p>

          <h1 className="text-3xl font-bold tracking-tight">
            Welcome Back, {displayName}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Track assigned jobs, monitor progress, and review your weekly repair
            performance.
          </p>
        </div>

        <Link
          href="/mechanics/bookings"
          className="hidden h-11 items-center gap-2 rounded-xl bg-[#522C14] px-5 text-sm font-medium text-white transition-all hover:bg-[#6B3818] md:flex"
        >
          View Assigned Jobs
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* SUMMARY CARDS */}
      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>

                  <h2 className="mt-2 text-3xl font-bold">
                    {loading ? "-" : compactNumber(card.value)}
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
            </Link>
          );
        })}
      </div>

      {/* CURRENT JOB + STATUS */}
      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        {/* CURRENT JOB */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-7">
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-[#C2692A]/10 blur-3xl" />

          <div className="relative z-10 flex items-start justify-between gap-6">
            <div className="w-full">
              <p className="text-sm text-muted-foreground">Current Job</p>

              {currentJob ? (
                <>
                  <h2 className="mt-2 text-2xl font-bold">
                    {currentJob.brand} {currentJob.model}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {currentJob.service_name}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {(() => {
                      const status = getStatus(currentJob.status);
                      const StatusIcon = status.icon;

                      return (
                        <div
                          className="inline-flex items-center gap-2 rounded-xl border px-3 py-1.5"
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

                  <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">Customer</p>

                      <p className="mt-1 truncate text-sm font-semibold">
                        {currentJob.customer_name || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">
                        License Plate
                      </p>

                      <p className="mt-1 text-sm font-semibold uppercase">
                        {currentJob.license_plate || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">Schedule</p>

                      <p className="mt-1 text-sm font-semibold">
                        {formatDate(currentJob.preferred_date)}{" "}
                        {formatTime(currentJob.preferred_time)}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="mt-2 text-2xl font-bold">No Active Job</h2>

                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                    You do not have active service jobs right now. Pending or
                    assigned jobs will appear here when available.
                  </p>
                </>
              )}
            </div>

            {currentJob && (
              <Link
                href={`/mechanics/bookings/${currentJob.id}`}
                className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-border bg-background/40 px-4 text-sm font-semibold text-white transition hover:bg-accent hover:text-white"
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

          <div className="mt-5 space-y-4">
            {(
              [
                "pending",
                "accepted",
                "inspection",
                "in_progress",
                "completed",
              ] as BookingStatus[]
            ).map((statusKey) => {
              const status = getStatus(statusKey);
              const StatusIcon = status.icon;

              const count =
                statusKey === "pending"
                  ? stats.pending
                  : statusKey === "accepted"
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
                      className="flex h-10 w-10 items-center justify-center rounded-xl border"
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

      {/* CHARTS */}
      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
        {/* STATUS DONUT */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Job Status Overview</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Distribution of your current and completed jobs.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex h-72 items-center justify-center">
              <Loader2 className="animate-spin text-[#C2692A]" />
            </div>
          ) : statusChartData.length === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#522C1430] bg-[#522C1415]">
                <Activity size={24} className="text-[#C2692A]" />
              </div>

              <h3 className="font-semibold">No chart data</h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Job status chart will appear after jobs are available.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-[260px_1fr] md:items-center">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={92}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusChartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>

                    <Tooltip
                      cursor={false}
                      contentStyle={{
                        background: "#111111",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "14px",
                        color: "#ffffff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {statusChartData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-2xl border border-border bg-background p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: item.color,
                        }}
                      />

                      <p className="text-sm font-medium">{item.name}</p>
                    </div>

                    <p className="text-sm font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* WEEKLY COMPLETED */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Weekly Completed Jobs</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Completed jobs counted by day this week.
              </p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyCompletedData}>
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(255,255,255,0.08)"
                />

                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#9CA3AF",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#9CA3AF",
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(255,255,255,0.04)",
                  }}
                  contentStyle={{
                    background: "#111111",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "14px",
                    color: "#ffffff",
                  }}
                />

                <Bar
                  dataKey="value"
                  fill="#522C14"
                  radius={[10, 10, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PRIORITY + RECENT JOBS */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        {/* PRIORITY */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-xl font-bold">Priority Breakdown</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Current job load by priority level.
          </p>

          <div className="mt-6 space-y-5">
            {priorityChartData.map((item) => {
              const total = Math.max(bookings.length, 1);
              const percentage = Math.round((item.value / total) * 100);

              return (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: item.color,
                        }}
                      />

                      <p className="text-sm font-medium">{item.name}</p>
                    </div>

                    <p className="text-sm font-semibold">{item.value}</p>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-background">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT JOBS */}
        <div>
          <div className="mb-5 flex items-center justify-between gap-5">
            <div>
              <h2 className="text-xl font-bold">Assigned Jobs</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Latest pending and assigned jobs.
              </p>
            </div>

            <Link
              href="/mechanics/bookings"
              className="flex items-center gap-1 text-sm text-[#C2692A] hover:underline"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* SEARCH */}
          <div className="mb-5 flex h-11 max-w-md items-center gap-3 rounded-xl border border-border bg-card px-4">
            <Search size={15} className="text-muted-foreground" />

            <input
              type="text"
              placeholder="Search assigned jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border-none bg-transparent text-sm outline-none"
            />
          </div>

          {/* TABLE */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="hidden grid-cols-12 border-b border-border px-6 py-4 text-[11px] uppercase tracking-[0.15em] text-muted-foreground md:grid">
              <div className="col-span-3">Booking</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-3">Vehicle</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {loading && (
              <div className="flex h-72 items-center justify-center">
                <Loader2 className="animate-spin text-[#C2692A]" />
              </div>
            )}

            {!loading && recentJobs.length === 0 && (
              <div className="flex h-72 flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#522C1430] bg-[#522C1415]">
                  <Wrench size={28} className="text-[#C2692A]" />
                </div>

                <h3 className="font-semibold">No assigned jobs</h3>

                <p className="mt-1 text-sm text-muted-foreground">
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
                    className="grid grid-cols-1 gap-4 border-b border-border/60 px-6 py-5 transition-all hover:bg-accent/40 md:grid-cols-12 md:items-center"
                  >
                    {/* BOOKING */}
                    <div className="md:col-span-3">
                      <div className="text-sm font-semibold">
                        {booking.booking_code}
                      </div>

                      <div className="mt-1 text-xs text-muted-foreground">
                        {formatDate(booking.created_at)}
                      </div>
                    </div>

                    {/* CUSTOMER */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2">
                        <UserRound
                          size={15}
                          className="text-muted-foreground"
                        />

                        <span className="truncate text-sm">
                          {booking.customer_name || "-"}
                        </span>
                      </div>
                    </div>

                    {/* VEHICLE */}
                    <div className="md:col-span-3">
                      <div className="flex items-center gap-2">
                        <Car size={15} className="text-muted-foreground" />

                        <span className="truncate text-sm">
                          {booking.brand} {booking.model}
                        </span>
                      </div>

                      <div
                        className="mt-2 inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-semibold uppercase"
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
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5"
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

                    {/* ACTION */}
                    <div className="flex md:col-span-2 md:justify-end">
                      <Link
                        href={`/mechanics/bookings/${booking.id}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border transition hover:bg-accent"
                      >
                        <Eye size={15} />
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
