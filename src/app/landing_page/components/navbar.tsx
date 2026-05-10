"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Workflow", href: "#workflow" },
    { label: "Garage", href: "#garage" },
    { label: "Showcase", href: "#showcase" },
    { label: "About", href: "#about" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(10,10,10,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="#" className="flex items-center gap-3 group">
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
            <span className="tracking-[0.25em] uppercase text-[#F5F5F5] font-bold">
              REVION
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Login
            </Link>

            <button className="px-5 py-2.5 rounded-lg bg-[#522C14] text-[#F5F5F5] text-sm font-semibold hover:bg-[#6B3818] transition active:scale-95">
              Book Service
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-[#F5F5F5]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-6 flex flex-col gap-5 border-t border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-zinc-400 hover:text-zinc-100"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex flex-col gap-3 pt-2">
              <Link href="/login" className="text-zinc-400">
                Login
              </Link>

              <button className="px-5 py-2.5 rounded-lg bg-[#522C14] text-[#F5F5F5]">
                Book Service
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
