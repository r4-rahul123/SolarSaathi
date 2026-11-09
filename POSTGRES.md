# PostgreSQL setup

PostgreSQL is required for homeowner signup/login, sessions and persistent application data.

## Use an existing PostgreSQL installation

1. In pgAdmin, create a database, for example `solarsaathi`.
2. Copy `.env.example` to `.env.local` and edit `DATABASE_URL` with the host, port, database, username and password for your PostgreSQL instance. Keep `.env.local` private and out of Git.
3. From the project root, run `npm run db:setup`. This applies `database/schema.sql` to initialize the application tables.
4. Run `npm run dev` and create a homeowner account at `/signup`.

## Use the included local Docker database

With Docker Desktop running, execute:

```bash
docker compose up -d postgres
```

The database is bound to `127.0.0.1:55432`; the local connection string in `.env.example` matches the Compose defaults. These credentials are for local development only. Change the Compose password and connection string before using a shared environment.

## Account roles

Public signup creates homeowner accounts. There are no default staff accounts or passwords. For local staff-screen evaluation, an authorized database operator can create an account through signup and assign its role in pgAdmin:

```sql
UPDATE app_users
SET role = 'SALES', updated_at = NOW()
WHERE email = 'the-account-created-above@example.com';
```

Allowed roles are `HOMEOWNER`, `SALES`, `SURVEYOR` and `COORDINATOR`. Only provision accounts you control; do not run this against shared/production data unless authorized. Public role assignment remains unavailable.

## Password-reset email (optional)

Forgot-password OTP delivery requires SMTP settings in `.env.local`. For Gmail, use an App Password rather than the regular account password. Configure `PASSWORD_RESET_SECRET` with a random value of at least 32 characters. Restart the app after changing environment variables. The OTP storage table is created by `npm run db:setup`.
