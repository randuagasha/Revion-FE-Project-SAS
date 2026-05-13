"use client";

import { useEffect, useState } from "react";

import SuperAdminSidebar from "./components/sidebar";
import SuperAdminTopbar from "./components/topbar";

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const savedSidebarState = window.localStorage.getItem(
      "super-admin-sidebar-collapsed",
    );

    if (savedSidebarState !== null) {
      setCollapsed(savedSidebarState === "true");
    }
  }, []);

  const handleToggleSidebar = () => {
    setCollapsed((prev) => {
      const nextValue = !prev;

      window.localStorage.setItem(
        "super-admin-sidebar-collapsed",
        String(nextValue),
      );

      return nextValue;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SuperAdminSidebar collapsed={collapsed} onToggle={handleToggleSidebar} />

      <SuperAdminTopbar collapsed={collapsed} />

      <main
        className={cn(
          "min-h-screen pt-20 transition-all duration-300",
          collapsed ? "pl-22" : "pl-67.5",
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
