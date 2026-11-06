import { createHmac, timingSafeEqual } from "node:crypto";
import argon2 from "argon2";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPasswordResetSecret } from "@/lib/mailer";
import { getPostgresPool } from "@/lib/postgres";

const Schema = z.object({
  email: z.email().trim().toLowerCase(),
  otp: z.string().regex(/^\d{6}$/),
  password: z.string().min(8).max(128),
});
const invalid = () => NextResponse.json({ error: "The code is invalid, expired, or has reached its attempt limit." }, { status: 400 });

export async function POST(request: NextRequest) {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email, 6-digit code, and password of at least 8 characters." }, { status: 400 });

  const pool = getPostgresPool();
  const client = await pool.connect();
  try {
    const secret = getPasswordResetSecret();
    await client.query("BEGIN");
    const userResult = await client.query<{ id: string }>("SELECT id FROM app_users WHERE email = $1", [parsed.data.email]);
    const user = userResult.rows[0];
    if (!user) { await client.query("ROLLBACK"); return invalid(); }

    const otpResult = await client.query<{ id: string; code_hash: string; attempts: number }>(
      `SELECT id, code_hash, attempts FROM password_reset_otps
       WHERE user_id = $1 AND consumed_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1 FOR UPDATE`, [user.id],
    );
    const otp = otpResult.rows[0];
    if (!otp || otp.attempts >= 5) { await client.query("ROLLBACK"); return invalid(); }

    const expected = Buffer.from(otp.code_hash, "hex");
    const actual = Buffer.from(createHmac("sha256", secret).update(`${user.id}:${parsed.data.otp}`).digest("hex"), "hex");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      await client.query("UPDATE password_reset_otps SET attempts = attempts + 1 WHERE id = $1", [otp.id]);
      await client.query("COMMIT");
      return invalid();
    }

    const passwordHash = await argon2.hash(parsed.data.password, { type: argon2.argon2id });
    await client.query("UPDATE app_users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [passwordHash, user.id]);
    await client.query("DELETE FROM app_sessions WHERE user_id = $1", [user.id]);
    await client.query("UPDATE password_reset_otps SET consumed_at = NOW() WHERE id = $1", [otp.id]);
    await client.query("UPDATE password_reset_otps SET consumed_at = NOW() WHERE user_id = $1 AND id <> $2 AND consumed_at IS NULL", [user.id, otp.id]);
    await client.query("COMMIT");
    return NextResponse.json({ message: "Password updated. Please sign in with your new password." });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("Password reset failed", error);
    return NextResponse.json({ error: "Could not update the password. Please try again." }, { status: 503 });
  } finally {
    client.release();
  }
}
