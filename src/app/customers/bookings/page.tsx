"use client";

import Link from "next/link";
import Image from "next/image";

import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  Loader2,
  Eye,
  X,
  Save,
  Car,
  Wrench,
  Clock,
  CalendarDays,
  AlertCircle,
  CheckCircle,
  Upload,
  ImagePlus,
  Trash2,
  ChevronDown,
} from "lucide-react";

import {
  bookingService,
  Booking,
  BookingStatus,
} from "@/services/booking.service";

import { vehicleService } from "@/services/vehicle.service";
import { serviceService, Service } from "@/services/service.service";

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: string;
  license_plate: string;
  image?: string | null;
}

interface BookingForm {
  vehicle_id: string;
  service_id: string;
  preferred_date: string;
  preferred_time: string;
  complaint: string;
  priority: "low" | "medium" | "high";
  images: File[];
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

const filters = [
  "All",
  "pending",
  "accepted",
  "inspection",
  "in_progress",
  "completed",
  "cancelled",
];

const fieldClassName =
  "w-full h-12 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[#C2692A] transition";

const selectClassName = `${fieldClassName} appearance-none pr-12 cursor-pointer`;

const dateTimeClassName = `${fieldClassName} pr-12 cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer`;

const getTodayDate = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getCurrentTime = () => {
  const date = new Date();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

const getInitialForm = (): BookingForm => ({
  vehicle_id: "",
  service_id: "",
  preferred_date: getTodayDate(),
  preferred_time: getCurrentTime(),
  complaint: "",
  priority: "medium",
  images: [],
});

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [previews, setPreviews] = useState<string[]>([]);

  const [form, setForm] = useState<BookingForm>(getInitialForm);

  const selectedVehicle = vehicles.find(
    (vehicle) => String(vehicle.id) === form.vehicle_id,
  );

  const selectedService = services.find(
    (service) => String(service.id) === form.service_id,
  );

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const response = await bookingService.getMyBookings();

      setBookings(response.data || []);
    } catch (error) {
      console.error("Failed fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModalData = async () => {
    try {
      setModalLoading(true);

      const [vehicleResponse, serviceResponse] = await Promise.all([
        vehicleService.getMyVehicles(),
        serviceService.getServices(),
      ]);

      setVehicles(vehicleResponse.data || []);
      setServices(serviceResponse.data || []);
    } catch (error) {
      console.error("Failed fetch modal data:", error);
    } finally {
      setModalLoading(false);
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

  const openModal = () => {
    setForm(getInitialForm());
    setPreviews([]);
    setShowModal(true);

    const loadModalData = async () => {
      try {
        await fetchModalData();
      } catch (error) {
        console.error("Failed to load modal data:", error);
      }
    };

    void loadModalData();
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(getInitialForm());
    setPreviews([]);
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        (booking.booking_code || "").toLowerCase().includes(keyword) ||
        (booking.brand || "").toLowerCase().includes(keyword) ||
        (booking.model || "").toLowerCase().includes(keyword) ||
        (booking.service_name || "").toLowerCase().includes(keyword) ||
        (booking.mechanic_name || "").toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "All" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const existingCount = form.images.length;
    const availableSlots = 5 - existingCount;

    if (availableSlots <= 0) {
      alert("Maximum 5 images allowed");
      return;
    }

    const selectedFiles = files.slice(0, availableSlots);

    for (const file of selectedFiles) {
      if (!file.type.startsWith("image/")) {
        alert("All files must be images");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Each image max size is 5MB");
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...selectedFiles],
    }));

    setPreviews((prev) => [
      ...prev,
      ...selectedFiles.map((file) => URL.createObjectURL(file)),
    ]);

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIndex) => imageIndex !== index),
    }));

    setPreviews((prev) =>
      prev.filter((_, previewIndex) => previewIndex !== index),
    );
  };

  const handleCreateBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      const formData = new FormData();

      formData.append("vehicle_id", form.vehicle_id);
      formData.append("service_id", form.service_id);
      formData.append("preferred_date", form.preferred_date);
      formData.append("preferred_time", form.preferred_time);
      formData.append("complaint", form.complaint);
      formData.append("priority", form.priority);

      form.images.forEach((image) => {
        formData.append("images", image);
      });

      await bookingService.createBooking(formData);

      closeModal();

      await fetchBookings();
    } catch (error) {
      console.error("Create booking failed:", error);
      alert("Failed to create booking. Check backend terminal for details.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
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

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>

          <p className="text-muted-foreground text-sm mt-1">
            Manage your vehicle service bookings and track their progress.
          </p>
        </div>

        <button
          onClick={openModal}
          className="h-11 px-5 rounded-xl bg-[#522C14] hover:bg-[#6B3818] transition-all text-white text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} />
          New Booking
        </button>
      </div>

      {/* TOP BAR */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        {/* SEARCH */}
        <div className="flex items-center gap-3 h-11 w-full xl:max-w-md rounded-xl border border-border bg-card px-4">
          <Search size={15} className="text-muted-foreground" />

          <input
            type="text"
            placeholder="Search booking, vehicle, service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none border-none flex-1 text-sm"
          />
        </div>

        {/* FILTER */}
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
            <CalendarDays size={28} className="text-[#C2692A]" />
          </div>

          <h2 className="font-semibold">No bookings found</h2>

          <p className="text-sm text-muted-foreground mt-1">
            Create your first vehicle service booking.
          </p>
        </div>
      )}

      {/* BOOKING GRID */}
      {!loading && filteredBookings.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredBookings.map((booking) => {
            const status = statusConfig[booking.status] || statusConfig.pending;
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
                    href={`/customers/bookings/${booking.id}`}
                    className="w-10 h-10 rounded-xl border border-border hover:bg-accent transition flex items-center justify-center shrink-0"
                  >
                    <Eye size={16} />
                  </Link>
                </div>

                {/* INFO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Vehicle</p>

                    <div className="flex items-center gap-2 mt-2">
                      <Car size={15} className="text-[#C2692A]" />

                      <p className="text-sm font-semibold truncate">
                        {booking.brand} {booking.model}
                      </p>
                    </div>
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
                    <p className="text-xs text-muted-foreground">
                      Preferred Schedule
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <CalendarDays size={15} className="text-[#C2692A]" />

                      <p className="text-sm font-semibold truncate">
                        {formatDate(booking.preferred_date)} at{" "}
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

                {/* MECHANIC */}
                <div className="mt-5 rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs text-muted-foreground">Mechanic</p>

                  <p className="text-sm font-semibold mt-1">
                    {booking.mechanic_name || "Not assigned yet"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-start justify-center px-5 py-12">
            <div className="w-full max-w-3xl rounded-3xl border border-border bg-card p-7">
              {/* MODAL HEADER */}
              <div className="sticky top-0 z-20 -mx-7 -mt-7 mb-6 px-7 py-5 rounded-t-3xl border-b border-border bg-card/95 backdrop-blur flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">New Booking</h2>

                  <p className="text-sm text-muted-foreground mt-1">
                    Create a new vehicle service booking.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="w-10 h-10 rounded-xl border border-border hover:bg-accent transition flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>

              {modalLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#C2692A]" />
                </div>
              ) : (
                <form onSubmit={handleCreateBooking} className="space-y-5">
                  {/* VEHICLE */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Vehicle
                    </label>

                    <div className="relative">
                      <select
                        value={form.vehicle_id}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            vehicle_id: e.target.value,
                          }))
                        }
                        required
                        className={selectClassName}
                      >
                        <option value="">Select vehicle</option>

                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.brand} {vehicle.model} -{" "}
                            {vehicle.license_plate}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                    </div>

                    {vehicles.length === 0 && (
                      <p className="text-xs text-red-500 mt-2">
                        You need to add a vehicle first.
                      </p>
                    )}
                  </div>

                  {/* SERVICE */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Service
                    </label>

                    <div className="relative">
                      <select
                        value={form.service_id}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            service_id: e.target.value,
                          }))
                        }
                        required
                        className={selectClassName}
                      >
                        <option value="">Select service</option>

                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {formatCurrency(service.price)}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                    </div>

                    {services.length === 0 && (
                      <p className="text-xs text-red-500 mt-2">
                        No services available. Ask admin to add service data.
                      </p>
                    )}
                  </div>

                  {/* SELECTED PREVIEW */}
                  {(selectedVehicle || selectedService) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-border bg-background p-4">
                        <p className="text-xs text-muted-foreground">
                          Selected Vehicle
                        </p>

                        <p className="text-sm font-semibold mt-1">
                          {selectedVehicle
                            ? `${selectedVehicle.brand} ${selectedVehicle.model}`
                            : "-"}
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedVehicle?.license_plate || ""}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border bg-background p-4">
                        <p className="text-xs text-muted-foreground">
                          Selected Service
                        </p>

                        <p className="text-sm font-semibold mt-1">
                          {selectedService?.name || "-"}
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedService
                            ? `${formatCurrency(selectedService.price)} • ${
                                selectedService.estimated_duration || "-"
                              }`
                            : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* DATE + TIME */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Preferred Date
                      </label>

                      <div className="relative">
                        <input
                          type="date"
                          value={form.preferred_date}
                          min={getTodayDate()}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              preferred_date: e.target.value,
                            }))
                          }
                          required
                          className={dateTimeClassName}
                        />

                        <CalendarDays
                          size={18}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Preferred Time
                      </label>

                      <div className="relative">
                        <input
                          type="time"
                          value={form.preferred_time}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              preferred_time: e.target.value,
                            }))
                          }
                          required
                          className={dateTimeClassName}
                        />

                        <Clock
                          size={18}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PRIORITY */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Priority
                    </label>

                    <div className="relative">
                      <select
                        value={form.priority}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            priority: e.target.value as
                              | "low"
                              | "medium"
                              | "high",
                          }))
                        }
                        className={selectClassName}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>

                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                      />
                    </div>
                  </div>

                  {/* COMPLAINT */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Complaint
                    </label>

                    <textarea
                      value={form.complaint}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          complaint: e.target.value,
                        }))
                      }
                      placeholder="Explain your vehicle problem..."
                      required
                      rows={5}
                      className="w-full rounded-xl border border-border bg-background p-4 text-sm outline-none focus:border-[#C2692A] resize-none transition"
                    />
                  </div>

                  {/* IMAGES */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Damage Images
                    </label>

                    <label className="group flex flex-col items-center justify-center w-full h-48 border border-dashed border-border rounded-2xl cursor-pointer hover:bg-accent/50 transition overflow-hidden">
                      <div className="w-14 h-14 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center mb-4">
                        <ImagePlus size={24} className="text-[#C2692A]" />
                      </div>

                      <p className="text-sm font-medium">
                        Upload damage images
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        Max 5 images, each up to 5MB
                      </p>

                      <div className="mt-4 flex items-center gap-2 text-sm text-[#C2692A]">
                        <Upload size={15} />
                        Choose Images
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {previews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                        {previews.map((preview, index) => (
                          <div
                            key={preview}
                            className="relative h-28 rounded-2xl overflow-hidden border border-border bg-background"
                          >
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              fill
                              className="object-cover"
                            />

                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/70 hover:bg-black text-white flex items-center justify-center"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={submitLoading}
                      className="flex-1 h-12 rounded-xl border border-border hover:bg-accent transition-all text-sm font-medium disabled:opacity-60"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        submitLoading ||
                        vehicles.length === 0 ||
                        services.length === 0
                      }
                      className="flex-1 h-12 rounded-xl bg-[#522C14] hover:bg-[#6B3818] transition-all text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {submitLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Create Booking
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
