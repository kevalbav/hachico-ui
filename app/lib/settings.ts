export type Settings = { workspaceId: string; period: string }; // period = "YYYY-MM"

const KEY = "hachi.settings";

export function getSettings(): Settings {
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  if (typeof window === "undefined") return { workspaceId: "w_001", period };
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "{}");
    return { workspaceId: parsed.workspaceId || "w_001", period: parsed.period || period };
  } catch {
    return { workspaceId: "w_001", period };
  }
}

export function setSettings(next: Partial<Settings>) {
  const cur = getSettings();
  const merged = { ...cur, ...next };
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(merged));
  return merged;
}

export function shiftPeriod(period: string, deltaMonths: number) {
  const [y, m] = period.split("-").map(Number);
  const d = new Date(y, m - 1 + deltaMonths, 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
