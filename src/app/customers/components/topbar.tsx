"use client";

import { Bell} from "lucide-react";

export default function CustomerTopbar() {
  return (
    <header className="h-20 border-b border-border px-8 flex items-center justify-between bg-background/70 backdrop-blur-xl">

      {/* RIGHT */}
      <div className="flex items-center gap-4 ml-235">
        <button className="w-11 h-11 rounded-xl border border-border flex items-center justify-center hover:bg-accent transition-all">
          <Bell size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#522C14] flex items-center justify-center text-sm font-bold">
            R
          </div>

          <div>
            <p className="text-sm font-semibold">Customer</p>

            <p className="text-xs text-muted-foreground">customer@revion.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}