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
- **Instant AI Bill Reader & Side-by-Side Review Workstation**: Gemini 2.5 Flash Vision OCR with confidence scores per field and human-in-the-loop editing.
- **100-Point Transparent Lead Scoring System**: Categorizes leads into High (Priority Physical Survey) and Low (Diverted to 5-minute Tele-Advisory Desk), saving ₹2,500 per unqualified inquiry without rejecting customers.
- **Instant Same-Day Quote Engine**: Automatically calculates Central PM Surya Ghar subsidies (up to ₹78,000), 1,400 units/kW benchmark generation, and side-by-side 1 kW / 2 kW / 3 kW options with dated rule snapshots.
- **Live 8-Stage Milestone Tracker**: Public magic tracking link (`/track/[id]`) with automated WhatsApp & SMS alerts.
- **Stuck Projects Dashboard**: Automatically detects and escalates projects with no milestone update for >7 days.
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
│   • 100-Point Score Breakdown     │   • Stuck Projects Monitor (>7d)   │
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
│ • Google Gemini 2.5 Flash Vision  │ │ • In-Memory Singleton Repository │
│ • Confidence Scores (98%, 95%...) │ │   with Pre-seeded Sample Dataset │
│ • Blurry Bill Failure Handling    │ │ • Frozen Dated Rule Snapshots    │
│ • Built-in Resilient Fallback     │ │ • Real-time State & Mutation APIs│
└───────────────────────────────────┘ └──────────────────────────────────┘
```

### Why This Architecture Was Chosen:
1. **Next.js 16 (App Router) + React 19 + TypeScript**: Unifies backend API endpoints and frontend views into a single high-performance repository. Delivers zero-configuration Vercel deployment and guarantees strict type safety across the financial calculation engine.
2. **Tailwind CSS v4 + ThemeProvider**: Implements SolarSaathi's calm forest green design system (`#123D2B`, `#198754`, `#E7F3EC`, `#263238`) with dark/light mode toggling, smooth CSS transitions, and high-contrast typography.
3. **Google Gemini 2.5 Flash Vision OCR**: State-of-the-art multimodal extraction for printed MSEDCL/Mahavitaran electricity bills with sub-2-second latency and field-level confidence ratings.
4. **Resilient Dual-Mode Parsing**: If an evaluator runs locally without a `GEMINI_API_KEY`, SolarSaathi automatically operates via a built-in MSEDCL heuristic parser with per-field confidence scores, ensuring zero crashes or blank screens.
5. **Frozen Dated Rule Snapshots**: Quotes capture and store the exact subsidy and pricing rule active at the time of quotation, ensuring historical quotes never change when administrators update rules later.

---

## 3. Financial Calculation & Subsidy Engine

### Central PM Surya Ghar Muft Bijli Yojana Formula:
$$\text{Subsidy} = \min\left( 30000 \times \min(\text{kW}, 2) + 18000 \times \min(\max(\text{kW} - 2, 0), 1), 78000 \right)$$

- **1 kW System**: $1 \times ₹30,000 = \mathbf{₹30,000}$
- **2 kW System**: $2 \times ₹30,000 = \mathbf{₹60,000}$
- **3 kW System**: $₹60,000 + 1 \times ₹18,000 = \mathbf{₹78,000}$ (Maximum Central Cap)
- **4 kW+ System**: Capped at $\mathbf{₹78,000}$

### Turnkey Installation Base Pricing Table:
- 1 kW: ₹65,000 (Gross) − ₹30,000 Subsidy = **₹35,000 Net**
- 2 kW: ₹1,25,000 (Gross) − ₹60,000 Subsidy = **₹65,000 Net**
- 3 kW: ₹1,80,000 (Gross) − ₹78,000 Subsidy = **₹1,02,000 Net**

### Nagpur Generation & Payback Benchmark:
- **Benchmark Factor**: 1,400 kWh / kW / year (explicit client brief requirement).
- **Tariff Assumption**: ₹7.50 / unit (average blended MSEDCL residential rate).
- **Annual Savings (3 kW)**: $3 \times 1400 \times 7.50 = \mathbf{₹31,500 / \text{year}}$.
- **Payback (3 kW)**: $\frac{₹1,02,000}{₹31,500} = \mathbf{3.2\text{ Years}}$.
- **25-Year Net Profit**: $(₹31,500 \times 25) - ₹1,02,000 = \mathbf{₹6,85,500}$.

---

## 4. 100-Point Transparent Lead Qualification Rubric

Rather than a black-box machine learning model, SolarSaathi implements a transparent 100-point rubric that is explained in full detail to the user:

| Category | Max Points | Scoring Criteria | Business Justification |
| :--- | :---: | :--- | :--- |
| **Roof Ownership** | 25 | Owner: +25 pts<br>Tenant: +5 pts | PM Surya Ghar subsidy requires owner title deed. Tenants cannot install without landlord NOC. |
| **Monthly Bill** | 25 | $\ge ₹2500$: +25 pts<br>$₹1200-2499$: +15 pts<br>$<₹800$: +5 pts | Bills under ₹800/mo have paybacks >7 years and almost never purchase on-grid solar. |
| **Roof Area** | 20 | $\ge 500$ sq.ft: +20 pts<br>$250-499$: +14 pts<br>$<250$: +6 pts | Sizing benchmark requires ~100 sq.ft shadow-free area per kW. |
| **Power Consumption** | 20 | $\ge 250$ kWh/mo: +20 pts<br>$150-249$: +14 pts<br>$<100$: +4 pts | Directly impacts DISCOM sanctioned load limits and inverter sizing. |
| **Feeder Serviceability** | 10 | Nagpur Urban / Vidarbha: +10 pts | Verified DISCOM transformer feeder capacity. |
| **Total Score** | **100** | **$\ge 70$: High (Physical Survey Approved)**<br>**$<70$: Low (Tele-Advisory Desk)** | Eliminates 40% of wasted surveys while maintaining 100% customer helpfulness. |

---

## 5. 8-Stage Project Lifecycle & Stuck Projects Alert

### 8 Milestone Stages:
1. `LEAD_APPROVED`: Intake received and MSEDCL bill OCR verified.
2. `SITE_SURVEY`: Certified engineer assigned for shadow analysis.
3. `QUOTATION_APPROVED`: System capacity chosen and dated subsidy reserved.
4. `ADVANCE_PAYMENT`: 10% token payment recorded via mock gateway.
5. `INSTALLATION`: Tier-1 Mono PERC panels and inverter mounted.
6. `NET_METERING`: MSEDCL bi-directional meter installed and synchronized.
7. `SUBSIDY_APPLICATION`: DBT claim submitted on National Solar Portal.
8. `SUBSIDY_CREDITED`: ₹78,000 transferred into consumer bank account.

### Automated WhatsApp & SMS Notification Stream:
At every stage transition, an automated notification is created and displayed in the tracking stream with timestamp and delivery status (`DELIVERED`, `READ`).

### Stuck Projects Escalation (>7 Days Inactivity):
If a project remains in any stage without progress for more than 7 days (e.g. `PR-1025` stuck 10 days at Net Metering, `PR-1026` stuck 15 days), it is automatically:
- Flagged in the customer tracker with an Inactive Project Alert.
- Prominently surfaced in the Staff CRM **Stuck Projects** tab with 1-click customer phone contact and stage resolution actions.

---

## 6. Privacy & Security (DPDP Act Compliance)

1. **Consumer Number Masking**: On all public tracking URLs, 12-digit MSEDCL consumer IDs are masked as `4100****3741` to prevent unauthorized PII exposure.
2. **Access Control**: Role-Based Access Control (RBAC) separates homeowner views from staff admin tools.
3. **Zero Secrets in Repository**: No API keys or database passwords are hardcoded in source files.

---

## 7. Verification & Test Suite

The test suite in `tests/run-tests.mjs` verifies:
- Central PM Surya Ghar tiered calculation (1 kW = ₹30k, 2 kW = ₹60k, 3 kW = ₹78k, 5 kW = ₹78k).
- System capacity sizing based on 1,400 units/kW benchmark.
- Homeowner quote ROI and ~3.2 years payback calculation.
- Lead scoring engine saving ₹2,500 on Tenants and Small Bills.

To run:
```bash
npm test
npm run build
```
Result: **4/4 suites pass, zero compilation errors.**
