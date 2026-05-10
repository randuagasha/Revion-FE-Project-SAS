"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { DashboardMockup } from "./dashboardMockup";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-start pt-32 pb-20 px-6 overflow-hidden bg-background text-foreground"
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(82,44,20,0.18)_0%,transparent_70%)]" />

      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 80%)",
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center text-center gap-8">
        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-4xl font-satoshi font-bold text-[clamp(2.6rem,5.5vw,4.5rem)] leading-tight tracking-tight"
        >
          Precision Service for{" "}
          <span className="bg-linear-to-r from-[#e07b35] to-[#c45a1a] bg-clip-text text-transparent">
            Drivers
          </span>{" "}
          Who Demand More
        </motion.h1>

        {/* SUBTITLE */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-2xl font-satoshi text-base text-[#A1A1AA] leading-relaxed"
        >
          Manage bookings, track service progress, and streamline your
          performance garage workflow <br />all in one modern platform.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-satoshi font-semibold bg-[#522C14] text-white hover:bg-[#6B3818] transition active:scale-95">
            Book Service
            <ArrowRight size={16} />
          </button>

          <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-satoshi font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition active:scale-95">
            <Play size={15} />
            Explore Dashboard
          </button>
        </motion.div>

        {/* TRUST */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-wrap gap-6 justify-center"
        >
          {[
            "200+ Garages",
            "12,000+ Bookings",
            "99.9% Uptime",
            "5-Star Rated",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-[#A1A1AA] text-xs"
            >
              <div className="w-1 h-1 rounded-full bg-[#522C14]" />
              {item}
            </div>
          ))}
        </motion.div>
      </div>

      {/* MOCKUP */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.5 }}
        className="relative z-10 w-full max-w-6xl mx-auto mt-14"
      >
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-[radial-gradient(ellipse,rgba(82,44,20,0.2)_0%,transparent_70%)] blur-2xl" />

        <DashboardMockup />

        <div className="absolute -bottom-1 left-0 right-0 h-20 bg-linear-to-b from-transparent to-background" />
      </motion.div>
    </section>
  );
}
