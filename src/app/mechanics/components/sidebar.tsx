"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  ClipboardList,
  CheckCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const menus = [
  {
    label: "Dashboard",
    href: "/mechanics/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Assigned Jobs",
    href: "/mechanics/bookings",
    icon: ClipboardList,
  },
  {
    label: "Completed Jobs",
    href: "/mechanics/completed",
    icon: CheckCircle,
  },
  {
    label: "Settings",
    href: "/mechanics/settings",
    icon: Settings,
  },
];

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

interface MechanicSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function MechanicSidebar({
  collapsed,
  onToggle,
}: MechanicSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    router.push("/auth/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen border-r border-border bg-card/40 backdrop-blur-xl flex flex-col transition-[width] duration-300 ease-in-out",
        collapsed ? "w-22" : "w-67.5",
      )}
    >
      {/* LOGO */}
      <div
        className={cn(
          "h-20 flex items-center border-b border-border transition-all duration-300",
          collapsed ? "justify-center px-3" : "px-7",
        )}
      >
        {collapsed ? (
          <div className="w-11 h-11 rounded-2xl bg-[#522C14] text-white flex items-center justify-center font-bold tracking-widest">
            R
          </div>
        ) : (
          <div>
            <h1 className="text-xl font-bold tracking-[0.25em] text-white">
              REVION
            </h1>

            <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
              Garage Management
            </p>
          </div>
        )}
      </div>

      {/* TOGGLE */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-4 top-24 w-8 h-8 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-white hover:bg-[#522C14] shadow-lg transition-all"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* MENUS */}
      <div className="flex-1 p-4 space-y-2">
        {menus.map((menu) => {
          const Icon = menu.icon;

          const active =
            pathname === menu.href || pathname.startsWith(`${menu.href}/`);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              title={collapsed ? menu.label : undefined}
              className={cn(
                "group relative flex items-center h-12 rounded-xl transition-all",
                collapsed ? "justify-center px-0" : "gap-3 px-4",
                active
                  ? "bg-[#522C14] text-white shadow-lg shadow-[#522C14]/20"
                  : "text-muted-foreground hover:bg-accent hover:text-white",
              )}
            >
              <Icon size={18} className="shrink-0" />

              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {menu.label}
                </span>
              )}

              {collapsed && (
                <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg bg-[#111111] border border-white/10 text-xs text-white whitespace-nowrap opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shadow-xl">
                  {menu.label}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-border">
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "group relative w-full h-12 rounded-xl border border-border flex items-center transition-all text-muted-foreground hover:bg-red-500/10 hover:text-red-400",
            collapsed ? "justify-center" : "justify-center gap-2",
          )}
        >
          <LogOut size={16} className="shrink-0" />

          {!collapsed && (
            <span className="text-sm whitespace-nowrap">Logout</span>
          )}

          {collapsed && (
            <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg bg-[#111111] border border-white/10 text-xs text-white whitespace-nowrap opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shadow-xl">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
