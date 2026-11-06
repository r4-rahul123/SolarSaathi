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
    console.error("Error fetching rules:", err);
    return NextResponse.json({ error: "Could not load rules. Please try again." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "COORDINATOR") return NextResponse.json({ error: "Coordinator access is required." }, { status: 403 });
    const body = await req.json();

    if (body.type === "pricing") {
      const numKw = Number(body.systemSizeKw);
      const numPrice = Number(body.price);
      if (isNaN(numKw) || isNaN(numPrice) || numKw <= 0 || numPrice <= 0) {
        return NextResponse.json({ error: "Invalid system size or price." }, { status: 400 });
      }
      const updatedPricing = await SolarDB.updatePricingRule(numKw, numPrice);
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
    console.error("Error updating rule:", err);
    return NextResponse.json({ error: "Could not update rule. Please try again." }, { status: 500 });
  }
}
