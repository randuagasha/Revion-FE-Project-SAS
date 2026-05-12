"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { loginUser } from "@/services/auth.service";
import { Eye, EyeOff } from "lucide-react";

type UserRole = "customer" | "mechanic" | "super_admin";

interface LoginResponseUser {
  id?: number;
  name?: string;
  email?: string;
  role?: UserRole;
}

interface LoginResponse {
  success?: boolean;
  message?: string;
  token?: string;
  user?: LoginResponseUser;
  data?: {
    token?: string;
    user?: LoginResponseUser;
  };
}

interface JwtPayload {
  id?: number;
  user_id?: number;
  name?: string;
  email?: string;
  role?: UserRole;
  exp?: number;
  iat?: number;
}

const getTokenFromResponse = (response: LoginResponse) => {
  return response.token || response.data?.token || "";
};

const getUserFromResponse = (response: LoginResponse) => {
  return response.user || response.data?.user || null;
};

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const payload = token.split(".")[1];

    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");

    const decodedPayload = window.atob(normalizedPayload);

    return JSON.parse(decodedPayload) as JwtPayload;
  } catch (error) {
    console.error("Failed to decode token:", error);

    return null;
  }
};

const getDashboardPathByRole = (role?: string) => {
  if (role === "customer") {
    return "/customers/dashboard";
  }

  if (role === "mechanic") {
    return "/mechanics/dashboard";
  }

  if (role === "super_admin") {
    return "/admins/dashboard";
  }

  return "/auth/login";
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = (await loginUser({
        email,
        password,
      })) as LoginResponse;

      const token = getTokenFromResponse(response);

      if (!token) {
        throw new Error("Token tidak ditemukan dari response login");
      }

      const responseUser = getUserFromResponse(response);
      const decodedUser = decodeJwtPayload(token);

      const user = {
        id: responseUser?.id || decodedUser?.id || decodedUser?.user_id,
        name: responseUser?.name || decodedUser?.name || "",
        email: responseUser?.email || decodedUser?.email || email,
        role: responseUser?.role || decodedUser?.role,
      };

      if (!user.role) {
        throw new Error(
          "Role user tidak ditemukan. Pastikan backend login mengirim user.role atau token berisi role.",
        );
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);

      router.replace(getDashboardPathByRole(user.role));
    } catch (err: unknown) {
      console.error("Login failed:", err);

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

          <form onSubmit={handleLogin} className="space-y-5">
            {/* EMAIL */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Email</Label>

              <Input
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
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

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="h-11 bg-[#141414] border-zinc-800 text-white pr-10 focus-visible:ring-[#522C14]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-zinc-300 disabled:opacity-60"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#522C14] hover:bg-[#6B3818] text-white font-medium transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </Button>

            {/* GOOGLE */}
            <Button
              type="button"
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
          </form>
        </div>
      </div>
    </div>
  );
}
