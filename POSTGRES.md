# Local PostgreSQL setup

This project uses PostgreSQL for user accounts, sessions, enquiries, and pricing rules.

## Connect an existing PostgreSQL installation

1. In pgAdmin, create a database named `solarsaathi` (or choose an existing database).
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to match your PostgreSQL host, port, database, username and password. Keep this file private and out of Git.
3. Run `npm run db:setup` to create the application tables.
4. Run `npm run dev`.

If you prefer Docker, `docker compose up -d postgres` starts a separate development database on `127.0.0.1:55432`. Its password is for local use only; update `DATABASE_URL` to match and never use it in a shared or deployed environment.

## Accounts and roles

Public signup creates homeowner accounts. Staff roles must be provisioned by an authorized operator. `npm run db:seed-demo` is an optional local development helper for testing staff screens; it refuses to run in production and should not be used with a shared database.

## Password reset email

Forgot password sends a 6-digit code to the account email. SMTP must be configured in `.env.local` (do not commit or share that file), then restart the Next.js dev server:

```env
PASSWORD_RESET_SECRET=use-a-random-secret-with-at-least-32-characters
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-sending-email@example.com
SMTP_PASS=your-email-provider-app-password
SMTP_FROM=SolarSaathi <your-sending-email@example.com>
```

For Gmail, use an App Password from the Google account that sends the mail; the regular account password will not work. For another provider, use its SMTP host, port, and TLS settings. The OTP table is created by `npm run db:setup`.
