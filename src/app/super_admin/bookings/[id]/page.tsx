"use client";

import Image from "next/image";
import Link from "next/link";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Car,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  MessageSquareText,
  ShieldAlert,
  Trash2,
  UserRound,
  Wrench,
} from "lucide-react";

import {
  bookingService,
  type Booking,
  type BookingStatus,
} from "@/services/booking.service";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const statusOptions: BookingStatus[] = [
  "pending",
  "accepted",
  "inspection",
  "in_progress",
  "completed",
  "cancelled",
];

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

const formatDate = (date?: string) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date?: string) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (time?: string) => {
  if (!time) return "-";

  return time.slice(0, 5);
};

const formatPrice = (price?: number | string | null) => {
  if (!price) return "-";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
};

const formatStatusLabel = (status: BookingStatus) => {
  return statusConfig[status]?.label || status;
};

const getBookingImageUrl = (
  image?: string | null,
  imageUrl?: string | null,
) => {
  if (imageUrl) return imageUrl;

  if (!image) return null;

  if (image.startsWith("http")) return image;

  if (image.startsWith("/uploads")) {
    return `${BACKEND_BASE_URL}${image}`;
  }

  return `${BACKEND_BASE_URL}/uploads/${image}`;
};

export default function SuperAdminBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const bookingId = params.id;

  const [booking, setBooking] = useState<Booking | null>(null);

  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadBookingDetail = async () => {
      if (!bookingId) {
        if (mounted) {
          setLoading(false);
        }

        return;
      }

      try {
        const response = await bookingService.getBookingById(bookingId);

        if (!mounted) return;

        setBooking(response.data);
      } catch (error) {
        console.error("Failed fetch booking detail:", error);

        if (!mounted) return;

        setBooking(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadBookingDetail();

    return () => {
      mounted = false;
    };
  }, [bookingId]);

  const status = booking
    ? statusConfig[booking.status] || statusConfig.pending
    : statusConfig.pending;

  const StatusIcon = status.icon;

  const priority = useMemo(() => {
    if (!booking) return priorityConfig.medium;

    return priorityConfig[booking.priority] || priorityConfig.medium;
  }, [booking]);

  const images = useMemo(() => {
    return booking?.images || [];
  }, [booking]);

  const handleUpdateStatus = async (statusValue: BookingStatus) => {
    if (!bookingId) return;

    try {
      setStatusLoading(true);

      await bookingService.updateBookingStatus(bookingId, statusValue);

      setBooking((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          status: statusValue,
        };
      });
    } catch (error) {
      console.error("Failed update booking status:", error);
      alert("Failed to update booking status");
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!bookingId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this booking?",
    );

    if (!confirmDelete) return;

    try {
      setDeleteLoading(true);

      await bookingService.deleteBooking(bookingId);

      router.push("/super_admin/bookings");
      router.refresh();
    } catch (error) {
      console.error("Failed delete booking:", error);
      alert("Failed to delete booking");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center rounded-3xl border border-border bg-card/40 backdrop-blur-xl">
        <Loader2 className="animate-spin text-[#C2692A]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="space-y-6">
        <Link
          href="/super_admin/bookings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to bookings
        </Link>

        <div className="flex h-72 items-center justify-center rounded-3xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">
            Booking detail not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/super_admin/bookings"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back to bookings
          </Link>

          <h1 className="text-3xl font-bold tracking-tight">Booking Detail</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor customer booking request and manage booking status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2"
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

          <button
            type="button"
            onClick={handleDeleteBooking}
            disabled={deleteLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 text-sm font-semibold text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleteLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        {/* MAIN CONTENT */}
        <div className="space-y-6">
          {/* BOOKING SUMMARY */}
          <section className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="border-b border-border p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Booking Code</p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {booking.booking_code}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Created {formatDateTime(booking.created_at)}
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#522C1430] bg-[#522C1415]">
                  <CalendarDays size={24} className="text-[#C2692A]" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                  <UserRound size={16} />
                  <span className="text-xs">Customer</span>
                </div>

                <p className="text-sm font-semibold">
                  {booking.customer_name || "-"}
                </p>

                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail size={14} />
                  {booking.customer_email || "-"}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                  <Wrench size={16} />
                  <span className="text-xs">Mechanic</span>
                </div>

                <p className="text-sm font-semibold">
                  {booking.mechanic_name || "Not assigned yet"}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  {booking.mechanic_id
                    ? `Mechanic ID: ${booking.mechanic_id}`
                    : "Waiting mechanic acceptance"}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                  <Car size={16} />
                  <span className="text-xs">Vehicle</span>
                </div>

                <p className="text-sm font-semibold">
                  {booking.brand} {booking.model}
                </p>

                <p className="mt-2 text-xs uppercase text-muted-foreground">
                  {booking.license_plate || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                  <CalendarDays size={16} />
                  <span className="text-xs">Preferred Schedule</span>
                </div>

                <p className="text-sm font-semibold">
                  {formatDate(booking.preferred_date)} at{" "}
                  {formatTime(booking.preferred_time)}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  Customer requested schedule
                </p>
              </div>
            </div>
          </section>

          {/* SERVICE + COMPLAINT */}
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#522C1430] bg-[#522C1415]">
                <Wrench size={23} className="text-[#C2692A]" />
              </div>

              <h2 className="text-lg font-bold">Service Information</h2>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">Service Name</p>

                  <p className="mt-1 text-sm font-semibold">
                    {booking.service_name || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Estimated Price
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {formatPrice(booking.price)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Priority</p>

                  <div
                    className="mt-2 inline-flex rounded-lg border px-3 py-1.5 text-xs font-semibold"
                    style={{
                      background: priority.bg,
                      borderColor: priority.border,
                      color: priority.color,
                    }}
                  >
                    {priority.label} Priority
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#522C1430] bg-[#522C1415]">
                <MessageSquareText size={23} className="text-[#C2692A]" />
              </div>

              <h2 className="text-lg font-bold">Customer Complaint</h2>

              <div className="mt-5 rounded-2xl border border-border bg-background p-4">
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {booking.complaint || "No complaint provided."}
                </p>
              </div>
            </div>
          </section>

          {/* IMAGES */}
          <section className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Booking Images</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Images uploaded by the customer when creating this booking.
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#522C1430] bg-[#522C1415]">
                <Car size={21} className="text-[#C2692A]" />
              </div>
            </div>

            {images.length === 0 ? (
              <div className="flex h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background text-center">
                <Car size={28} className="mb-3 text-muted-foreground" />

                <p className="text-sm font-semibold">No images uploaded</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Customer did not attach any vehicle photos.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {images.map((item) => {
                  const imageUrl = getBookingImageUrl(
                    item.image,
                    item.image_url,
                  );

                  if (!imageUrl) return null;

                  return (
                    <a
                      key={item.id}
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative h-56 overflow-hidden rounded-2xl border border-border bg-background"
                    >
                      <Image
                        src={imageUrl}
                        alt="Booking image"
                        fill
                        sizes="(max-width: 768px) 100vw, 360px"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                    </a>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-6">
          {/* STATUS */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#522C1430] bg-[#522C1415]">
              <StatusIcon
                size={23}
                color={status.color}
                className={
                  booking.status === "in_progress" ? "animate-spin" : ""
                }
              />
            </div>

            <h2 className="text-lg font-bold">Booking Status</h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Current Status</p>

                <div
                  className="mt-2 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5"
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

              <div>
                <p className="text-xs text-muted-foreground">Update Status</p>

                <select
                  value={booking.status}
                  onChange={(e) =>
                    handleUpdateStatus(e.target.value as BookingStatus)
                  }
                  disabled={statusLoading}
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-[#C2692A] disabled:opacity-60"
                >
                  {statusOptions.map((item) => (
                    <option key={item} value={item} className="bg-[#0A0A0A]">
                      {formatStatusLabel(item)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <ShieldAlert size={16} />
                  <span className="text-xs">Admin Note</span>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  Super admin can monitor and update booking status. Mechanic
                  assignment happens when mechanic accepts a pending booking.
                </p>
              </div>
            </div>
          </div>

          {/* BOOKING INFO */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#522C1430] bg-[#522C1415]">
              <CalendarDays size={23} className="text-[#C2692A]" />
            </div>

            <h2 className="text-lg font-bold">Booking Information</h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Code</p>

                <p className="mt-1 text-sm font-semibold">
                  {booking.booking_code}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Created At</p>

                <p className="mt-1 text-sm font-semibold">
                  {formatDateTime(booking.created_at)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Updated At</p>

                <p className="mt-1 text-sm font-semibold">
                  {formatDateTime(booking.updated_at)}
                </p>
              </div>
            </div>
          </div>

          {/* CUSTOMER */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#522C1430] bg-[#522C1415]">
              <UserRound size={23} className="text-[#C2692A]" />
            </div>

            <h2 className="text-lg font-bold">Customer</h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>

                <p className="mt-1 text-sm font-semibold">
                  {booking.customer_name || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Email</p>

                <p className="mt-1 break-all text-sm font-semibold">
                  {booking.customer_email || "-"}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
