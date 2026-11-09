import { test, expect } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import pg from "pg";
import { execFileSync } from "node:child_process";

loadEnvConfig(process.cwd());

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for E2E cleanup.");

const pool = new pg.Pool({ connectionString: databaseUrl });
const testEmails: string[] = [];
const testLeadIds: string[] = [];

test.afterAll(async () => {
  if (testLeadIds.length) {
    await pool.query("DELETE FROM solar_leads WHERE id = ANY($1::text[])", [testLeadIds]);
  }
  if (testEmails.length) {
    await pool.query("DELETE FROM app_users WHERE email = ANY($1::text[])", [testEmails]);
  }
  await pool.end();
});

test("Marathi language selection localizes both homeowner intake steps", async ({ page }) => {
  await page.goto("/");
  await page.getByTitle("Switch Language (English / मराठी / हिंदी)").click();
  await page.getByRole("button", { name: /मराठी/ }).click();

  const intake = page.locator("#estimate");
  await expect(intake.getByRole("heading", { name: "संपर्क आणि स्थापनेचा पत्ता" })).toBeVisible();
  await expect(intake).toContainText("छताची मालकी आणि रचना");
  await expect(intake.getByPlaceholder("तुमचे नाव")).toBeVisible();
  await expect(intake.getByPlaceholder("मोबाईल क्रमांक टाका")).toBeVisible();

  await intake.getByPlaceholder("तुमचे नाव").fill("अमोल देशमुख");
  await intake.getByPlaceholder("मोबाईल क्रमांक टाका").fill("9876543210");
  await intake.getByPlaceholder("पिन कोड").fill("440001");
  await intake.getByRole("checkbox").check();
  await intake.getByRole("button", { name: "वीजबिल तपासण्याकडे पुढे चला" }).click();

  await expect(intake.getByRole("heading", { name: "महावितरण वीजबिल तपासणी" })).toBeVisible();
  await expect(intake).toContainText("बिल आणि माहितीची बाजूबाजूने पडताळणी");
  await expect(intake.getByRole("button", { name: "अंदाज तयार करा" })).toBeVisible();
  await expect(intake).not.toContainText("Contact & Installation Address");
});

test("homeowner signs up, extracts a bill, saves/accepts a quote and tracks the project", async ({ page, browser }, testInfo) => {
  const email = `playwright-homeowner-${Date.now()}@example.invalid`;
  const password = "BrowserCheck-2026!";
  testEmails.push(email);

  await page.goto("/contact");
  const contactPage = page.getByRole("main");
  await expect(contactPage).toContainText("Contact us");
  await expect(contactPage).toContainText("SolarSaathi Support Team");
  await expect(contactPage.getByTestId("business-support-email")).toHaveAttribute(
    "href",
    "mailto:solarsaathi9@gmail.com?subject=General%20enquiry",
  );
  await expect(contactPage).toContainText("Phone support currently unavailable - Demo");
  await expect(contactPage).toContainText("WhatsApp support - Coming Soon");
  await expect(contactPage.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(contactPage.locator('a[href*="wa.me"], a[href*="whatsapp"]')).toHaveCount(0);

  await page.goto("/signup");
  const businessFooter = page.locator("footer");
  await expect(businessFooter.getByTestId("business-support-email")).toHaveAttribute(
    "href",
    "mailto:solarsaathi9@gmail.com?subject=General%20enquiry",
  );
  await expect(businessFooter).toContainText("Phone support currently unavailable - Demo");
  await expect(businessFooter).toContainText("WhatsApp support - Coming Soon");
  await expect(businessFooter).toContainText("SolarSaathi Support Team");
  await expect(businessFooter).toContainText("Nagpur & Vidarbha");
  await expect(businessFooter).not.toContainText(/\+91/);
  await expect(businessFooter.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(businessFooter.locator('a[href*="wa.me"], a[href*="whatsapp"]')).toHaveCount(0);
  await page.getByLabel("Full name").fill("Playwright Test Homeowner");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.locator('input[autocomplete="new-password"]').fill(password);
  const signupResponse = page.waitForResponse((response) =>
    response.url().endsWith("/api/auth/signup") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Create account" }).click();
  expect((await signupResponse).status()).toBe(201);
  await expect(page).toHaveURL(`${baseURL}/`);

  let cookies = await page.context().cookies(baseURL);
  const sessionCookie = cookies.find((cookie) => cookie.name === "solarsaathi-session");
  expect(sessionCookie).toBeDefined();
  expect(sessionCookie?.httpOnly).toBe(true);
  expect(sessionCookie?.sameSite).toBe("Lax");

  const logoutResponse = await page.context().request.post(`${baseURL}/api/auth/logout`);
  expect(logoutResponse.ok()).toBe(true);
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.locator('input[autocomplete="current-password"]').fill(password);
  const loginResponse = page.waitForResponse((response) =>
    response.url().endsWith("/api/auth/login") && response.request().method() === "POST",
  );
  await page.locator("form").getByRole("button", { name: /^Sign in$/i }).click();
  expect((await loginResponse).status()).toBe(200);
  await expect(page).toHaveURL(`${baseURL}/`);

  cookies = await page.context().cookies(baseURL);
  const loggedInCookie = cookies.find((cookie) => cookie.name === "solarsaathi-session");
  expect(loggedInCookie?.httpOnly).toBe(true);
  expect(loggedInCookie?.sameSite).toBe("Lax");

  const sessionResponse = await page.context().request.get(`${baseURL}/api/auth/session`);
  expect(sessionResponse.status()).toBe(200);
  expect((await sessionResponse.json()).user.email).toBe(email);

  await page.getByPlaceholder("Your name").fill("Aarav Kulkarni (Sample Customer)");
  await page.getByPlaceholder("Enter your mobile number").fill("0000000000");
  await page.getByPlaceholder("Plot / Street / Area (e.g. Somalwada, Wardha Road)").fill("Sample Residence, Somalwada, Wardha Road");
  await page.getByPlaceholder("PIN code").fill("440001");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Continue to Bill Verification" }).click();

  const billPath = "output/pdf/test-bills/sample-electricity-bill-1.pdf";
  let forceOneRetry = true;
  await page.route("**/api/ai/parse-bill", async (route) => {
    if (forceOneRetry) {
      forceOneRetry = false;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          extraction: {
            confidence: { overall: "Unclear" },
            extractionNotes: "Gemini took too long to read the bill. Retry the reading in a moment.",
          },
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        extraction: {
          consumerNumber: "VPL-TEST-24018",
          tariff: "LT-I (Residential)",
          sanctionedLoadKw: 3,
          monthlyUnits: 278,
          monthlyAmount: 2340,
          billingUnit: "Nagpur Urban BU-41",
          confidence: { overall: "High" },
          extractionNotes: "Synthetic fixture used to keep the browser workflow deterministic.",
        },
      }),
    });
  });
  const firstExtractionResponse = page.waitForResponse((response) =>
    response.url().endsWith("/api/ai/parse-bill") && response.request().method() === "POST",
  );
  await page.locator("#bill-upload-input").setInputFiles(billPath);
  expect((await firstExtractionResponse).status()).toBe(200);
  await expect(page.getByRole("button", { name: "Retry bill reading" })).toBeVisible();
  let extraction: Record<string, unknown> = {};
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const extractionResponsePromise = page.waitForResponse((response) =>
      response.url().endsWith("/api/ai/parse-bill") && response.request().method() === "POST",
      { timeout: 90_000 },
    );
    await page.getByRole("button", { name: "Retry bill reading" }).click();
    const extractionResponse = await extractionResponsePromise;
    expect(extractionResponse.status()).toBe(200);
    extraction = (await extractionResponse.json()).extraction;
    if (extraction.consumerNumber === "VPL-TEST-24018") break;
    await expect(page.getByRole("button", { name: "Retry bill reading" })).toBeVisible();
  }
  expect(extraction.consumerNumber).toBe("VPL-TEST-24018");
  expect(extraction.sanctionedLoadKw).toBe(3);
  expect(extraction.monthlyUnits).toBe(278);
  expect(extraction.monthlyAmount).toBe(2340);
  await expect(page.locator('input[type="number"]').nth(0)).toHaveValue("278");
  await expect(page.locator('input[type="number"]').nth(1)).toHaveValue("2340");
  await expect(page.locator('input[type="number"]').nth(2)).toHaveValue("3");
  expect(await page.locator('input[type="number"]').nth(2).evaluate((input) => (input as HTMLInputElement).validity.valid)).toBe(true);

  // Correct the recorded monthly use as a customer would during bill review.
  await page.locator('input[type="number"]').nth(0).fill("375");

  const previewResponse = page.waitForResponse((response) =>
    response.url().endsWith("/api/leads/preview") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Prepare estimate" }).click();
  expect((await previewResponse).status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Your rooftop solar estimate" })).toBeVisible();
  const webCapacityWarning = page.getByTestId("system-capacity-warning").first();
  await expect(webCapacityWarning.getByRole("heading", { name: "System Capacity Review Required" })).toBeVisible();
  await expect(webCapacityWarning).toContainText("350 units/month");
  await expect(webCapacityWarning).toContainText("93.3%");
  await expect(webCapacityWarning).toContainText("375 recorded monthly units");

  const saveResponsePromise = page.waitForResponse((response) =>
    response.url().endsWith("/api/leads") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Save estimate to My Projects" }).click();
  const saveResponse = await saveResponsePromise;
  expect(saveResponse.status()).toBe(201);
  const saved = await saveResponse.json();
  const lead = saved.lead;
  expect(lead.quote.options.map((option: { systemSizeKw: number }) => option.systemSizeKw)).toEqual([1, 2, 3]);
  testLeadIds.push(lead.id);

  const ownerLeadResponse = await page.context().request.get(`${baseURL}/api/leads/${lead.id}`);
  expect(ownerLeadResponse.status()).toBe(200);
  const ownerLead = (await ownerLeadResponse.json()).lead;
  expect(ownerLead.scoreBreakdown).toBeUndefined();
  expect(ownerLead.scoreReason).toBeUndefined();
  expect((await page.context().request.get(`${baseURL}/api/rules`)).status()).toBe(403);

  const otherEmail = `playwright-other-${Date.now()}@example.invalid`;
  testEmails.push(otherEmail);
  const otherContext = await browser.newContext({ baseURL });
  try {
    const otherPage = await otherContext.newPage();
    await otherPage.goto("/signup");
    await otherPage.getByLabel("Full name").fill("Second Test Homeowner");
    await otherPage.getByLabel("Email", { exact: true }).fill(otherEmail);
    await otherPage.getByLabel("Password").fill(password);
    const otherSignup = otherPage.waitForResponse((response) =>
      response.url().endsWith("/api/auth/signup") && response.request().method() === "POST",
    );
    await otherPage.getByRole("button", { name: "Create account" }).click();
    expect((await otherSignup).status()).toBe(201);
    expect((await otherContext.request.get(`${baseURL}/api/leads/${lead.id}`)).status()).toBe(403);
  } finally {
    await otherContext.close();
  }

  const quotePage = await page.context().newPage();
  await quotePage.goto(`/quote/${lead.id}`);
  const printCapacityWarning = quotePage.getByTestId("system-capacity-warning");
  await expect(printCapacityWarning.getByRole("heading", { name: "System Capacity Review Required" })).toBeVisible();
  await expect(printCapacityWarning).toContainText("350 units/month");
  await expect(printCapacityWarning).toContainText("93.3%");
  await expect(printCapacityWarning).toContainText("375 recorded monthly units");
  await expect(printCapacityWarning).toContainText("larger-system feasibility, and DISCOM approval");
  const printableQuote = quotePage.locator(".quotation-document");
  await expect(printableQuote).toContainText("SolarSaathi Demo Support");
  await expect(printableQuote).toContainText("SolarSaathi Support Team");
  await expect(printableQuote).toContainText("solarsaathi9@gmail.com");
  await expect(printableQuote).toContainText("Phone: Not Available - Demo");
  await expect(printableQuote).toContainText("WhatsApp: Coming Soon");
  await expect(printableQuote).toContainText("Service Area: Nagpur & Vidarbha");
  await expect(printableQuote.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(printableQuote.locator('a[href*="wa.me"], a[href*="whatsapp"]')).toHaveCount(0);
  await expect(printableQuote.locator('a[href^="mailto:"]')).toHaveAttribute(
    "href",
    "mailto:solarsaathi9@gmail.com?subject=Solar%20quotation%20enquiry",
  );
  await quotePage.getByRole("button", { name: "1 kW", exact: true }).click();
  await quotePage.getByRole("button", { name: "3 kW", exact: true }).click();

  await quotePage.evaluate(() => {
    (window as Window & { __solarPrintCalled?: boolean }).print = () => {
      (window as Window & { __solarPrintCalled?: boolean }).__solarPrintCalled = true;
    };
  });
  await quotePage.getByRole("button", { name: "Print / Save PDF" }).click();
  await expect.poll(() => quotePage.evaluate(() => (window as Window & { __solarPrintCalled?: boolean }).__solarPrintCalled)).toBe(true);
  await quotePage.emulateMedia({ media: "print" });
  const pdfPath = testInfo.outputPath("solar-quote.pdf");
  const pdf = await quotePage.pdf({ path: pdfPath, format: "A4", printBackground: true, preferCSSPageSize: true });
  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  const pdfInfo = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  expect(pdfInfo).toMatch(/Pages:\s+2\b/);
  expect(pdfInfo).toMatch(/Page size:.*\(A4\)/);
  const pdfText = execFileSync("python", [
    "-c",
    "from pypdf import PdfReader; import sys; sys.stdout.reconfigure(encoding='utf-8'); print(' '.join(page.extract_text() or '' for page in PdfReader(sys.argv[1]).pages))",
    pdfPath,
  ], { encoding: "utf8" });
  expect(pdfText).toContain("solarsaathi9@gmail.com");
  expect(pdfText).toContain("Phone: Not Available - Demo");
  expect(pdfText).toContain("WhatsApp: Coming Soon");
  expect(pdfText).toContain("Service Area: Nagpur & Vidarbha");
  expect(pdfText).not.toContain("0000000000");
  expect(pdfText).not.toContain("+91 712 298 0000");
  expect(pdfText).not.toContain("demo@solarsaathi.app");
  const pdfLinks = execFileSync("python", [
    "-c",
    "from pypdf import PdfReader; import json,sys; print(json.dumps([a.get_object().get('/A',{}).get_object().get('/URI','') for p in PdfReader(sys.argv[1]).pages for a in p.get('/Annots',[]) if a.get_object().get('/A')]))",
    pdfPath,
  ], { encoding: "utf8" });
  expect(pdfLinks).toContain("mailto:solarsaathi9@gmail.com");
  await quotePage.close();

  await page.emulateMedia({ media: "screen" });
  const acceptResponsePromise = page.waitForResponse((response) =>
    response.url().endsWith(`/api/leads/${lead.id}`) && response.request().method() === "PATCH",
  );
  await page.getByRole("button", { name: "Accept estimate & request next step" }).click();
  expect((await acceptResponsePromise).status()).toBe(200);
  await page.getByRole("link", { name: "View project tracker" }).click();
  await expect(page).toHaveURL(`${baseURL}/track/${lead.id}`);
  await expect(page.getByText("Estimate accepted. Your project will move to the next step after review.")).toBeVisible();
});
