"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";

import {
  AlertCircle,
  ArrowUpRight,
  CalendarCheck,
  Car,
  CheckCircle2,
  Clock3,
  Loader2,
  Ticket,
  TrendingUp,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";

import { bookingService, type Booking } from "@/services/booking.service";
import { serviceService, type Service } from "@/services/service.service";

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
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "accepted":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "inspection":
      return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    case "in_progress":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "completed":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-white/5 text-muted-foreground border-white/10";
  }
};

export default function SuperAdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] = useState(false);
  const [serviceError, setServiceError] = useState(false);

  const rawUser = useSyncExternalStore(
    subscribeUser,
    getUserSnapshot,
    getServerUserSnapshot,
  );

  const currentUser = useMemo(() => {
    return parseUser(rawUser);
  }, [rawUser]);

  const displayName = currentUser?.name || "Admin";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setBookingError(false);
        setServiceError(false);

        const [bookingResult, serviceResult] = await Promise.allSettled([
          bookingService.getAllBookings(),
          serviceService.getServices(),
        ]);

        if (bookingResult.status === "fulfilled") {
          setBookings(bookingResult.value.data || []);
        } else {
          console.error("Failed to fetch bookings:", bookingResult.reason);
          setBookings([]);
          setBookingError(true);
        }

        if (serviceResult.status === "fulfilled") {
          setServices(serviceResult.value.data || []);
        } else {
          console.error("Failed to fetch services:", serviceResult.reason);
          setServices([]);
          setServiceError(true);
        }
      } catch (error) {
        console.error("Failed to fetch super admin dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const totalCancelled = useMemo(() => {
    return bookings.filter((booking) => booking.status === "cancelled").length;
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

  const stats = [
    {
      title: "Total Bookings",
      value: bookings.length,
      description: bookingError
        ? "Booking API currently error"
        : "All customer requests",
      icon: CalendarCheck,
      href: "/super_admin/bookings",
      hasError: bookingError,
    },
    {
      title: "Pending Review",
      value: totalPending,
      description: "Waiting for admin action",
      icon: Clock3,
      href: "/super_admin/bookings",
      hasError: bookingError,
    },
    {
      title: "Active Progress",
      value: totalActive,
      description: "Accepted, inspection, or repair",
      icon: TrendingUp,
      href: "/super_admin/bookings",
      hasError: bookingError,
    },
    {
      title: "Available Services",
      value: services.length,
      description: serviceError
        ? "Service API currently error"
        : "Customer booking options",
      icon: Wrench,
      href: "/super_admin/services",
      hasError: serviceError,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center rounded-3xl border border-border bg-card/40 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="animate-spin" size={24} />

          <span className="text-sm font-medium">
            Loading super admin dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(bookingError || serviceError) && (
        <section className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 text-yellow-400" />

            <div>
              <h3 className="text-sm font-semibold text-yellow-300">
                Some dashboard data failed to load
              </h3>

              <p className="mt-1 text-sm leading-6 text-yellow-200/70">
                {bookingError && "Bookings API returned an error. "}
                {serviceError && "Services API returned an error. "}
                The dashboard is still available, but some numbers may show as
                zero.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              Revion Management System
            </p>

            <h1 className="max-w-2xl text-2xl font-bold leading-tight text-white md:text-3xl">
              Welcome back, {displayName}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage bookings, services, mechanics, customers, and support
              tickets from one dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/super_admin/services/create"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#522C14] px-5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#63351a]"
            >
              <Wrench size={17} />
              Add Service
            </Link>

            <Link
              href="/super_admin/bookings"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-white transition hover:bg-accent"
            >
              <CalendarCheck size={17} />
              View Bookings
            </Link>
          </div>
        </div>

        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#522C14]/20 blur-3xl" />
      </section>

      {/* STATS */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-card/70"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white shadow-lg shadow-[#522C14]/20">
                  <Icon size={21} />
                </div>

                <ArrowUpRight
                  size={19}
                  className="text-muted-foreground transition group-hover:text-white"
                />
              </div>

              <p className="text-sm text-muted-foreground">{item.title}</p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {item.value}
              </h2>

              <p
                className={`mt-2 text-sm ${
                  item.hasError ? "text-yellow-400/80" : "text-muted-foreground"
                }`}
              >
                {item.description}
              </p>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        {/* RECENT BOOKINGS */}
        <div className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Recent Bookings</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Latest customer service requests.
              </p>
            </div>

            <Link
              href="/super_admin/bookings"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#522C14] px-4 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#63351a]"
            >
              View All
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {bookingError ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-yellow-500/20 bg-yellow-500/5 text-center">
              <div className="mb-4 flex h-13 w-13 items-center justify-center rounded-xl bg-yellow-500/10">
                <AlertCircle size={24} className="text-yellow-400" />
              </div>

              <h3 className="text-lg font-bold text-white">
                Booking API Error
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Frontend successfully requested{" "}
                <span className="font-semibold text-yellow-300">
                  GET /bookings
                </span>
                , but backend returned status 500. Check your backend terminal
                for the real SQL/controller error.
              </p>
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
              <div className="mb-4 flex h-13 w-13 items-center justify-center rounded-xl bg-accent">
                <AlertCircle size={24} className="text-muted-foreground" />
              </div>

              <h3 className="text-lg font-bold text-white">No bookings yet</h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Customer booking data will appear here after a booking is
                created.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-196 text-left text-sm">
                <thead className="bg-accent/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-4 font-medium">Booking</th>
                    <th className="px-4 py-4 font-medium">Customer</th>
                    <th className="px-4 py-4 font-medium">Vehicle</th>
                    <th className="px-4 py-4 font-medium">Service</th>
                    <th className="px-4 py-4 font-medium">Schedule</th>
                    <th className="px-4 py-4 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-t border-border transition hover:bg-accent/40"
                    >
                      <td className="px-4 py-4">
                        <Link
                          href={`/super_admin/bookings/${booking.id}`}
                          className="font-semibold text-white hover:underline"
                        >
                          {booking.booking_code || `Booking #${booking.id}`}
                        </Link>

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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Quick Actions</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Common admin tasks.
                </p>
              </div>

              <UserCog size={22} className="text-muted-foreground" />
            </div>

            <div className="space-y-3">
              <Link
                href="/super_admin/services"
                className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-4 text-muted-foreground transition hover:bg-[#522C14] hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <Wrench size={18} />

                  <span className="text-sm font-semibold">Manage Services</span>
                </div>

                <ArrowUpRight size={16} />
              </Link>

              <Link
                href="/super_admin/bookings"
                className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-4 text-muted-foreground transition hover:bg-[#522C14] hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <CalendarCheck size={18} />

                  <span className="text-sm font-semibold">Manage Bookings</span>
                </div>

                <ArrowUpRight size={16} />
              </Link>

              <Link
                href="/super_admin/mechanics"
                className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-4 text-muted-foreground transition hover:bg-[#522C14] hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <UserCog size={18} />

                  <span className="text-sm font-semibold">
                    Manage Mechanics
                  </span>
                </div>

                <ArrowUpRight size={16} />
              </Link>

              <Link
                href="/super_admin/customers"
                className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-4 text-muted-foreground transition hover:bg-[#522C14] hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} />

                  <span className="text-sm font-semibold">View Customers</span>
                </div>

                <ArrowUpRight size={16} />
              </Link>

              <Link
                href="/super_admin/tickets"
                className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-4 text-muted-foreground transition hover:bg-[#522C14] hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <Ticket size={18} />

                  <span className="text-sm font-semibold">Support Tickets</span>
                </div>

                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white">
              <CheckCircle2 size={22} />
            </div>

            <h2 className="text-xl font-bold text-white">Today Summary</h2>

            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Pending Bookings</span>
                <span className="font-semibold text-white">{totalPending}</span>
              </div>

              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Active Progress</span>
                <span className="font-semibold text-white">{totalActive}</span>
              </div>

              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-semibold text-white">
                  {totalCompleted}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Cancelled</span>
                <span className="font-semibold text-white">
                  {totalCancelled}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
