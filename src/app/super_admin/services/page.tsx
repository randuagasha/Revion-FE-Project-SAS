"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

import {
  Plus,
  Wrench,
  Pencil,
  Trash2,
  Loader2,
  Search,
  AlertCircle,
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

export default function SuperAdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);

        const response = await serviceService.getServices();

        const serviceData = response.data || [];

        setServices(serviceData);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = useMemo(() => {
    const keyword = search.toLowerCase();

    return services.filter((service) => {
      return (
        service.name.toLowerCase().includes(keyword) ||
        service.description?.toLowerCase().includes(keyword) ||
        service.estimated_duration?.toLowerCase().includes(keyword)
      );
    });
  }, [search, services]);

  const handleDeleteService = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?",
    );

    if (!confirmDelete) return;

    try {
      setDeleteLoading(id);

      await serviceService.deleteService(id);

      setServices((prev) => prev.filter((service) => service.id !== id));
    } catch (error) {
      console.error("Failed to delete service:", error);
      alert("Failed to delete service");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 rounded-[2rem] bg-black p-8 text-white md:flex-row md:items-end">
        <div>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
            <Wrench size={26} />
          </div>

          <p className="mb-3 text-sm text-white/50">Service Management</p>

          <h1 className="max-w-2xl text-3xl font-bold md:text-4xl">
            Manage available vehicle services for Revion customers.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-white/55">
            Services created here will be visible to customers when they create
            a booking request.
          </p>
        </div>

        <Link
          href="/super_admin/services/create"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-black transition hover:scale-[1.02]"
        >
          <Plus size={18} />
          Add Service
        </Link>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
          <p className="text-sm text-black/50">Total Services</p>
          <h2 className="mt-2 text-3xl font-bold">{services.length}</h2>
          <p className="mt-2 text-sm text-black/40">
            Available service options
          </p>
        </div>

        <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
          <p className="text-sm text-black/50">Visible to Customer</p>
          <h2 className="mt-2 text-3xl font-bold">{services.length}</h2>
          <p className="mt-2 text-sm text-black/40">
            Listed on customer service page
          </p>
        </div>

        <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
          <p className="text-sm text-black/50">Management Access</p>
          <h2 className="mt-2 text-3xl font-bold">Admin</h2>
          <p className="mt-2 text-sm text-black/40">
            Only super admin can edit
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold">Service List</h2>
            <p className="mt-1 text-sm text-black/45">
              Create, update, and remove services from the system.
            </p>
          </div>

          <div className="flex h-12 items-center gap-3 rounded-2xl bg-[#F5F5F5] px-4 md:w-80">
            <Search size={18} className="text-black/40" />

            <input
              type="text"
              placeholder="Search service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-black/10">
            <div className="flex items-center gap-3 text-black/50">
              <Loader2 className="animate-spin" size={22} />
              <span className="text-sm font-medium">Loading services...</span>
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black/5">
              <AlertCircle size={24} className="text-black/45" />
            </div>

            <h3 className="text-lg font-bold">No services found</h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-black/45">
              Add your first service so customers can start booking vehicle
              maintenance.
            </p>

            <Link
              href="/super_admin/services/create"
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-black px-5 text-sm font-semibold text-white transition hover:scale-[1.02]"
            >
              <Plus size={17} />
              Add Service
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-black/5">
            <table className="w-full min-w-212.5 text-left text-sm">
              <thead className="bg-black/3 text-black/50">
                <tr>
                  <th className="px-5 py-4 font-medium">Service</th>
                  <th className="px-5 py-4 font-medium">Description</th>
                  <th className="px-5 py-4 font-medium">Price</th>
                  <th className="px-5 py-4 font-medium">Duration</th>
                  <th className="px-5 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredServices.map((service) => (
                  <tr
                    key={service.id}
                    className="border-t border-black/5 transition hover:bg-black/2"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                          <Wrench size={18} />
                        </div>

                        <div>
                          <p className="font-semibold">{service.name}</p>
                          <p className="text-xs text-black/40">
                            ID: {service.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="max-w-xs px-5 py-4 text-black/60">
                      <p className="line-clamp-2">
                        {service.description || "No description"}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {formatPrice(service.price)}
                    </td>

                    <td className="px-5 py-4 text-black/60">
                      {service.estimated_duration || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/super_admin/services/edit/${service.id}`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-black transition hover:bg-black hover:text-white"
                        >
                          <Pencil size={17} />
                        </Link>

                        <button
                          onClick={() => handleDeleteService(service.id)}
                          disabled={deleteLoading === service.id}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          type="button"
                        >
                          {deleteLoading === service.id ? (
                            <Loader2 size={17} className="animate-spin" />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
