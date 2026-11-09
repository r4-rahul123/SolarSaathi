import { randomUUID } from "node:crypto";
import type { Lead, ProjectStage, MockNotification, NotificationChannel } from "../types/solar.ts";

/**
 * Human-readable display label for each recognized project stage.
 */
export function formatStageLabel(stage: ProjectStage): string {
  switch (stage) {
    case "LEAD_APPROVED":
      return "Lead & Bill Approved";
    case "SITE_SURVEY":
      return "Rooftop Site Survey";
    case "QUOTATION_APPROVED":
      return "Quotation Accepted";
    case "ADVANCE_PAYMENT":
      return "Advance Token Payment Confirmed";
    case "INSTALLATION":
      return "Installation Completed";
    case "NET_METERING":
      return "Net Metering Synchronized";
    case "SUBSIDY_APPLICATION":
      return "DBT Subsidy Application Filed";
    case "SUBSIDY_CREDITED":
      return "Central Subsidy Credited";
    default:
      return String(stage).replaceAll("_", " ");
  }
}

/**
 * Stage-specific next steps guidance for homeowner communication.
 */
function getStageNextSteps(stage: ProjectStage): string {
  switch (stage) {
    case "LEAD_APPROVED":
      return "Our engineering desk has received your electricity bill and is reviewing rooftop feasibility.";
    case "SITE_SURVEY":
      return "Our certified solar surveyor will conduct a shadow and structural inspection of your rooftop.";
    case "QUOTATION_APPROVED":
      return "Our project coordinator will reach out to confirm your component selection and project schedule.";
    case "ADVANCE_PAYMENT":
      return "Procurement of Tier-1 ALMM solar panels and BIS inverter has been initiated for your site.";
    case "INSTALLATION":
      return "Rooftop mounting and solar inverter wiring are complete. Next step: MSEDCL bi-directional net meter synchronization.";
    case "NET_METERING":
      return "Your bi-directional net meter is synchronized with the MSEDCL grid. Generation credit has commenced.";
    case "SUBSIDY_APPLICATION":
      return "Your Central Financial Assistance claim has been submitted on the National Portal for PM Surya Ghar.";
    case "SUBSIDY_CREDITED":
      return "Central subsidy has been credited directly to your Aadhaar-linked bank account. Congratulations on clean energy independence!";
    default:
      return "Our team will contact you regarding the next steps.";
  }
}

/**
 * Construct a customer-facing WhatsApp Mock message.
 * Follows the standard SolarSaathi customer notification template.
 */
export function generateMockWhatsAppMessage(
  customerName: string,
  projectId: string,
  stage: ProjectStage
): string {
  const cleanName = customerName?.trim() || "Customer";
  const firstName = cleanName.split(/\s+/)[0] || "Customer";
  const stageLabel = formatStageLabel(stage);
  const nextSteps = getStageNextSteps(stage);

  return `Hello ${firstName} ji,

Your rooftop solar project status has been updated.

Project ID: ${projectId}
Current Status: ${stageLabel}

${nextSteps}

Thank you for choosing SolarSaathi!`;
}

/**
 * Safely mask phone numbers to prevent DPDP privacy leakage in staff UI / logs.
 */
export function maskRecipientPhone(phone?: string): string {
  const trimmed = phone?.trim() || "";
  if (!trimmed) return "—";
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length <= 4) return digits ? `*${digits.slice(-1)}` : "—";
  if (digits.length <= 8) return `${digits.slice(0, 2)}****${digits.slice(-2)}`;
  return `${digits.slice(0, 2)}******${digits.slice(-4)}`;
}

/**
 * Generate a new MockNotification record for a project status update.
 */
export function createMockNotificationRecord(
  lead: { id: string; name?: string; customerName?: string; phone?: string; ownerUserId?: string },
  stage: ProjectStage,
  channel: NotificationChannel = "WhatsApp Mock"
): MockNotification {
  const now = new Date().toISOString();
  const cName = lead.customerName || lead.name || "Customer";
  return {
    id: randomUUID(),
    projectId: lead.id,
    customerId: lead.ownerUserId,
    customerName: cName,
    channel,
    recipient: lead.phone || "—",
    message: generateMockWhatsAppMessage(cName, lead.id, stage),
    status: "Sent (Mock)",
    stage,
    createdAt: now,
    sentAt: now,
    readAt: null,
  };
}
