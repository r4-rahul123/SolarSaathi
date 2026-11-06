"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SolarSaathiLogo } from "@/components/SolarSaathiLogo";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    const message = await signup(name, email, password);
    setIsSubmitting(false);
    if (message) {
      setError(message);
      return;
    }
    const requestedPath = new URLSearchParams(window.location.search).get("next");
    const safeRequestedPath = requestedPath?.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : null;
    const pendingEstimate = sessionStorage.getItem("solarsaathi-pending-estimate");
    router.push(safeRequestedPath || (pendingEstimate ? "/?resumeEstimate=1#estimate" : "/"));
  };

  return (
    <main className="grid min-h-screen bg-slate-100 p-4 dark:bg-slate-950 lg:grid-cols-2 lg:p-0">
      <div className="relative hidden min-h-screen overflow-hidden bg-[#123D2B] lg:block">
        <Image src="/images/hero-solar-rooftop.jpg" alt="Solar panels on a rooftop" fill priority sizes="50vw" className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#092016] to-transparent" />
        <div className="absolute bottom-12 left-12 z-10 text-white"><SolarSaathiLogo size="lg" inverse withName /><p className="mt-3 text-emerald-50">Create your homeowner account.</p></div>
      </div>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md space-y-6 rounded-3xl bg-white p-7 shadow-xl dark:bg-slate-900 sm:p-10">
          <div><h2 className="text-3xl font-bold text-slate-900 dark:text-white">Create account</h2><p className="mt-2 text-sm text-slate-500">Homeowner accounts can request and track estimates.</p></div>
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Full name<input required minLength={2} maxLength={80} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></label>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></label>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password<input type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /><span className="mt-1 block text-xs font-normal text-slate-500">Use at least 8 characters.</span></label>
            <button disabled={isSubmitting} className="w-full rounded-full bg-[#174b32] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#216642] disabled:opacity-60">{isSubmitting ? "Creating account…" : "Create account"}</button>
          </form>
          <p className="text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-semibold text-emerald-700 hover:underline">Sign in</Link></p>
        </div>
      </div>
    </main>
  );
}
