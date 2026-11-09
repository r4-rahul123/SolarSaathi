import { describe, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("Authentication fails closed without database-backed credentials", () => {
  test("login has no fixed demo-account or in-memory session bypass", () => {
    const loginRoute = fs.readFileSync(path.join(projectRoot, "src/app/api/auth/login/route.ts"), "utf8");
    const authServer = fs.readFileSync(path.join(projectRoot, "src/lib/auth-server.ts"), "utf8");

    assert.doesNotMatch(loginRoute, /DEMO_ACCOUNTS|solar123|sales123|survey123|admin123/);
    assert.doesNotMatch(authServer, /memorySessions|demoUser/);
    assert.match(authServer, /await insertSessionRecord\(getPostgresPool\(\), userId, session\)/);
    assert.match(authServer, /Fail closed when the database is unavailable/);
  });
});
