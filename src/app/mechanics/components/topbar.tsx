"use client";

import { Bell } from "lucide-react";

const cn = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

interface MechanicTopbarProps {
  collapsed: boolean;
}

export default function MechanicTopbar({ collapsed }: MechanicTopbarProps) {
  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-40 h-20 border-b border-border px-8 flex items-center justify-between bg-background/80 backdrop-blur-xl transition-all duration-300",
        collapsed ? "left-22" : "left-67.5",
      )}
    >
      <div />

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <button className="w-11 h-11 rounded-xl border border-border flex items-center justify-center hover:bg-accent transition-all">
          <Bell size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#522C14] flex items-center justify-center text-sm font-bold text-white">
            M
          </div>

          <div>
            <p className="text-sm font-semibold">Mechanic</p>

            <p className="text-xs text-muted-foreground">mechanic@revion.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
