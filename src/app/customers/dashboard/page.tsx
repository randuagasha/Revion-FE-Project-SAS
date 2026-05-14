"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import {
  Search,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Car,
  Wrench,
  CalendarDays,
  Activity,
  ArrowRight,
  BarChart3,
  PieChart,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
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
  | "accepted"
  | "inspection"
  | "in_progress"
  | "completed"
  | "pending"
  | "cancelled"
  | "rejected";

interface Booking {
  id: number;
  booking_code: string;

  brand: string;
  model: string;

  service_name: string;
  mechanic_name?: string | null;

  status: BookingStatus;

  created_at: string;
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

  rejected: {
    label: "Rejected",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.25)",
    icon: AlertCircle,
  },
};

const filters = [
  "All",
  "pending",
  "accepted",
  "inspection",
  "in_progress",
  "completed",
];

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const rawUser = useSyncExternalStore(
    subscribeUser,
    getUserSnapshot,
    getServerUserSnapshot,
  );

  const currentUser = useMemo(() => {
    return parseUser(rawUser);
  }, [rawUser]);

  const displayName = currentUser?.name || "Customer";

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const response = await bookingService.getMyBookings();

      setBookings(response.data || []);
    } catch (err) {
      console.error("Failed fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadBookings = async () => {
      try {
        await fetchBookings();
      } catch (error) {
        console.error("Failed to load bookings:", error);
      }
    };

    void loadBookings();
  }, []);

  const stats = useMemo(() => {
    const total = bookings.length;

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

    const active = pending + accepted + inspection + inProgress;

    return {
      total,
      active,
      pending,
      accepted,
      inspection,
      inProgress,
      completed,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        (booking.booking_code || "").toLowerCase().includes(keyword) ||
        (booking.brand || "").toLowerCase().includes(keyword) ||
        (booking.model || "").toLowerCase().includes(keyword) ||
        (booking.service_name || "").toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "All" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const recentBookings = filteredBookings.slice(0, 5);

  const activeBooking = bookings.find(
    (booking) =>
      booking.status === "in_progress" ||
      booking.status === "inspection" ||
      booking.status === "accepted" ||
      booking.status === "pending",
  );

  const bookingTrendData = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const monthlyData = monthNames.map((month) => ({
      month,
      bookings: 0,
      completed: 0,
    }));

    bookings.forEach((booking) => {
      if (!booking.created_at) return;

      const date = new Date(booking.created_at);

      if (Number.isNaN(date.getTime())) return;

      if (date.getFullYear() !== currentYear) return;

      const monthIndex = date.getMonth();

      monthlyData[monthIndex].bookings += 1;

      if (booking.status === "completed") {
        monthlyData[monthIndex].completed += 1;
      }
    });

    return monthlyData;
  }, [bookings]);

  const statusChartData = useMemo(() => {
    const statusKeys: BookingStatus[] = [
      "pending",
      "accepted",
      "inspection",
      "in_progress",
      "completed",
    ];

    return statusKeys
      .map((status) => ({
        name: statusConfig[status].label,
        value: bookings.filter((booking) => booking.status === status).length,
        color: statusConfig[status].color,
      }))
      .filter((item) => item.value > 0);
  }, [bookings]);

  const summaryCards = [
    {
      title: "Total Bookings",
      value: stats.total,
      description: "All service requests",
      icon: CalendarDays,
    },
    {
      title: "Active Bookings",
      value: stats.active,
      description: "Pending and ongoing services",
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
      description: "Finished services",
      icon: CheckCircle,
    },
  ];

  const getStatus = (status: BookingStatus) => {
    return statusConfig[status] || statusConfig.pending;
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-5 mb-8">
        <div>
          <p className="text-sm text-[#C2692A] font-medium mb-2">
            Customer Dashboard
          </p>

          <h1 className="text-3xl font-bold tracking-tight">Welcome Back, {displayName}</h1>

          <p className="text-muted-foreground text-sm mt-1">
            Track your vehicle services and recent booking activity.
          </p>
        </div>

        <Link
          href="/customers/bookings"
          className="h-11 px-5 rounded-xl bg-[#522C14] hover:bg-[#6B3818] transition-all text-white text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} />
          New Booking
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

      {/* CURRENT SERVICE + STATUS BREAKDOWN */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 mb-8">
        {/* ACTIVE BOOKING CARD */}
        <div className="rounded-3xl border border-border bg-card p-7 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-52 h-52 bg-[#C2692A]/10 blur-3xl rounded-full" />

          <div className="relative z-10 flex items-start justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Current Service</p>

              {activeBooking ? (
                <>
                  <h2 className="text-2xl font-bold mt-2">
                    {activeBooking.brand} {activeBooking.model}
                  </h2>

                  <p className="text-sm text-muted-foreground mt-2">
                    {activeBooking.service_name}
                  </p>

                  <div className="mt-5 flex items-center gap-3 flex-wrap">
                    {(() => {
                      const status = getStatus(activeBooking.status);
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
                              activeBooking.status === "in_progress"
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
                      {activeBooking.booking_code}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mt-2">No Active Service</h2>

                  <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                    You do not have any active vehicle service right now. Create
                    a new booking when your vehicle needs maintenance.
                  </p>
                </>
              )}
            </div>

            <Link
              href="/customers/bookings"
              className="hidden md:flex h-11 px-4 rounded-xl border border-border hover:bg-accent transition items-center gap-2 text-sm"
            >
              View Bookings
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* STATUS BREAKDOWN */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <h3 className="font-semibold">Status Breakdown</h3>

          <div className="space-y-4 mt-5">
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
                        {count} booking
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
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 mb-8">
        {/* BOOKING TREND */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-[#C2692A]" />
                <h3 className="font-semibold">Booking Activity</h3>
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                Monthly booking and completed service trend.
              </p>
            </div>

            <span className="text-xs text-muted-foreground">
              {new Date().getFullYear()}
            </span>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={bookingTrendData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C2692A" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#C2692A" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient
                    id="completedFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 12,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 12,
                    fill: "hsl(var(--muted-foreground))",
                  }}
                />

                <Tooltip
                  cursor={{
                    stroke: "#C2692A",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
                    boxShadow: "0 20px 45px rgba(0,0,0,0.15)",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="bookings"
                  name="Bookings"
                  stroke="#C2692A"
                  strokeWidth={3}
                  fill="url(#bookingsFill)"
                  activeDot={{
                    r: 5,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#22C55E"
                  strokeWidth={3}
                  fill="url(#completedFill)"
                  activeDot={{
                    r: 5,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* STATUS PIE */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <PieChart size={18} className="text-[#C2692A]" />
            <h3 className="font-semibold">Status Distribution</h3>
          </div>

          <p className="text-sm text-muted-foreground">
            Booking status composition.
          </p>

          <div className="h-72 mt-5">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={statusChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={4}
                  >
                    {statusChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      color: "hsl(var(--foreground))",
                      boxShadow: "0 20px 45px rgba(0,0,0,0.15)",
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full rounded-2xl border border-dashed border-border flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  No status data yet.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3 mt-2">
            {statusChartData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: item.color,
                    }}
                  />

                  <span className="text-muted-foreground">{item.name}</span>
                </div>

                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT BOOKINGS HEADER */}
      <div className="flex items-center justify-between gap-5 mb-5">
        <div>
          <h2 className="text-xl font-bold">Recent Bookings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Showing latest service booking activities.
          </p>
        </div>

        <Link
          href="/customers/bookings"
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
          placeholder="Search recent bookings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none border-none flex-1 text-sm"
        />
      </div>

      {/* FILTER */}
      <div className="flex gap-2 mb-6 flex-wrap">
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

      {/* TABLE */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        {/* TABLE HEADER */}
        <div className="hidden md:grid grid-cols-12 px-6 py-4 border-b border-border text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
          <div className="col-span-3">Booking</div>
          <div className="col-span-3">Vehicle</div>
          <div className="col-span-2">Service</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="h-72 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#C2692A]" />
          </div>
        )}

        {/* EMPTY */}
        {!loading && recentBookings.length === 0 && (
          <div className="h-72 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No bookings found.</p>
          </div>
        )}

        {/* ROWS */}
        {!loading &&
          recentBookings.map((booking) => {
            const status = getStatus(booking.status);
            const StatusIcon = status.icon;

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
                    {new Date(booking.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* VEHICLE */}
                <div className="md:col-span-3">
                  <div className="flex items-center gap-2">
                    <Car size={15} className="text-muted-foreground" />

                    <span className="text-sm">
                      {booking.brand} {booking.model}
                    </span>
                  </div>
                </div>

                {/* SERVICE */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <Wrench size={15} className="text-muted-foreground" />

                    <span className="text-sm">{booking.service_name}</span>
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
                    href={`/customers/bookings/${booking.id}`}
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
