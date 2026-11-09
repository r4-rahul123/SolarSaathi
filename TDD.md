# TECHNICAL DESIGN DOCUMENT (TDD)
## Product: SolarSaathi (AI-Powered Rooftop Solar Sales & Project Management Platform)
**Target Market**: Nagpur & Vidarbha Region, Maharashtra (BU-41, MSEDCL Urban & Rural Circles)  
**Client Problem Brief**: Problem Statement 2 (Nagpur Rooftop Solar)  
**Repository (GitHub)**: [https://github.com/rahul-isolab/nagpur-rooftop-solar](https://github.com/rahul-isolab/nagpur-rooftop-solar)  
**Live Deployed URL**: [https://solarsaathi.vercel.app](https://solarsaathi.vercel.app)  
**Author**: Candidate  
**Date**: November 2026 (Due Nov 9, 2026)  

---

## 1. Executive Summary & Business Problem

Company A operates rooftop solar installations across Nagpur and Vidarbha, handling ~1,400 incoming leads per month. Under the traditional manual process:
1. **₹26.4 Lakhs Annual Loss on Unqualified Surveys**: 40% of the 220 physical rooftop surveys per month (~88 surveys) were conducted for tenants who do not own the property or consumers with tiny ₹600 electricity bills who never buy. Each surveyor visit costs ₹2,500 ($88 \times ₹2,500 \times 12 = ₹26.4\text{ Lakhs/year}$).
2. **₹60.48 Lakhs Annual Sales Lost to Delays**: Preparing quotes manually in Excel takes 3 days, causing 4% of genuine buyers (14 per month) to purchase from faster rivals ($14 \times ₹36,000 \times 12 = ₹60.48\text{ Lakhs/year}$).
3. **Total Annual Value Leakage**: **₹86.88 Lakhs / year**.

### Core Objective of the "CORE BUILD" Slice:
Eliminate physical survey waste by deploying **SolarSaathi** — an end-to-end working platform with:
- **Instant AI Bill Reader & Side-by-Side Review Workstation**: Gemini OCR with customer confirmation of extracted bill fields.
- **100-Point Transparent Lead Scoring System**: Uses explicit design-assumption weights and separates the points tier from the recommended next action. Tenant/low-usage cases can receive a short call without being rejected.
- **Instant Same-Day Quote Engine**: Automatically calculates Central PM Surya Ghar subsidies (up to ₹78,000), 1,400 units/kW benchmark generation, and side-by-side 1 kW / 2 kW / 3 kW options with dated rule snapshots.
- **Live 8-Stage Milestone Tracker**: Public magic tracking link (`/track/[id]`) with automated WhatsApp & SMS alerts.
- **Stuck Projects Dashboard**: Flags projects with no status change for 7 full days; subsidy-credited projects are terminal and excluded.
- **Staff CRM & Dated Subsidy/Pricing Master**: Screen 6 and Screen 7 with full RBAC (Homeowner, Sales Desk, Site Surveyor, Coordinator).

---

## 2. System Architecture & Tech Stack Justification

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT / USER PERSONAS                          │
├───────────────────────────────────┬────────────────────────────────────┤
│   Homeowner (Mobile Browser)      │   Sales & Operations Staff (Desk)  │
│   • Multi-step Intake & Upload    │   • Lead Queue & AI Audit Table    │
│   • Side-by-side Bill Review      │   • 8-Stage Pipeline Transitions   │
│   • Estimate & Follow-up Guidance │   • Score Breakdown & Reason Codes │
│   • 3-Tier Quote & Confetti       │   • Dated Subsidy & Price Master   │
│   • Public Magic Link Tracker     │   • WhatsApp/SMS Notification Log  │
└─────────────────┬─────────────────┴──────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   NEXT.JS 16 APP ROUTER (FULL-STACK)                   │
├────────────────────────────────────────────────────────────────────────┤
│ • Server Actions & Route Handlers (/api/leads, /api/ai/parse-bill)    │
│ • Multilingual Context (English, Marathi mr, Hindi hi)                │
│ • Tailwind CSS v4 + Dark/Light Mode Theme Provider                     │
│ • Deterministic Calculation Engine (PM Subsidy, 1,400 Benchmark)       │
│ • DPDP Act Compliance (Masked MSEDCL Consumer Numbers)                 │
└─────────────────┬────────────────────────────────────┬─────────────────┘
                  │                                    │
                  ▼                                    ▼
┌───────────────────────────────────┐ ┌──────────────────────────────────┐
│         AI / VISION LAYER         │ │      DATA PERSISTENCE LAYER      │
├───────────────────────────────────┤ ├──────────────────────────────────┤
│ • Google Gemini Vision OCR        │ │ • PostgreSQL Repository          │
│ • Schema-validated Extraction     │ │ • Persistent Leads & Rule Tables │
│ • Manual Review on Unclear Reads  │ │ • Frozen Dated Quote Snapshots   │
│ • Built-in Resilient Fallback     │ │ • Real-time State & Mutation APIs│
└───────────────────────────────────┘ └──────────────────────────────────┘
```

### Why This Architecture Was Chosen:
1. **Next.js 16 (App Router) + React 19 + TypeScript**: Unifies backend API endpoints and frontend views into a single high-performance repository. Delivers zero-configuration Vercel deployment and guarantees strict type safety across the financial calculation engine.
2. **Tailwind CSS v4 + ThemeProvider**: Implements SolarSaathi's calm forest green design system (`#123D2B`, `#198754`, `#E7F3EC`, `#263238`) with dark/light mode toggling, smooth CSS transitions, and high-contrast typography.
3. **Google Gemini Vision OCR**: `gemini-3.6-flash` extracts bill fields and validates the response schema. A live synthetic-bill request returned the expected values; other tested model versions returned provider deadline errors at that time.
4. **Resilient Dual-Mode Parsing**: If an evaluator runs locally without a `GEMINI_API_KEY`, SolarSaathi automatically operates via a built-in MSEDCL heuristic parser with per-field confidence scores, ensuring zero crashes or blank screens.
5. **Frozen Dated Rule Snapshots**: Each saved quote retains option prices and calculated amounts plus subsidy rates/cap, generation factor, tariff assumption, rule name and effective date. Display and print use the stored quote options rather than recalculating from current admin rules.

---

## 3. Financial Calculation & Subsidy Engine

### Central PM Surya Ghar Muft Bijli Yojana Formula:
$$\text{Subsidy} = \min\left( 30000 \times \min(\text{kW}, 2) + 18000 \times \min(\max(\text{kW} - 2, 0), 1), 78000 \right)$$

The function accepts fractional kW values (for example, 1.5 kW yields ₹45,000) and applies the ₹78,000 cap. The quote options currently displayed are 1, 2 and 3 kW. Subsidy is an estimate pending eligibility and DISCOM approval.

- **1 kW System**: $1 \times ₹30,000 = \mathbf{₹30,000}$
- **2 kW System**: $2 \times ₹30,000 = \mathbf{₹60,000}$
- **3 kW System**: $₹60,000 + 1 \times ₹18,000 = \mathbf{₹78,000}$ (Maximum Central Cap)
- **4 kW+ System**: Capped at $\mathbf{₹78,000}$

### Turnkey Installation Base Pricing Table:
- 1 kW: ₹75,000 (Gross) − ₹30,000 estimated subsidy = **₹45,000 estimated net**
- 2 kW: ₹1,40,000 (Gross) − ₹60,000 estimated subsidy = **₹80,000 estimated net**
- 3 kW: ₹1,95,000 (Gross) − ₹78,000 estimated subsidy = **₹1,17,000 estimated net**

### Generation, Savings & Payback Assumptions:
- **Sizing**: `ceil(monthly units × 12 ÷ 1,400)`, with a 1 kW minimum and 3 kW quote-option cap. If usage exceeds the 3 kW benchmark, the quote warns that a larger system needs manual review.
- **Generation factor**: 1,400 units/kW/year (client-provided benchmark, not a generation guarantee).
- **Tariff assumption**: ₹8/unit. Estimated annual savings = generation × assumed tariff. It does not model self-consumption/export splits; actual savings depend on usage, net-metering settlement and site conditions.
- **Payback**: estimated net cost ÷ annual savings, rounded to two decimals. If annual savings are zero or negative, payback is shown as “Not calculable”.
- **25-year estimate**: `(annual savings × 25) − net cost`, undiscounted and excluding degradation, maintenance, replacement, financing, inflation and tariff changes.
- Prices and other rule values are editable assumptions; current values are not a vendor quote or subsidy guarantee.

---

## 4. 100-Point Transparent Lead Qualification Rubric

Rather than a black-box model, SolarSaathi uses a transparent 100-point heuristic. Staff can inspect the internal breakdown and reason codes; homeowners receive next-step guidance without the internal score:

| Category | Max Points | Scoring Criteria | Business Justification |
| :--- | :---: | :--- | :--- |
| **Roof Ownership** | 25 | Owner: +25 pts<br>Tenant: +5 pts | PM Surya Ghar subsidy requires owner title deed. Tenants cannot install without landlord NOC. |
| **Monthly Bill** | 25 | ₹2,800+: 25; ₹1,800+: 20; ₹1,000+: 12; otherwise 5 | Design assumption; bill and units are correlated inputs. |
| **Roof Area** | 20 | 500 sq.ft+: 20; 300+: 14; otherwise 5 | Design assumption; survey confirms usable/shadow-free area. |
| **Power Consumption** | 20 | 300 units+: 20; 180+: 14; 100+: 8; otherwise 4 | Design assumption used alongside bill amount. |
| **PIN Prefix Proxy** | 10 | PIN starts `44`: 10; otherwise 6 | Rough service-area proxy, not a verified feeder-capacity check. |
| **Score bands** | **100** | 70+: High; 40–69: Medium; below 40: Low | Bands are design assumptions, not client-provided/calibrated thresholds. |

Ownership points are Owner 25 / Tenant 5. The points tier is independent from routing: tenants, bills below ₹800, usage below 100 units, and non-High tiers are routed to a short call; only High tier without these review flags is routed to survey review. A short call is not rejection. Staff can view points and reason codes; homeowners receive next-step guidance rather than the internal score breakdown.

---

## 5. 8-Stage Project Lifecycle & Stuck Projects Alert

### 8 Milestone Stages:
1. `LEAD_APPROVED`: Intake received and MSEDCL bill OCR verified.
2. `SITE_SURVEY`: Certified engineer assigned for shadow analysis.
3. `QUOTATION_APPROVED`: System capacity chosen and dated subsidy reserved.
4. `ADVANCE_PAYMENT`: manually recorded simulated payment entry; no gateway or real fund transfer is involved.
5. `INSTALLATION`: Tier-1 Mono PERC panels and inverter mounted.
6. `NET_METERING`: MSEDCL bi-directional meter installed and synchronized.
7. `SUBSIDY_APPLICATION`: DBT claim submitted on National Solar Portal.
8. `SUBSIDY_CREDITED`: ₹78,000 transferred into consumer bank account.

### Automated WhatsApp & SMS Notification Stream:
At every stage transition, an automated notification is created and displayed in the tracking stream with timestamp and delivery status (`DELIVERED`, `READ`).

### Stuck Projects Escalation (>7 Days Inactivity):
The application stores `lastStatusChangedAt` separately from general `updatedAt`. At 7 complete 24-hour periods without a status transition, a non-terminal project is flagged. Editing unrelated lead fields does not reset the timer. `SUBSIDY_CREDITED` is the only terminal status currently defined; cancellation is not part of the workflow.

When a project remains in any stage without a status transition for 7 complete days, it is:
- Flagged in the customer tracker with an Inactive Project Alert.
- Prominently surfaced in the Staff CRM **Stuck Projects** tab with customer contact and separate stage update actions.

---

## 6. Privacy & Security (DPDP Act Compliance)

1. **Consumer Number Masking**: On all public tracking URLs, 12-digit MSEDCL consumer IDs are masked as `4100****3741` to prevent unauthorized PII exposure.
2. **Access Control**: Role-Based Access Control (RBAC) separates homeowner views from staff admin tools.
3. **Zero Secrets in Repository**: No API keys or database passwords are hardcoded in source files.

### Central Business Support Contact

`src/config/business.ts` is the source of truth for SolarSaathi's public contact details. The footer, Contact Us page, enquiry error help, password reset email and Page 2 of the quotation read from that configuration. The public email is `solarsaathi9@gmail.com` and links use `mailto:` with context-specific subjects. Phone support is labeled unavailable for the demo and WhatsApp is marked coming soon; neither channel has a number, `tel:` link or WhatsApp URL. The contact person is SolarSaathi Support Team and the service area is Nagpur & Vidarbha. A `mailto:` link opens the visitor's email application; it does not send mail automatically.

### Quotation Capacity Coverage Review

- Coverage uses the quotation's saved generation factor: `monthly generation = maximum quoted system kW × units/kW/year ÷ 12`.
- `coverage % = monthly generation ÷ recorded monthly consumption × 100`, displayed to one decimal place.
- The amber **System Capacity Review Required** notice appears on the estimate and printed quotation only when valid, positive recorded consumption is greater than the maximum quoted option's monthly benchmark. Exact and lower usage, or zero/invalid usage, do not trigger it.
- The notice clarifies that 3 kW is the largest currently quoted option and recommends manual review of roof area, sanctioned load, larger-system feasibility and DISCOM approval.
- Example: 375 units/month against a 3 kW benchmark of 350 units/month is 93.3% coverage and requires review.
- This advisory does not change the quote's prices, subsidy, savings or historical rule snapshot.

---

## 7. Verification & Test Suite

### Mock payment tracking

- `solar_payments` stores simulated payment entries with project/user foreign keys, status/type/method constraints, a unique transaction reference and idempotency key.
- Project amount is the selected quotation option's saved net cost; totals include only `Paid` entries.
- Sales staff and coordinators can record/update payment status. Homeowners receive only the four-field summary for their own project.
- Project-row transactions serialize payment writes and reject amounts above the outstanding balance. Receipts are generated only for `Paid` records and are labelled **MOCK PAYMENT RECEIPT – NOT A REAL TRANSACTION**.
- No payment gateway, UPI API, or bank integration is used.
- Payment unit tests cover advance/installment amounts, rollups, full payment, pending/failed exclusion, over-balance rejection, role access and owner isolation. These helper tests do not replace database-backed API/E2E tests.

### 8. WhatsApp Mock Notification System

- Automatically creates an audit notification record when a project status transitions across all 8 stages (`LEAD_APPROVED`, `SITE_SURVEY`, `QUOTATION_APPROVED`, `ADVANCE_PAYMENT`, `INSTALLATION`, `NET_METERING`, `SUBSIDY_APPLICATION`, `SUBSIDY_CREDITED`).
- Uses atomic database transactions (`withPostgresTransaction`) to serialize lead status updates and notification insertion, ensuring consistency without orphan records.
- Idempotency guard prevents duplicate notifications on repeated identical status submissions.
- Contextual notification messages dynamically incorporate customer first name, project ID, localized stage label, and specific operational next steps.
- Admin dashboard tab ("Mock Notifications") provides search, channel/status filters, and a prominent disclaimer banner stating zero external costs and no actual WhatsApp/SMS transmission.
- Full RBAC protection: only staff can inspect system notifications; customers can access only their own project notifications with masked recipient phone numbers.

The Node tests in `tests/run-tests.mjs` verify:
- Subsidy amounts at integer capacities, fractional capacity and the cap.
- System sizing against the 1,400 units/kW/year benchmark.
- Quote arithmetic and null payback when savings are non-positive.
- Lead score tiers and independent short-call routing.
- Capacity coverage above, at and below the 3 kW benchmark, invalid usage, and the matching web/print warning in the Playwright quotation flow.
- Central business contact values, subject-specific `mailto:` URLs, no retired business contact strings and use of the central configuration in contact and quotation components.

The unit/helper suite includes signup rollback and a two-page quotation PDF fixture. A separate Playwright flow now verifies homeowner signup and login, session cookie attributes, synthetic bill extraction, estimate preview and save, homeowner data redaction, staff-route rejection, cross-homeowner lead isolation, option selection, quote acceptance, and project tracking. The browser-generated A4 PDF was inspected by page count and rendered visually during layout work; the native print dialog/download interaction itself is not automated.

### Bill Reading Reliability – Verified

- Primary Gemini model: `gemini-3.6-flash`.
- SDK request timeout: 28 seconds.
- One retry configured for transient provider errors.
- API route maximum duration: 60 seconds.
- Uploaded bill is retained when extraction fails.
- Users can retry extraction without uploading the bill again.
- Readable error messages replace raw abort errors.
- Live synthetic bill extraction verified.
- Playwright E2E verified recovery after a simulated initial failure.
- TypeScript, ESLint, and production build passed.

**Known limitation:** Gemini provider availability and response latency are external dependencies. HTTP 503/504 responses may still occur; retry and manual recovery reduce their impact but do not guarantee uninterrupted extraction.

This closes an important reliability gap in the AI bill-reading feature. The homeowner journey now has a tested recovery path when AI extraction initially fails. Provider availability remains an external dependency; extraction is not guaranteed to be uninterrupted.

To run:
```bash
npm test
npm run build
```
Latest verification (2026-11-09): **34/34 tests pass with `node --experimental-strip-types tests/run-tests.mjs`**. `npm test` returned exit code 1 without test diagnostics in this Windows environment; do not report the wrapper as passing. Existing Playwright checks passed against an isolated database schema on port 3001; see deployment.md for their scope and limits. Payment-specific tests cover amount/status arithmetic and role/owner policy helpers, but do not replace live database-backed payment API or browser tests. The mock payments schema was applied successfully to the configured local PostgreSQL database. Final TypeScript check passes. Full ESLint direct invocation exits 0; one run reported three existing unused-import warnings in `src/lib/db.ts`. A Webpack production build completed successfully once after adding payment routes and UI. Final build retries after small payment API response/access hardening failed with Windows `EPERM` while creating directories under `.next`; the exact final source tree's production build is therefore not confirmed. `npm run build` also returned exit code 1 without diagnostics. No real payment gateway or transfer is connected. Production deployment, live payment API browser workflow and HTTPS behavior remain unverified. E2E does not make a live Gemini request; a direct Gemini request was independently verified in an earlier audit. Native print dialog was not automated. Development cookies were verified as HttpOnly and SameSite=Lax; Secure is not set in development. SameSite=Lax reduces CSRF exposure but is not complete CSRF protection. Synthetic test accounts and lead rows are deleted by E2E teardown. The original `createSessionCredential` and initial Next startup errors were not reproduced, so their root causes remain unconfirmed.
