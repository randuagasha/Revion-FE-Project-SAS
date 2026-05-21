"use client";

import { useState } from "react";

import MechanicSidebar from "./components/sidebar";
import MechanicTopbar from "./components/topbar";

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

const SIDEBAR_STORAGE_KEY = "mechanic-sidebar-collapsed";

const getInitialSidebarState = () => {
  if (typeof window === "undefined") return false;

  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
};

export default function MechanicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState<boolean>(getInitialSidebarState);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const nextValue = !prev;

      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextValue));

      return nextValue;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MechanicSidebar collapsed={collapsed} onToggle={toggleSidebar} />

      <MechanicTopbar collapsed={collapsed} />

      <main
        className={cn(
          "pt-20 min-h-screen transition-all duration-300",
          collapsed ? "ml-22" : "ml-67.5",
        )}
      >
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
