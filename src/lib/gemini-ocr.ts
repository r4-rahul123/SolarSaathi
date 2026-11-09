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
      // Synthetic bill verification showed the supported Flash model can take ~25s.
      // Keep each attempt below the route's 60s platform limit.
      httpOptions: {
        timeout: 28_000,
        retryOptions: { attempts: 2, initialDelay: 0.5, maxDelay: 1, jitter: 0 },
      },
    });
    const model = "gemini-3.6-flash";
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
        failureDetail = "Gemini returned an empty response.";
      } else {
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
        failureDetail = `Gemini returned unreadable fields (${validated.error.issues.map((issue) => issue.path.join(".") || "response").join(", ")}).`;
      }
    } catch (err: unknown) {
      const status = typeof err === "object" && err !== null && "status" in err
        ? Number((err as { status?: unknown }).status)
        : 0;
      const errorName = err instanceof Error ? err.name : "";
      const rawMessage = err instanceof Error ? err.message : "";
      if (errorName === "AbortError" || status === 408 || status === 504 || /operation was aborted|deadline exceeded|timed? ?out/i.test(rawMessage)) {
        failureDetail = "Gemini took too long to read the bill. Retry the reading in a moment.";
      } else if (status === 429 || status === 500 || status === 502 || status === 503) {
        failureDetail = "Gemini is temporarily busy. Retry the reading in a moment.";
      } else if (status === 401 || status === 403) {
        failureDetail = "Gemini API access was denied. Check the API key and model access.";
      } else {
        failureDetail = "Gemini could not read this bill. Check API access and try again.";
      }
      console.warn("Bill OCR request did not complete:", { model, status: status || undefined, reason: failureDetail });
    }
  }

  // Do not invent bill values when OCR is unavailable or fails.
  return {
    confidence: {
      overall: "Unclear",
    },
    extractionNotes: apiKey
      ? `${failureDetail} Retry automatic reading or enter and check the values manually.`
      : "Automatic bill reading is not configured. Enter the values manually and check them against the uploaded bill.",
    extractedAt: new Date().toISOString(),
  };
}
