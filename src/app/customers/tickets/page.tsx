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
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
  Paperclip,
  Trash2,
  ChevronDown,
} from "lucide-react";

import { ticketService, Ticket, TicketStatus } from "@/services/ticket.service";

import { vehicleService } from "@/services/vehicle.service";

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: string;
  license_plate: string;
  image?: string | null;
}

interface TicketForm {
  vehicle_id: string;
  subject: string;
  message: string;
  attachment: File | null;
}

const statusConfig: Record<
  TicketStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: typeof Clock;
  }
> = {
  open: {
    label: "Open",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
    icon: Clock,
  },

  in_review: {
    label: "In Review",
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.25)",
    icon: AlertCircle,
  },

  resolved: {
    label: "Resolved",
    color: "#22C55E",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.25)",
    icon: CheckCircle,
  },

  closed: {
    label: "Closed",
    color: "#6B7280",
    bg: "rgba(107,114,128,0.12)",
    border: "rgba(107,114,128,0.25)",
    icon: CheckCircle,
  },
};

const filters = ["All", "open", "in_review", "resolved", "closed"];

const fieldClassName =
  "w-full h-12 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-[#C2692A] transition";

const selectClassName = `${fieldClassName} appearance-none pr-12 cursor-pointer`;

const getInitialForm = (): TicketForm => ({
  vehicle_id: "",
  subject: "",
  message: "",
  attachment: null,
});

export default function CustomerTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState<TicketForm>(getInitialForm);

  const selectedVehicle = vehicles.find(
    (vehicle) => String(vehicle.id) === form.vehicle_id,
  );

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const response = await ticketService.getTickets();

      setTickets(response.data || []);
    } catch (error) {
      console.error("Failed fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModalData = async () => {
    try {
      setModalLoading(true);

      const response = await vehicleService.getMyVehicles();

      setVehicles(response.data || []);
    } catch (error) {
      console.error("Failed fetch modal data:", error);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    const loadTickets = async () => {
      try {
        await fetchTickets();
      } catch (error) {
        console.error("Failed to load tickets:", error);
      }
    };

    void loadTickets();
  }, []);

  const openModal = () => {
    setForm(getInitialForm());
    setPreview(null);
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
    setPreview(null);
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        (ticket.ticket_code || "").toLowerCase().includes(keyword) ||
        (ticket.subject || "").toLowerCase().includes(keyword) ||
        (ticket.brand || "").toLowerCase().includes(keyword) ||
        (ticket.model || "").toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "All" || ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Attachment max size is 5MB");
      return;
    }

    setForm((prev) => ({
      ...prev,
      attachment: file,
    }));

    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }

    e.target.value = "";
  };

  const removeAttachment = () => {
    setForm((prev) => ({
      ...prev,
      attachment: null,
    }));

    setPreview(null);
  };

  const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      const ticketResponse = await ticketService.createTicket({
        vehicle_id: form.vehicle_id || null,
        subject: form.subject,
      });

      const ticketId = ticketResponse.data?.ticket_id;

      if (!ticketId) {
        throw new Error("Ticket ID tidak ditemukan dari response backend");
      }

      const formData = new FormData();

      formData.append("ticket_id", String(ticketId));
      formData.append("message", form.message);

      if (form.attachment) {
        formData.append("attachment", form.attachment);
      }

      await ticketService.sendTicketMessage(formData);

      closeModal();

      await fetchTickets();
    } catch (error) {
      console.error("Create ticket failed:", error);
      alert("Failed to create ticket. Check backend terminal for details.");
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

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>

          <p className="text-muted-foreground text-sm mt-1">
            Consult your vehicle issue and communicate with support.
          </p>
        </div>

        <button
          onClick={openModal}
          className="h-11 px-5 rounded-xl bg-[#522C14] hover:bg-[#6B3818] transition-all text-white text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} />
          New Ticket
        </button>
      </div>

      {/* TOP BAR */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 h-11 w-full xl:max-w-md rounded-xl border border-border bg-card px-4">
          <Search size={15} className="text-muted-foreground" />

          <input
            type="text"
            placeholder="Search ticket, subject, vehicle..."
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
              {filter === "in_review" ? "In Review" : filter}
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
      {!loading && filteredTickets.length === 0 && (
        <div className="h-72 rounded-3xl border border-border bg-card flex flex-col items-center justify-center text-center px-5">
          <div className="w-16 h-16 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center mb-4">
            <MessageCircle size={28} className="text-[#C2692A]" />
          </div>

          <h2 className="font-semibold">No tickets found</h2>

          <p className="text-sm text-muted-foreground mt-1">
            Create a ticket to consult your vehicle issue.
          </p>
        </div>
      )}

      {/* TICKET GRID */}
      {!loading && filteredTickets.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredTickets.map((ticket) => {
            const status = statusConfig[ticket.status] || statusConfig.open;
            const StatusIcon = status.icon;

            return (
              <div
                key={ticket.id}
                className="rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold">
                        {ticket.ticket_code}
                      </h2>

                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border"
                        style={{
                          background: status.bg,
                          borderColor: status.border,
                        }}
                      >
                        <StatusIcon size={13} color={status.color} />

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
                      Created at {formatDate(ticket.created_at)}
                    </p>
                  </div>

                  <Link
                    href={`/customers/tickets/${ticket.id}`}
                    className="w-10 h-10 rounded-xl border border-border hover:bg-accent transition flex items-center justify-center shrink-0"
                  >
                    <Eye size={16} />
                  </Link>
                </div>

                <div className="mt-6 rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs text-muted-foreground">Subject</p>

                  <p className="text-sm font-semibold mt-1">{ticket.subject}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Vehicle</p>

                    <div className="flex items-center gap-2 mt-2">
                      <Car size={15} className="text-[#C2692A]" />

                      <p className="text-sm font-semibold truncate">
                        {ticket.brand && ticket.model
                          ? `${ticket.brand} ${ticket.model}`
                          : "No vehicle linked"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-4">
                    <p className="text-xs text-muted-foreground">Customer</p>

                    <p className="text-sm font-semibold mt-2 truncate">
                      {ticket.customer_name || "-"}
                    </p>
                  </div>
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
              {/* HEADER */}
              <div className="sticky top-0 z-20 -mx-7 -mt-7 mb-6 px-7 py-5 rounded-t-3xl border-b border-border bg-card/95 backdrop-blur flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">New Ticket</h2>

                  <p className="text-sm text-muted-foreground mt-1">
                    Start a consultation with support.
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
                <form onSubmit={handleCreateTicket} className="space-y-5">
                  {/* VEHICLE */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Related Vehicle
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
                        className={selectClassName}
                      >
                        <option value="">No vehicle selected</option>

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
                  </div>

                  {/* SELECTED VEHICLE */}
                  {selectedVehicle && (
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <p className="text-xs text-muted-foreground">
                        Selected Vehicle
                      </p>

                      <p className="text-sm font-semibold mt-1">
                        {selectedVehicle.brand} {selectedVehicle.model}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedVehicle.license_plate}
                      </p>
                    </div>
                  )}

                  {/* SUBJECT */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Subject
                    </label>

                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      placeholder="Example: Engine noise consultation"
                      required
                      className={fieldClassName}
                    />
                  </div>

                  {/* MESSAGE */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Message
                    </label>

                    <textarea
                      value={form.message}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      placeholder="Explain what you want to consult..."
                      required
                      rows={6}
                      className="w-full rounded-xl border border-border bg-background p-4 text-sm outline-none focus:border-[#C2692A] resize-none transition"
                    />
                  </div>

                  {/* ATTACHMENT */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Attachment
                    </label>

                    {!form.attachment ? (
                      <label className="group flex flex-col items-center justify-center w-full h-48 border border-dashed border-border rounded-2xl cursor-pointer hover:bg-accent/50 transition overflow-hidden">
                        <div className="w-14 h-14 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center mb-4">
                          <Paperclip size={24} className="text-[#C2692A]" />
                        </div>

                        <p className="text-sm font-medium">Upload attachment</p>

                        <p className="text-xs text-muted-foreground mt-1">
                          Image or document up to 5MB
                        </p>

                        <div className="mt-4 flex items-center gap-2 text-sm text-[#C2692A]">
                          <Upload size={15} />
                          Choose File
                        </div>

                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="rounded-2xl border border-border bg-background p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center shrink-0">
                              <Paperclip size={18} className="text-[#C2692A]" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate">
                                {form.attachment.name}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {(form.attachment.size / 1024 / 1024).toFixed(
                                  2,
                                )}{" "}
                                MB
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={removeAttachment}
                            className="w-10 h-10 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition flex items-center justify-center"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {preview && (
                          <div className="relative h-52 rounded-2xl overflow-hidden border border-border mt-4">
                            <Image
                              src={preview}
                              alt="Attachment preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ACTIONS */}
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
                      disabled={submitLoading}
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
                          Create Ticket
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
