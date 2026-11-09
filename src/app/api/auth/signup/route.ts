import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { z } from "zod";
import { createSessionCredential, insertSessionRecord, setSessionCookie } from "@/lib/auth-server";
import { getPostgresPool } from "@/lib/postgres";
import { withPostgresTransaction } from "@/lib/postgres-transaction";

const SignupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(128),
});

export async function POST(request: NextRequest) {
  const parsed = SignupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid name, email and password (at least 8 characters)." }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  try {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const session = createSessionCredential();
    await withPostgresTransaction(getPostgresPool(), async (client) => {
      const { rows } = await client.query<{ id: string }>(
        "INSERT INTO app_users (name, email, password_hash, role) VALUES ($1, $2, $3, 'HOMEOWNER') RETURNING id",
        [name, email, passwordHash],
      );
      await insertSessionRecord(client, rows[0].id, session);
    });
    await setSessionCookie(session);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
    if (code === "23505") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    console.error("Signup failed", error);
    const message = error instanceof Error ? error.message : "Unknown signup error";
    if (message.includes("DATABASE_URL is missing")) {
      return NextResponse.json({ error: "DATABASE_URL was not loaded. Restart the Next.js server after updating .env.local." }, { status: 503 });
    }
    if (code === "42P01") {
      return NextResponse.json({ error: "Account tables are missing. Run npm run db:setup and try again." }, { status: 503 });
    }
    if (code === "42501") {
      return NextResponse.json({ error: "The database account needs permission to create accounts and sessions." }, { status: 503 });
    }
    return NextResponse.json({
      error: process.env.NODE_ENV === "development"
        ? `Could not create the account: ${message}`
        : "Could not create the account. Check the database setup and try again.",
    }, { status: 500 });
  }
}
