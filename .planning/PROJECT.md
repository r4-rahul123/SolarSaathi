# Project: SolarSaathi (AI-Powered Rooftop Solar Sales & Project Management)

## Overview & Vision
SolarSaathi is a full-stack, AI-powered rooftop solar sales and project management platform built for the Nagpur & Vidarbha region (Maharashtra). It streamlines lead intake, automates MSEDCL electricity bill extraction via Gemini Vision OCR, evaluates 100-point lead qualification, delivers same-day quotes with PM Surya Ghar central subsidies, and tracks the 8-stage installation lifecycle.

## Personas & User Roles
1. **Homeowner**: Mobile-first intake, bill photo upload, side-by-side review, instant quote comparison (1 kW, 2 kW, 3 kW), and public magic tracking link (`/track/[id]`).
2. **Sales Desk Staff**: Lead qualification queue, high/low fit triage, 5-minute tele-advisory diverts (saving ₹2,500/survey on tenants & tiny bills).
3. **Site Surveyor**: Digital shadow analysis, structural feasibility verification, and physical inspection sign-off.
4. **Project Coordinator (Admin)**: 8-stage project pipeline management, stuck project alerts (>7 days inactive), DISCOM net-metering dispatch, and dated subsidy/pricing rules master editor.

## Tech Stack
- **Framework**: Next.js 16.4.4 App Router, React 19, TypeScript 5
- **Styling**: Tailwind CSS v4, Custom ThemeProvider (Dark/Light mode)
- **AI / Vision**: Google Gemini 2.5 Flash Vision OCR with resilient fallback
- **State & Database**: Dual-mode (In-memory singleton + optional PostgreSQL with Docker)
- **Financial Engine**: PM Surya Ghar central tiered subsidy formula + 1,400 kWh/kW/yr generation benchmark
