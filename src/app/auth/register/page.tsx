"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { registerUser } from "@/services/auth.service";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError("");

      await registerUser({
        name,
        email,
        password,
      });

      router.push("/auth/login");
    } catch (err: unknown) {
      console.error(err);

      setError("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0A0A0A]">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center bg-[#0F0F0F] border-r border-zinc-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, transparent 2px, transparent 10px)",
          }}
        />

        <div className="absolute w-125 h-125 bg-[#522C14]/20 blur-3xl rounded-full" />

        <div className="relative text-center px-10">
          <h1 className="text-5xl font-bold tracking-[0.35em] text-[#F5F5F5]">
            REVION
          </h1>

          <p className="text-zinc-500 mt-4 text-sm leading-relaxed max-w-sm mx-auto">
            Create your account and manage bookings, vehicles, tickets, and
            premium workshop operations in one platform.
          </p>

          <div className="mt-10 w-40 h-1 bg-[#522C14] mx-auto rounded-full" />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-white mb-2">
              Create Account
            </h2>

            <p className="text-zinc-500 text-sm">
              Register your garage dashboard access
            </p>
          </div>

          <div className="space-y-5">
            {/* NAME */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Full Name</Label>

              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 bg-[#141414] border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-[#522C14]"
              />
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Email</Label>

              <Input
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-[#141414] border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-[#522C14]"
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Password</Label>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-[#141414] border-zinc-800 text-white pr-10 focus-visible:ring-[#522C14]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-zinc-300 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Confirm Password</Label>

              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 bg-[#141414] border-zinc-800 text-white pr-10 focus-visible:ring-[#522C14]"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-zinc-300 transition"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* REGISTER BUTTON */}
            <Button
              onClick={handleRegister}
              disabled={loading}
              className="w-full h-11 bg-[#522C14] hover:bg-[#6B3818] text-white font-medium transition"
            >
              {loading ? "Creating account..." : "Register"}
            </Button>

            {/* LOGIN */}
            <p className="text-sm text-zinc-500 text-center pt-2">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-[#C2692A] hover:text-[#d17b3f] transition"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
