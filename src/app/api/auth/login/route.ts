import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { z } from "zod";
import { createUserSession } from "@/lib/auth-server";
import { getPostgresPool } from "@/lib/postgres";

const LoginSchema = z.object({ email: z.email().trim().toLowerCase(), password: z.string().min(1).max(128) });

export async function POST(request: NextRequest) {
  const parsed = LoginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });

  try {
    const { rows } = await getPostgresPool().query<{ id: string; password_hash: string }>(
      "SELECT id, password_hash FROM app_users WHERE email = $1",
      [parsed.data.email],
    );
    if (!rows[0] || !(await argon2.verify(rows[0].password_hash, parsed.data.password))) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }
    await createUserSession(rows[0].id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "Could not sign in. Check that PostgreSQL is running." }, { status: 503 });
  }
}
