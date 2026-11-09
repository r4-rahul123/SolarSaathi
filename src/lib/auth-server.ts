import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getPostgresPool } from "@/lib/postgres";
import type { UserRole } from "@/context/AuthContext";

const SESSION_COOKIE = "solarsaathi-session";
const SESSION_DAYS = 30;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

declare global {
  var __memorySessions: Map<string, { user: SessionUser; expiresAt: Date }> | undefined;
}

function getMemorySessions() {
  if (!globalThis.__memorySessions) {
    globalThis.__memorySessions = new Map();
  }
  return globalThis.__memorySessions;
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createUserSession(userId: string, demoUser?: SessionUser) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  try {
    await getPostgresPool().query(
      "INSERT INTO app_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
      [hashToken(token), userId, expiresAt],
    );
  } catch (err) {
    if (demoUser) {
      getMemorySessions().set(hashToken(token), { user: demoUser, expiresAt });
    }
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
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
    if (rows[0]) return rows[0];
  } catch (err) {
    // Database connection failed, fall back to in-memory sessions
  }

  const memSession = getMemorySessions().get(hashToken(token));
  if (memSession && memSession.expiresAt > new Date()) {
    return memSession.user;
  }
  return null;
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
    getMemorySessions().delete(hashToken(token));
  }
  cookieStore.delete(SESSION_COOKIE);
}
