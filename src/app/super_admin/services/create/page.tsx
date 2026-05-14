"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  Banknote,
  Clock3,
  FileText,
  Loader2,
  Save,
  Wrench,
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
      !form.name.trim() ||
      !form.description.trim() ||
      !form.estimated_duration.trim() ||
      !form.price.trim()
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      await serviceService.createService({
        name: form.name.trim(),
        description: form.description.trim(),
        estimated_duration: form.estimated_duration.trim(),
        price: form.price.trim(),
      });

      router.push("/super_admin/services");
      router.refresh();
    } catch (error) {
      console.error("Failed to create service:", error);
      alert("Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  const formattedPrice = form.price
    ? `Rp ${Number(form.price).toLocaleString("id-ID")}`
    : "-";

  return (
    <div className="space-y-6">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <Link
              href="/super_admin/services"
              className="mb-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background/40 px-4 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Services
            </Link>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white shadow-lg shadow-[#522C14]/20">
              <Wrench size={22} />
            </div>

            <p className="mb-2 text-sm text-muted-foreground">Create Service</p>

            <h1 className="max-w-2xl text-2xl font-bold leading-tight text-white md:text-3xl">
              Add a new service to Revion.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              This service will be visible to customers when they create a
              vehicle service booking.
            </p>
          </div>
        </div>

        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#522C14]/20 blur-3xl" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.75fr]">
        {/* FORM */}
        <form
          onSubmit={handleCreateService}
          className="rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">
              Service Information
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Fill in the service details clearly so customers understand what
              they are booking.
            </p>
          </div>

          <div className="space-y-5">
            {/* NAME */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Service Name
              </label>

              <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background/40 px-4 transition focus-within:border-[#522C14]">
                <Wrench size={17} className="text-muted-foreground" />

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Example: Engine Diagnostic"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Description
              </label>

              <div className="flex gap-3 rounded-xl border border-border bg-background/40 px-4 py-4 transition focus-within:border-[#522C14]">
                <FileText
                  size={17}
                  className="mt-1 shrink-0 text-muted-foreground"
                />

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Describe what this service includes..."
                  rows={6}
                  className="w-full resize-none bg-transparent text-sm leading-6 text-white outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* DURATION */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Estimated Duration
                </label>

                <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background/40 px-4 transition focus-within:border-[#522C14]">
                  <Clock3 size={17} className="text-muted-foreground" />

                  <input
                    type="text"
                    name="estimated_duration"
                    value={form.estimated_duration}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Example: 2 hours"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* PRICE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Price
                </label>

                <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background/40 px-4 transition focus-within:border-[#522C14]">
                  <Banknote size={17} className="text-muted-foreground" />

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Example: 250000"
                    min="0"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* ACTION */}
            <div className="flex flex-col gap-3 pt-3 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#522C14] px-5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#63351a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Service
                  </>
                )}
              </button>

              <Link
                href="/super_admin/services"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background/40 px-5 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-white"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>

        {/* PREVIEW */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-white">Live Preview</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Service card preview based on your input.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-background/40 p-5">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white shadow-lg shadow-[#522C14]/20">
                <Wrench size={20} />
              </div>

              <h3 className="text-lg font-bold text-white">
                {form.name || "Service name"}
              </h3>

              <p className="mt-3 min-h-20 text-sm leading-6 text-muted-foreground">
                {form.description ||
                  "Service description will appear here after you type it."}
              </p>

              <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-xl border border-border bg-card/40 p-3">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <Banknote size={15} />
                    <span className="text-xs">Price</span>
                  </div>

                  <p className="text-sm font-semibold text-white">
                    {formattedPrice}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card/40 p-3">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <Clock3 size={15} />
                    <span className="text-xs">Duration</span>
                  </div>

                  <p className="text-sm font-semibold text-white">
                    {form.estimated_duration || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white">Admin Note</h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Use short service names and clear descriptions. Customers will
              choose from this list before submitting their booking request.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
