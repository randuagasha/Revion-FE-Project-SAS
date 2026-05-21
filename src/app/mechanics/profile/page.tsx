"use client";

import { useCallback, useEffect, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Power,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import {
  type MechanicAvailability,
  type ProfileUser,
  userService,
} from "@/services/user.service";

interface ApiErrorData {
  message?: string;
  active_booking?: {
    id?: number;
    booking_code?: string;
    status?: string;
  };
}

interface ApiError {
  response?: {
    data?: ApiErrorData;
  };
  message?: string;
}

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

const availabilityMeta: Record<
  MechanicAvailability,
  {
    label: string;
    description: string;
    className: string;
    icon: typeof CheckCircle2;
  }
> = {
  available: {
    label: "Available",
    description: "Kamu sedang siap menerima booking baru dari customer.",
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-300 shadow-emerald-500/10",
    icon: CheckCircle2,
  },
  busy: {
    label: "Busy",
    description:
      "Kamu sedang menangani booking aktif. Status ini otomatis dari sistem.",
    className:
      "border-orange-500/25 bg-orange-500/10 text-orange-300 shadow-orange-500/10",
    icon: Wrench,
  },
  off_duty: {
    label: "Off Duty",
    description: "Kamu sedang tidak menerima booking baru.",
    className:
      "border-zinc-500/25 bg-zinc-500/10 text-zinc-300 shadow-zinc-500/10",
    icon: Power,
  },
};

const getInitials = (name?: string | null) => {
  if (!name) return "M";

  return name
    .split(" ")
    .filter(Boolean)
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const getErrorData = (error: unknown): ApiErrorData => {
  const apiError = error as ApiError;

  return apiError.response?.data || {};
};

const getErrorMessage = (
  error: unknown,
  fallback = "Terjadi kesalahan. Coba lagi.",
) => {
  const apiError = error as ApiError;

  return apiError.response?.data?.message || apiError.message || fallback;
};

export default function MechanicProfilePage() {
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] =
    useState<MechanicAvailability | null>(null);

  const availability = (profile?.availability ||
    "off_duty") as MechanicAvailability;

  const currentMeta =
    availabilityMeta[availability] || availabilityMeta.off_duty;

  const CurrentIcon = currentMeta.icon;
  const isBusy = availability === "busy";
  const initials = getInitials(profile?.name);

  const syncLocalUser = useCallback((updatedUser: Partial<ProfileUser>) => {
    const savedUser = window.localStorage.getItem("user");

    if (!savedUser) return;

    try {
      const parsedUser = JSON.parse(savedUser) as Record<string, unknown>;

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          ...parsedUser,
          ...updatedUser,
        }),
      );
    } catch {
      window.localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const result = await userService.getProfile();

      setProfile(result.data);
      syncLocalUser(result.data);
    } catch (error: unknown) {
      window.alert(
        getErrorMessage(
          error,
          "Gagal memuat profile mechanic. Coba refresh halaman.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [syncLocalUser]);

  const handleUpdateAvailability = async (
    nextAvailability: "available" | "off_duty",
  ) => {
    if (availability === nextAvailability) return;

    try {
      setUpdatingAvailability(nextAvailability);

      const result =
        await userService.updateMechanicAvailability(nextAvailability);

      const updatedAvailability = result.data?.availability || nextAvailability;

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              availability: updatedAvailability,
            }
          : prev,
      );

      syncLocalUser({
        availability: updatedAvailability,
      });

      window.alert(result.message || "Availability berhasil diupdate.");
    } catch (error: unknown) {
      const errorData = getErrorData(error);
      const activeBooking = errorData.active_booking;

      if (activeBooking?.booking_code) {
        window.alert(
          `${
            errorData.message ||
            "Tidak bisa mengubah status karena masih ada booking aktif."
          }\n\nBooking aktif: ${activeBooking.booking_code}`,
        );
      } else {
        window.alert(
          getErrorMessage(error, "Gagal mengubah availability mechanic."),
        );
      }

      await loadProfile();
    } finally {
      setUpdatingAvailability(null);
    }
  };

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (active) {
        void loadProfile();
      }
    });

    return () => {
      active = false;
    };
  }, [loadProfile]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground p-6">
        <div className="h-[70vh] flex items-center justify-center">
          <div className="rounded-3xl border border-border bg-card/50 backdrop-blur-xl px-8 py-7 flex items-center gap-4">
            <Loader2 className="animate-spin text-[#C96F32]" size={24} />

            <div>
              <p className="text-white font-semibold">Loading profile...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Mengambil data mechanic.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-7">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#C96F32]/20 blur-3xl" />
          <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-[#522C14]/20 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-3xl bg-[#522C14] text-white flex items-center justify-center text-2xl font-black shadow-xl shadow-[#522C14]/20 overflow-hidden">
                {profile?.profile_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.profile_image_url}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground mb-3">
                  <ShieldCheck size={14} className="text-[#C96F32]" />
                  Mechanic Profile
                </div>

                <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white">
                  {profile?.name || "Mechanic"}
                </h1>

                <p className="text-muted-foreground mt-2">{profile?.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void loadProfile()}
              className="h-11 px-4 rounded-xl border border-border bg-white/5 text-sm text-muted-foreground hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
          <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white">Current Status</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Status ini menentukan apakah kamu bisa menerima booking baru.
              </p>
            </div>

            <div
              className={cn(
                "rounded-3xl border p-5 shadow-xl",
                currentMeta.className,
              )}
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <CurrentIcon size={22} />
                </div>

                <div>
                  <p className="text-2xl font-black">{currentMeta.label}</p>
                  <p className="text-sm mt-2 leading-6 opacity-90">
                    {currentMeta.description}
                  </p>
                </div>
              </div>
            </div>

            {isBusy ? (
              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 flex gap-3">
                <AlertCircle
                  size={20}
                  className="text-orange-300 shrink-0 mt-0.5"
                />

                <div>
                  <p className="text-sm font-semibold text-orange-200">
                    Status busy dikunci otomatis.
                  </p>
                  <p className="text-sm text-orange-100/70 mt-1 leading-6">
                    Selesaikan booking aktif terlebih dahulu untuk mengubah
                    status menjadi available atau off duty.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white">
                Work Availability
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Pilih status kerja manual. Status busy tetap otomatis dari
                sistem.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AvailabilityOption
                title="Available"
                description="Siap menerima booking baru dari customer."
                active={availability === "available"}
                disabled={isBusy || updatingAvailability !== null}
                loading={updatingAvailability === "available"}
                icon={<CheckCircle2 size={22} />}
                onClick={() => void handleUpdateAvailability("available")}
              />

              <AvailabilityOption
                title="Off Duty"
                description="Tidak menerima booking baru untuk sementara."
                active={availability === "off_duty"}
                disabled={isBusy || updatingAvailability !== null}
                loading={updatingAvailability === "off_duty"}
                icon={<Power size={22} />}
                onClick={() => void handleUpdateAvailability("off_duty")}
              />
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-card/40 backdrop-blur-xl p-6">
          <h2 className="text-xl font-bold text-white">Account Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            <InfoCard label="Name" value={profile?.name || "-"} />
            <InfoCard label="Email" value={profile?.email || "-"} />
            <InfoCard label="Role" value={profile?.role || "-"} />
          </div>
        </section>
      </div>
    </main>
  );
}

function AvailabilityOption({
  title,
  description,
  active,
  disabled,
  loading,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  active: boolean;
  disabled: boolean;
  loading: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "text-left rounded-3xl border p-5 transition-all group",
        active
          ? "border-[#C96F32]/40 bg-[#C96F32]/15 shadow-xl shadow-[#C96F32]/10"
          : "border-border bg-white/3 hover:bg-white/6",
        disabled && "opacity-60 cursor-not-allowed hover:bg-white/3",
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "h-12 w-12 rounded-2xl flex items-center justify-center transition-all",
            active
              ? "bg-[#C96F32] text-white"
              : "bg-white/5 text-muted-foreground group-hover:text-white",
          )}
        >
          {loading ? <Loader2 size={22} className="animate-spin" /> : icon}
        </div>

        <div>
          <p className="text-white font-black text-lg">{title}</p>

          <p className="text-sm text-muted-foreground mt-2 leading-6">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white/3 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>

      <p className="text-white font-semibold mt-2 wrap-break-word">{value}</p>
    </div>
  );
}
