"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  AlertCircle,
  Banknote,
  CalendarPlus,
  Clock3,
  Loader2,
  Search,
  Wrench,
} from "lucide-react";

import { serviceService, type Service } from "@/services/service.service";

const formatPrice = (price?: number | string | null) => {
  if (!price) return "-";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price));
};

export default function CustomerServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setPageError("");

        const response = await serviceService.getServices();

        setServices(response.data || []);
      } catch (error) {
        console.error("Failed to fetch customer services:", error);
        setServices([]);
        setPageError("Failed to load available services.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return services;

    return services.filter((service) => {
      return (
        service.name.toLowerCase().includes(keyword) ||
        service.description?.toLowerCase().includes(keyword) ||
        service.estimated_duration?.toLowerCase().includes(keyword) ||
        String(service.price || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [services, search]);

  return (
    <div className="space-y-6">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white shadow-lg shadow-[#522C14]/20">
              <Wrench size={22} />
            </div>

            <p className="mb-2 text-sm text-muted-foreground">
              Available Services
            </p>

            <h1 className="max-w-2xl text-2xl font-bold leading-tight text-white md:text-3xl">
              Explore vehicle services available at Revion.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Choose from available maintenance and repair services before
              creating your vehicle booking request.
            </p>
          </div>

          <Link
            href="/customers/bookings/create"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#522C14] px-5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#63351a]"
          >
            <CalendarPlus size={17} />
            Create Booking
          </Link>
        </div>

        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#522C14]/20 blur-3xl" />
      </section>

      {/* STATS */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white">
            <Wrench size={21} />
          </div>

          <p className="text-sm text-muted-foreground">Total Services</p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {services.length}
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Available service options
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white">
            <Banknote size={21} />
          </div>

          <p className="text-sm text-muted-foreground">Transparent Price</p>

          <h2 className="mt-2 text-3xl font-bold text-white">Listed</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            View estimated service cost
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white">
            <Clock3 size={21} />
          </div>

          <p className="text-sm text-muted-foreground">Estimated Duration</p>

          <h2 className="mt-2 text-3xl font-bold text-white">Visible</h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Know the estimated time
          </p>
        </div>
      </section>

      {/* SERVICES */}
      <section className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Service Catalog</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Browse services provided by Revion garage.
            </p>
          </div>

          <div className="flex h-11 items-center gap-3 rounded-xl border border-border bg-background/40 px-4 lg:w-80">
            <Search size={17} className="text-muted-foreground" />

            <input
              type="text"
              placeholder="Search service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-border">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="animate-spin" size={22} />
              <span className="text-sm font-medium">Loading services...</span>
            </div>
          </div>
        ) : pageError ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-red-500/20 bg-red-500/5 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10">
              <AlertCircle size={24} className="text-red-400" />
            </div>

            <h3 className="text-lg font-bold text-white">
              Failed to load services
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {pageError}
            </p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent">
              <AlertCircle size={24} className="text-muted-foreground" />
            </div>

            <h3 className="text-lg font-bold text-white">No services found</h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Try another keyword or check again later.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="group rounded-2xl border border-border bg-background/40 p-5 transition hover:-translate-y-1 hover:bg-accent/40"
              >
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#522C14] text-white shadow-lg shadow-[#522C14]/20">
                    <Wrench size={18} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-white">
                      {service.name}
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      Revion Service
                    </p>
                  </div>
                </div>

                <p className="line-clamp-3 min-h-16 text-sm leading-6 text-muted-foreground">
                  {service.description || "No description available."}
                </p>

                <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card/40 p-3">
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                      <Banknote size={15} />
                      <span className="text-xs">Price</span>
                    </div>

                    <p className="text-sm font-semibold text-white">
                      {formatPrice(service.price)}
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-card/40 p-3">
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                      <Clock3 size={15} />
                      <span className="text-xs">Duration</span>
                    </div>

                    <p className="text-sm font-semibold text-white">
                      {service.estimated_duration || "-"}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/customers/bookings`}
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#522C14] px-5 text-sm font-semibold text-white transition hover:scale-[1.01] hover:bg-[#63351a]"
                >
                  <CalendarPlus size={17} />
                  Book This Service
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
