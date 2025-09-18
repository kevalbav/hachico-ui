"use client";
import { useEffect, useState } from "react";

const TZ = "Asia/Kolkata";

function monthNowTZ(): string {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" });
  const parts = fmt.formatToParts(now);
  const y = parts.find(p => p.type === "year")!.value;
  const m = parts.find(p => p.type === "month")!.value;
  return `${y}-${m}`;
}

function incMonth(period: string, delta: number): string {
  const [ys, ms] = period.split("-"); const y = parseInt(ys, 10); const m = parseInt(ms, 10);
  const d = new Date(Date.UTC(y, (m - 1) + delta, 1));
  const yy = d.getUTCFullYear(); const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

export default function Controls() {
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState<string>("");
  const [workspaceId, setWorkspaceId] = useState<string>("w_001");

  // mount: read from localStorage (client-only), else default using TZ
  useEffect(() => {
    setMounted(true);
    const p = localStorage.getItem("hachi.period") || monthNowTZ();
    const w = localStorage.getItem("hachi.workspace") || "w_001";
    setPeriod(p); setWorkspaceId(w);
  }, []);

  // persist + notify dashboard
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("hachi.period", period);
    localStorage.setItem("hachi.workspace", workspaceId);
    window.dispatchEvent(new Event("hachi:settings"));
  }, [period, workspaceId, mounted]);

  const display = mounted && period ? period : "— — —";

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button className="hc-btn-ghost" onClick={() => mounted && setPeriod(incMonth(period, -1))} disabled={!mounted}>◀</button>
        <div style={{ minWidth: 88, textAlign: "center" }}>{display}</div>
        <button className="hc-btn-ghost" onClick={() => mounted && setPeriod(incMonth(period, 1))} disabled={!mounted}>▶</button>
      </div>
      <div style={{ marginLeft: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 12, color: "#64748b" }}>Workspace</span>
        <input className="hc-input" value={workspaceId} onChange={(e) => setWorkspaceId(e.target.value)} disabled={!mounted} />
      </div>
    </div>
  );
}
