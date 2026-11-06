"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SolarSaathiLogo } from "@/components/SolarSaathiLogo";

function getPostLoginDestination(search: string, role?: string) {
  const requestedPath = new URLSearchParams(search).get("next");
  const routePath = requestedPath?.split(/[?#]/, 1)[0];
  const authRoutes = ["/login", "/signup", "/forgot-password"];
  const safeRequestedPath = requestedPath?.startsWith("/")
    && !requestedPath.startsWith("//")
    && routePath
    && !authRoutes.includes(routePath)
    ? requestedPath
    : null;
  return safeRequestedPath || (role === "HOMEOWNER" ? "/" : "/admin");
}

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const checkedInitialSession = useRef(false);

  useEffect(() => {
    if (isLoading || checkedInitialSession.current) return;
    checkedInitialSession.current = true;
    if (user) router.replace(getPostLoginDestination(window.location.search, user.role));
  }, [isLoading, router, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    const message = await login(email, password);
    setIsSubmitting(false);
    if (message) {
      setError(message);
      return;
    }
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    const data = await response.json();
    router.push(getPostLoginDestination(window.location.search, data.user?.role));
  };

  if (isLoading || user) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
        <p role="status" className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {isLoading ? "Checking your account…" : "You’re already signed in. Redirecting…"}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-8">
      <div className="mx-auto grid min-h-[680px] max-w-5xl overflow-hidden rounded-[30px] bg-white shadow-2xl dark:bg-slate-900 lg:grid-cols-2">
        <section className="relative flex min-h-72 flex-col justify-between overflow-hidden bg-[#123D2B] p-8 text-white sm:p-12">
          <Image src="/images/hero-solar-rooftop.jpg" alt="Solar panels on a rooftop" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#092016] via-[#123D2B]/40 to-transparent" />
          <div className="relative z-10">
            <SolarSaathiLogo size="lg" inverse withName />
            <p className="mt-3 max-w-sm text-sm text-emerald-50">Sign in to view your solar estimate or workspace.</p>
          </div>
          <div className="relative z-10 grid grid-cols-3 gap-2 text-xs text-white/90">
            <div className="rounded-xl border border-white/20 bg-black/20 p-3">Enquiry</div>
            <div className="rounded-xl border border-white/20 bg-black/20 p-3">Estimate</div>
            <div className="rounded-xl border border-white/20 bg-black/20 p-3">Updates</div>
          </div>
        </section>

        <section className="flex items-center p-6 sm:p-12">
          <div className="mx-auto w-full max-w-md space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Sign in</h2>
              <p className="mt-2 text-sm text-slate-500">Use your account email and password.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email
                <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              </label>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password
                <span className="relative mt-1.5 block">
                  <input type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-3 text-slate-500">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                </span>
              </label>
              <div className="-mt-2 flex justify-end"><Link href="/forgot-password" className="text-xs font-semibold text-emerald-700 hover:underline">Forgot password?</Link></div>
              <button disabled={isSubmitting} className="w-full rounded-full bg-[#174b32] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#216642] disabled:opacity-60">{isSubmitting ? "Signing in…" : "Sign in"}</button>
            </form>
            <p className="text-center text-sm text-slate-500">New to SolarSaathi? <Link href="/signup" className="font-semibold text-emerald-700 hover:underline">Create an account</Link></p>
            <p className="text-center text-xs text-slate-400"><Link href="/" className="hover:underline">Return to home</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}
