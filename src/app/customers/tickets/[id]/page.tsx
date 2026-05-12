"use client";

import Link from "next/link";
import Image from "next/image";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  AlertCircle,
  Car,
  CheckCircle,
  Clock,
  ImageIcon,
  Loader2,
  MessageCircle,
  Paperclip,
  Send,
  Trash2,
  Upload,
  UserRound,
  Wrench,
} from "lucide-react";

import {
  ticketService,
  Ticket,
  TicketMessage,
  TicketStatus,
} from "@/services/ticket.service";

interface MessageForm {
  message: string;
  attachment: File | null;
}

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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

const getInitialForm = (): MessageForm => ({
  message: "",
  attachment: null,
});

export default function TicketDetailPage() {
  const params = useParams();

  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState<MessageForm>(getInitialForm);

  const status = ticket
    ? statusConfig[ticket.status] || statusConfig.open
    : statusConfig.open;

  const StatusIcon = status.icon;

  const fetchTicketDetail = async () => {
    try {
      setLoading(true);

      const [ticketResponse, messageResponse] = await Promise.all([
        ticketService.getTicketById(ticketId),
        ticketService.getTicketMessages(ticketId),
      ]);

      setTicket(ticketResponse.data);
      setMessages(messageResponse.data || []);
    } catch (error) {
      console.error("Failed fetch ticket detail:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTicketDetail = async () => {
      try {
        await fetchTicketDetail();
      } catch (error) {
        console.error("Failed to load ticket detail:", error);
      }
    };

    if (ticketId) {
      void loadTicketDetail();
    }
  }, [ticketId]);

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

  const getAttachmentUrl = (
    attachment?: string | null,
    attachmentUrl?: string | null,
  ) => {
    if (attachmentUrl) return attachmentUrl;

    if (!attachment) return null;

    if (attachment.startsWith("http")) return attachment;

    if (attachment.startsWith("/uploads")) {
      return `${BACKEND_BASE_URL}${attachment}`;
    }

    return `${BACKEND_BASE_URL}/uploads/${attachment}`;
  };

  const isImageUrl = (url?: string | null) => {
    if (!url) return false;

    return /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
  };

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

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.message.trim()) {
      alert("Message wajib diisi");
      return;
    }

    try {
      setSubmitLoading(true);

      const formData = new FormData();

      formData.append("ticket_id", ticketId);
      formData.append("message", form.message);

      if (form.attachment) {
        formData.append("attachment", form.attachment);
      }

      await ticketService.sendTicketMessage(formData);

      setForm(getInitialForm());
      setPreview(null);

      await fetchTicketDetail();
    } catch (error) {
      console.error("Send message failed:", error);
      alert("Failed to send message. Check backend terminal for details.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const groupedMessages = useMemo(() => {
    return messages;
  }, [messages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#C2692A]" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <Link
          href="/customers/tickets"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft size={16} />
          Back to tickets
        </Link>

        <div className="h-72 mt-8 rounded-3xl border border-border bg-card flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Ticket detail not found.
          </p>
        </div>
      </div>
    );
  }

  const isClosed = ticket.status === "closed";

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-5 mb-8">
        <div>
          <Link
            href="/customers/tickets"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-4"
          >
            <ArrowLeft size={16} />
            Back to tickets
          </Link>

          <h1 className="text-3xl font-bold tracking-tight">Ticket Detail</h1>

          <p className="text-sm text-muted-foreground mt-1">
            View and continue your support consultation.
          </p>
        </div>

        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border"
          style={{
            background: status.bg,
            borderColor: status.border,
          }}
        >
          <StatusIcon size={16} color={status.color} />

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

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
        {/* CHAT AREA */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          {/* CHAT HEADER */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Ticket Code</p>

                <h2 className="text-2xl font-bold mt-1">
                  {ticket.ticket_code}
                </h2>

                <p className="text-sm text-muted-foreground mt-2">
                  {ticket.subject}
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center shrink-0">
                <MessageCircle size={24} className="text-[#C2692A]" />
              </div>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="p-6 space-y-5 min-h-115 max-h-160 overflow-y-auto">
            {groupedMessages.length === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center mb-4">
                  <MessageCircle size={28} className="text-[#C2692A]" />
                </div>

                <h3 className="font-semibold">No messages yet</h3>

                <p className="text-sm text-muted-foreground mt-1">
                  Start the conversation by sending a message.
                </p>
              </div>
            ) : (
              groupedMessages.map((message) => {
                const isCustomer = message.sender_role === "customer";

                const attachmentUrl = getAttachmentUrl(
                  message.attachment,
                  message.attachment_url,
                );

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isCustomer ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[78%] rounded-3xl p-4 border ${
                        isCustomer
                          ? "bg-[#522C14] border-[#522C14] text-white"
                          : "bg-background border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isCustomer
                              ? "bg-white/15"
                              : "bg-[#522C1415] border border-[#522C1430]"
                          }`}
                        >
                          <UserRound
                            size={15}
                            className={
                              isCustomer ? "text-white" : "text-[#C2692A]"
                            }
                          />
                        </div>

                        <div>
                          <p className="text-xs font-semibold">
                            {message.sender_name}
                          </p>

                          <p
                            className={`text-[11px] capitalize ${
                              isCustomer
                                ? "text-white/60"
                                : "text-muted-foreground"
                            }`}
                          >
                            {message.sender_role.replace("_", " ")} •{" "}
                            {formatDateTime(message.created_at)}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {message.message}
                      </p>

                      {attachmentUrl && (
                        <div
                          className={`mt-4 rounded-2xl overflow-hidden border ${
                            isCustomer ? "border-white/15" : "border-border"
                          }`}
                        >
                          {isImageUrl(attachmentUrl) ? (
                            <div className="relative h-52 bg-black/10">
                              <Image
                                src={attachmentUrl}
                                alt="Ticket attachment"
                                fill
                                sizes="(max-width: 768px) 80vw, 420px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <a
                              href={attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-3 p-4 transition ${
                                isCustomer
                                  ? "hover:bg-white/10"
                                  : "hover:bg-accent"
                              }`}
                            >
                              <Paperclip size={18} />

                              <span className="text-sm font-medium">
                                Open Attachment
                              </span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* REPLY FORM */}
          <div className="p-6 border-t border-border">
            {isClosed ? (
              <div className="rounded-2xl border border-border bg-background p-5 text-center">
                <p className="text-sm font-semibold">Ticket Closed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This ticket is closed and cannot receive new messages.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  placeholder="Type your reply..."
                  required
                  rows={4}
                  className="w-full rounded-2xl border border-border bg-background p-4 text-sm outline-none focus:border-[#C2692A] resize-none transition"
                />

                {form.attachment && (
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
                            {(form.attachment.size / 1024 / 1024).toFixed(2)} MB
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

                <div className="flex items-center gap-3">
                  <label className="h-11 px-4 rounded-xl border border-border hover:bg-accent transition text-sm font-medium flex items-center gap-2 cursor-pointer">
                    <Upload size={15} />
                    Attach
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex-1 h-11 rounded-xl bg-[#522C14] hover:bg-[#6B3818] transition-all text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          {/* TICKET INFO */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="w-12 h-12 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center mb-5">
              <MessageCircle size={23} className="text-[#C2692A]" />
            </div>

            <h2 className="text-lg font-bold">Ticket Information</h2>

            <div className="space-y-4 mt-5">
              <div>
                <p className="text-xs text-muted-foreground">Code</p>
                <p className="text-sm font-semibold mt-1">
                  {ticket.ticket_code}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Subject</p>
                <p className="text-sm font-semibold mt-1">{ticket.subject}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Created At</p>
                <p className="text-sm font-semibold mt-1">
                  {formatDate(ticket.created_at)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Status</p>

                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 mt-2 rounded-lg border"
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
            </div>
          </div>

          {/* VEHICLE */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="w-12 h-12 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center mb-5">
              <Car size={23} className="text-[#C2692A]" />
            </div>

            <h2 className="text-lg font-bold">Related Vehicle</h2>

            <div className="space-y-4 mt-5">
              <div>
                <p className="text-xs text-muted-foreground">Vehicle</p>
                <p className="text-sm font-semibold mt-1">
                  {ticket.brand && ticket.model
                    ? `${ticket.brand} ${ticket.model}`
                    : "No vehicle linked"}
                </p>
              </div>
            </div>
          </div>

          {/* CUSTOMER */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="w-12 h-12 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center mb-5">
              <UserRound size={23} className="text-[#C2692A]" />
            </div>

            <h2 className="text-lg font-bold">Customer</h2>

            <div className="space-y-4 mt-5">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-semibold mt-1">
                  {ticket.customer_name || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* HELP */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="w-12 h-12 rounded-2xl bg-[#522C1415] border border-[#522C1430] flex items-center justify-center mb-5">
              <Wrench size={23} className="text-[#C2692A]" />
            </div>

            <h2 className="text-lg font-bold">Support Flow</h2>

            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Admin will review your consultation ticket and reply in this
              conversation. You can continue sending additional information or
              attachments while the ticket is still open.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
