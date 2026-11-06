"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SolarSaathiLogo } from "@/components/SolarSaathiLogo";

const linkClass = "text-sm text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 rounded-sm";
const headingClass = "text-xs font-bold uppercase tracking-[0.14em] text-emerald-200";

export function SiteFooter() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (pathname.startsWith("/admin")) return null;

  const accountHref = user?.role === "HOMEOWNER"
    ? "/track"
    : user
      ? "/admin"
      : "/login?next=%2Ftrack";
  return (
    <footer className="mt-auto border-t border-emerald-900/60 bg-[#0b2419] text-white dark:bg-[#06150f]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.1fr] lg:gap-12">
          <div className="max-w-sm">
            <Link href="/" aria-label="SolarSaathi home" className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">
              <SolarSaathiLogo size="md" inverse withName />
            </Link>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              Rooftop solar estimates and project guidance for homes across Nagpur and Vidarbha.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-emerald-100">
              <MapPin className="h-3.5 w-3.5 text-emerald-300" />
              Maharashtra, India
            </div>
          </div>

          <nav aria-label="Explore SolarSaathi" className="space-y-4">
            <h2 className={headingClass}>Explore</h2>
            <ul className="space-y-3">
              <li><Link href="/#estimate" className={linkClass}>Get an estimate</Link></li>
              <li><Link href="/#how-it-works" className={linkClass}>How it works</Link></li>
            </ul>
          </nav>

          <nav aria-label="Account" className="space-y-4">
            <h2 className={headingClass}>Your account</h2>
            <ul className="space-y-3">
              {user ? (
                <li><Link href={accountHref} className={linkClass}>{user.role === "HOMEOWNER" ? "My projects" : "Staff workspace"}</Link></li>
              ) : (
                <>
                  <li><Link href="/login" className={linkClass}>Sign in</Link></li>
                  <li><Link href="/signup" className={linkClass}>Create an account</Link></li>
                  <li><Link href={accountHref} className={linkClass}>Track a project</Link></li>
                </>
              )}
            </ul>
          </nav>

          <div className="space-y-4">
            <h2 className={headingClass}>Planning solar?</h2>
            <p className="text-sm leading-6 text-slate-300">
              Start with your electricity bill and rooftop details. Review an estimate before deciding on a site survey.
            </p>
            <Link href="/#estimate" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-[#082216] transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              Start estimate <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-5 text-xs leading-5 text-slate-400 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-3xl">
            Estimates are indicative. Final system design, pricing and subsidy eligibility depend on a site survey and applicable scheme rules.
          </p>
          <p className="shrink-0">© {new Date().getFullYear()} SolarSaathi</p>
        </div>
      </div>
    </footer>
  );
}
