import "server-only";
import { Pool } from "pg";

const globalForPostgres = globalThis as typeof globalThis & { solarPostgresPool?: Pool };

export function getPostgresPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Configure .env.local and start PostgreSQL.");
  }

  if (!globalForPostgres.solarPostgresPool) {
    globalForPostgres.solarPostgresPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  return globalForPostgres.solarPostgresPool;
}
