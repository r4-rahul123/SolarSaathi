import type { Lead, QuoteOption } from "../types/solar.ts";

export type PaymentType = "Advance" | "Installment" | "Final";
export type PaymentMethod = "Cash" | "UPI Mock" | "Bank Transfer Mock";
export type PaymentStatus = "Pending" | "Paid" | "Failed";
export type OverallPaymentStatus = "Pending" | "Partially Paid" | "Paid";

export interface PaymentRow {
  id: string;
  projectId: string;
  amount: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionReference: string;
  paymentDate: string;
  createdAt: string;
  createdBy: string;
  customerName?: string;
}

export interface PaymentSummary {
  projectAmount: number;
  totalPaid: number;
  remainingBalance: number;
  status: OverallPaymentStatus;
}

const cents = (amount: number) => Math.round((amount + Number.EPSILON) * 100);

export function getProjectNetAmount(lead: Lead): number {
  const selected: QuoteOption | undefined = lead.quote?.options.find(
    (option) => option.systemSizeKw === lead.recommendedKw,
  );
  if (!selected || !Number.isFinite(selected.netCost) || selected.netCost <= 0) {
    throw new Error("A valid quotation option is required before tracking payments.");
  }
  return Number(selected.netCost);
}

export function summarizePayments(projectAmount: number, payments: Pick<PaymentRow, "amount" | "status">[]): PaymentSummary {
  const projectCents = cents(projectAmount);
  const paidCents = payments.reduce((total, payment) =>
    payment.status === "Paid" && Number.isFinite(Number(payment.amount))
      ? total + cents(Number(payment.amount))
      : total, 0);
  const totalPaidCents = Math.min(projectCents, paidCents);
  return {
    projectAmount: projectCents / 100,
    totalPaid: totalPaidCents / 100,
    remainingBalance: Math.max(0, projectCents - totalPaidCents) / 100,
    status: totalPaidCents === 0 ? "Pending" : totalPaidCents >= projectCents ? "Paid" : "Partially Paid",
  };
}

export function validatePaymentAmount(amount: number, remainingBalance: number): boolean {
  return Number.isFinite(amount) && amount > 0 && cents(amount) <= cents(remainingBalance);
}

export function isPaymentStaffRole(role: string | undefined): boolean {
  return role === "SALES" || role === "COORDINATOR";
}

export function canCustomerViewPayments(role: string | undefined, ownerUserId: string | undefined, userId: string): boolean {
  return role === "HOMEOWNER" && ownerUserId === userId;
}

export function makeMockTransactionReference(): string {
  return `MOCK-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}
