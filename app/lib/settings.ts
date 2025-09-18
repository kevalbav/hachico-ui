const TZ = "Asia/Kolkata";
function monthNowTZ(): string {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" });
  const parts = fmt.formatToParts(now);
  const y = parts.find(p => p.type === "year")!.value;
  const m = parts.find(p => p.type === "month")!.value;
  return `${y}-${m}`;
}
export function getSettings() {
  if (typeof window === "undefined") {
    return { workspaceId: "w_001", period: monthNowTZ() };
  }
  return {
    workspaceId: localStorage.getItem("hachi.workspace") || "w_001",
    period: localStorage.getItem("hachi.period") || monthNowTZ(),
  };
}
