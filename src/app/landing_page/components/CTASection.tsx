"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative py-28 px-6 bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden p-10 md:p-16 flex flex-col items-center text-center gap-8 bg-linear-to-br from-[#181818] via-[#1a1210] to-[#181818] border border-[#522C14]/30"
        >
          {/* Glow */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(82,44,20,0.15),transparent_70%)]" />

          {/* Carbon texture */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.015)_0px,rgba(255,255,255,0.015)_1px,transparent_1px,transparent_12px),repeating-linear-gradient(-45deg,rgba(255,255,255,0.015)_0px,rgba(255,255,255,0.015)_1px,transparent_1px,transparent_12px)]" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <span className="uppercase tracking-[0.18em] text-xs font-semibold text-[#e07b35]">
              Get Started Today
            </span>

            <h2 className="max-w-2xl text-[#F5F5F5] font-bold text-3xl md:text-5xl leading-tight tracking-tight">
              Ready to Elevate Your Garage Operations?
            </h2>

            <p className="max-w-xl text-zinc-400 leading-relaxed">
              Join 200+ performance garages already running on Revion. Start
              your free trial today — no credit card required.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <button className="flex items-center gap-2 px-8 py-4 rounded-xl bg-[#522C14] text-[#F5F5F5] font-semibold text-sm hover:bg-[#6B3818] hover:shadow-[0_12px_32px_rgba(82,44,20,0.5)] transition active:scale-95">
                Book Service
                <ArrowRight size={16} />
              </button>

              <button className="px-8 py-4 rounded-xl bg-white/5 text-[#F5F5F5] border border-white/10 font-semibold text-sm hover:bg-white/10 transition active:scale-95">
                Request a Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
