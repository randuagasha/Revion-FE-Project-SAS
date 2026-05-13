"use client";

import { useSyncExternalStore } from "react";

import CustomerSidebar from "./components/sidebar";
import { Bell } from "lucide-react";

interface LoggedInUser {
  id?: number;
  name?: string;
  email?: string;
  role?: "customer" | "mechanic" | "super_admin";
}

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

// =========================
// SUBSCRIBE SIDEBAR STATE
// =========================
const subscribeSidebar = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("customer-sidebar-toggle", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("customer-sidebar-toggle", callback);
  };
};

const getSidebarSnapshot = () => {
  if (typeof window === "undefined") return "false";

  return window.localStorage.getItem("customer-sidebar-collapsed") || "false";
};

const getSidebarServerSnapshot = () => "false";

// =========================
// SUBSCRIBE USER STATE
// =========================
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

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarRaw = useSyncExternalStore(
    subscribeSidebar,
    getSidebarSnapshot,
    getSidebarServerSnapshot,
  );

  const rawUser = useSyncExternalStore(
    subscribeUser,
    getUserSnapshot,
    getUserServerSnapshot,
  );

  const collapsed = sidebarRaw === "true";
  const user = parseUser(rawUser);

  const displayName = user?.name || getRoleLabel(user?.role);
  const displayEmail = user?.email || "-";
  const initial = getInitial(user?.name, user?.email);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CustomerSidebar />

      {/* TOPBAR */}
      <header
        className={cn(
          "fixed top-0 right-0 z-40 h-20 border-b border-border bg-background/80 backdrop-blur-xl transition-all duration-300",
          collapsed ? "left-22" : "left-67.5",
        )}
      >
        <div className="h-full px-8 flex items-center justify-end gap-4">
          <button className="w-11 h-11 rounded-2xl border border-border hover:bg-accent transition flex items-center justify-center">
            <Bell size={17} />
          </button>

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

      {/* CONTENT */}
      <main
        className={cn(
          "min-h-screen pt-20 transition-all duration-300",
          collapsed ? "ml-22" : "ml-67.5",
        )}
      >
        <div className="w-full px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
