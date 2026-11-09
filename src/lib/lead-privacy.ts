import type { Lead } from "@/types/solar";

export function hideLeadScoring(lead: Lead): Lead {
  const publicLead = { ...lead };
  delete publicLead.scoreBreakdown;
  delete publicLead.score;
  delete publicLead.scoreReason;
  return publicLead;
}
