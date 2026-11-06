import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-server";

export async function GET() {
  try {
    return NextResponse.json({ user: await getSessionUser() });
  } catch (error) {
    console.error("Session lookup failed", error);
    return NextResponse.json({ user: null, error: "PostgreSQL is not connected." }, { status: 503 });
  }
}
