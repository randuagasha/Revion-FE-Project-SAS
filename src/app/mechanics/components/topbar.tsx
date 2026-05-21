"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { CheckCircle2, Power, Wrench } from "lucide-react";

import NotificationDropdown from "@/components/layout/notification-dropdown";
import { userService } from "@/services/user.service";

type MechanicAvailability = "available" | "busy" | "off_duty";

interface LoggedInUser {
  id?: number;
  name?: string;
  email?: string;
  role?: "customer" | "mechanic" | "super_admin";
  availability?: MechanicAvailability | null;
  profile_image_url?: string | null;
}

interface MechanicTopbarProps {
  collapsed: boolean;
}

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

const subscribeUser = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("user-updated", callback);
  window.addEventListener("mechanic-profile-updated", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("user-updated", callback);
    window.removeEventListener("mechanic-profile-updated", callback);
  };
};

const getUserSnapshot = () => {
  if (typeof window === "undefined") return "";

  return window.localStorage.getItem("user") || "";
};

const getUserServerSnapshot = () => "";

const parseUser = (rawUser: string): LoggedInUser | null => {
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as LoggedInUser;
  } catch (error) {
    console.error("Failed to parse user:", error);
    return null;
  }
};

const syncLocalUser = (updatedUser: Partial<LoggedInUser>) => {
  const savedUser = window.localStorage.getItem("user");

  if (!savedUser) {
    window.localStorage.setItem("user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("user-updated"));
    return;
  }

  try {
    const parsedUser = JSON.parse(savedUser) as LoggedInUser;

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

  window.dispatchEvent(new Event("user-updated"));
};

const getInitial = (name?: string, email?: string) => {
  const value = name || email || "R";
  return value.charAt(0).toUpperCase();
};

const getRoleLabel = (role?: string) => {
  if (role === "customer") return "Customer";
  if (role === "mechanic") return "Mechanic";
  if (role === "super_admin") return "Super Admin";

  return "User";
};

const availabilityMeta: Record<
  MechanicAvailability,
  {
    label: string;
    icon: typeof CheckCircle2;
    wrapperClassName: string;
    iconWrapClassName: string;
    textClassName: string;
    glowClassName: string;
  }
> = {
  available: {
    label: "Available",
    icon: CheckCircle2,
    wrapperClassName:
      "border-green-500/30 bg-green-500/10 shadow-[0_0_24px_rgba(16,185,129,0.10)]",
    iconWrapClassName: "bg-green-500/15 text-green-300",
    textClassName: "text-green-300",
    glowClassName: "bg-green-400/20",
  },
  busy: {
    label: "Busy",
    icon: Wrench,
    wrapperClassName:
      "border-orange-500/30 bg-orange-500/10 shadow-[0_0_24px_rgba(249,115,22,0.10)]",
    iconWrapClassName: "bg-orange-500/15 text-orange-300",
    textClassName: "text-orange-300",
    glowClassName: "bg-orange-400/20",
  },
  off_duty: {
    label: "Off Duty",
    icon: Power,
    wrapperClassName:
      "border-red-500/30 bg-red-500/10 shadow-[0_0_24px_rgba(239,68,68,0.10)]",
    iconWrapClassName: "bg-red-500/15 text-red-300",
    textClassName: "text-red-300",
    glowClassName: "bg-red-400/20",
  },
};

export default function MechanicTopbar({ collapsed }: MechanicTopbarProps) {
  const rawUser = useSyncExternalStore(
    subscribeUser,
    getUserSnapshot,
    getUserServerSnapshot,
  );

  const user = parseUser(rawUser);

  const displayName = user?.name || getRoleLabel(user?.role);
  const displayEmail = user?.email || "-";
  const initial = getInitial(user?.name, user?.email);

  const availability = (user?.availability ||
    "off_duty") as MechanicAvailability;

  const meta = availabilityMeta[availability] || availabilityMeta.off_duty;
  const StatusIcon = meta.icon;

  const refreshProfile = useCallback(async () => {
    try {
      const result = await userService.getProfile();
      syncLocalUser(result.data);
    } catch (error) {
      console.error("TOPBAR_REFRESH_PROFILE_ERROR:", error);
    }
  }, []);

  useEffect(() => {
    const firstLoadTimer = window.setTimeout(() => {
      void refreshProfile();
    }, 0);

    const interval = window.setInterval(() => {
      void refreshProfile();
    }, 10000);

    const handleFocus = () => {
      void refreshProfile();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshProfile();
      }
    };

    const handleProfileUpdated = () => {
      void refreshProfile();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("mechanic-profile-updated", handleProfileUpdated);

    return () => {
      window.clearTimeout(firstLoadTimer);
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener(
        "mechanic-profile-updated",
        handleProfileUpdated,
      );
    };
  }, [refreshProfile]);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-40 h-20 border-b border-border bg-background/80 backdrop-blur-xl transition-all duration-300",
        collapsed ? "left-22" : "left-67.5",
      )}
    >
      <div className="h-full px-8 flex items-center justify-end gap-4">
        <div className="relative">
          <div
            className={cn(
              "absolute inset-0 rounded-2xl blur-xl opacity-70",
              meta.glowClassName,
            )}
          />

          <div
            className={cn(
              "relative h-12 rounded-2xl border px-4 flex items-center gap-3 backdrop-blur-xl transition-all",
              meta.wrapperClassName,
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center",
                meta.iconWrapClassName,
              )}
            >
              <StatusIcon size={17} />
            </div>

            <span className={cn("text-sm font-bold", meta.textClassName)}>
              {meta.label}
            </span>
          </div>
        </div>

        <NotificationDropdown />

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#522C14] text-white flex items-center justify-center font-semibold overflow-hidden">
            {user?.profile_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profile_image_url}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              initial
            )}
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-semibold text-white">{displayName}</p>
            <p className="text-xs text-muted-foreground">{displayEmail}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
