import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";
import { getPostgresPool } from "@/lib/postgres";
import { getProjectNetAmount, isPaymentStaffRole, summarizePayments } from "@/lib/payment-utils";
import type { Lead } from "@/types/solar";
import { formatCurrency } from "@/lib/utils";
import { ReceiptPrintButton } from "@/components/ReceiptPrintButton";

export const dynamic = "force-dynamic";

export default async function MockPaymentReceiptPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!isPaymentStaffRole(user.role)) notFound();
  const { paymentId } = await params;
  const pool = getPostgresPool();
  const { rows } = await pool.query(
    `SELECT p.*, l.data FROM solar_payments p JOIN solar_leads l ON l.id = p.project_id WHERE p.id = $1`,
    [paymentId],
  );
  const payment = rows[0];
  if (!payment || payment.status !== "Paid") notFound();
  const lead = payment.data as Lead;
  const { rows: allPayments } = await pool.query("SELECT amount, status FROM solar_payments WHERE project_id = $1", [payment.project_id]);
  const balance = summarizePayments(getProjectNetAmount(lead), allPayments).remainingBalance;
  const paymentDate = new Date(payment.payment_date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <main className="mx-auto my-10 max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm print:my-0 print:max-w-none print:rounded-none print:border-0 print:shadow-none sm:p-10">
      <div className="mb-8 border-2 border-amber-600 bg-amber-50 p-4 text-center text-sm font-black tracking-wide text-amber-950">MOCK PAYMENT RECEIPT – NOT A REAL TRANSACTION</div>
      <header className="flex items-start justify-between gap-4 border-b pb-5"><div><p className="text-2xl font-black text-[#123D2B]">SolarSaathi</p><p className="text-sm text-slate-500">Mock payment tracking receipt</p></div><div className="text-right text-sm"><p className="font-semibold">Receipt number</p><p className="font-mono">{payment.transaction_reference}</p></div></header>
      <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
        <div><dt className="text-slate-500">Customer</dt><dd className="mt-1 font-semibold">{lead.name}</dd></div>
        <div><dt className="text-slate-500">Project ID</dt><dd className="mt-1 font-mono font-semibold">{lead.id}</dd></div>
        <div><dt className="text-slate-500">Payment amount</dt><dd className="mt-1 text-xl font-black">{formatCurrency(Number(payment.amount))}</dd></div>
        <div><dt className="text-slate-500">Payment type</dt><dd className="mt-1 font-semibold">{payment.payment_type}</dd></div>
        <div><dt className="text-slate-500">Payment method (mock)</dt><dd className="mt-1 font-semibold">{payment.payment_method}</dd></div>
        <div><dt className="text-slate-500">Payment date</dt><dd className="mt-1 font-semibold">{paymentDate}</dd></div>
        <div className="col-span-2"><dt className="text-slate-500">Transaction reference</dt><dd className="mt-1 break-all font-mono font-semibold">{payment.transaction_reference}</dd></div>
        <div><dt className="text-slate-500">Remaining project balance</dt><dd className="mt-1 font-semibold">{formatCurrency(balance)}</dd></div>
      </dl>
      <p className="mt-8 border-t pt-5 text-xs leading-5 text-slate-500">This document records a simulated payment entry for project tracking. It is not proof of a bank transfer, UPI payment, or receipt of real funds.</p>
      <div className="mt-6 flex justify-end"><ReceiptPrintButton /></div>
    </main>
  );
}
