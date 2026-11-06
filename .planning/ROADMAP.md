# Project Roadmap & Milestones

## Phase 1: Foundation & Financial Calculation Engine [COMPLETED]
- [x] Scaffold Next.js 16 App Router with React 19 and Tailwind CSS v4.
- [x] Implement deterministic PM Surya Ghar subsidy math ($\min(30000 \times \min(kW,2) + 18000 \times \min(\max(kW-2,0),1), 78000)$).
- [x] Implement 1,400 kWh/kW/yr generation benchmark and ROI calculation.
- [x] Implement 100-point transparent lead qualification rubric.

## Phase 2: Multimodal AI Bill Extraction & Intake Workstation [COMPLETED]
- [x] Integrate Google Gemini 2.5 Flash Vision OCR with Zod schema validation.
- [x] Implement dual-mode parser with fallback for API-key-free local testing.
- [x] Build side-by-side verification card with per-field confidence badges.
- [x] Add 1-click evaluator test presets (Owner High, Tenant, Small Bill).

## Phase 3: Brand Identity, Visual UI & Photorealistic Imagery [COMPLETED]
- [x] SolarSaathi color palette (`#123D2B`, `#198754`, `#E7F3EC`, `#263238`).
- [x] Dribbble-inspired split-card authentication (`/login`, `/signup`, `AuthModal`).
- [x] Photorealistic rooftop solar installation and certified surveyor imagery.
- [x] Trilingual localization provider (English, Marathi `mr`, Hindi `hi`).

## Phase 4: Staff Operations CRM & Dated Rules Master [COMPLETED]
- [x] Lead queue with search, tier filter, and 8-stage updater.
- [x] Stuck projects dashboard flagging >7 days inactivity (`PR-1025`, `PR-1026`).
- [x] Dated subsidy rule editor and turnkey installation pricing table.
- [x] Mock WhatsApp & SMS notification dispatch log.

## Phase 5: Submission & Verification [COMPLETED]
- [x] Automated test suite passing 4/4 suites (`npm test`).
- [x] Production build clean exit 0 (`npm run build`).
- [x] Technical Design Document generated (`Technical_Design_Document.docx`).
- [x] Deployment guide with demo credentials (`deployment.md`).
- [x] Packaged `submission.zip` (<25 MB).
