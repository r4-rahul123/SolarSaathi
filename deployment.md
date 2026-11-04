# Deployment & Setup Guide

**Project**: Vidarbha Solar Hub (Rooftop Solar Qualification & Instant Subsidy Platform)  
**Location / Target**: Nagpur & Vidarbha Region, Maharashtra  
**Client Problem Solved**: Problem Statement 2 (Rooftop Solar Lead Qualification & Subsidy Quoting)

---

## 1. How to Run Locally (Step-by-Step)

### Prerequisites:
- **Node.js**: v18.18+ or v20+ or v22+
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
Create a file named `.env.local` in the project root:
```env
# Optional: Google Gemini API Key for Live Multimodal Bill OCR
# If omitted or left empty, the application automatically runs on a high-fidelity
# built-in MSEDCL heuristic parser so you can test seamlessly without an API key!
GEMINI_API_KEY=
```
*(Note: As per security guidelines, never commit actual secrets or API key values to GitHub).*

### Step 4: Run Automated Tests
Verify all core subsidy formulas, sizing logic, and lead scoring engine:
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

The application features full **Role-Based Access Control (RBAC)**. You can either use the **⚡ 1-Click Quick Demo Login** buttons inside the app navbar, or log in with the following demo credentials:

| Role | Demo Email | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- |
| **🏠 Homeowner** | `prashant@vidarbhasolar.in` | `user123` | Mobile-first intake, MSEDCL bill upload, instant subsidy calculation, and public magic tracking link (`/track/LD-30881`). |
| **📞 Sales Desk** | `sales@vidarbhasolar.in` | `sales123` | Leads management queue, AI Score filtering (High vs Low), and short-call diverts for tenants/₹600 bills (saving ₹2,500/survey). |
| **🛠️ Site Surveyor** | `surveyor@vidarbhasolar.in` | `survey123` | Scheduled rooftop site visits, shadow-free area checks, and structural feasibility approvals. |
| **📋 Project Coordinator (Admin)** | `admin@vidarbhasolar.in` | `admin123` | Full access: DISCOM (MSEDCL) net-metering applications, milestone updates, and **Dated Subsidy Rule Master Editor**. |

*(Tip: In the navbar, click on your profile name to open the role-switcher and switch perspectives with 1 click without re-typing passwords).*

---

## 3. Production Deployment (Vercel)

The application is built on **Next.js 16 App Router** and deploys to **Vercel** with zero configuration.

### Steps to Deploy to Vercel:
1. Push this repository to your public GitHub account:
   ```bash
   git add .
   git commit -m "feat: complete rooftop solar platform with RBAC authentication and dated subsidy rules"
   git branch -M main
   git remote add origin <YOUR_GITHUB_REPO_URL>
   git push -u origin main
   ```
2. Go to [https://vercel.com](https://vercel.com) and import the repository.
3. In **Environment Variables**, optionally add:
   - `GEMINI_API_KEY`: *(Your Google AI Studio API key)*
4. Click **Deploy**. Vercel will build and deploy the production site with an instant live `.vercel.app` URL.

---

## 4. Environment Variables Reference

| Variable Name | Required? | Purpose |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | Optional | Powers live Google Gemini 2.5 Flash Vision OCR on electricity bill images. If omitted, the built-in parser seamlessly handles evaluation with zero errors. |
