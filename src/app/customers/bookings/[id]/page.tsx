"use client";

import Link from "next/link";
import Image from "next/image";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  AlertCircle,
  CalendarDays,
  Car,
  CheckCircle,
  Clock,
  ImageIcon,
  Loader2,
  UserRound,
  Wrench,
} from "lucide-react";

import {
  bookingService,
  BookingStatus,
} from "@/services/booking.service";

interface BookingImage {
  id: number;
  image: string;
  image_url?: string;
}

interface BookingDetail {
  id: number;
  booking_code: string;

  user_id: number;
  vehicle_id: number;
  service_id: number;
  mechanic_id?: number | null;

  preferred_date: string;
  preferred_time: string;

  complaint: string;
  priority: "low" | "medium" | "high";
  status: BookingStatus;

  customer_name?: string;
  customer_email?: string;

  brand: string;
  model: string;
  license_plate: string;

  service_name: string;
  price?: number | string | null;

  mechanic_name?: string | null;

  created_at: string;
  updated_at?: string;

  images?: BookingImage[];
}

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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

const timelineSteps: BookingStatus[] = [
  "pending",
  "accepted",
  "inspection",
  "in_progress",
  "completed",
];

export default function BookingDetailPage() {
  const params = useParams();

  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBookingDetail = async () => {
    try {
      setLoading(true);

      const response = await bookingService.getBookingById(bookingId);

      setBooking(response.data);
    } catch (error) {
      console.error("Failed fetch booking detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadBookingDetail = async () => {
      try {
        await fetchBookingDetail();
      } catch (error) {
        console.error("Failed to load booking detail:", error);
      }
    };

    if (bookingId) {
      void loadBookingDetail();
    }
  }, [bookingId]);

  const status = booking
    ? statusConfig[booking.status] || statusConfig.pending
    : statusConfig.pending;

  const priority = booking
    ? priorityConfig[booking.priority] || priorityConfig.medium
    : priorityConfig.medium;

  const activeStepIndex = useMemo(() => {
    if (!booking) return -1;

    if (booking.status === "cancelled") return -1;

    return timelineSteps.findIndex((step) => step === booking.status);
  }, [booking]);

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

  const formatCurrency = (value?: number | string | null) => {
    if (value === undefined || value === null) return "-";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  const getImageUrl = (image?: string | null, imageUrl?: string | null) => {
    if (imageUrl) return imageUrl;

    if (!image) return null;

    if (image.startsWith("http")) return image;

    if (image.startsWith("/uploads")) {
      return `${BACKEND_BASE_URL}${image}`;
    }

    return `${BACKEND_BASE_URL}/uploads/${image}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C2692A]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <Link
          href="/customers/bookings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft size={16} />
          Back to bookings
        </Link>

        <div className="h-72 mt-8 rounded-3xl border border-border bg-card flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Booking detail not found.
          </p>
        </div>
      </div>
    );
  }

  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-5 mb-8">
        <div>
          <Link
            href="/customers/bookings"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-4"
          >
            <ArrowLeft size={16} />
            Back to bookings
          </Link>

          <h1 className="text-3xl font-bold tracking-tight">
            Booking Detail
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            View your service booking information and current progress.
          </p>
        </div>

        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border"
          style={{
            background: status.bg,
            borderColor: status.border,
          }}
        >
          <StatusIcon
            size={16}
            color={status.color}
            className={booking.status === "in_progress" ? "animate-spin" : ""}
          />

          <span
            className="text-sm font-semibold"
            style={{
              color: status.color,
            }}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        {/* LEFT */}
        <div className="space-y-6">
          {/* SUMMARY CARD */}
          <div className="rounded-3xl border border-border bg-card p-7 overflow-hidden relative">
            <div className="absolute right-0 top-0 w-56 h-56 bg-[#C2692A]/10 blur-3xl rounded-full" />

            <div className="relative z-10">
              <p className="text-sm text-muted-foreground">Booking Code</p>

              <h2 className="text-3xl font-bold mt-2">
                {booking.booking_code}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-7">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs text-muted-foreground">
                    Preferred Date
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <CalendarDays size={16} className="text-[#C2692A]" />

                    <p className="text-sm font-semibold">
                      {formatDate(booking.preferred_date)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs text-muted-foreground">
                    Preferred Time
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <Clock size={16} className="text-[#C2692A]" />

                    <p className="text-sm font-semibold">
                      {formatTime(booking.preferred_time)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs text-muted-foreground">Priority</p>

                  <div
                    className="inline-flex items-center px-3 py-1 mt-2 rounded-lg border text-xs font-semibold"
                    style={{
                      background: priority.bg,
                      borderColor: priority.border,
                      color: priority.color,
                    }}
                  >
                    {priority.label}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="rounded-3xl border border-border bg-card p-7">
            <div className="flex items-center justify-between gap-4 mb-7">
              <div>
                <h2 className="text-xl font-bold">Service Progress</h2>

                <p className="text-sm text-muted-foreground mt-1">
                  Current service status timeline.
                </p>
              </div>
            </div>

            {booking.status === "cancelled" ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-500" />

                  <div>
                    <p className="font-semibold text-red-500">
                      Booking Cancelled
                    </p>

                    <p className="text-sm text-muted-foreground mt-1">
                      This booking has been cancelled.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {timelineSteps.map((step, index) => {
                  const stepStatus = statusConfig[step];
                  const StepIcon = stepStatus.icon;

                  const isCompleted = index < activeStepIndex;
                  const isActive = index === activeStepIndex;

                  return (
                    <div key={step} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${
                            isCompleted || isActive
                              ? "bg-[#522C1415] border-[#522C1430]"
                              : "bg-background border-border"
                          }`}
                        >
                          <StepIcon
                            size={18}
                            className={
                              step === "in_progress" && isActive
                                ? "animate-spin"
                                : ""
                            }
                            color={
                              isCompleted || isActive
                                ? "#C2692A"
                                : "hsl(var(--muted-foreground))"
                            }
                          />
                        </div>

                        {index !== timelineSteps.length - 1 && (
                          <div
                            className={`w-px h-10 ${
                              isCompleted
                                ? "bg-[#C2692A]"
                                : "bg-border"
                            }`}
                          />
                        )}
                      </div>

                      <div className="pt-2">
                        <p
                          className={`text-sm font-semibold ${
                            isActive
                              ? "text-[#C2692A]"
                              : isCompleted
                                ? "text-foreground"
                                : "text-muted-foreground"
                          }`}
                        >
                          {stepStatus.label}
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          {isActive
                            ? "Current progress"
                            : isCompleted
                              ? "Completed step"
                              : "Waiting for update"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* COMPLAINT */}
          <div className="rounded-3xl border border-border bg-card p-7">
            <h2 className="text-xl font-bold">Complaint</h2>

            <p className="text-sm text-muted-foreground mt-1">
              Problem description submitted by customer.
            </p>

            <div className="mt-5 rounded-2xl border border-border bg-background p-5">
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {booking.complaint || "-"}
              </p>
            </div>
          </div>

          {/* IMAGES */}
          <div className="rounded-3xl border border-border bg-card p-7">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-bold">Damage Images</h2>

                <p className="text-sm text-muted-foreground mt-1">
                  Images uploaded when creating this booking.
                </p>
              </div>
            </div>

            {booking.images && booking.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {booking.images.map((image) => {
                  const imageUrl = getImageUrl(image.image, image.image_url);

                  return (
                    <div
                      key={image.id}
                      className="relative h-48 rounded-2xl overflow-hidden border border-border bg-background"
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt="Booking damage"
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 rounded-2xl border border-dashed border-border bg-background flex flex-col items-center justify-center">
                <ImageIcon size={28} className="text-muted-foreground" />

                <p className="text-sm text-muted-foreground mt-2">
                  No images uploaded.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          {/* VEHICLE */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="w-12 h-12 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center mb-5">
              <Car size={23} className="text-[#C2692A]" />
            </div>

            <h2 className="text-lg font-bold">Vehicle</h2>

            <div className="space-y-4 mt-5">
              <div>
                <p className="text-xs text-muted-foreground">Car</p>
                <p className="text-sm font-semibold mt-1">
                  {booking.brand} {booking.model}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  License Plate
                </p>
                <p className="text-sm font-semibold mt-1 uppercase">
                  {booking.license_plate}
                </p>
              </div>
            </div>
          </div>

          {/* SERVICE */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="w-12 h-12 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center mb-5">
              <Wrench size={23} className="text-[#C2692A]" />
            </div>

            <h2 className="text-lg font-bold">Service</h2>

            <div className="space-y-4 mt-5">
              <div>
                <p className="text-xs text-muted-foreground">Service Type</p>
                <p className="text-sm font-semibold mt-1">
                  {booking.service_name}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Estimated Price
                </p>
                <p className="text-sm font-semibold mt-1">
                  {formatCurrency(booking.price)}
                </p>
              </div>
            </div>
          </div>

          {/* MECHANIC */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="w-12 h-12 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center mb-5">
              <UserRound size={23} className="text-[#C2692A]" />
            </div>

            <h2 className="text-lg font-bold">Assigned Mechanic</h2>

            <div className="space-y-4 mt-5">
              <div>
                <p className="text-xs text-muted-foreground">Mechanic</p>
                <p className="text-sm font-semibold mt-1">
                  {booking.mechanic_name || "Not assigned yet"}
                </p>
              </div>
            </div>
          </div>

          {/* CUSTOMER */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold">Customer Info</h2>

            <div className="space-y-4 mt-5">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-semibold mt-1">
                  {booking.customer_name || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-semibold mt-1">
                  {booking.customer_email || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Created At</p>
                <p className="text-sm font-semibold mt-1">
                  {formatDate(booking.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}