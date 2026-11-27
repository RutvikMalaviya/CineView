"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Loader2, Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { useUserStore } from "@/store/useUserStore";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export function AuthView() {
  const router = useRouter();
  const { login, register: registerUser } = useUserStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setErrorMsg(null);
    try {
      const user = await login(values.email, values.password);
      if (user.role === "CINEMA_ADMIN" || user.role === "SUPER_ADMIN") {
        router.push("/admin");
      } else {
        router.push("/profile");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Sign in failed");
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setErrorMsg(null);
    try {
      await registerUser(values);
      router.push("/profile");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="rounded-[8px] border border-white/10 bg-[#13151B] p-6 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#A78BFA] text-[#0B0C10]">
            <Eye className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              {mode === "login" ? "Sign In to CineView" : "Create Account"}
            </h1>
            <p className="text-xs text-[#94A3B8]">
              Session-authenticated bookings, tickets &amp; saved cinemas
            </p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-[4px] bg-[#0B0C10] p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
            }}
            className={`rounded-[4px] py-2 text-xs font-semibold transition-colors ${
              mode === "login" ? "bg-[#A78BFA] text-[#0B0C10]" : "text-[#94A3B8] hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg(null);
            }}
            className={`rounded-[4px] py-2 text-xs font-semibold transition-colors ${
              mode === "register"
                ? "bg-[#A78BFA] text-[#0B0C10]"
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg ? (
          <div className="mb-4 rounded-[4px] border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {errorMsg}
          </div>
        ) : null}

        {mode === "login" ? (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                <input
                  type="email"
                  {...loginForm.register("email")}
                  placeholder="alex.rivera@cineview.app"
                  className="w-full rounded-[4px] border border-white/10 bg-[#0B0C10] py-2 pl-9 pr-3 text-sm text-white focus:border-[#A78BFA] focus:outline-none"
                />
              </div>
              {loginForm.formState.errors.email ? (
                <p className="mt-1 text-xs text-red-400">
                  {loginForm.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                <input
                  type="password"
                  {...loginForm.register("password")}
                  placeholder="••••••••"
                  className="w-full rounded-[4px] border border-white/10 bg-[#0B0C10] py-2 pl-9 pr-3 text-sm text-white focus:border-[#A78BFA] focus:outline-none"
                />
              </div>
              {loginForm.formState.errors.password ? (
                <p className="mt-1 text-xs text-red-400">
                  {loginForm.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              disabled={loginForm.formState.isSubmitting}
              className="w-full justify-center"
            >
              {loginForm.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="border-t border-white/10 pt-3">
              <p className="mb-2 text-[11px] uppercase tracking-wider text-[#64748B]">
                Seeded Demo Credentials
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    loginForm.setValue("email", "alex.rivera@cineview.app");
                    loginForm.setValue("password", "DemoUser123!");
                  }}
                  className="rounded-[4px] border border-white/10 bg-[#1A1B20] px-2 py-1.5 text-[11px] font-medium text-[#CEBDFF] hover:border-[#A78BFA]/50"
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    loginForm.setValue("email", "cinema.admin@cineview.app");
                    loginForm.setValue("password", "CinemaAdmin123!");
                  }}
                  className="rounded-[4px] border border-white/10 bg-[#1A1B20] px-2 py-1.5 text-[11px] font-medium text-[#FFB95F] hover:border-[#F59E0B]/50"
                >
                  Cinema Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    loginForm.setValue("email", "admin@cineview.app");
                    loginForm.setValue("password", "AdminUser123!");
                  }}
                  className="rounded-[4px] border border-white/10 bg-[#1A1B20] px-2 py-1.5 text-[11px] font-medium text-[#4CD7F6] hover:border-[#06B6D4]/50"
                >
                  Super Admin
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                <input
                  type="text"
                  {...registerForm.register("name")}
                  placeholder="Alex Rivera"
                  className="w-full rounded-[4px] border border-white/10 bg-[#0B0C10] py-2 pl-9 pr-3 text-sm text-white focus:border-[#A78BFA] focus:outline-none"
                />
              </div>
              {registerForm.formState.errors.name ? (
                <p className="mt-1 text-xs text-red-400">
                  {registerForm.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                <input
                  type="email"
                  {...registerForm.register("email")}
                  placeholder="you@example.com"
                  className="w-full rounded-[4px] border border-white/10 bg-[#0B0C10] py-2 pl-9 pr-3 text-sm text-white focus:border-[#A78BFA] focus:outline-none"
                />
              </div>
              {registerForm.formState.errors.email ? (
                <p className="mt-1 text-xs text-red-400">
                  {registerForm.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#64748B]" />
                <input
                  type="password"
                  {...registerForm.register("password")}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-[4px] border border-white/10 bg-[#0B0C10] py-2 pl-9 pr-3 text-sm text-white focus:border-[#A78BFA] focus:outline-none"
                />
              </div>
              {registerForm.formState.errors.password ? (
                <p className="mt-1 text-xs text-red-400">
                  {registerForm.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              disabled={registerForm.formState.isSubmitting}
              className="w-full justify-center"
            >
              {registerForm.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
