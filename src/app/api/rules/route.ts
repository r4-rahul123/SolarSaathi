import { NextRequest, NextResponse } from "next/server";
import { SolarDB } from "@/lib/db";

export async function GET() {
  try {
    const rules = SolarDB.getSubsidyRules();
    return NextResponse.json({ success: true, rules });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching subsidy rules";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { ruleId, ...updates } = body;

    if (!ruleId) {
      return NextResponse.json({ error: "Missing ruleId" }, { status: 400 });
    }

    const updated = SolarDB.updateSubsidyRule(ruleId, updates);
    if (!updated) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, rule: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error updating subsidy rule";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
