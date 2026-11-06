# Project Requirements & Verification Criteria

## Core Functional Requirements (Core Build Slice)

- [x] **Screen 1: Authentication & Role-Based Access Control (RBAC)**
  - Split-card Dribbble-inspired UI with clean energy vector art.
  - Dedicated `/login`, `/signup`, `/forgot-password`, and global `AuthModal`.
  - 1-click test login presets for Homeowner, Sales, Surveyor, and Coordinator.

- [x] **Screen 2 & 3: Multi-Step Lead Intake & AI Bill Reader**
  - Personal details, roof structure, shadow-free area slider.
  - Gemini Vision multimodal OCR extraction for MSEDCL bills (Consumer ID, Tariff, Sanctioned Load, Units, Amount).
  - Field-level confidence scores (98%, 95%, 91%, 88%).
  - Blurry photo simulation with manual edit workstation.

- [x] **Screen 4: 100-Point Transparent Lead Qualification**
  - Transparent score breakdown (Ownership 25 pts, Bill Size 25 pts, Area 20 pts, Units 20 pts, Feeder Fit 10 pts).
  - High score (≥70 pts) triggers immediate site survey assignment.
  - Low score (<70 pts) diverts tenants/tiny bills to 5-minute phone desk, saving ₹2,500/survey.

- [x] **Screen 5: Instant Same-Day Quote with Dated Subsidy Snapshot**
  - Central PM Surya Ghar tiered calculation (up to ₹78,000 cap).
  - 3-tier side-by-side comparison (1 kW, 2 kW, 3 kW).
  - Payback math (~3.2 years) and 25-year lifetime net profit.
  - Confetti celebration and quote acceptance mutation.

- [x] **Screen 6 & 7: Staff Operations CRM & Pricing Master**
  - Lead pipeline queue with search and tier filters.
  - Dated subsidy rules editor with effective start/end dates.
  - Turnkey base installation pricing table (1 kW, 2 kW, 3 kW).
  - Automated WhatsApp/SMS notification audit stream.

- [x] **Screen 8: Public Project Tracker & Stuck Projects Alert**
  - Public magic link (`/track/[id]`) with DPDP masked consumer IDs (`4100****3741`).
  - Swiggy/Amazon style 8-stage visual milestone progression.
  - Automated WhatsApp/SMS stream displaying dispatched alerts.
  - Inactivity monitor flagging projects without milestone updates for >7 days (`PR-1025`, `PR-1026`).

- [x] **Quality, Accessibility & Testing**
  - Responsive across mobile, tablet, and desktop.
  - Dark / Light mode toggle with zero hydration mismatch warnings.
  - Automated unit test suite passing 4/4 suites (`npm test`).
  - Zero TypeScript or Turbopack errors (`npm run build`).
