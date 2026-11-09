import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { z } from "zod";
import { createUserSession, SessionUser } from "@/lib/auth-server";
import { getPostgresPool } from "@/lib/postgres";
import type { UserRole } from "@/context/AuthContext";

const LoginSchema = z.object({ email: z.email().trim().toLowerCase(), password: z.string().min(1).max(128) });

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || entry.resetAt < now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 5 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) {
    return false;
  }
  entry.count += 1;
  return true;
}

const DEMO_ACCOUNTS: Record<string, { role: UserRole; name: string; pass: string }> = {
  "admin@solarsaathi.demo": { role: "COORDINATOR", name: "Demo Admin", pass: "admin123" },
  "sales@solarsaathi.demo": { role: "SALES", name: "Demo Sales User", pass: "sales123" },
  "surveyor@solarsaathi.demo": { role: "SURVEYOR", name: "Demo Surveyor", pass: "survey123" },
  "customer@solarsaathi.demo": { role: "HOMEOWNER", name: "Demo Customer", pass: "solar123" },
};

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const parsed = LoginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });

  const rateLimitKey = `${ip}:${parsed.data.email}`;
  if (!checkRateLimit(rateLimitKey)) {
    return NextResponse.json(
      { error: "Too many failed login attempts. Please wait 5 minutes before trying again." },
      { status: 429 }
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
    await createUserSession(rows[0].id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const demo = DEMO_ACCOUNTS[parsed.data.email];
    if (demo && demo.pass === parsed.data.password) {
      const demoUser: SessionUser = {
        id: `demo-${demo.role.toLowerCase()}`,
        name: demo.name,
        email: parsed.data.email,
        role: demo.role,
      };
      await createUserSession(demoUser.id, demoUser);
      return NextResponse.json({ success: true });
    }
    console.error("Login failed", error);
    return NextResponse.json({ error: "Could not sign in. Check that PostgreSQL is running." }, { status: 503 });
  }
}
