"use client";

import { useEffect, useMemo, useState } from "react";

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
} from "lucide-react";

import { bookingService } from "@/services/booking.service";

type BookingStatus = "accepted" | "inspection" | "in_progress" | "completed";

interface Booking {
  id: number;
  booking_code: string;

  brand: string;
  model: string;

  service_name: string;

  mechanic_name: string;

  status: BookingStatus;

  created_at: string;
}

const statusConfig = {
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
};

const filters = ["All", "accepted", "inspection", "in_progress", "completed"];

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);

        const response = await bookingService.getMyBookings();

        setBookings(response.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        booking.booking_code.toLowerCase().includes(keyword) ||
        booking.brand.toLowerCase().includes(keyword) ||
        booking.model.toLowerCase().includes(keyword) ||
        booking.service_name.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "All" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>

          <p className="text-muted-foreground text-sm mt-1">
            Track your vehicle services in real-time
          </p>
        </div>

        <button className="h-11 px-5 rounded-xl bg-[#522C14] hover:bg-[#6B3818] transition-all text-white text-sm font-medium flex items-center gap-2">
          <Plus size={16} />
          New Booking
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-5 flex items-center gap-3 h-11 max-w-md rounded-xl border border-border bg-card px-4">
        <Search size={15} className="text-muted-foreground" />

        <input
          type="text"
          placeholder="Search bookings..."
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
            className={`px-4 h-9 rounded-lg border text-xs font-medium transition-all
            ${
              statusFilter === filter
                ? "border-[#522C14] bg-[#522C1415] text-[#C2692A]"
                : "border-border text-muted-foreground hover:bg-accent"
            }
            `}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        {/* TABLE HEADER */}
        <div className="grid grid-cols-12 px-6 py-4 border-b border-border text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
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
        {!loading && filteredBookings.length === 0 && (
          <div className="h-72 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No bookings found.</p>
          </div>
        )}

        {/* ROWS */}
        {!loading &&
          filteredBookings.map((booking) => {
            const status = statusConfig[booking.status];

            const StatusIcon = status.icon;

            return (
              <div
                key={booking.id}
                className="grid grid-cols-12 items-center px-6 py-5 border-b border-border/60 hover:bg-accent/40 transition-all"
              >
                {/* BOOKING */}
                <div className="col-span-3">
                  <div className="text-sm font-semibold">
                    {booking.booking_code}
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* VEHICLE */}
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <Car size={15} className="text-muted-foreground" />

                    <span className="text-sm">
                      {booking.brand} {booking.model}
                    </span>
                  </div>
                </div>

                {/* SERVICE */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <Wrench size={15} className="text-muted-foreground" />

                    <span className="text-sm">{booking.service_name}</span>
                  </div>
                </div>

                {/* STATUS */}
                <div className="col-span-2">
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
                <div className="col-span-2 flex justify-end">
                  <button className="w-9 h-9 rounded-lg border border-border hover:bg-accent transition flex items-center justify-center">
                    <Eye size={15} />
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
