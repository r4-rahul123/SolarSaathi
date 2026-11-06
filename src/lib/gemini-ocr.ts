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
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

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

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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
    } catch (err: unknown) {
      console.warn("Bill OCR failed:", err);
    }
  }

  // Do not invent bill values when OCR is unavailable or fails.
  return {
    confidence: {
      overall: "Unclear",
    },
    extractionNotes: apiKey
      ? "The bill could not be read. Enter the values manually and check them against the uploaded bill."
      : "Automatic bill reading is not configured. Enter the values manually and check them against the uploaded bill.",
    extractedAt: new Date().toISOString(),
  };
}
