import argon2 from "argon2";
import pg from "pg";

if (process.env.NODE_ENV === "production") {
  console.error("Demo accounts must not be seeded in production.");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing.");
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const demoUsers = [
  { name: "Demo Customer", email: "customer@solarsaathi.demo", password: "customer123", role: "HOMEOWNER" },
  { name: "Demo Sales User", email: "sales@solarsaathi.demo", password: "sales123", role: "SALES" },
  { name: "Demo Surveyor", email: "surveyor@solarsaathi.demo", password: "survey123", role: "SURVEYOR" },
  { name: "Demo Admin", email: "admin@solarsaathi.demo", password: "admin123", role: "COORDINATOR" },
];

try {
  for (const user of demoUsers) {
    const passwordHash = await argon2.hash(user.password, { type: argon2.argon2id });
    await pool.query(
      `INSERT INTO app_users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, updated_at = NOW()`,
      [user.name, user.email, passwordHash, user.role],
    );
  }
  console.log("Demo accounts added. They are for local development only.");
} finally {
  await pool.end();
}
