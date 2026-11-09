import { NextRequest, NextResponse } from "next/server";
import { SolarDB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";
import { hideLeadScoring } from "@/lib/lead-privacy";

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

    return NextResponse.json({ success: true, lead: user.role === "HOMEOWNER" ? hideLeadScoring(lead) : lead });
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
    if (!user) {
      return NextResponse.json({ error: "Authentication required to update enquiries." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const existing = await SolarDB.getLeadById(id);
    if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const VALID_STAGES = new Set([
      "LEAD_APPROVED",
      "SITE_SURVEY",
      "QUOTATION_APPROVED",
      "ADVANCE_PAYMENT",
      "INSTALLATION",
      "NET_METERING",
      "SUBSIDY_APPLICATION",
      "SUBSIDY_CREDITED",
    ]);

    if (body.status && !VALID_STAGES.has(body.status)) {
      return NextResponse.json({ error: "Invalid project status stage." }, { status: 400 });
    }

    const isStaff = user.role !== "HOMEOWNER";
    const isOwnerAccepting =
      user.role === "HOMEOWNER" &&
      (!existing.ownerUserId || existing.ownerUserId === user.id) &&
      body.status === "QUOTATION_APPROVED";

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

    const updates = isOwnerAccepting && !existing.ownerUserId ? { ...body, ownerUserId: user.id } : body;
    const updated = await SolarDB.updateLead(id, updates);
    if (!updated) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    return NextResponse.json({ success: true, lead: isStaff ? updated : hideLeadScoring(updated) });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating lead";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
