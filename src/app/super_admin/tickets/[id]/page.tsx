"use client";

import Image from "next/image";
import Link from "next/link";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  Car,
  CheckCircle,
  Clock,
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
  type Ticket as TicketData,
  type TicketMessage,
  type TicketStatus,
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

const statusOptions: TicketStatus[] = [
  "open",
  "in_review",
  "resolved",
  "closed",
];

const getInitialForm = (): MessageForm => ({
  message: "",
  attachment: null,
});

export default function SuperAdminTicketDetailPage() {
  const params = useParams<{ id: string }>();

  const ticketId = params.id;

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState<MessageForm>(getInitialForm);

  const status = ticket
    ? statusConfig[ticket.status] || statusConfig.open
    : statusConfig.open;

  const StatusIcon = status.icon;

  useEffect(() => {
    let mounted = true;

    const loadTicketDetail = async () => {
      if (!ticketId) {
        if (mounted) {
          setLoading(false);
        }

        return;
      }

      try {
        const [ticketResponse, messageResponse] = await Promise.all([
          ticketService.getTicketById(ticketId),
          ticketService.getTicketMessages(ticketId),
        ]);

        if (!mounted) return;

        setTicket(ticketResponse.data);
        setMessages(messageResponse.data || []);
      } catch (error) {
        console.error("Failed fetch ticket detail:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadTicketDetail();

    return () => {
      mounted = false;
    };
  }, [ticketId]);

  const refreshTicketDetail = async () => {
    if (!ticketId) return;

    try {
      const [ticketResponse, messageResponse] = await Promise.all([
        ticketService.getTicketById(ticketId),
        ticketService.getTicketMessages(ticketId),
      ]);

      setTicket(ticketResponse.data);
      setMessages(messageResponse.data || []);
    } catch (error) {
      console.error("Failed refresh ticket detail:", error);
    }
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

  const handleUpdateStatus = async (statusValue: TicketStatus) => {
    if (!ticketId) return;

    try {
      setStatusLoading(true);

      await ticketService.updateTicketStatus(ticketId, statusValue);

      setTicket((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          status: statusValue,
        };
      });
    } catch (error) {
      console.error("Failed to update ticket status:", error);
      alert("Failed to update ticket status");
    } finally {
      setStatusLoading(false);
    }
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

      await refreshTicketDetail();
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
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center rounded-3xl border border-border bg-card/40 backdrop-blur-xl">
        <Loader2 className="animate-spin text-[#C2692A]" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <Link
          href="/super_admin/tickets"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to tickets
        </Link>

        <div className="flex h-72 items-center justify-center rounded-3xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">
            Ticket detail not found.
          </p>
        </div>
      </div>
    );
  }

  const isClosed = ticket.status === "closed";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-5">
        <div>
          <Link
            href="/super_admin/tickets"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft size={16} />
            Back to tickets
          </Link>

          <h1 className="text-3xl font-bold tracking-tight">Ticket Detail</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor and respond to customer support conversations.
          </p>
        </div>

        <div
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2"
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        {/* CHAT AREA */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          {/* CHAT HEADER */}
          <div className="border-b border-border p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Ticket Code</p>

                <h2 className="mt-1 text-2xl font-bold">
                  {ticket.ticket_code}
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  {ticket.subject}
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#522C1430] bg-[#522C1415]">
                <MessageCircle size={24} className="text-[#C2692A]" />
              </div>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="max-h-160 min-h-115 space-y-5 overflow-y-auto p-6">
            {groupedMessages.length === 0 ? (
              <div className="flex h-80 flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#522C1430] bg-[#522C1415]">
                  <MessageCircle size={28} className="text-[#C2692A]" />
                </div>

                <h3 className="font-semibold">No messages yet</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Start the conversation by sending a message.
                </p>
              </div>
            ) : (
              groupedMessages.map((message) => {
                const isAdmin = message.sender_role === "super_admin";
                const isOwnMessage = isAdmin;

                const attachmentUrl = getAttachmentUrl(
                  message.attachment,
                  message.attachment_url,
                );

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[78%] rounded-3xl border p-4 ${
                        isOwnMessage
                          ? "border-[#522C14] bg-[#522C14] text-white"
                          : "border-border bg-background"
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                            isOwnMessage
                              ? "bg-white/15"
                              : "border border-[#522C1430] bg-[#522C1415]"
                          }`}
                        >
                          <UserRound
                            size={15}
                            className={
                              isOwnMessage ? "text-white" : "text-[#C2692A]"
                            }
                          />
                        </div>

                        <div>
                          <p className="text-xs font-semibold">
                            {message.sender_name}
                          </p>

                          <p
                            className={`text-[11px] capitalize ${
                              isOwnMessage
                                ? "text-white/60"
                                : "text-muted-foreground"
                            }`}
                          >
                            {message.sender_role.replace("_", " ")} •{" "}
                            {formatDateTime(message.created_at)}
                          </p>
                        </div>
                      </div>

                      <p className="whitespace-pre-line text-sm leading-relaxed">
                        {message.message}
                      </p>

                      {attachmentUrl && (
                        <div
                          className={`mt-4 overflow-hidden rounded-2xl border ${
                            isOwnMessage ? "border-white/15" : "border-border"
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
                                isOwnMessage
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
          <div className="border-t border-border p-6">
            {isClosed ? (
              <div className="rounded-2xl border border-border bg-background p-5 text-center">
                <p className="text-sm font-semibold">Ticket Closed</p>

                <p className="mt-1 text-sm text-muted-foreground">
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
                  className="w-full resize-none rounded-2xl border border-border bg-background p-4 text-sm outline-none transition focus:border-[#C2692A]"
                />

                {form.attachment && (
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#522C1430] bg-[#522C1415]">
                          <Paperclip size={18} className="text-[#C2692A]" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
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
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 text-red-500 transition hover:bg-red-500/10"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {preview && (
                      <div className="relative mt-4 h-52 overflow-hidden rounded-2xl border border-border">
                        <Image
                          src={preview}
                          alt="Attachment preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium transition hover:bg-accent">
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
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#522C14] text-sm font-medium text-white transition-all hover:bg-[#6B3818] disabled:opacity-60"
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
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#522C1430] bg-[#522C1415]">
              <MessageCircle size={23} className="text-[#C2692A]" />
            </div>

            <h2 className="text-lg font-bold">Ticket Information</h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Code</p>

                <p className="mt-1 text-sm font-semibold">
                  {ticket.ticket_code}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Subject</p>

                <p className="mt-1 text-sm font-semibold">{ticket.subject}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Created At</p>

                <p className="mt-1 text-sm font-semibold">
                  {formatDate(ticket.created_at)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Status</p>

                <div
                  className="mt-2 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5"
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

              <div>
                <p className="text-xs text-muted-foreground">Update Status</p>

                <select
                  value={ticket.status}
                  onChange={(e) =>
                    handleUpdateStatus(e.target.value as TicketStatus)
                  }
                  disabled={statusLoading}
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-[#C2692A] disabled:opacity-60"
                >
                  {statusOptions.map((item) => (
                    <option key={item} value={item} className="bg-[#0A0A0A]">
                      {statusConfig[item].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* VEHICLE */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#522C1430] bg-[#522C1415]">
              <Car size={23} className="text-[#C2692A]" />
            </div>

            <h2 className="text-lg font-bold">Related Vehicle</h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Vehicle</p>

                <p className="mt-1 text-sm font-semibold">
                  {ticket.brand && ticket.model
                    ? `${ticket.brand} ${ticket.model}`
                    : "No vehicle linked"}
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
                  {ticket.customer_name || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* HELP */}
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#522C1430] bg-[#522C1415]">
              <Wrench size={23} className="text-[#C2692A]" />
            </div>

            <h2 className="text-lg font-bold">Admin Flow</h2>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Super admin can monitor all customer tickets, respond to
              conversations, and update ticket status when the issue is reviewed
              or resolved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
