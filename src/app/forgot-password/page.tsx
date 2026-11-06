"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SolarSaathiLogo } from "@/components/SolarSaathiLogo";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      const endpoint = step === "email" ? "/api/auth/forgot-password" : "/api/auth/reset-password";
      const body = step === "email" ? { email } : { email, otp, password };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      if (step === "email") {
        setStep("reset");
        setNotice(data.message || "If an account exists for that email, a reset code has been sent.");
      } else {
        setNotice(data.message);
        window.setTimeout(() => router.push("/login"), 1400);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally { setBusy(false); }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-8">
      <div className="mx-auto grid min-h-[620px] max-w-5xl overflow-hidden rounded-[30px] bg-white shadow-2xl dark:bg-slate-900 lg:grid-cols-2">
        <section className="relative flex min-h-64 flex-col justify-between overflow-hidden bg-[#123D2B] p-8 text-white sm:p-12">
          <Image src="/images/hero-solar-rooftop.jpg" alt="Solar panels on a rooftop" fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#092016] via-[#123D2B]/40 to-transparent" />
          <div className="relative z-10"><SolarSaathiLogo size="lg" inverse withName /><p className="mt-3 max-w-sm text-sm text-emerald-50">A secure reset link starts with a one-time email code.</p></div>
          <p className="relative z-10 text-sm text-white/80">Your account stays protected with expiring verification codes.</p>
        </section>
        <section className="flex items-center p-6 sm:p-12">
          <div className="mx-auto w-full max-w-md space-y-6">
            <div><p className="text-sm font-semibold text-emerald-700">Account recovery</p><h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{step === "email" ? "Forgot password?" : "Set a new password"}</h2><p className="mt-2 text-sm text-slate-500">{step === "email" ? "Enter your account email and we’ll send a 6-digit code." : `Enter the code sent to ${email} and choose a new password.`}</p></div>
            <form onSubmit={submit} className="space-y-4">
              {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              {notice && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>}
              {step === "email" ? <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email address<input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></label> : <>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">6-digit code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg tracking-[0.4em] text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></label>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">New password<input type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /><span className="mt-1 block text-xs font-normal text-slate-400">Use at least 8 characters.</span></label>
              </>}
              <button disabled={busy} className="w-full rounded-full bg-[#174b32] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#216642] disabled:opacity-60">{busy ? "Please wait…" : step === "email" ? "Send reset code" : "Update password"}</button>
              {step === "reset" && <button type="button" onClick={() => { setStep("email"); setOtp(""); setPassword(""); setNotice(""); setError(""); }} className="w-full text-sm font-medium text-emerald-700 hover:underline">Use a different email</button>}
            </form>
            <p className="text-center text-sm text-slate-500"><Link href="/login" className="font-semibold text-emerald-700 hover:underline">Back to sign in</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}
