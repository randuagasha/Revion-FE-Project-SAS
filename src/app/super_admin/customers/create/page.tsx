"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

import { adminUserService } from "@/services/admin-user.service";

export default function CreateCustomerPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateCustomer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      alert("Please fill in all fields");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await adminUserService.createUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: "customer",
      });

      router.push("/super_admin/customers");
      router.refresh();
    } catch (error) {
      console.error("Failed to create customer:", error);
      alert("Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <Link
              href="/super_admin/customers"
              className="mb-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background/40 px-4 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Customers
            </Link>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white shadow-lg shadow-[#522C14]/20">
              <Users size={22} />
            </div>

            <p className="mb-2 text-sm text-muted-foreground">
              Create Customer
            </p>

            <h1 className="max-w-2xl text-2xl font-bold leading-tight text-white md:text-3xl">
              Add a new customer account.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Customer accounts can register vehicles, create bookings, and open
              support tickets in Revion.
            </p>
          </div>
        </div>

        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#522C14]/20 blur-3xl" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.75fr]">
        <form
          onSubmit={handleCreateCustomer}
          className="rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">
              Customer Information
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Fill in the account details for the new customer.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Full Name
              </label>

              <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background/40 px-4 transition focus-within:border-[#522C14]">
                <User size={17} className="text-muted-foreground" />

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Example: Randu Agasha"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Email Address
              </label>

              <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background/40 px-4 transition focus-within:border-[#522C14]">
                <Mail size={17} className="text-muted-foreground" />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="customer@revion.com"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Password
              </label>

              <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background/40 px-4 transition focus-within:border-[#522C14]">
                <ShieldCheck size={17} className="text-muted-foreground" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  className="text-muted-foreground transition hover:text-white disabled:opacity-60"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
              <p className="text-sm font-semibold text-blue-300">
                Account Role
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-200/70">
                This account will be created as a customer and will only have
                access to customer dashboard features.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-3 sm:flex-row">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#522C14] px-5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#63351a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Customer
                  </>
                )}
              </button>

              <Link
                href="/super_admin/customers"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background/40 px-5 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-white"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white">Live Preview</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Account preview based on your input.
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-background/40 p-5">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white shadow-lg shadow-[#522C14]/20">
                {form.name ? form.name.charAt(0).toUpperCase() : "C"}
              </div>

              <h3 className="text-lg font-bold text-white">
                {form.name || "Customer name"}
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                {form.email || "customer@revion.com"}
              </p>

              <div className="mt-5 border-t border-border pt-5">
                <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                  Customer
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white">Admin Note</h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Customer accounts are intended for users who will register
              vehicles, create bookings, and communicate through tickets.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
