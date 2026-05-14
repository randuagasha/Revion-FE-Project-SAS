"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  RefreshCcw,
  Save,
  ShieldCheck,
  User,
  UserCog,
  Wrench,
} from "lucide-react";

import {
  adminUserService,
  type AdminUserPayload,
  type MechanicAvailability,
} from "@/services/admin-user.service";

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

export default function EditMechanicPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const userId = params?.id;

  const [pageLoading, setPageLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    availability: "available" as MechanicAvailability,
  });

  useEffect(() => {
    let mounted = true;

    const fetchMechanicDetail = async () => {
      if (!userId) {
        setPageError("Mechanic ID tidak ditemukan dari URL.");
        setPageLoading(false);
        return;
      }

      try {
        setPageLoading(true);
        setPageError("");

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(
              new Error("Request timeout saat mengambil detail mechanic."),
            );
          }, 8000);
        });

        const response = await Promise.race([
          adminUserService.getUserById(userId),
          timeoutPromise,
        ]);

        if (!mounted) return;

        const user = response.data;

        if (!user) {
          setPageError("Mechanic tidak ditemukan.");
          setPageLoading(false);
          return;
        }

        if (user.role !== "mechanic") {
          setPageError("Akun ini bukan mechanic.");
          setPageLoading(false);
          return;
        }

        setForm({
          name: user.name || "",
          email: user.email || "",
          password: "",
          availability: user.availability || "available",
        });
      } catch (error) {
        console.error("Failed to fetch mechanic detail:", error);

        if (!mounted) return;

        setPageError(
          "Gagal mengambil detail mechanic. Cek endpoint GET /admin/users/:id di backend.",
        );
      } finally {
        if (mounted) {
          setPageLoading(false);
        }
      }
    };

    fetchMechanicDetail();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateMechanic = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) {
      alert("Mechanic ID not found");
      return;
    }

    if (!form.name.trim() || !form.email.trim()) {
      alert("Name and email are required");
      return;
    }

    if (form.password && form.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setSubmitLoading(true);

      const payload: AdminUserPayload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role: "mechanic",
        availability: form.availability,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      await adminUserService.updateUser(userId, payload);

      router.push("/super_admin/mechanics");
      router.refresh();
    } catch (error) {
      console.error("Failed to update mechanic:", error);
      alert("Failed to update mechanic");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center rounded-3xl border border-border bg-card/40 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="animate-spin" size={24} />

          <span className="text-sm font-medium">
            Loading mechanic detail...
          </span>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="w-full max-w-xl rounded-3xl border border-border bg-card/40 p-6 text-center backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <AlertCircle size={26} />
          </div>

          <h1 className="text-xl font-bold text-white">
            Failed to load mechanic
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {pageError}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#522C14] px-5 text-sm font-semibold text-white transition hover:bg-[#63351a]"
            >
              <RefreshCcw size={17} />
              Retry
            </button>

            <Link
              href="/super_admin/mechanics"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background/40 px-5 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-white"
            >
              Back to Mechanics
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

            <p className="mb-2 text-sm text-muted-foreground">Edit Mechanic</p>

            <h1 className="max-w-2xl text-2xl font-bold leading-tight text-white md:text-3xl">
              Update mechanic account.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Update mechanic profile, availability, email, or password.
            </p>
          </div>
        </div>

        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#522C14]/20 blur-3xl" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.75fr]">
        <form
          onSubmit={handleUpdateMechanic}
          className="rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">
              Mechanic Information
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Edit the account details for this mechanic.
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
                  disabled={submitLoading}
                  placeholder="Example: Budi Santoso"
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
                  disabled={submitLoading}
                  placeholder="mechanic@revion.com"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                />
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
                  disabled={submitLoading}
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                New Password
              </label>

              <div className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background/40 px-4 transition focus-within:border-[#522C14]">
                <ShieldCheck size={17} className="text-muted-foreground" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={submitLoading}
                  placeholder="Leave empty to keep current password"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={submitLoading}
                  className="text-muted-foreground transition hover:text-white disabled:opacity-60"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Password will only be updated if this field is filled.
              </p>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
              <p className="text-sm font-semibold text-purple-300">
                Account Role
              </p>

              <p className="mt-1 text-sm leading-6 text-purple-200/70">
                This account remains as mechanic and can manage assigned booking
                progress.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-3 sm:flex-row">
              <button
                type="submit"
                disabled={submitLoading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#522C14] px-5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#63351a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLoading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Update Mechanic
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
              Account preview based on current data.
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
              Set mechanic availability carefully because available mechanics
              can receive new booking assignments.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
