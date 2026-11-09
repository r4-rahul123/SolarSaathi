# Deployment & Setup Guide

**Project**: SolarSaathi (AI-Powered Rooftop Solar Sales & Project Management Platform)  
**Location / Target**: Nagpur & Vidarbha Region, Maharashtra (BU-41, MSEDCL Urban & Rural Circles)  
**Problem Statement**: Problem 2 (Rooftop Solar Lead Qualification, Sizing, Pricing & Project Tracker)  
**Submission Due**: Nov 9, 2026, 11:59 pm IST  

---

## 1. How to Run Locally (Step-by-Step)

### Prerequisites:
- **Node.js**: v20.9+ (recommended: current Node.js LTS)
- **npm**: v9+ or v10+
- **Git**

### Step 1: Clone the Repository
```bash
git clone <YOUR_PUBLIC_GITHUB_REPO_URL>
cd isolab
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

SolarSaathi features dual-mode architecture:
- **Zero-Setup In-Memory Mode**: If `DATABASE_URL` is omitted, the platform runs instantly using pre-seeded in-memory scenarios for rapid evaluation.
- **PostgreSQL Mode**: Follow [POSTGRES.md](./POSTGRES.md) to connect an existing PostgreSQL instance or run `docker compose up -d postgres`, then run `npm run db:setup` and `npm run db:seed-demo`.

```env
# Optional: Google Gemini API key for live multimodal bill OCR extraction.
# If omitted or left empty, SolarSaathi operates smoothly with manual input and high-fidelity presets!
GEMINI_API_KEY=
```

### Step 4: Run Automated Tests
Verify all core central subsidy formulas, 1,400 units/kW benchmark sizing, payback, and 100-point transparent lead scoring:
```bash
npm test
```

### Step 5: Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 2. Reviewer Demo Login Credentials (RBAC)

The local demo database includes four pre-seeded role accounts:

| Role | Demo Email | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- |
| **🏠 Homeowner** | `customer@solarsaathi.demo` | `solar123` | Mobile-first intake, MSEDCL bill upload, side-by-side verification, instant subsidy calculation, 100-point transparent score, and public magic tracking link (`/track/LD-30881`). |
| **📞 Sales Desk** | `sales@solarsaathi.demo` | `sales123` | Leads management queue, AI score filtering (High vs Low), and short-call diverts for tenants/small bills (saving ₹2,500/survey). |
| **🛠️ Site Surveyor** | `surveyor@solarsaathi.demo` | `survey123` | Scheduled rooftop site visits, shadow-free area checks, and structural feasibility approvals. |
| **📋 Project Coordinator (Admin)** | `admin@solarsaathi.demo` | `admin123` | Full access: Stuck projects alert (>7 days), DISCOM net-metering status, milestone progression, and **Dated Subsidy Rule & Base Installation Pricing Master Editor**. |

---

## 3. Pre-Seeded Evaluation Scenarios

For rapid 2-minute evaluation, 5 pre-seeded leads and projects are included in memory:

1. **Prashant Wankhede (`LD-30881`)**:
   - High Priority Owner: 340 units/month, 650 sq. ft. flat concrete roof.
   - Recommended 3 kW plant, ₹78,000 Central PM Subsidy, 100/100 score.
   - Public Tracker: `/track/LD-30881`.
2. **Rohit Meshram (`LD-30902`)**:
   - Tenant / Rental Lead: Flagged for Landlord NOC consultation.
   - Saves ₹2,500 wasted site survey cost by routing to a 5-minute phone call.
   - Public Tracker: `/track/LD-30902`.
3. **Ayesha Siddiqui (`LD-30915`)**:
   - Small Bill Lead: <₹800/mo (85 units). Payback >7 years.
   - Diverted to Tele-Advisory desk to save survey costs.
   - Public Tracker: `/track/LD-30915`.
4. **Dr. Rajesh Deshmukh (`PR-1025`)**:
   - **Stuck Project Alert**: Delayed at MSEDCL net-metering stage (>7 days threshold).
   - Flagged in Staff CRM Stuck Projects tab with 1-click stage resolution.
   - Public Tracker: `/track/PR-1025`.
5. **Sunita Patil (`PR-1026`)**:
   - **Stuck Project Alert**: Delayed at National Portal subsidy release.
   - Flagged in Staff CRM Stuck Projects tab with 1-click stage resolution.
   - Public Tracker: `/track/PR-1026`.

---

## 4. Production Deployment (Vercel)

The application uses **Next.js 16 App Router** and React 19.

### Steps to Deploy to Vercel:
1. Push this repository to your public GitHub account:
   ```bash
   git add .
   git commit -m "feat: complete SolarSaathi rooftop solar platform with RBAC authentication and dated subsidy rules"
   git branch -M main
   git remote add origin <YOUR_GITHUB_REPO_URL>
   git push -u origin main
   ```
2. Go to [https://vercel.com](https://vercel.com) and import the repository.
3. In **Environment Variables**, optionally set:
   - `DATABASE_URL`: Hosted PostgreSQL connection string (Supabase / Neon / AWS RDS).
   - `PASSWORD_RESET_SECRET`: Random secret of at least 32 characters.
   - `GEMINI_API_KEY`: Google Gemini API key for OCR extraction.
4. Click **Deploy**. Vercel will build and deploy the production site with an instant live `.vercel.app` URL.

---

## 5. Environment Variables Reference

| Variable Name | Required? | Purpose |
| :--- | :---: | :--- |
| `DATABASE_URL` | Optional | PostgreSQL connection string. If omitted, SolarSaathi operates in zero-setup in-memory mode. |
| `PASSWORD_RESET_SECRET` | Production | Random secret of at least 32 characters used to sign password reset tokens. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Optional | SMTP settings for email password-reset OTP dispatch. |
| `GEMINI_API_KEY` | Optional | Powers live Google Gemini 2.5 Flash Vision OCR on electricity bill images. If omitted, users can enter bill values manually. |
