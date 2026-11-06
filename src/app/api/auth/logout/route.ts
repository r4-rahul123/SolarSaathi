import { NextResponse } from "next/server";
import { destroyUserSession } from "@/lib/auth-server";

export async function POST() {
  try {
    await destroyUserSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout failed", error);
    return NextResponse.json({ error: "Could not sign out." }, { status: 500 });
  }
}
