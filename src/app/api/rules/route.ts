import { NextRequest, NextResponse } from "next/server";
import { SolarDB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role === "HOMEOWNER") return NextResponse.json({ error: "Sign in with a staff account." }, { status: 403 });
    const rules = await SolarDB.getSubsidyRules();
    const pricing = await SolarDB.getPricingRules();
    return NextResponse.json({ success: true, rules, pricing });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching rules";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "COORDINATOR") return NextResponse.json({ error: "Coordinator access is required." }, { status: 403 });
    const body = await req.json();

    if (body.type === "pricing") {
      const updatedPricing = await SolarDB.updatePricingRule(body.systemSizeKw, body.price);
      return NextResponse.json({ success: true, pricing: updatedPricing });
    }

    const { ruleId, ...updates } = body;
    if (!ruleId) {
      return NextResponse.json({ error: "Missing ruleId" }, { status: 400 });
    }

    const updated = await SolarDB.updateSubsidyRule(ruleId, updates);
    if (!updated) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, rule: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating rule";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
