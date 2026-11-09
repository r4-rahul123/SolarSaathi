import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getPostgresPool } from "@/lib/postgres";
import type { UserRole } from "@/context/AuthContext";
import type { PoolClient } from "pg";

const SESSION_COOKIE = "solarsaathi-session";
const SESSION_DAYS = 30;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export function createSessionCredential() {
  return {
    token: randomBytes(32).toString("base64url"),
    expiresAt: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000),
  };
}

export async function insertSessionRecord(client: Pick<PoolClient, "query">, userId: string, session: ReturnType<typeof createSessionCredential>) {
  await client.query(
    "INSERT INTO app_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
    [hashToken(session.token), userId, session.expiresAt],
  );
}

export async function setSessionCookie(session: ReturnType<typeof createSessionCredential>) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: session.expiresAt,
  });
}

export async function createUserSession(userId: string) {
  const session = createSessionCredential();
  await insertSessionRecord(getPostgresPool(), userId, session);
  await setSessionCookie(session);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { rows } = await getPostgresPool().query<SessionUser>(
      `SELECT u.id, u.name, u.email, u.role
       FROM app_sessions s JOIN app_users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
      [hashToken(token)],
    );
    return rows[0] ?? null;
  } catch {
    // Fail closed when the database is unavailable.
    return null;
  }
}

export async function destroyUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await getPostgresPool().query("DELETE FROM app_sessions WHERE token_hash = $1", [hashToken(token)]);
    } catch {
      // Ignore error if database unreachable
    }
  }
  cookieStore.delete(SESSION_COOKIE);
}
