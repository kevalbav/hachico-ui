"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSettings } from "../../lib/settings";

type KPI = { id: string; name: string; channel?: string; unit?: string };

export default function AddKpisPage() {
  const { workspaceId, period } = getSettings();
  const [allKpis, setAllKpis] = useState<KPI[]>([]);
  const [platform, setPlatform] = useState<string>("All");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [targets, setTargets]   = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);
  const [q, setQ] = useState("");

  const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/hachi/kpis");
        const j = await r.json();
        setAllKpis(j as KPI[]);
      } catch (e) { setErr(errMsg(e)); }
    })();
  }, []);

  const platforms = useMemo(() => {
    const set = new Set<string>();
    allKpis.forEach(k => { if (k.channel) set.add(k.channel); });
    return ["All", ...Array.from(set).sort()];
  }, [allKpis]);

  const filtered = useMemo(() => {
    return allKpis.filter(k => {
      if (platform !== "All" && (k.channel || "") !== platform) return false;
      if (q.trim()) {
        const t = q.trim().toLowerCase();
        if (!(`${k.name} ${k.id} ${k.channel||""}`).toLowerCase().includes(t)) return false;
      }
      return true;
    });
  }, [allKpis, platform, q]);

  function toggle(id: string) {
    setSelected(s => ({ ...s, [id]: !s[id] }));
  }
  function setTarget(id: string, v: string) {
    setTargets(t => ({ ...t, [id]: v }));
  }

  async function addSelected() {
    setMsg(null); setErr(null);
    const picked = Object.keys(selected).filter(k => selected[k]);
    if (picked.length === 0) { setErr("Select at least one KPI"); return; }

    setBusy(true);
    try {
      await Promise.all(picked.map(kpi_id =>
        fetch(`/api/hachi/workspaces/${workspaceId}/attach_kpi`, {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ kpi_id })
        })
      ));

      await Promise.all(picked.map(async (kpi_id) => {
        const raw = targets[kpi_id];
        const num = raw == null ? NaN : Number(raw);
        if (!Number.isFinite(num) || num <= 0) return;
        await fetch("/api/hachi/goals/set", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ kpi_id, period, target_value: num })
        });
      }));

      setMsg("Added! Check your dashboard.");
      setSelected({});
      setTargets({});
    } catch (e) { setErr(errMsg(e) || "Failed to add KPIs"); }
    finally { setBusy(false); }
  }

  return (
    <div style={{display:"grid", gap:12}}>
      <h2 style={{fontSize:20, fontWeight:600}}>Add KPIs by Platform</h2>
      <div style={{display:"flex", gap:8, flexWrap:"wrap", alignItems:"center"}}>
        <label>Platform:</label>
        <select value={platform} onChange={e=>setPlatform(e.target.value)}
                style={{border:"1px solid #e5e7eb", borderRadius:8, padding:"6px 8px"}}>
          {platforms.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)}
               style={{border:"1px solid #e5e7eb", borderRadius:8, padding:"6px 8px", flex:"0 1 260px"}} />
        <div style={{marginLeft:"auto"}}>
          <Link href="/kpis" style={{fontSize:12, textDecoration:"underline"}}>Back to KPI Manager</Link>
        </div>
      </div>

      {err && <div style={{color:"crimson"}}>Error: {err}</div>}
      {msg && <div style={{color:"#065f46"}}>{msg}</div>}

      <div style={{display:"grid", gap:8}}>
        {filtered.length === 0 && <div style={{color:"#6b7280"}}>No KPIs found.</div>}
        {filtered.map(k => {
          const checked = !!selected[k.id];
          return (
            <div key={k.id} style={{display:"grid", gridTemplateColumns:"auto 1fr auto auto", gap:12, alignItems:"center",
                                     border:"1px solid #e5e7eb", borderRadius:10, padding:10}}>
              <input type="checkbox" checked={checked} onChange={()=>toggle(k.id)} />
              <div>
                <div style={{fontWeight:600}}>{k.name}</div>
                <div style={{fontSize:12, color:"#6b7280"}}>{k.channel} · {k.id}{k.unit ? ` · ${k.unit}`:""}</div>
              </div>
              <div style={{fontSize:12, color:"#6b7280"}}>Target ({period})</div>
              <input type="number" min="0" step="1" placeholder="optional"
                     value={targets[k.id] ?? ""} onChange={e=>setTarget(k.id, e.target.value)}
                     style={{width:120, border:"1px solid #e5e7eb", borderRadius:8, padding:"6px 8px"}} />
            </div>
          );
        })}
      </div>

      <div>
        <button onClick={addSelected} disabled={busy}
                style={{padding:"10px 14px", borderRadius:8, background:"#0a0a0a", color:"#fff", opacity:busy?0.6:1}}>
          {busy ? "Adding…" : "Add Selected"}
        </button>
      </div>
    </div>
  );
}
