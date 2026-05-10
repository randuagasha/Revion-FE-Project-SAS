"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "200+", label: "Garages Onboarded" },
  { value: "12,000+", label: "Services Completed" },
  { value: "£4.8M+", label: "Revenue Managed" },
  { value: "99.9%", label: "Platform Uptime" },
];

export function StatsSection() {
  return (
    <section className="relative py-20 px-6 bg-[#0A0A0A]">
      {/* Divider */}
      <div className="max-w-7xl mx-auto border-t border-white/10" />

      <div className="max-w-7xl mx-auto pt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="text-[#F5F5F5] font-bold leading-none tracking-tight text-3xl md:text-5xl">
                {stat.value}
              </div>

              <div className="text-sm text-zinc-400">{stat.label}</div>

              {/* Accent line */}
              <div className="w-8 h-0.5 rounded-full mt-1 bg-[#522C14]" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
