"use client";

import { useEffect, useState } from "react";

import CustomerSidebar from "./components/sidebar";
import { Bell } from "lucide-react";

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const savedSidebarState = window.localStorage.getItem(
      "customer-sidebar-collapsed",
    );

    if (savedSidebarState !== null) {
      setCollapsed(savedSidebarState === "true");
    }

    const handleSidebarToggle = (event: Event) => {
      const customEvent = event as CustomEvent<{ collapsed: boolean }>;

      setCollapsed(customEvent.detail.collapsed);
    };

    window.addEventListener("customer-sidebar-toggle", handleSidebarToggle);

    return () => {
      window.removeEventListener(
        "customer-sidebar-toggle",
        handleSidebarToggle,
      );
    };
  }, []);

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
              R
            </div>

            <div className="hidden md:block">
              <p className="text-sm font-semibold">Customer</p>
              <p className="text-xs text-muted-foreground">
                customer@revion.com
              </p>
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
