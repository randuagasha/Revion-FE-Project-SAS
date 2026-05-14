"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Activity,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  User,
  UserCog,
  Wrench,
} from "lucide-react";

import {
  adminUserService,
  type MechanicAvailability,
} from "@/services/admin-user.service";

export default function CreateMechanicPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    availability: "available" as MechanicAvailability,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateMechanic = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      alert("Please fill in all required fields");
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
        role: "mechanic",
        availability: form.availability,
      });

      router.push("/super_admin/mechanics");
      router.refresh();
    } catch (error) {
      console.error("Failed to create mechanic:", error);
      alert("Failed to create mechanic");
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityClass = (availability: MechanicAvailability) => {
    if (availability === "available") {
      return "border-green-500/20 bg-green-500/10 text-green-400";
    }

    if (availability === "busy") {
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";
    }

    return "border-red-500/20 bg-red-500/10 text-red-400";
  };

  const formatAvailability = (availability: MechanicAvailability) => {
    return availability.charAt(0).toUpperCase() + availability.slice(1);
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <Link
              href="/super_admin/mechanics"
              className="mb-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background/40 px-4 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Mechanics
            </Link>

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white shadow-lg shadow-[#522C14]/20">
              <UserCog size={22} />
            </div>

            <p className="mb-2 text-sm text-muted-foreground">
              Create Mechanic
            </p>

            <h1 className="max-w-2xl text-2xl font-bold leading-tight text-white md:text-3xl">
              Add a new mechanic account.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Mechanic accounts can receive assigned jobs and update booking
              progress for customer vehicles.
            </p>
          </div>
        </div>

        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#522C14]/20 blur-3xl" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.75fr]">
        <form
          onSubmit={handleCreateMechanic}
          className="rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">
              Mechanic Information
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Fill in the account details for the new mechanic.
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
                  placeholder="Example: Ayrton Senna"
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
                  placeholder="mechanic@revion.com"
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Availability
              </label>

              <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background/40 px-4 transition focus-within:border-[#522C14]">
                <Activity size={17} className="text-muted-foreground" />

                <select
                  name="availability"
                  value={form.availability}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-transparent text-sm text-white outline-none disabled:cursor-not-allowed"
                >
                  <option className="bg-[#0A0A0A]" value="available">
                    Available
                  </option>
                  <option className="bg-[#0A0A0A]" value="busy">
                    Busy
                  </option>
                  <option className="bg-[#0A0A0A]" value="offline">
                    Offline
                  </option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
              <p className="text-sm font-semibold text-purple-300">
                Account Role
              </p>

              <p className="mt-1 text-sm leading-6 text-purple-200/70">
                This account will be created as a mechanic and can access job
                assignments and booking progress features.
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
                    Save Mechanic
                  </>
                )}
              </button>

              <Link
                href="/super_admin/mechanics"
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
                {form.name ? form.name.charAt(0).toUpperCase() : "M"}
              </div>

              <h3 className="text-lg font-bold text-white">
                {form.name || "Mechanic name"}
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                {form.email || "mechanic@revion.com"}
              </p>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
                <span className="inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
                  Mechanic
                </span>

                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getAvailabilityClass(
                    form.availability,
                  )}`}
                >
                  {formatAvailability(form.availability)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white">
              <Wrench size={22} />
            </div>

            <h2 className="text-xl font-bold text-white">Mechanic Note</h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Available mechanics can be assigned to new bookings. Busy
              mechanics are already handling active jobs, while offline
              mechanics should not receive new assignments.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
