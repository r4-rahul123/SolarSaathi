"use client";

import { useCallback, useEffect, useState } from "react";
import { ReceiptText, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { PaymentRow, PaymentSummary, PaymentType, PaymentMethod, PaymentStatus } from "@/lib/payment-utils";

interface PaymentProject {
  projectId: string;
  customerName: string;
  summary: PaymentSummary;
  payments: Omit<PaymentRow, "createdBy">[];
}

export function PaymentsSection() {
  const [projects, setProjects] = useState<PaymentProject[]>([]);
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("Advance");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI Mock");
  const [status, setStatus] = useState<PaymentStatus>("Paid");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    const response = await fetch("/api/payments", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load payment records.");
    setProjects(data.projects);
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void refresh().catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load payment records."));
    });
    return () => { active = false; };
  }, [refresh]);

  const selected = projects.find((project) => project.projectId === projectId);

  const submitPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, amount: Number(amount), paymentType, paymentMethod, status, idempotencyKey: crypto.randomUUID() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not record mock payment.");
      setAmount("");
      await refresh();
      setNotice(status === "Paid" ? "Mock payment recorded. Print the receipt from the payment list." : `Mock payment recorded as ${status}. It is excluded from amount paid.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not record mock payment.");
    } finally { setBusy(false); }
  };

  const updateStatus = async (payment: PaymentProject["payments"][number], nextStatus: PaymentStatus) => {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/payments/${payment.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update payment status.");
      await refresh();
      setNotice(`Mock payment status updated to ${nextStatus}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update payment status.");
    } finally { setBusy(false); }
  };

  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">Mock payment tracking</h2><p className="mt-1 text-sm text-slate-500">Record project payments for tracking only. No money is transferred.</p></div>
        <button type="button" onClick={() => void refresh().catch((caught) => setError(caught.message))} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </header>
      <form onSubmit={submitPayment} className="grid gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950 md:grid-cols-6">
        <label className="text-xs font-semibold md:col-span-2">Project / customer<select required value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-sm dark:bg-slate-900"><option value="">Choose a quoted project</option>{projects.map((project) => <option key={project.projectId} value={project.projectId}>{project.customerName} · {project.projectId}</option>)}</select></label>
        <label className="text-xs font-semibold">Amount (₹)<input required type="number" min="0.01" step="0.01" max={selected?.summary.remainingBalance ?? undefined} value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-sm dark:bg-slate-900" /></label>
        <label className="text-xs font-semibold">Payment type<select value={paymentType} onChange={(event) => setPaymentType(event.target.value as PaymentType)} className="mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-sm dark:bg-slate-900"><option>Advance</option><option>Installment</option><option>Final</option></select></label>
        <label className="text-xs font-semibold">Method<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} className="mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-sm dark:bg-slate-900"><option>Cash</option><option>UPI Mock</option><option>Bank Transfer Mock</option></select></label>
        <label className="text-xs font-semibold">Mock status<select value={status} onChange={(event) => setStatus(event.target.value as PaymentStatus)} className="mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-sm dark:bg-slate-900"><option>Paid</option><option>Pending</option><option>Failed</option></select></label>
        <div className="flex items-end md:col-span-6"><button disabled={!selected || busy} className="rounded-xl bg-[#174b32] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Saving…" : "Record mock payment"}</button>{selected && <p className="ml-3 self-center text-xs text-slate-500">Project amount {formatCurrency(selected.summary.projectAmount)} · Balance {formatCurrency(selected.summary.remainingBalance)}</p>}</div>
      </form>
      <div className="space-y-3">
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950"><tr><th className="p-3">Customer / Project</th><th className="p-3">Project amount</th><th className="p-3">Paid</th><th className="p-3">Balance</th><th className="p-3">Overall status</th><th className="p-3">Payment records</th></tr></thead><tbody className="divide-y dark:divide-slate-800">
          {projects.map((project) => <tr key={project.projectId} className="align-top"><td className="p-3 font-semibold">{project.customerName}<span className="block text-xs font-normal text-slate-500">{project.projectId}</span></td><td className="p-3">{formatCurrency(project.summary.projectAmount)}</td><td className="p-3">{formatCurrency(project.summary.totalPaid)}</td><td className="p-3">{formatCurrency(project.summary.remainingBalance)}</td><td className="p-3">{project.summary.status}</td><td className="space-y-2 p-3">{project.payments.length ? project.payments.map((payment) => <div key={payment.id} className="rounded-xl bg-slate-50 p-2.5 text-xs dark:bg-slate-950"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{formatCurrency(payment.amount)} · {payment.paymentType}</strong><span>{payment.status}</span></div><p className="mt-1 text-slate-500">{payment.paymentMethod} · {new Date(payment.paymentDate).toLocaleString()}</p><p className="mt-1 break-all font-mono text-slate-500">{payment.transactionReference}</p><div className="mt-2 flex gap-2">{payment.status !== "Paid" && <button type="button" disabled={busy} onClick={() => void updateStatus(payment, "Paid")} className="rounded-lg border px-2 py-1 font-semibold">Mark paid</button>}{payment.status === "Paid" && <a href={`/payment-receipt/${payment.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 font-semibold"><ReceiptText className="h-3.5 w-3.5" /> Receipt</a>}{payment.status !== "Failed" && <button type="button" disabled={busy} onClick={() => void updateStatus(payment, "Failed")} className="rounded-lg border px-2 py-1">Mark failed</button>}</div></div>) : <span className="text-xs text-slate-400">No payments recorded</span>}</td></tr>)}
          {!projects.length && <tr><td colSpan={6} className="p-8 text-center text-sm text-slate-500">No quoted projects are available for payment tracking.</td></tr>}
        </tbody></table>
      </div>
      <p className="text-xs text-slate-500">Every receipt is marked “MOCK PAYMENT RECEIPT – NOT A REAL TRANSACTION.” Pending and failed records are excluded from totals.</p>
    </section>
  );
}
