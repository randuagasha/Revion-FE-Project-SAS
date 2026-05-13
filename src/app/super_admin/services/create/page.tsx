"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  Save,
  Loader2,
  Wrench,
  FileText,
  Clock3,
  Banknote,
} from "lucide-react";

import { serviceService } from "@/services/service.service";

export default function CreateServicePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    estimated_duration: "",
    price: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.description ||
      !form.estimated_duration ||
      !form.price
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      await serviceService.createService(form);

      router.push("/super_admin/services");
      router.refresh();
    } catch (error) {
      console.error("Failed to create service:", error);
      alert("Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 rounded-[2rem] bg-black p-8 text-white md:flex-row md:items-end">
        <div>
          <Link
            href="/super_admin/services"
            className="mb-6 inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white hover:text-black"
          >
            <ArrowLeft size={17} />
            Back to Services
          </Link>

          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
            <Wrench size={26} />
          </div>

          <p className="mb-3 text-sm text-white/50">Create Service</p>

          <h1 className="max-w-2xl text-3xl font-bold md:text-4xl">
            Add a new vehicle service to Revion.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-white/55">
            This service will appear on the customer service list and can be
            selected when customers create a booking.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <form
          onSubmit={handleCreateService}
          className="rounded-[2rem] bg-white p-6 shadow-sm"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold">Service Information</h2>
            <p className="mt-1 text-sm text-black/45">
              Fill in the details for the new service.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Service Name
              </label>

              <div className="flex h-13 items-center gap-3 rounded-2xl bg-[#F5F5F5] px-4">
                <Wrench size={18} className="text-black/40" />

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Example: Engine Diagnostic"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-black/35"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>

              <div className="flex gap-3 rounded-2xl bg-[#F5F5F5] px-4 py-4">
                <FileText size={18} className="mt-1 text-black/40" />

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe what this service includes..."
                  rows={5}
                  className="w-full resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-black/35"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Estimated Duration
                </label>

                <div className="flex h-13 items-center gap-3 rounded-2xl bg-[#F5F5F5] px-4">
                  <Clock3 size={18} className="text-black/40" />

                  <input
                    type="text"
                    name="estimated_duration"
                    value={form.estimated_duration}
                    onChange={handleChange}
                    placeholder="Example: 2 hours"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-black/35"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Price
                </label>

                <div className="flex h-13 items-center gap-3 rounded-2xl bg-[#F5F5F5] px-4">
                  <Banknote size={18} className="text-black/40" />

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Example: 250000"
                    min="0"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-black/35"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-3 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-black px-6 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Service
                  </>
                )}
              </button>

              <Link
                href="/super_admin/services"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-black/5 px-6 text-sm font-semibold text-black transition hover:bg-black/10"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Preview</h2>
            <p className="mt-1 text-sm text-black/45">
              This is how the service data will look.
            </p>

            <div className="mt-6 rounded-3xl border border-black/5 bg-[#F5F5F5] p-5">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                <Wrench size={20} />
              </div>

              <h3 className="text-lg font-bold">
                {form.name || "Service name"}
              </h3>

              <p className="mt-2 text-sm leading-6 text-black/50">
                {form.description ||
                  "Service description will appear here after you type it."}
              </p>

              <div className="mt-5 space-y-3 border-t border-black/5 pt-5 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-black/45">Duration</span>
                  <span className="font-semibold">
                    {form.estimated_duration || "-"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-black/45">Price</span>
                  <span className="font-semibold">
                    {form.price
                      ? `Rp ${Number(form.price).toLocaleString("id-ID")}`
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-black p-6 text-white shadow-sm">
            <h2 className="text-xl font-bold">Admin Note</h2>

            <p className="mt-3 text-sm leading-6 text-white/55">
              Keep service names short and clear. Customers will use this list
              when creating a vehicle service booking.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
