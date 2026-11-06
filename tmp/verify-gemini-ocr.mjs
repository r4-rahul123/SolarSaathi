import fs from "node:fs";
import { GoogleGenAI } from "@google/genai";

const key = process.env.GEMINI_API_KEY?.trim();
if (!key) throw new Error("GEMINI_API_KEY is not loaded by Next's environment loader.");
const ai = new GoogleGenAI({ apiKey: key, httpOptions: { timeout: 20_000, retryOptions: { attempts: 1 } } });
const pdf = fs.readFileSync("output/pdf/test-bills/sample-electricity-bill-1.pdf");
const prompt = "This is a fictional sample utility bill. Extract JSON only: consumerNumber (string), tariff (string), sanctionedLoadKw (number), monthlyUnits (number), monthlyAmount (number). Do not infer values.";
let lastError;
for (const model of ["gemini-3.8-flash", "gemini-3.7-flash"]) {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { mimeType: "application/pdf", data: pdf.toString("base64") } }] }],
    });
    const text = (response.text || "").replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    const checks = {
      consumerNumber: parsed.consumerNumber === "VPL-TEST-24018",
      tariff: typeof parsed.tariff === "string" && parsed.tariff.length > 1,
      sanctionedLoadKw: Number(parsed.sanctionedLoadKw) === 3,
      monthlyUnits: Number(parsed.monthlyUnits) === 278,
      monthlyAmount: Number(parsed.monthlyAmount) === 2340,
    };
    console.log(JSON.stringify({ model, checks }));
    if (Object.values(checks).every(Boolean)) process.exit(0);
    lastError = new Error("OCR returned values that did not match the sample bill.");
  } catch (error) {
    lastError = error;
    const message = String(error?.message || "OCR request failed").replaceAll(key, "[redacted]").replace(/AIza[0-9A-Za-z_-]{20,}/g, "[redacted]").slice(0, 200);
    console.log(`${model} failed: ${message}`);
  }
}
process.exitCode = 1;
