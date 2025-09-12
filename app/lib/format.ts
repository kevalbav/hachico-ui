export function fmtNum(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return sign + (abs / 1_000_000_000).toFixed(abs < 10_000_000_000 ? 1 : 0) + "B";
  if (abs >= 1_000_000)     return sign + (abs / 1_000_000).toFixed(abs < 10_000_000 ? 1 : 0) + "M";
  if (abs >= 1_000)         return sign + (abs / 1_000).toFixed(abs < 10_000 ? 1 : 0) + "K";
  return sign + Math.round(abs).toString();
}

export function fmtPct(p: number | null | undefined, digits = 1): string {
  if (p == null || Number.isNaN(p)) return "—";
  return p.toFixed(digits) + "%";
}
