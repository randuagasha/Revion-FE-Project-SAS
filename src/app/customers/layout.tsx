"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import {
  LayoutDashboard,
  CalendarDays,
  Car,
  Settings,
  Wrench,
  Bell,
  Search,
  ChevronDown,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
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
    label: "My Garage",
    href: "/customers/my-garage",
    icon: Car,
  },
  {
    label: "Services",
    href: "/customers/services",
    icon: Wrench,
  },
  {
    label: "Settings",
    href: "/customers/settings",
    icon: Settings,
  },
];

export default function CustomersLayout({ children }: LayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      {/* SIDEBAR */}
      <aside className="w-67.5 border-r border-border bg-card/40 backdrop-blur-xl flex flex-col">
        {/* LOGO */}
        <div className="h-20 border-b border-border flex items-center px-7">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#522C14] flex items-center justify-center shadow-lg shadow-[#522C14]/20">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 3h7c2.2 0 4 1.8 4 4s-1.8 4-4 4H2V3z"
                  fill="#F5F5F5"
                />
                <rect
                  x="2"
                  y="9"
                  width="6"
                  height="4"
                  rx="1"
                  fill="#F5F5F5"
                  opacity="0.5"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-[15px] font-bold tracking-[0.22em]">
                REVION
              </h1>

              <p className="text-[11px] text-muted-foreground mt-0.5">
                Garage System
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 px-4 py-6">
          <div className="mb-4 px-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Main Navigation
            </p>
          </div>

          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3
                    h-12 px-4 rounded-2xl
                    transition-all duration-200
                    border
                    ${
                      active
                        ? "bg-[#522C1418] border-[#522C1450] text-[#C2692A]"
                        : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                    }
                  `}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.3 : 2}
                    className={
                      active ? "text-[#C2692A]" : "text-muted-foreground"
                    }
                  />

                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* USER PROFILE */}
        <div className="border-t border-border p-4">
          <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-accent transition">
            <div className="w-11 h-11 rounded-xl bg-[#522C14] flex items-center justify-center text-sm font-bold text-white">
              R
            </div>

            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Rans Skuyy</p>

              <p className="text-xs text-muted-foreground">Customer Account</p>
            </div>

            <ChevronDown size={16} className="text-muted-foreground" />
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <header className="h-20 border-b border-border bg-background/70 backdrop-blur-xl px-8 flex items-center justify-between">
          {/* SEARCH */}
          <div className="w-full max-w-md">
            <div className="h-11 rounded-2xl border border-border bg-card flex items-center gap-3 px-4">
              <Search size={16} className="text-muted-foreground" />

              <input
                type="text"
                placeholder="Search bookings, vehicles..."
                className="bg-transparent outline-none border-none flex-1 text-sm placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <button className="w-11 h-11 rounded-2xl border border-border bg-card hover:bg-accent transition flex items-center justify-center">
              <Bell size={17} />
            </button>

            <div className="w-px h-6 bg-border" />

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">Rans Skuyy</p>

                <p className="text-xs text-muted-foreground">
                  Premium Customer
                </p>
              </div>

              <div className="w-11 h-11 rounded-2xl bg-[#522C14] flex items-center justify-center text-sm font-bold text-white">
                R
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
