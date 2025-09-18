"use client";
import { useState } from "react";

export default function ImportPage() {
  const [kpiId, setKpiId] = useState("k_ig_reach");
  const [source, setSource] = useState("csv");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setErr(null);
    if (!file) { setErr("Please select a CSV file."); return; }
    const fd = new FormData();
    fd.append("kpi_id", kpiId);
    fd.append("source", source);
    fd.append("file", file);

    setBusy(true);
    try {
      const r = await fetch("/api/hachi/metrics/import", { method: "POST", body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.detail || `HTTP ${r.status}`);
      setMsg("Import complete. Check your dashboard!");
    } catch (e: any) {
      setErr(e.message || "Import failed.");
    } finally { setBusy(false); }
  }

  const template = "date,value\n2025-09-01,1200\n2025-09-08,2400\n";

  function downloadTemplate() {
    const blob = new Blob([template], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "hachi_template.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{maxWidth:560}}>
      <h2 style={{fontSize:20, fontWeight:600, marginBottom:12}}>Import CSV</h2>
      <p style={{fontSize:14, color:"#475569", marginBottom:16}}>
        Upload a <b>CSV</b> with headers <code>date,value</code> (ISO date). Optional sources are supported by your backend.
      </p>

      <form onSubmit={onSubmit} style={{display:"grid", gap:12}}>
        <label style={{display:"grid", gap:6}}>
          <span style={{fontSize:12, color:"#6b7280"}}>KPI ID</span>
          <input value={kpiId} onChange={e=>setKpiId(e.target.value)}
                 style={{border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 10px"}} />
        </label>

        <label style={{display:"grid", gap:6}}>
          <span style={{fontSize:12, color:"#6b7280"}}>Source (optional)</span>
          <input value={source} onChange={e=>setSource(e.target.value)}
                 style={{border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 10px"}} />
        </label>

        <label style={{display:"grid", gap:6}}>
          <span style={{fontSize:12, color:"#6b7280"}}>CSV File</span>
          <input type="file" accept=".csv,text/csv" onChange={e=>setFile(e.target.files?.[0] || null)} />
        </label>

        <div style={{display:"flex", gap:8}}>
          <button type="submit" disabled={busy}
                  style={{padding:"10px 14px", borderRadius:8, background:"#0a0a0a", color:"#fff", opacity:busy?0.6:1}}>
            {busy ? "Uploading…" : "Upload CSV"}
          </button>
          <button type="button" onClick={downloadTemplate}
                  style={{padding:"10px 14px", borderRadius:8, border:"1px solid #e5e7eb"}}>
            Download template
          </button>
        </div>
      </form>

      {msg && <div style={{marginTop:12, color:"#065f46"}}>{msg}</div>}
      {err && <div style={{marginTop:12, color:"crimson"}}>Error: {err}</div>}
    </div>
  );
}
