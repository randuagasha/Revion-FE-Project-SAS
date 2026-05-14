"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  AlertCircle,
  ArrowUpRight,
  Car,
  Clock3,
  Loader2,
  MessageCircle,
  Search,
  Ticket as TicketIcon,
  UserRound,
  Wrench,
} from "lucide-react";

import {
  ticketService,
  type Ticket as TicketData,
  type TicketStatus,
} from "@/services/ticket.service";

const statusOptions: Array<TicketStatus | "all"> = [
  "all",
  "open",
  "in_review",
  "resolved",
  "closed",
];

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

const getStatusClass = (status?: TicketStatus) => {
  switch (status) {
    case "open":
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";
    case "in_review":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
    case "resolved":
      return "border-green-500/20 bg-green-500/10 text-green-400";
    case "closed":
      return "border-zinc-500/20 bg-zinc-500/10 text-zinc-400";
    default:
      return "border-white/10 bg-white/5 text-muted-foreground";
  }
};

export default function SuperAdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setPageError("");

        const response = await ticketService.getTickets();

        setTickets(response.data || []);
      } catch (error) {
        console.error("Failed to fetch super admin tickets:", error);

        setTickets([]);
        setPageError("Failed to load tickets. Check backend GET /tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch =
        !keyword ||
        ticket.ticket_code?.toLowerCase().includes(keyword) ||
        ticket.subject?.toLowerCase().includes(keyword) ||
        ticket.customer_name?.toLowerCase().includes(keyword) ||
        ticket.brand?.toLowerCase().includes(keyword) ||
        ticket.model?.toLowerCase().includes(keyword) ||
        ticket.status?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  const totalOpen = useMemo(() => {
    return tickets.filter((ticket) => ticket.status === "open").length;
  }, [tickets]);

  const totalInReview = useMemo(() => {
    return tickets.filter((ticket) => ticket.status === "in_review").length;
  }, [tickets]);

  const totalResolved = useMemo(() => {
    return tickets.filter((ticket) => ticket.status === "resolved").length;
  }, [tickets]);

  return (
    <div className="space-y-6">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white shadow-lg shadow-[#522C14]/20">
              <TicketIcon size={22} />
            </div>

            <p className="mb-2 text-sm text-muted-foreground">
              Ticket Management
            </p>

            <h1 className="max-w-2xl text-2xl font-bold leading-tight text-white md:text-3xl">
              Monitor all customer support tickets.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              View, track, respond, and update every customer ticket submitted
              to Revion.
            </p>
          </div>
        </div>

        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#522C14]/20 blur-3xl" />
      </section>

      {/* STATS */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white">
            <TicketIcon size={21} />
          </div>

          <p className="text-sm text-muted-foreground">Total Tickets</p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {tickets.length}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            All customer reports
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white">
            <MessageCircle size={21} />
          </div>

          <p className="text-sm text-muted-foreground">Open</p>

          <h2 className="mt-2 text-3xl font-bold text-white">{totalOpen}</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Waiting for response
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white">
            <Clock3 size={21} />
          </div>

          <p className="text-sm text-muted-foreground">In Review</p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {totalInReview}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Currently handled
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white">
            <Wrench size={21} />
          </div>

          <p className="text-sm text-muted-foreground">Resolved</p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {totalResolved}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">Solved tickets</p>
        </div>
      </section>

      {/* LIST */}
      <section className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-bold text-white">All Tickets</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Search and manage all tickets from customers.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex h-11 items-center gap-3 rounded-xl border border-border bg-background/40 px-4 md:w-80">
              <Search size={17} className="text-muted-foreground" />

              <input
                type="text"
                placeholder="Search ticket..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as TicketStatus | "all")
              }
              className="h-11 rounded-xl border border-border bg-background/40 px-4 text-sm font-medium text-white outline-none"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status} className="bg-[#0A0A0A]">
                  {status === "all" ? "All Status" : formatLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-border">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="animate-spin" size={22} />
              <span className="text-sm font-medium">Loading tickets...</span>
            </div>
          </div>
        ) : pageError ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-red-500/20 bg-red-500/5 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10">
              <AlertCircle size={24} className="text-red-400" />
            </div>

            <h3 className="text-lg font-bold text-white">
              Failed to load tickets
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {pageError}
            </p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent">
              <TicketIcon size={24} className="text-muted-foreground" />
            </div>

            <h3 className="text-lg font-bold text-white">No tickets found</h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Tickets from customers will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/super_admin/tickets/${ticket.id}`}
                className="group rounded-2xl border border-border bg-background/40 p-5 transition hover:-translate-y-1 hover:bg-accent/40"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-white">
                        {ticket.ticket_code}
                      </h3>

                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                          ticket.status,
                        )}`}
                      >
                        {formatLabel(ticket.status)}
                      </span>
                    </div>

                    <p className="line-clamp-1 text-sm font-medium text-white">
                      {ticket.subject}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Created {formatDate(ticket.created_at)}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition group-hover:bg-[#522C14] group-hover:text-white">
                    <ArrowUpRight size={17} />
                  </div>
                </div>

                <div className="grid gap-3 border-t border-border pt-5 md:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card/40 p-3">
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                      <UserRound size={15} />
                      <span className="text-xs">Customer</span>
                    </div>

                    <p className="truncate text-sm font-semibold text-white">
                      {ticket.customer_name || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card/40 p-3">
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                      <Car size={15} />
                      <span className="text-xs">Vehicle</span>
                    </div>

                    <p className="truncate text-sm font-semibold text-white">
                      {ticket.brand || "-"} {ticket.model || ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
