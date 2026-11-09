import type { ProjectStage } from "@/types/solar";

const DAY_MS = 86_400_000;

export function daysSinceStatusChange(timestamp: string, now = Date.now()): number {
  const changedAt = Date.parse(timestamp);
  return Number.isFinite(changedAt) ? Math.max(0, Math.floor((now - changedAt) / DAY_MS)) : 0;
}

export function isProjectStuck(status: ProjectStage, timestamp: string, now = Date.now()): boolean {
  return status !== "SUBSIDY_CREDITED" && daysSinceStatusChange(timestamp, now) >= 7;
}
