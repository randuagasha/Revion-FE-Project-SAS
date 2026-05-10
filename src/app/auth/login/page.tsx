"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { loginUser } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await loginUser({
        email,
        password,
      });

      localStorage.setItem("token", res.token);

      router.push("/customers/dashboard");
    } catch (err: unknown) {
      console.error(err);

      setError("Invalid email or password");
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
            Premium automotive garage management platform built for modern
            workshops and high-performance service operations.
          </p>

          <div className="mt-10 w-40 h-1 bg-[#522C14] mx-auto rounded-full" />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-white mb-2">
              Welcome Back
            </h2>

            <p className="text-zinc-500 text-sm">
              Login to access your garage dashboard
            </p>
          </div>

          <div className="space-y-5">
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
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Password</Label>

                <button
                  type="button"
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition"
                >
                  Forgot password?
                </button>
              </div>

              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-[#141414] border-zinc-800 text-white focus-visible:ring-[#522C14]"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-11 bg-[#522C14] hover:bg-[#6B3818] text-white font-medium transition"
            >
              {loading ? "Signing in..." : "Login"}
            </Button>

            {/* GOOGLE */}
            <Button
              variant="outline"
              className="w-full h-11 border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-white"
            >
              Continue with Google
            </Button>

            {/* REGISTER */}
            <p className="text-sm text-zinc-500 text-center pt-2">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="text-[#C2692A] hover:text-[#d17b3f] transition"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}