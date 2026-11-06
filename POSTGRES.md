# Local PostgreSQL setup

This project uses PostgreSQL for user accounts, sessions, enquiries, and pricing rules.

## Start the local database

1. Start Docker Desktop.
2. Copy `.env.example` to `.env.local`.
3. Run `docker compose up -d postgres`.
4. Run `npm run db:setup` to create the tables.
5. Run `npm run db:seed-demo` to add the local demo accounts.
6. Run `npm run dev`.

The Compose database is bound to `127.0.0.1:55432` to avoid colliding with a local PostgreSQL install. It uses a development-only password. Change it before using any shared or deployed environment, and update `DATABASE_URL` to match. Do not commit `.env.local`.

## Local demo accounts

| Workspace | Email | Password |
| --- | --- | --- |
| Customer | `customer@solarsaathi.demo` | `customer123` |
| Sales | `sales@solarsaathi.demo` | `sales123` |
| Surveyor | `surveyor@solarsaathi.demo` | `survey123` |
| Admin | `admin@solarsaathi.demo` | `admin123` |

The seed command refuses to run with `NODE_ENV=production`. These credentials are only for a local demo. The database stores Argon2id password hashes, not these plaintext passwords. Public signup always creates a `HOMEOWNER`; staff roles are assigned through the local demo seed or by an administrator.

The current Compose password is intentionally simple for local development. Use a strong secret manager value and a managed database before deployment.

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
