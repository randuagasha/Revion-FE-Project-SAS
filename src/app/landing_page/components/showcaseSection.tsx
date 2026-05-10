"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const serviceItems = [
  {
    code: "RV-2401",
    vehicle: "Porsche 911 GT3 RS",
    type: "Full Performance Service",
    date: "06 May 2026",
    status: "Complete",
    tech: "J. Harrison",
  },
  {
    code: "RV-2402",
    vehicle: "McLaren 720S Spider",
    type: "Brake System Overhaul",
    date: "06 May 2026",
    status: "In Progress",
    tech: "A. Marsh",
  },
  {
    code: "RV-2403",
    vehicle: "Ferrari F8 Tributo",
    type: "Engine Diagnostics",
    date: "06 May 2026",
    status: "In Progress",
    tech: "S. Cole",
  },
  {
    code: "RV-2404",
    vehicle: "Lamborghini Huracán",
    type: "Suspension Geometry",
    date: "07 May 2026",
    status: "Scheduled",
    tech: "R. Grant",
  },
  {
    code: "RV-2405",
    vehicle: "Aston Martin Vantage",
    type: "ECU Recalibration",
    date: "07 May 2026",
    status: "Scheduled",
    tech: "M. Patel",
  },
];

const statusStyle: Record<string, string> = {
  Complete: "bg-green-500/10 text-green-400 border-green-500/20",
  "In Progress": "bg-[#522C14]/20 text-orange-400 border-[#6B3818]/40",
  Scheduled: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export function ShowcaseSection() {
  return (
    <section id="showcase" className="relative py-28 px-6 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div className="flex flex-col gap-3">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="uppercase tracking-[0.18em] text-xs text-[#e07b35] font-semibold"
            >
              Showcase
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#F5F5F5] font-bold text-3xl md:text-5xl tracking-tight leading-tight"
            >
              Live Service Records
            </motion.h2>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-[#e07b35] text-sm font-semibold hover:gap-3 transition-all"
          >
            View all records
            <ArrowRight size={14} />
          </motion.button>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl overflow-hidden border border-white/10 bg-[#181818]"
        >
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#141414] border-b border-white/5 text-[11px] uppercase tracking-widest text-zinc-400 font-semibold">
            <div className="col-span-2">Service ID</div>
            <div className="col-span-2">Vehicle</div>
            <div className="col-span-2">Service Type</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Technician</div>
            <div className="col-span-2">Status</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/5">
            {serviceItems.map((item, i) => (
              <motion.div
                key={item.code}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors"
              >
                <div className="col-span-2 text-[#e07b35] text-sm font-semibold">
                  {item.code}
                </div>

                <div className="col-span-2 text-[#F5F5F5] text-sm font-semibold truncate">
                  {item.vehicle}
                </div>

                <div className="col-span-2 text-zinc-400 text-sm">
                  {item.type}
                </div>

                <div className="col-span-2 text-zinc-400 text-sm">
                  {item.date}
                </div>

                <div className="col-span-2 text-zinc-400 text-sm">
                  {item.tech}
                </div>

                <div className="col-span-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusStyle[item.status]}`}
                  >
                    {item.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
