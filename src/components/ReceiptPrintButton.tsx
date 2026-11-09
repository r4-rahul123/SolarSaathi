"use client";

export function ReceiptPrintButton() {
  return <button type="button" onClick={() => window.print()} className="rounded-xl bg-[#174b32] px-5 py-3 text-sm font-bold text-white print:hidden">Print mock receipt</button>;
}
