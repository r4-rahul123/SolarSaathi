import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, SunMedium } from "lucide-react";
import { getSessionUser } from "@/lib/auth-server";
import { SolarDB } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MyProjectsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "HOMEOWNER") redirect("/admin");

  const leads = await SolarDB.getLeadsByOwner(user.id);

  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-10 dark:bg-slate-950 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">Your SolarSaathi account</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My projects</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">View your estimates and follow project progress.</p>
          </div>
          <Link href="/#estimate" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174b32] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#216642]">
            Get an estimate <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {leads.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><SunMedium className="h-6 w-6" /></div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No projects yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">Start with a rooftop estimate. Once you submit an enquiry, it will appear here.</p>
            <Link href="/#estimate" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#174b32] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#216642]">Start an estimate <ArrowRight className="h-4 w-4" /></Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {leads.map((lead) => {
              const option = lead.quote?.options?.find((item) => item.systemSizeKw === lead.recommendedKw);
              const stage = lead.timeline?.find((item) => item.isCurrent)?.title ?? lead.status.replaceAll("_", " ");
              return (
                <Link key={lead.id} href={`/track/${lead.id}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-slate-400">Project ref · {lead.id}</p><h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{lead.city} rooftop estimate</h2></div><ArrowRight className="mt-1 h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600" /></div>
                  <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm"><span><span className="block text-xs text-slate-400">System</span><strong className="mt-1 block text-slate-800 dark:text-slate-200">{lead.recommendedKw} kW</strong></span><span><span className="block text-xs text-slate-400">Estimated net cost</span><strong className="mt-1 block text-slate-800 dark:text-slate-200">{option ? formatCurrency(option.netCost) : "Pending"}</strong></span></div>
                  <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800"><span className="text-xs text-slate-400">Current stage</span><p className="mt-1 text-sm font-semibold text-emerald-800 dark:text-emerald-300">{stage}</p></div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
