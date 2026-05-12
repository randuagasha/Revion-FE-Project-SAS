"use client";

import { useEffect, useState } from "react";

import MechanicSidebar from "./components/sidebar";
import MechanicTopbar from "./components/topbar";

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

export default function MechanicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const savedSidebarState = localStorage.getItem(
      "mechanic-sidebar-collapsed",
    );

    if (savedSidebarState !== null) {
      setCollapsed(savedSidebarState === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const nextValue = !collapsed;

    setCollapsed(nextValue);

    localStorage.setItem("mechanic-sidebar-collapsed", String(nextValue));
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
