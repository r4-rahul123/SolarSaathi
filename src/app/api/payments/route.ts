import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth-server";
import { getPostgresPool } from "@/lib/postgres";
import { canCustomerViewPayments, getProjectNetAmount, isPaymentStaffRole, summarizePayments, validatePaymentAmount, type PaymentRow } from "@/lib/payment-utils";
import type { Lead } from "@/types/solar";

export const runtime = "nodejs";

const CreatePaymentSchema = z.object({
  projectId: z.string().min(1).max(100),
  amount: z.number().finite().positive().max(100_000_000),
  paymentType: z.enum(["Advance", "Installment", "Final"]),
  paymentMethod: z.enum(["Cash", "UPI Mock", "Bank Transfer Mock"]),
  status: z.enum(["Pending", "Paid", "Failed"]),
  idempotencyKey: z.uuid(),
});

function publicPayment(row: Record<string, unknown>): Omit<PaymentRow, "createdBy"> {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    amount: Number(row.amount),
    paymentType: row.payment_type as PaymentRow["paymentType"],
    paymentMethod: row.payment_method as PaymentRow["paymentMethod"],
    status: row.status as PaymentRow["status"],
    transactionReference: String(row.transaction_reference),
    paymentDate: new Date(String(row.payment_date)).toISOString(),
    createdAt: new Date(String(row.created_at)).toISOString(),
    customerName: typeof row.customer_name === "string" ? row.customer_name : undefined,
  };
}

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const projectId = request.nextUrl.searchParams.get("projectId");
  const pool = getPostgresPool();

  if (isPaymentStaffRole(user.role)) {
    const { rows: leadRows } = await pool.query<{ data: Lead }>("SELECT data FROM solar_leads ORDER BY created_at DESC");
    const leads = leadRows.map((row) => row.data).filter((lead) => lead.quote);
    const { rows: paymentRows } = await pool.query(
      `SELECT p.*, l.data->>'name' AS customer_name FROM solar_payments p
       JOIN solar_leads l ON l.id = p.project_id
       ORDER BY p.payment_date DESC`,
    );
    const grouped = new Map<string, Record<string, unknown>[]>();
    for (const row of paymentRows) grouped.set(String(row.project_id), [...(grouped.get(String(row.project_id)) || []), row]);
    const projects = leads.map((lead) => {
      const payments = (grouped.get(lead.id) || []).map(publicPayment);
      const summary = summarizePayments(getProjectNetAmount(lead), payments);
      return { projectId: lead.id, customerName: lead.name, summary, payments };
    });
    return NextResponse.json({ projects });
  }

  if (user.role !== "HOMEOWNER" || !projectId) {
    return NextResponse.json({ error: "You do not have access to payment records." }, { status: 403 });
  }
  const { rows } = await pool.query<{ data: Lead }>(
    "SELECT data FROM solar_leads WHERE id = $1",
    [projectId],
  );
  const lead = rows[0]?.data;
  if (!lead || !canCustomerViewPayments(user.role, lead.ownerUserId, user.id)) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }
  const { rows: payments } = await pool.query<{ amount: string; status: PaymentRow["status"] }>(
    "SELECT amount, status FROM solar_payments WHERE project_id = $1",
    [projectId],
  );
  return NextResponse.json({ summary: summarizePayments(getProjectNetAmount(lead), payments.map((payment) => ({ ...payment, amount: Number(payment.amount) }))) });
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!isPaymentStaffRole(user.role)) return NextResponse.json({ error: "Only sales staff and coordinators can record payments." }, { status: 403 });
  const parsed = CreatePaymentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid project, amount, payment type, method and status." }, { status: 400 });

  const { projectId, amount, paymentType, paymentMethod, status, idempotencyKey } = parsed.data;
  const client = await getPostgresPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [idempotencyKey]);
    const duplicate = await client.query("SELECT * FROM solar_payments WHERE idempotency_key = $1", [idempotencyKey]);
    if (duplicate.rows[0]) {
      if (duplicate.rows[0].project_id !== projectId) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "This request key was already used." }, { status: 409 });
      }
      const priorRows = await client.query("SELECT amount, status FROM solar_payments WHERE project_id = $1", [projectId]);
      const { rows: leadRows } = await client.query("SELECT data FROM solar_leads WHERE id = $1", [projectId]);
      if (!leadRows[0]) throw new Error("Project not found.");
      const summary = summarizePayments(getProjectNetAmount(leadRows[0].data), priorRows.rows);
      await client.query("COMMIT");
      return NextResponse.json({ payment: publicPayment(duplicate.rows[0]), summary, duplicate: true });
    }

    const { rows: leadRows } = await client.query<{ data: Lead }>("SELECT data FROM solar_leads WHERE id = $1 FOR UPDATE", [projectId]);
    const lead = leadRows[0]?.data;
    if (!lead) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    const projectAmount = getProjectNetAmount(lead);
    const { rows: currentRows } = await client.query("SELECT amount, status FROM solar_payments WHERE project_id = $1", [projectId]);
    const currentSummary = summarizePayments(projectAmount, currentRows);
    if (!validatePaymentAmount(amount, currentSummary.remainingBalance)) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Payment must be positive and cannot exceed the remaining balance." }, { status: 400 });
    }
    const transactionReference = `MOCK-${randomUUID().slice(0, 12).toUpperCase()}`;
    const { rows: inserted } = await client.query(
      `INSERT INTO solar_payments
       (project_id, amount, payment_type, payment_method, status, transaction_reference, idempotency_key, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [projectId, amount, paymentType, paymentMethod, status, transactionReference, idempotencyKey, user.id],
    );
    const summary = summarizePayments(projectAmount, [...currentRows, inserted[0]]);
    await client.query("COMMIT");
    return NextResponse.json({ payment: publicPayment({ ...inserted[0], customer_name: lead.name }), summary }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Mock payment record failed", error);
    return NextResponse.json({ error: "Could not record the mock payment." }, { status: 500 });
  } finally {
    client.release();
  }
}
