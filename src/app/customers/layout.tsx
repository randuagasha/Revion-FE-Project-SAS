"use client";

import { useSyncExternalStore } from "react";

import RevBotFloating from "@/components/revbot/revbot-floating";

import CustomerSidebar from "./components/sidebar";
import CustomerTopbar from "./components/topbar";

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

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

  const collapsed = sidebarRaw === "true";

  const handleToggleSidebar = () => {
    const nextValue = !collapsed;

    window.localStorage.setItem(
      "customer-sidebar-collapsed",
      String(nextValue),
    );

    window.dispatchEvent(new Event("customer-sidebar-toggle"));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CustomerSidebar collapsed={collapsed} onToggle={handleToggleSidebar} />

      <CustomerTopbar collapsed={collapsed} />

      <main
        className={cn(
          "min-h-screen pt-20 transition-all duration-300",
          collapsed ? "ml-22" : "ml-67.5",
        )}
      >
        <div className="w-full px-8 py-8">{children}</div>
      </main>

      <RevBotFloating />
    </div>
  );
}
