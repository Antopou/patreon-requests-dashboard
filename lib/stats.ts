import { RequestItem, Tier } from "@/types/request";

export function daysBetween(dateIso: string, now = new Date()) {
  const d = new Date(dateIso);
  const ms = now.getTime() - d.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function slaDays(tier: Tier): number {
  if (tier === "VIP") return 2;
  if (tier === "Premium") return 3;
  return 5;
}

export function priorityFromTier(tier: Tier) {
  if (tier === "VIP") return "High";
  if (tier === "Premium") return "Medium";
  if (tier === "Standard") return "Normal";
  return "Low";
}

export function computeMetrics(items: RequestItem[]) {
  const now = new Date();
  const pending = items.filter(i => i.status === "Pending").length;
  const inProgress = items.filter(i => i.status === "In Progress").length;
  const waiting = items.filter(i => i.status === "Waiting for Client").length;

  const completed7d = items.filter(i => {
    if (i.status !== "Completed" || !i.dateCompleted) return false;
    return daysBetween(i.dateCompleted, now) <= 7;
  }).length;

  const overdue = items.filter(i => {
    if (i.status === "Completed" || i.status === "Cancelled") return false;
    const dw = daysBetween(i.dateRequested, now);
    return dw > slaDays(i.tier);
  }).length;

  return { pending, inProgress, waiting, completed7d, overdue };
}

export function nextUp(items: RequestItem[]) {
  const now = new Date();
  const active = items.filter(i => i.status !== "Completed" && i.status !== "Cancelled");

  const tierWeight: Record<string, number> = { VIP: 4, Premium: 3, Standard: 2, Basic: 1 };

  return active
    .map(i => ({
      ...i,
      daysWaiting: daysBetween(i.dateRequested, now),
      overdue: daysBetween(i.dateRequested, now) > slaDays(i.tier),
      tierScore: tierWeight[i.tier] ?? 0,
    }))
    .sort((a, b) => {
      // 1) overdue first
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      // 2) higher tier first
      if (a.tierScore !== b.tierScore) return b.tierScore - a.tierScore;
      // 3) longer waiting first
      return b.daysWaiting - a.daysWaiting;
    });
}
