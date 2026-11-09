import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { z } from "zod";
import { createUserSession } from "@/lib/auth-server";
import { getPostgresPool } from "@/lib/postgres";

const LoginSchema = z.object({ email: z.email().trim().toLowerCase(), password: z.string().min(1).max(128) });

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_LOGIN_ATTEMPT_KEYS = 5_000;

function checkRateLimit(key: string): "allowed" | "limited" | "capacity" {
  const now = Date.now();
  // Expire old buckets on every check and enforce a strict memory ceiling.
  for (const [k, v] of loginAttempts.entries()) {
    if (v.resetAt < now) loginAttempts.delete(k);
  }
  if (!loginAttempts.has(key) && loginAttempts.size >= MAX_LOGIN_ATTEMPT_KEYS) return "capacity";
  const entry = loginAttempts.get(key);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 5 * 60 * 1000 });
    return "allowed";
  }
  if (entry.count >= 5) {
    return "limited";
  }
  entry.count += 1;
  return "allowed";
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const parsed = LoginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });

  const rateLimitKey = `${ip}:${parsed.data.email}`;
  const rateLimitStatus = checkRateLimit(rateLimitKey);
  if (rateLimitStatus === "limited") {
    return NextResponse.json(
      { error: "Too many failed login attempts. Please wait 5 minutes before trying again." },
      { status: 429 }
    );
  }
  if (rateLimitStatus === "capacity") {
    return NextResponse.json(
      { error: "Login is temporarily busy. Please try again in a few minutes." },
      { status: 503, headers: { "Retry-After": "300" } },
    );
  }

  try {
    const { rows } = await getPostgresPool().query<{ id: string; password_hash: string }>(
      "SELECT id, password_hash FROM app_users WHERE email = $1",
      [parsed.data.email],
    );
    if (!rows[0] || !(await argon2.verify(rows[0].password_hash, parsed.data.password))) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }
    loginAttempts.delete(rateLimitKey);
    await createUserSession(rows[0].id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "Could not sign in. Check that PostgreSQL is running." }, { status: 503 });
  }
}
