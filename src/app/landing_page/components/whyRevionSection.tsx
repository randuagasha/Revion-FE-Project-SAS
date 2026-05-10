"use client";

import { motion } from "framer-motion";
import { Zap, Radio, Star } from "lucide-react";

const highlights = [
  {
    icon: Zap,
    title: "Performance-Focused Workflow",
    description:
      "Revion is purpose-built for high-performance garages that demand speed, precision, and operational excellence in every service cycle.",
    metric: "3× faster",
    metricLabel: "job throughput vs traditional systems",
  },
  {
    icon: Radio,
    title: "Real-Time Service Tracking",
    description:
      "Every vehicle's journey through your garage is tracked in real time. Customers have full transparency, and your team never loses sight of progress.",
    metric: "100%",
    metricLabel: "service visibility for customers",
  },
  {
    icon: Star,
    title: "Premium Garage Experience",
    description:
      "Deliver a polished, professional service experience that matches the quality of vehicles you work on.",
    metric: "4.9★",
    metricLabel: "average customer satisfaction score",
  },
];

export function WhyRevionSection() {
  return (
    <section
      id="workflow"
      className="relative py-28 px-6 bg-[#181818] overflow-hidden"
    >
      {/* Carbon texture */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.3)_0px,rgba(0,0,0,0.3)_1px,transparent_1px,transparent_10px),repeating-linear-gradient(-45deg,rgba(0,0,0,0.3)_0px,rgba(0,0,0,0.3)_1px,transparent_1px,transparent_10px)]" />

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-64 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(82,44,20,0.12),transparent_70%)] blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-5 mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="uppercase tracking-[0.18em] text-xs text-[#e07b35] font-semibold"
          >
            Why Revion
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl text-[#F5F5F5] font-bold text-3xl md:text-5xl leading-tight tracking-tight"
          >
            Built for Modern Performance Garages
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl text-zinc-400 leading-relaxed"
          >
            Deliver a seamless automotive service experience with modern
            workflow management and real-time operational transparency.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {highlights.map((item, i) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group relative p-8 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-xl hover:-translate-y-1 hover:border-[#522C14]/50 hover:shadow-[0_24px_64px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col gap-6"
              >
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#522C14]/20 border border-[#522C14]/30">
                  <Icon size={20} className="text-[#e07b35]" />
                </div>

                {/* Content */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-[#F5F5F5] font-bold text-lg tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Metric */}
                <div className="pt-5 border-t border-white/10">
                  <div className="text-[#e07b35] text-2xl font-bold leading-none">
                    {item.metric}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {item.metricLabel}
                  </div>
                </div>

                {/* Glow */}
                <div className="absolute bottom-0 left-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_bottom_left,rgba(82,44,20,0.12),transparent_70%)]" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
