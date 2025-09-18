export function monthBounds(period: string) {
  // period: "YYYY-MM"
  const [y, m] = period.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1); // next month
  const toISO = (d: Date) => d.toISOString().slice(0, 10);
  return { from: toISO(start), to: toISO(end) };
}
