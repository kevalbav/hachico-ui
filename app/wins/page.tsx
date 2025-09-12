"use client";
import { useEffect, useState } from "react";
const WID = "w_001";

type Win = { id: string; date: string; title: string; tags?: string | null; effort_mins: number };

export default function WinsPage() {
  const [wins, setWins] = useState<Win[]>([]);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  async function load() {
    setErr(null);
    try {
      const r = await fetch(`/api/hachi/wins?workspace_id=${WID}&limit=20`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setWins(await r.json());
    } catch (e:any) { setErr(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function addWin() {
    if (!title.trim()) return;
    setBusy(true);
    try {
      const payload = { workspace_id: WID, date: new Date().toISOString().slice(0,10), title };
      const r = await fetch("/api/hachi/wins", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setTitle("");
      load();
    } finally { setBusy(false); }
  }

  return (
    <div style={{display:"grid", gap:16}}>
      <div style={{display:"flex", gap:8}}>
        <input
          value={title} onChange={e=>setTitle(e.target.value)}
          placeholder="Add a small win…"
          style={{flex:1, border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 12px"}}
        />
        <button onClick={addWin} disabled={busy}
          style={{padding:"8px 12px", borderRadius:8, background:"#0a0a0a", color:"#fff", opacity:busy?0.6:1}}>
          Add
        </button>
      </div>
      {err && <div style={{color:"crimson"}}>Error: {err}</div>}
      <ul style={{display:"grid", gap:8}}>
        {wins.map(w => (
          <li key={w.id} style={{border:"1px solid #e5e7eb", borderRadius:12, padding:12}}>
            <div style={{fontSize:12, color:"#6b7280"}}>{w.date}</div>
            <div style={{fontWeight:600}}>{w.title}</div>
            {w.tags ? <div style={{fontSize:12, color:"#6b7280"}}>{w.tags}</div> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
