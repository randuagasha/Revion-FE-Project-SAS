"use client";

import { motion } from "framer-motion";
import { CalendarCheck, Activity, LayoutGrid, BarChart2 } from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Smart Service Booking",
    description:
      "Streamlined appointment scheduling with intelligent time-slot management, vehicle prioritisation, and automated customer confirmations.",
    detail: "Multi-bay scheduling · Customer portal · Automated reminders",
  },
  {
    icon: Activity,
    title: "Real-Time Progress Tracking",
    description:
      "Live service status updates for every vehicle in your garage. Customers stay informed, your team stays coordinated.",
    detail: "Live bay status · SMS/Email updates · Progress milestones",
  },
  {
    icon: LayoutGrid,
    title: "Garage Management",
    description:
      "Full operational oversight from a single dashboard. Manage technicians, bays, parts inventory, and job assignments effortlessly.",
    detail: "Bay allocation · Staff management · Parts tracking",
  },
  {
    icon: BarChart2,
    title: "Performance Analytics",
    description:
      "Data-driven insights into revenue, throughput, turnaround times, and customer satisfaction metrics.",
    detail: "Revenue reports · KPI dashboards · Efficiency metrics",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 px-6 bg-[#0A0A0A]">
      {/* Carbon texture */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.012)_0px,rgba(255,255,255,0.012)_1px,transparent_1px,transparent_12px),repeating-linear-gradient(-45deg,rgba(255,255,255,0.012)_0px,rgba(255,255,255,0.012)_1px,transparent_1px,transparent_12px)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-5 mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="uppercase tracking-[0.18em] text-xs text-[#e07b35] font-semibold"
          >
            Workflow Experience
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl text-[#F5F5F5] font-bold leading-tight text-3xl md:text-5xl tracking-tight"
          >
            Everything Your Garage Needs — In One Platform
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl text-zinc-400 leading-relaxed"
          >
            Built to simplify service management, improve workflow efficiency,
            and deliver a premium experience for every customer.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-8 rounded-3xl bg-[#181818] border border-white/5 hover:border-[#522C14]/40 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-[#522C14]/20 border border-[#522C14]/30">
                  <Icon size={22} className="text-[#e07b35]" />
                </div>

                {/* Title */}
                <h3 className="text-[#F5F5F5] text-lg font-bold mb-3 tracking-tight">
                  {feature.title}
                </h3>

                {/* Desc */}
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {feature.detail.split(" · ").map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-[11px] rounded-full bg-white/5 border border-white/10 text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* glow */}
                <div className="absolute top-0 right-0 w-24 h-24 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_top_right,rgba(82,44,20,0.15),transparent_70%)]" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
