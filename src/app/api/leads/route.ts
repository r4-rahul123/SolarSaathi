import { NextRequest, NextResponse } from "next/server";
import { SolarDB } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";
import { hideLeadScoring } from "@/lib/lead-privacy";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role === "HOMEOWNER") return NextResponse.json({ error: "Sign in with a staff account." }, { status: 403 });
    const leads = await SolarDB.getLeads();
    return NextResponse.json({ success: true, leads });
  } catch (err: unknown) {
    console.error("Failed to fetch leads:", err);
    return NextResponse.json({ error: "Failed to fetch leads. Please try again." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await getSessionUser();
    if (!user || user.role !== "HOMEOWNER") {
      return NextResponse.json({ error: "Sign in with a homeowner account to save this estimate." }, { status: 401 });
    }

    // Basic input validation
    if (!body.name || !body.phone || !body.occupancy) {
      return NextResponse.json(
        { error: "Validation failed: Name, phone, and occupancy are required." },
        { status: 400 }
      );
    }

    const newLead = await SolarDB.createLead({
      ownerUserId: user.id,
      name: body.name,
      phone: body.phone,
      email: body.email || "",
      address: body.address || "Nagpur, Maharashtra",
      pincode: body.pincode || "440001",
      city: body.city || "Nagpur",
      occupancy: body.occupancy,
      roofType: body.roofType || "Concrete Flat",
      roofAreaSqFt: Number(body.roofAreaSqFt) || 500,
      monthlyBill: Number(body.monthlyBill) || 2500,
      avgUnitsPerMonth: Number(body.avgUnitsPerMonth) || 280,
      billExtraction: body.billExtraction,
      billImageName: body.billImageName,
      billImageBase64: body.billImageBase64,
    });

    return NextResponse.json({ success: true, lead: hideLeadScoring(newLead) }, { status: 201 });
  } catch (err: unknown) {
    console.error("Failed to create lead:", err);
    return NextResponse.json({ error: "Failed to create lead. Please try again." }, { status: 500 });
  }
}
