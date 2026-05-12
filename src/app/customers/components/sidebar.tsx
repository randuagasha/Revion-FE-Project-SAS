"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  CalendarDays,
  Car,
  Wrench,
  Ticket,
  Settings,
  LogOut,
} from "lucide-react";

const menus = [
  {
    label: "Dashboard",
    href: "/customers/dashboard",
    icon: LayoutDashboard,
  },

  {
    label: "Bookings",
    href: "/customers/bookings",
    icon: CalendarDays,
  },

  {
    label: "Vehicles",
    href: "/customers/vehicles",
    icon: Car,
  },

  {
    label: "Services",
    href: "/customers/services",
    icon: Wrench,
  },

  {
    label: "Tickets",
    href: "/customers/tickets",
    icon: Ticket,
  },

  {
    label: "Settings",
    href: "/customers/settings",
    icon: Settings,
  },
];

export default function CustomerSidebar() {
  const pathname = usePathname();

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");

    router.push("/auth/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-50 w-67.5 h-screen border-r border-border bg-card/40 backdrop-blur-xl flex flex-col">
      {/* LOGO */}
      <div className="h-20 flex items-center px-7 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-[0.25em] text-white">
            REVION
          </h1>

          <p className="text-xs text-muted-foreground mt-1">
            Garage Management
          </p>
        </div>
      </div>

      {/* MENUS */}
      <div className="flex-1 p-4 space-y-2">
        {menus.map((menu) => {
          const Icon = menu.icon;

          const active = pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`
                flex items-center gap-3 h-12 px-4 rounded-xl transition-all
                ${
                  active
                    ? "bg-[#522C14] text-white"
                    : "text-muted-foreground hover:bg-accent hover:text-white"
                }
              `}
            >
              <Icon size={18} />

              <span className="text-sm font-medium">{menu.label}</span>
            </Link>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full h-12 rounded-xl border border-border flex items-center justify-center gap-2 text-sm text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
