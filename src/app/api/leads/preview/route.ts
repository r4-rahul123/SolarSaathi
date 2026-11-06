import { NextRequest, NextResponse } from "next/server";
import { SolarDB } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.phone || !body.occupancy || Number(body.avgUnitsPerMonth) <= 0 || Number(body.monthlyBill) <= 0) {
      return NextResponse.json({ error: "Add your contact details and valid electricity bill values to calculate an estimate." }, { status: 400 });
    }

    const lead = await SolarDB.createLead({
      name: String(body.name).trim(),
      phone: String(body.phone).trim(),
      email: String(body.email || "").trim(),
      address: String(body.address || body.city || "Nagpur, Maharashtra"),
      pincode: String(body.pincode || "440001"),
      city: String(body.city || "Nagpur"),
      occupancy: body.occupancy,
      roofType: body.roofType || "Concrete Flat",
      roofAreaSqFt: Number(body.roofAreaSqFt) || 500,
      monthlyBill: Number(body.monthlyBill),
      avgUnitsPerMonth: Number(body.avgUnitsPerMonth),
      billExtraction: body.billExtraction,
      billImageName: body.billImageName,
    }, false);

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("Estimate preview failed", error);
    return NextResponse.json({ error: "Could not calculate this estimate. Please check the bill details and try again." }, { status: 503 });
  }
}
