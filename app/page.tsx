"use client";
import { useEffect, useState } from "react";
import { getSettings } from "./lib/settings";
import { fmtNum, fmtPct } from "./lib/format";

type Card = {
  kpi_id: string; name: string; channel?: string; unit?: string;
  actual: number; target: number; pct_of_target: number | null;
};
type Rollup = { workspace_id: string; period: string; cards: Card[] };

export default function Dashboard() {
  const [data, setData] = useState<Rollup | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const s = getSettings();
    try {
      const r = await fetch(`/api/hachi/metrics/progress/workspace/${s.workspaceId}/${s.period}`);
      if (!r.ok) throw new Error("HTTP " + r.status);
      setData(await r.json());
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const fn = () => { setLoading(true); load(); };
    window.addEventListener("hachi:settings", fn);
    return () => window.removeEventListener("hachi:settings", fn);
  }, []);

  if (loading) return <p>Loading…</p>;
  if (err) return <p style={{ color: "crimson" }}>Error: {err}</p>;
  if (!data || data.cards.length === 0) return <p>No KPIs attached yet.</p>;

  return (
    <div style={{display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", padding:16}}>
      {data.cards.map((c) => {
        const pct = c.pct_of_target;
        const pctText = fmtPct(pct, 1);
        const width = pct == null ? "0%" : Math.max(0, Math.min(100, pct)).toFixed(1) + "%";
        const barColor = pct == null ? "#e5e7eb" : (pct >= 100 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#ef4444");

        return (
          <div key={c.kpi_id}
               style={{padding:16, borderRadius:16, border:"1px solid #e5e7eb", background:"#fff", display:"grid", gap:8}}>
            <div style={{ color:"#6b7280", fontSize:12 }}>{c.channel}</div>
            <div style={{ fontWeight: 600 }}>{c.name}</div>

            <div style={{display:"flex", gap:12}}>
              <div>Target: <b>{fmtNum(c.target)}</b></div>
              <div>Actual: <b>{fmtNum(c.actual)}</b></div>
              <div>Progress: <b>{pctText}</b></div>
            </div>

            <div style={{height:8, borderRadius:999, background:"#f1f5f9", overflow:"hidden"}}>
              <div style={{height:"100%", width, background: barColor, transition:"width .25s ease-out"}} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
