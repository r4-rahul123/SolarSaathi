import { NextRequest, NextResponse } from "next/server";
import { SolarDB } from "@/lib/db";

export async function GET() {
  try {
    const leads = SolarDB.getLeads();
    return NextResponse.json({ success: true, leads });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch leads";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic input validation
    if (!body.name || !body.phone || !body.occupancy) {
      return NextResponse.json(
        { error: "Validation failed: Name, phone, and occupancy are required." },
        { status: 400 }
      );
    }

    const newLead = SolarDB.createLead({
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

    return NextResponse.json({ success: true, lead: newLead }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create lead";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
