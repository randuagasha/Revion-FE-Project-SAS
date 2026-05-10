"use client";

export function Footer() {
  const links = {
    Product: ["Features", "Workflow", "Analytics", "Pricing"],
    Company: ["About", "Careers", "Press", "Contact"],
    Legal: ["Privacy", "Terms", "Security", "Cookies"],
  };

  return (
    <footer className="relative pt-16 pb-10 px-6 bg-[#0A0A0A] border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          {/* BRAND */}
          <div className="col-span-2 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#522C14]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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

              <span className="text-[#F5F5F5] font-bold tracking-[0.25em] text-sm">
                REVION
              </span>
            </div>

            <p className="max-w-xs text-sm text-zinc-400 leading-relaxed">
              The modern performance garage management platform. Built for
              precision. Designed for excellence.
            </p>

            {/* SOCIAL ICONS (SAFE SVG ONLY) */}
            <div className="flex items-center gap-3">
              {/* X */}
              <a className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-[#522C14]/20 transition">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.9 2H22l-6.8 7.8L23 22h-6.7l-5.3-6.9L4.8 22H2l7.3-8.4L1 2h6.8l4.8 6.3L18.9 2z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-[#522C14]/20 transition">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v16H0V8zm7.5 0H12v2.2h.1C12.9 9.5 14.6 8 17 8c5 0 5.9 3.3 5.9 7.6V24h-5v-7.5c0-1.8 0-4.2-2.6-4.2s-3 2-3 4V24h-5V8z" />
                </svg>
              </a>

              {/* Instagram */}
              <a className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-[#522C14]/20 transition">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <path d="M16 11.37a4 4 0 1 1-7.9 1.26" />
                  <circle cx="17.5" cy="6.5" r="1.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* LINKS */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category} className="flex flex-col gap-4">
              <div className="text-xs font-bold uppercase tracking-widest text-white">
                {category}
              </div>

              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-sm text-zinc-400 hover:text-white transition"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <span className="text-xs text-zinc-400">
            © 2026 Revion Technologies Ltd. All rights reserved.
          </span>
          <span className="text-xs text-zinc-400">
            Performance Garage Management Platform
          </span>
        </div>
      </div>
    </footer>
  );
}
