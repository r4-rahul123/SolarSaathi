import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const OUTPUT_DIR = path.resolve("output/pdf");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function main() {
  console.log("Launching Chromium/Edge/Chrome...");
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      channel: "msedge",
    });
  } catch {
    try {
      browser = await chromium.launch({
        headless: true,
        channel: "chrome",
      });
    } catch {
      browser = await chromium.launch({
        headless: true,
      });
    }
  }

  const page = await browser.newPage({
    viewport: { width: 1200, height: 1600 },
    deviceScaleFactor: 2,
  });

  const quoteUrl = "http://localhost:3000/quote/LD-30881";
  console.log(`Navigating to ${quoteUrl}...`);
  await page.goto(quoteUrl, { waitUntil: "networkidle" });

  // Wait for quotation element
  await page.waitForSelector(".quotation-document", { timeout: 10000 });

  // 1. Take screenshot of Page 1 element
  const page1 = await page.$(".quotation-page-1");
  if (page1) {
    const page1Path = path.join(OUTPUT_DIR, "quotation-page-1.png");
    await page1.screenshot({ path: page1Path });
    console.log(`Page 1 screenshot saved to ${page1Path}`);
  }

  // 2. Take screenshot of Page 2 element
  const page2 = await page.$(".quotation-page-2");
  if (page2) {
    const page2Path = path.join(OUTPUT_DIR, "quotation-page-2.png");
    await page2.screenshot({ path: page2Path });
    console.log(`Page 2 screenshot saved to ${page2Path}`);
  }

  // 3. Emulate print media and generate PDF
  await page.emulateMedia({ media: "print" });
  const pdfPath = path.join(OUTPUT_DIR, "SolarSaathi-Capacity-Review-Sample.pdf");

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "8mm",
      bottom: "8mm",
      left: "10mm",
      right: "10mm",
    },
  });
  console.log(`PDF saved to ${pdfPath}`);

  // Verify page count in generated PDF
  const pdfBuf = fs.readFileSync(pdfPath);
  const pdfString = pdfBuf.toString("latin1");
  const countMatch = pdfString.match(/\/Count\s+(\d+)/);
  if (countMatch) {
    console.log(`Verified PDF Page Count: ${countMatch[1]} pages`);
  } else {
    console.log("Could not find /Count in PDF catalog");
  }

  await browser.close();
  console.log("PDF generation and verification complete!");
}

main().catch((err) => {
  console.error("Error generating PDF:", err);
  process.exit(1);
});
