import { NextRequest, NextResponse } from "next/server";
import { SolarDB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    const { id } = await params;
    const lead = await SolarDB.getLeadById(id);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    if (!user || (user.role === "HOMEOWNER" && lead.ownerUserId !== user.id)) {
      return NextResponse.json({ error: "You do not have access to this enquiry." }, { status: 403 });
    }

    return NextResponse.json({ success: true, lead });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error retrieving lead";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    const { id } = await params;
    const body = await req.json();
    const existing = await SolarDB.getLeadById(id);
    if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    const isStaff = user && user.role !== "HOMEOWNER";
    const isOwnerAccepting = user?.role === "HOMEOWNER" && (!existing.ownerUserId || existing.ownerUserId === user.id) && body.status === "QUOTATION_APPROVED";
    if (!isStaff && !isOwnerAccepting) {
      return NextResponse.json({ error: "You do not have access to update this enquiry." }, { status: 403 });
    }
    if (isOwnerAccepting) {
      const allowedKeys = new Set(["status", "recommendedKw"]);
      if (Object.keys(body).some((key) => !allowedKeys.has(key))) {
        return NextResponse.json({ error: "Customers can only accept their own estimate." }, { status: 403 });
      }
      if (!existing.quote?.options.some((option) => option.systemSizeKw === Number(body.recommendedKw))) {
        return NextResponse.json({ error: "Choose a system size listed in the estimate." }, { status: 400 });
      }
    }

    const updates = isOwnerAccepting && !existing.ownerUserId ? { ...body, ownerUserId: user!.id } : body;
    const updated = await SolarDB.updateLead(id, updates);
    if (!updated) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    return NextResponse.json({ success: true, lead: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating lead";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
