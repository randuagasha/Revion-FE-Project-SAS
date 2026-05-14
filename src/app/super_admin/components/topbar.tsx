"use client";

import { useSyncExternalStore } from "react";
import NotificationDropdown from "@/components/layout/notification-dropdown";

interface LoggedInUser {
  id?: number;
  name?: string;
  email?: string;
  role?: "customer" | "mechanic" | "super_admin";
}

interface CustomerTopbarProps {
  collapsed: boolean;
}

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

// SUBSCRIBE USER STATE
const subscribeUser = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("user-updated", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("user-updated", callback);
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

export default function CustomerTopbar({ collapsed }: CustomerTopbarProps) {
  const rawUser = useSyncExternalStore(
    subscribeUser,
    getUserSnapshot,
    getUserServerSnapshot,
  );

  const user = parseUser(rawUser);

  const displayName = user?.name || getRoleLabel(user?.role);
  const displayEmail = user?.email || "-";
  const initial = getInitial(user?.name, user?.email);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-40 h-20 border-b border-border bg-background/80 backdrop-blur-xl transition-all duration-300",
        collapsed ? "left-22" : "left-67.5",
      )}
    >
      <div className="h-full px-8 flex items-center justify-end gap-4">
        <NotificationDropdown />

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#522C14] text-white flex items-center justify-center font-semibold">
            {initial}
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-semibold">{displayName}</p>
            <p className="text-xs text-muted-foreground">{displayEmail}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
