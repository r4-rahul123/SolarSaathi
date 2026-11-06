import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Copy .env.example to .env.local and set the database URL.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  const schema = await readFile(new URL("../database/schema.sql", import.meta.url), "utf8");
  await pool.query(schema);
  console.log("PostgreSQL schema is ready.");
} finally {
  await pool.end();
}
