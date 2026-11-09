# SolarSaathi

SolarSaathi helps homeowners review rooftop-solar estimates and track projects across Nagpur & Vidarbha.

## Local setup

Requirements: Node.js 22.9+ and PostgreSQL (or Docker Desktop with Compose).

```bash
npm ci
npm run db:setup
npm run dev
```

Before running these commands, copy `.env.example` to `.env.local`, set `DATABASE_URL`, and start PostgreSQL. Detailed fresh-machine, E2E and deployment steps are in [deployment.md](./deployment.md) and [POSTGRES.md](./POSTGRES.md). Create a homeowner login at `/signup`.

The deterministic test command is `node --experimental-strip-types tests/run-tests.mjs` (26/26 passed on 2026-11-09). In the current Windows/Codex environment, the `npm test` wrapper returned exit code 1 without diagnostics; see [TDD.md](./TDD.md).

## Business support

- Email: [solarsaathi9@gmail.com](mailto:solarsaathi9@gmail.com)
- Phone support: currently unavailable - Demo
- WhatsApp support: Coming Soon
- Contact: SolarSaathi Support Team
- Service area: Nagpur & Vidarbha

The email link opens the visitor's default email application; it does not send mail automatically. Contact details are centralized in `src/config/business.ts`.
The same support information is available from the global footer and the `/contact` page.
