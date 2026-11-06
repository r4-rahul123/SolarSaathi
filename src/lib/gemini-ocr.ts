import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { BillExtraction } from "@/types/solar";

// Validate extracted fields while allowing unreadable values to remain empty.
const BillExtractionSchema = z.object({
  consumerNumber: z.string().min(6).nullable().optional(),
  tariff: z.string().min(2).nullable().optional(),
  sanctionedLoadKw: z.number().positive().nullable().optional(),
  monthlyUnits: z.number().nonnegative().nullable().optional(),
  monthlyAmount: z.number().nonnegative().nullable().optional(),
  billingUnit: z.string().nullable().optional(),
});

/**
 * Extracts structured billing details from an electricity bill image.
 * Uses Google Gemini API if GEMINI_API_KEY is configured.
 * If no provider is configured or reading fails, returns an empty result for manual entry.
 */
export async function parseElectricityBillWithAI(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<BillExtraction> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  let failureDetail = "Gemini did not return readable bill fields.";

  if (apiKey) {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { timeout: 20_000, retryOptions: { attempts: 1 } },
    });
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    const prompt = `
You are an expert OCR and data extractor for Indian electricity distribution utility bills (MSEDCL / Mahavitaran, Adani Electricity, Tata Power, BESCOM, etc.).
Analyze this electricity bill image and extract the following details into a strict JSON object:
{
  "consumerNumber": "string (the consumer number / account ID / K-No)",
  "tariff": "string (e.g. LT-I Residential)",
  "sanctionedLoadKw": number (the connected/sanctioned load in kW),
  "monthlyUnits": number (the current month total units/kWh billed),
  "monthlyAmount": number (the current total bill amount in Rupees),
  "billingUnit": "string or null (the billing unit or subdivision or circle)"
}

Rules:
1. Return ONLY valid JSON, no markdown formatting, no backticks.
2. If an item cannot be read clearly, return null for that field. Never guess or infer a value.
3. Keep numbers as pure numeric floats/ints.
`;

    for (const [index, model] of models.entries()) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: imageBase64.replace(/^data:[^;]+;base64,/, ""),
                  },
                },
              ],
            },
          ],
        });

        const responseText = response.text?.trim() || "";
        if (!responseText) {
          failureDetail = `${model} returned an empty response.`;
          continue;
        }
        const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        const parsed = JSON.parse(cleanedJson);
        const validated = BillExtractionSchema.safeParse(parsed);

        if (validated.success) {
          return {
            ...validated.data,
            consumerNumber: validated.data.consumerNumber ?? undefined,
            tariff: validated.data.tariff ?? undefined,
            sanctionedLoadKw: validated.data.sanctionedLoadKw ?? undefined,
            monthlyUnits: validated.data.monthlyUnits ?? undefined,
            monthlyAmount: validated.data.monthlyAmount ?? undefined,
            billingUnit: validated.data.billingUnit ?? undefined,
            extractionNotes: "Review the values against your bill before continuing.",
            extractedAt: new Date().toISOString(),
          };
        }
        failureDetail = `${model} response fields were invalid: ${validated.error.issues.map((issue) => issue.path.join(".") || "response").join(", ")}.`;
      } catch (err: unknown) {
        const rawMessage = err instanceof Error ? err.message : "Gemini request failed.";
        failureDetail = rawMessage
          .replaceAll(apiKey, "[redacted]")
          .replace(/AIza[0-9A-Za-z_-]{20,}/g, "[redacted]")
          .replace(/([?&]key=)[^&\s]+/gi, "$1[redacted]")
          .replace(/[\r\n]+/g, " ")
          .slice(0, 220) || "Gemini request failed.";
        console.warn("Bill OCR failed with model:", model, failureDetail);

        const canFallback = index < models.length - 1 && (err instanceof SyntaxError || /(?:\b503\b|\b429\b|\b500\b|\b502\b|\b504\b|UNAVAILABLE|high demand|model.*not available)/i.test(rawMessage));
        if (!canFallback) break;
      }
    }
  }

  // Do not invent bill values when OCR is unavailable or fails.
  return {
    confidence: {
      overall: "Unclear",
    },
    extractionNotes: apiKey
      ? `The bill could not be read (${failureDetail}). Check Gemini API access and try again, or enter the values manually.`
      : "Automatic bill reading is not configured. Enter the values manually and check them against the uploaded bill.",
    extractedAt: new Date().toISOString(),
  };
}
