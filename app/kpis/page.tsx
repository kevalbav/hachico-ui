"use client";
import { useEffect, useMemo, useState } from "react";
import { getSettings } from "../lib/settings";

type KPI = { id: string; name: string; channel?: string; unit?: string };
type Rollup = { cards: { kpi_id: string }[] };

export default function KPIManager() {
  const { workspaceId, period } = getSettings();
  const [allKpis, setAllKpis] = useState<KPI[]>([]);
  const [attachedIds, setAttachedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      // all KPIs
      const all = await fetch("/api/hachi/kpis").then(r => r.json());
      setAllKpis(all);

      // attached: derive from rollup (cards list)
      const roll: Rollup = await fetch(`/api/hachi/metrics/progress/workspace/${workspaceId}/${period}`).then(r => r.json());
      setAttachedIds(new Set(roll.cards.map(c => c.kpi_id)));
    } catch (e: any) { setErr(e.message || "Failed to load KPIs"); }
  }

  useEffect(() => { load(); }, []);

  const attached = useMemo(() => allKpis.filter(k => attachedIds.has(k.id)), [allKpis, attachedIds]);
  const available = useMemo(() => allKpis.filter(k => !attachedIds.has(k.id)), [allKpis, attachedIds]);

  async function attach(kpi_id: string) {
    setBusy(kpi_id);
    try {
      const r = await fetch(`/api/hachi/workspaces/${workspaceId}/attach_kpi`, {
        method: "POST", headers: { "content-type":"application/json" },
        body: JSON.stringify({ kpi_id })
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const next = new Set(attachedIds); next.add(kpi_id); setAttachedIds(next);
    } catch (e:any) { setErr(e.message || "Attach failed"); }
    finally { setBusy(null); }
  }

  async function detach(kpi_id: string) {
    setBusy(kpi_id);
    try {
      const r = await fetch(`/api/hachi/workspaces/${workspaceId}/detach_kpi`, {
        method: "POST", headers: { "content-type":"application/json" },
        body: JSON.stringify({ kpi_id })
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const next = new Set(attachedIds); next.delete(kpi_id); setAttachedIds(next);
    } catch (e:any) { setErr(e.message || "Detach failed"); }
    finally { setBusy(null); }
  }

  return (
    <div style={{display:"grid", gap:16}}>
      <h2 style={{fontSize:20, fontWeight:600}}>KPI Manager</h2>
      {err && <div style={{color:"crimson"}}>Error: {err}</div>}

      <div style={{display:"grid", gap:16, gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))"}}>
        <section style={{border:"1px solid #e5e7eb", borderRadius:12, padding:12}}>
          <h3 style={{fontWeight:600, marginBottom:8}}>Attached to {workspaceId}</h3>
          <ul style={{display:"grid", gap:8}}>
            {attached.length === 0 && <li style={{color:"#6b7280"}}>No KPIs attached yet.</li>}
            {attached.map(k => (
              <li key={k.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", border:"1px solid #e5e7eb", borderRadius:10, padding:10}}>
                <div>
                  <div style={{fontWeight:600}}>{k.name}</div>
                  <div style={{fontSize:12, color:"#6b7280"}}>{k.channel} · {k.id}</div>
                </div>
                <button onClick={()=>detach(k.id)} disabled={busy === k.id}
                        style={{fontSize:12, padding:"6px 10px", border:"1px solid #e5e7eb", borderRadius:8}}>
                  {busy === k.id ? "…" : "Detach"}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section style={{border:"1px solid #e5e7eb", borderRadius:12, padding:12}}>
          <h3 style={{fontWeight:600, marginBottom:8}}>Available</h3>
          <ul style={{display:"grid", gap:8}}>
            {available.length === 0 && <li style={{color:"#6b7280"}}>No available KPIs. Create some via API.</li>}
            {available.map(k => (
              <li key={k.id} style={{display:"flex", justifyContent:"space-between", alignItems:"center", border:"1px solid #e5e7eb", borderRadius:10, padding:10}}>
                <div>
                  <div style={{fontWeight:600}}>{k.name}</div>
                  <div style={{fontSize:12, color:"#6b7280"}}>{k.channel} · {k.id}</div>
                </div>
                <button onClick={()=>attach(k.id)} disabled={busy === k.id}
                        style={{fontSize:12, padding:"6px 10px", border:"1px solid #e5e7eb", borderRadius:8, background:"#0a0a0a", color:"#fff"}}>
                  {busy === k.id ? "…" : "Attach"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
