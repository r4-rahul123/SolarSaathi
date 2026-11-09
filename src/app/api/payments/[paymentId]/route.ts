import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth-server";
import { getPostgresPool } from "@/lib/postgres";
import { getProjectNetAmount, isPaymentStaffRole, summarizePayments, validatePaymentAmount } from "@/lib/payment-utils";
import type { Lead } from "@/types/solar";

const UpdateSchema = z.object({ status: z.enum(["Pending", "Paid", "Failed"]) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!isPaymentStaffRole(user.role)) return NextResponse.json({ error: "Only sales staff and coordinators can update payments." }, { status: 403 });
  const parsed = UpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Choose a valid payment status." }, { status: 400 });
  const { paymentId } = await params;
  if (!z.uuid().safeParse(paymentId).success) return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
  const client = await getPostgresPool().connect();
  try {
    await client.query("BEGIN");
    const { rows: paymentRows } = await client.query("SELECT * FROM solar_payments WHERE id = $1 FOR UPDATE", [paymentId]);
    const payment = paymentRows[0];
    if (!payment) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
    }
    const { rows: leadRows } = await client.query<{ data: Lead }>("SELECT data FROM solar_leads WHERE id = $1 FOR UPDATE", [payment.project_id]);
    const lead = leadRows[0]?.data;
    if (!lead) throw new Error("Project not found.");
    const { rows: allRows } = await client.query("SELECT amount, status FROM solar_payments WHERE project_id = $1 AND id <> $2", [payment.project_id, paymentId]);
    const before = summarizePayments(getProjectNetAmount(lead), allRows);
    if (parsed.data.status === "Paid" && !validatePaymentAmount(Number(payment.amount), before.remainingBalance)) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "This payment would exceed the remaining project balance." }, { status: 400 });
    }
    const { rows: updated } = await client.query("UPDATE solar_payments SET status = $2 WHERE id = $1 RETURNING *", [paymentId, parsed.data.status]);
    const summary = summarizePayments(getProjectNetAmount(lead), [...allRows, updated[0]]);
    await client.query("COMMIT");
    const row = updated[0];
    return NextResponse.json({
      payment: {
        id: String(row.id), projectId: String(row.project_id), amount: Number(row.amount),
        paymentType: row.payment_type, paymentMethod: row.payment_method, status: row.status,
        transactionReference: row.transaction_reference, paymentDate: new Date(row.payment_date).toISOString(),
        createdAt: new Date(row.created_at).toISOString(), customerName: lead.name,
      },
      summary,
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Mock payment update failed", error);
    return NextResponse.json({ error: "Could not update the mock payment." }, { status: 500 });
  } finally {
    client.release();
  }
}
