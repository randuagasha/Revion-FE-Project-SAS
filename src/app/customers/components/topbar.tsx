"use client";

import { useSyncExternalStore } from "react";
import { Bell } from "lucide-react";

interface LoggedInUser {
  id?: number;
  name?: string;
  email?: string;
  role?: "customer" | "mechanic" | "super_admin";
}

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("user-updated", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("user-updated", callback);
  };
};

const getSnapshot = () => {
  if (typeof window === "undefined") return "";

  return window.localStorage.getItem("user") || "";
};

const getServerSnapshot = () => "";

const parseUser = (rawUser: string): LoggedInUser | null => {
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as LoggedInUser;
  } catch (error) {
    console.error("Failed to parse user:", error);
    return null;
  }
};

const getRoleLabel = (role?: string) => {
  if (role === "customer") return "Customer";
  if (role === "mechanic") return "Mechanic";
  if (role === "super_admin") return "Super Admin";

  return "User";
};

const getInitial = (name?: string, email?: string) => {
  const value = name || email || "R";

  return value.charAt(0).toUpperCase();
};

export default function CustomerTopbar() {
  const rawUser = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const user = parseUser(rawUser);

  const displayName = user?.name || getRoleLabel(user?.role);
  const displayEmail = user?.email || "-";
  const initial = getInitial(user?.name, user?.email);

  return (
    <header className="h-20 border-b border-border px-8 flex items-center justify-between bg-background/70 backdrop-blur-xl">
      <div />

      <div className="flex items-center gap-4">
        <button className="w-11 h-11 rounded-xl border border-border flex items-center justify-center hover:bg-accent transition-all">
          <Bell size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#522C14] flex items-center justify-center text-sm font-bold text-white">
            {initial}
          </div>

          <div>
            <p className="text-sm font-semibold">{displayName}</p>
            <p className="text-xs text-muted-foreground">{displayEmail}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
