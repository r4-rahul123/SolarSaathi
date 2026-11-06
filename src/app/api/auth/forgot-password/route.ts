import { createHmac, randomInt } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPasswordResetSecret, sendPasswordResetOtp, assertMailConfigured } from "@/lib/mailer";
import { getPostgresPool } from "@/lib/postgres";

const Schema = z.object({ email: z.email().trim().toLowerCase() });
const response = { message: "If an account exists for that email, a reset code has been sent." };
const codeHash = (userId: string, code: string, secret: string) => createHmac("sha256", secret).update(`${userId}:${code}`).digest("hex");

export async function POST(request: NextRequest) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  try {
    assertMailConfigured();
    const secret = getPasswordResetSecret();
    const pool = getPostgresPool();
    const { rows } = await pool.query<{ id: string; name: string }>("SELECT id, name FROM app_users WHERE email = $1", [parsed.data.email]);
    const user = rows[0];
    if (!user) return NextResponse.json(response);

    const rate = await pool.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM password_reset_otps WHERE user_id = $1 AND created_at > NOW() - INTERVAL '15 minutes'",
      [user.id],
    );
    if (Number(rate.rows[0]?.count ?? 0) >= 3) return NextResponse.json(response);

    const otp = String(randomInt(100000, 1000000));
    await pool.query("UPDATE password_reset_otps SET consumed_at = NOW() WHERE user_id = $1 AND consumed_at IS NULL", [user.id]);
    await pool.query(
      "INSERT INTO password_reset_otps (user_id, code_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '10 minutes')",
      [user.id, codeHash(user.id, otp, secret)],
    );
    try {
      await sendPasswordResetOtp(parsed.data.email, user.name, otp);
    } catch (error) {
      await pool.query("UPDATE password_reset_otps SET consumed_at = NOW() WHERE user_id = $1 AND consumed_at IS NULL", [user.id]);
      throw error;
    }
    return NextResponse.json(response);
  } catch (error) {
    console.error("Forgot password request failed", error);
    const message = error instanceof Error ? error.message : "Password reset is unavailable.";
    return NextResponse.json({ error: process.env.NODE_ENV === "development" ? message : "Password reset is temporarily unavailable. Please try again later." }, { status: 503 });
  }
}
