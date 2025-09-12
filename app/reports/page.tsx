"use client";
import { useState } from "react";
const WID = "w_001";
const now = new Date();
const PERIOD = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

export default function Reports() {
  const [report, setReport] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  async function generate() {
    setBusy(true); setErr(null);
    try {
      const r = await fetch("/api/hachi/reports/preview", {
        method:"POST",
        headers:{ "content-type":"application/json" },
        body: JSON.stringify({ workspace_id: WID, period: PERIOD, limit_kpis:5, limit_wins:5 })
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setReport(j.report);
    } catch (e:any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div style={{display:"grid", gap:16}}>
      <button onClick={generate} disabled={busy}
        style={{padding:"10px 14px", borderRadius:8, background:"#0a0a0a", color:"#fff", opacity:busy?0.6:1}}>
        {busy ? "Generating…" : "Generate Preview"}
      </button>
      {err && <div style={{color:"crimson"}}>Error: {err}</div>}
      {report && (
        <div style={{border:"1px solid #e5e7eb", borderRadius:12, padding:16, display:"grid", gap:12}}>
          <div style={{fontSize:12, color:"#6b7280"}}>{report.generated_at}</div>
          <h2 style={{fontSize:20, fontWeight:600}}>{report.workspace.name} — {report.period}</h2>
          <div style={{display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fit, minmax(220px,1fr))"}}>
            {report.kpi_summary.map((c:any)=>(
              <div key={c.kpi_id} style={{border:"1px solid #e5e7eb", borderRadius:10, padding:12}}>
                <div style={{fontSize:12, color:"#6b7280"}}>{c.channel}</div>
                <div style={{fontWeight:600}}>{c.name}</div>
                <div>Actual: <b>{c.actual}</b></div>
                <div>Target: <b>{c.target}</b></div>
                <div>%: <b>{c.pct_of_target?.toFixed?.(1) ?? "—"}</b></div>
              </div>
            ))}
          </div>
          <div>
            <h3 style={{fontWeight:600, margin:"8px 0"}}>Highlights</h3>
            <ul style={{paddingLeft:18}}>
              {report.highlights.map((w:any,i:number)=><li key={i}>{w.date} — {w.title}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
