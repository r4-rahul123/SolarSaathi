# SolarSaathi — Fresh Setup and Submission Guide

SolarSaathi is a Next.js 16 application for rooftop-solar estimates, homeowner enquiries and project tracking in Nagpur & Vidarbha. Account signup, login and persistent application data require PostgreSQL.

## Prerequisites

- Node.js 22.9 or later (the database scripts use Node's `--env-file-if-exists` option)
- npm 10 or later
- PostgreSQL 14+ **or** Docker Desktop with Compose
- For browser E2E tests: Playwright's Chromium browser; the PDF assertions also require Python with `pypdf` and Poppler's `pdfinfo`

## Install and initialize

1. Extract the submission ZIP or clone the repository, then open a terminal in the project directory.
2. Install exact lockfile dependencies:

   ```bash
   npm ci
   ```

3. Create a private local environment file from `.env.example`:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   On macOS/Linux use `cp .env.example .env.local`. Edit `.env.local` and set `DATABASE_URL` to your database. Never commit or share `.env.local`.

4. Start PostgreSQL using **one** of these options:

   - **Docker:** `docker compose up -d postgres`. The included local-only Compose service listens on `127.0.0.1:55432`; its default database/user/password match `.env.example`. Change them for any shared or deployed environment.
   - **Existing PostgreSQL / pgAdmin:** create a database (for example `solarsaathi`) and update `DATABASE_URL` with its actual host, port, database, user and password.

5. Initialize the schema and run the app:

   ```bash
   npm run db:setup
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) and create a homeowner account at `/signup`. Public signup creates homeowner accounts; there are no default staff accounts or passwords. For local staff-screen evaluation, an authorized database operator may first create an account through signup and then assign only the needed role in pgAdmin:

   ```sql
   UPDATE app_users
   SET role = 'SALES', updated_at = NOW()
   WHERE email = 'the-account-created-above@example.com';
   ```

   Allowed roles are `HOMEOWNER`, `SALES`, `SURVEYOR` and `COORDINATOR`. Use only an account you control; never expose role assignment through a public UI or use this SQL against a shared/production database without authorization. The ZIP contains no generated accounts or database contents.

### Reviewer login

There are **no seeded demo credentials** in the repository. Create a homeowner account from `/signup` using an email you control. For staff-only screens, create an account and assign `SALES` locally using the pgAdmin SQL above. No username or password is hardcoded or included in this submission.

The database setup command applies `database/schema.sql`; it initializes tables and is not a versioned migration framework. This schema includes `solar_payments` for mock payment tracking and `solar_notifications` for the mock notification audit trail. Existing installations should back up the database and rerun `npm run db:setup` to add tables and indexes; the operation is idempotent. Keep backups before applying schema changes to an existing database.

The staff dashboard's **Payments** section records simulated project payments only. Payment method labels such as “UPI Mock” do not initiate a transfer. A printable receipt is issued only for a record marked Paid and is explicitly labelled as not a real transaction.

The staff dashboard's **Mock Notifications** tab records automated customer communication generated on each project stage transition. Messages are simulated; no external WhatsApp Business API or SMS gateway is connected and no carrier charges occur. Phone numbers are masked for homeowner data protection. Unit tests cover notification templating, stage formatting, idempotency deduplication, and authorization policy.

## Optional integrations

- `GEMINI_API_KEY`: enables live Gemini bill extraction. Without it, users can enter bill values manually. Provider errors can still happen; the uploaded bill remains available for retry/manual entry.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`: enables password-reset email. Use a provider app password, not your normal Gmail password. Without SMTP configuration, email delivery is unavailable.
- `PASSWORD_RESET_SECRET`: configure a random secret of at least 32 characters for password-reset tokens, especially in deployments.

The support address is `solarsaathi9@gmail.com`. A `mailto:` link opens the visitor's email app and does not send automatically. Phone support is unavailable for this demo; WhatsApp is coming soon.

## Verification commands

Run the deterministic unit and financial-logic tests with:

```bash
node --experimental-strip-types tests/run-tests.mjs
```

This direct Node command passed **34/34 tests** on 2026-11-09. In the current Windows/Codex environment, the equivalent `npm test` wrapper returned exit code 1 without test diagnostics; do not report the wrapper as passing. The mock-payment checks exercise calculation and authorization policy helpers; they do not replace database-backed API/E2E payment tests. See [TDD.md](./TDD.md) for the verified status and limits.

Run static checks and a production build with:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

In the current Windows environment, direct TypeScript checking passed and direct full ESLint exited 0 (one run showed three existing unused-import warnings in `src/lib/db.ts`). A Webpack production build completed once; final retries after payment API hardening failed with `EPERM` while creating directories under `.next`, so the exact final source tree's build is not confirmed. `npm run build` returned exit code 1 without diagnostics in this environment.

Run the homeowner browser E2E test after PostgreSQL is running and initialized:

```bash
npx playwright install chromium
npm run test:e2e
```

The E2E suite starts/reuses the app at port 3000 and uses deterministic synthetic OCR fixtures rather than a live Gemini request. It includes a Marathi-language toggle test for both homeowner intake steps and a homeowner estimate-to-tracking journey; generated accounts and leads are deleted during teardown. Use a disposable local database for tests. On a fresh machine, install Python `pypdf` and Poppler (`pdfinfo`) for the PDF page-count assertions. The test verifies two A4 pages; native OS print-dialog behavior is not automated.

## Deployment notes

Set `DATABASE_URL` and `PASSWORD_RESET_SECRET` in the hosting provider's secret environment settings. Add `GEMINI_API_KEY` and SMTP variables only if those integrations are enabled. Production cookie `Secure` configuration is present in code, but live HTTPS cookie behavior and production deployment have not been independently verified. Do not use the local Compose credentials or sample data in a shared deployment.

## Submission contents and exclusions

The source, database schema/setup instructions, Playwright configuration/tests, test fixtures and documentation are included. `.env.local`, `.env`, dependency folders, Next build output, test-results, temporary files and local database contents are excluded. The sample two-page quotation PDF is included as a review artifact.
