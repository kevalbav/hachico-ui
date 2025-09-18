"use client";
import { useEffect, useState } from "react";

type Status = { connected: boolean; external_account_id?: string | null; last_metric_date?: string | null };

export default function Integrations() {
  // If you store workspace elsewhere, update this line:
  const WID = "w_001";

  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>("");

  async function loadStatus() {
    setErr("");
    try {
      const r = await fetch(`/api/hachi/integrations/youtube/status?workspace_id=${WID}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setStatus(await r.json());
    } catch (e: any) {
      setErr(e?.message || "Failed to load status");
    }
  }

  useEffect(() => { loadStatus(); }, []);

  async function syncNow() {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch(`/api/hachi/integrations/youtube/sync_channel?workspace_id=${WID}`, { method: "POST" });
      if (!r.ok) throw new Error(`Sync failed (HTTP ${r.status})`);
      alert("Synced!");
    } catch (e: any) {
      setErr(e?.message || "Sync failed");
    } finally {
      setBusy(false);
      loadStatus();
    }
  }

  return (
    <div style={{display:"grid", gap:16}}>
      <h2 style={{margin:0}}>Integrations</h2>

      <div style={{padding:16, border:"1px solid #e5e7eb", borderRadius:12}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16}}>
          <div>
            <h3 style={{margin:"0 0 4px 0"}}>YouTube</h3>
            <p style={{margin:0, color:"#6b7280"}}>Read-only connection to fetch Subscribers and Total Views (snapshot).</p>
            {status && (
              <p style={{margin:"8px 0 0 0", fontSize:12, color:"#6b7280"}}>
                {status.connected ? "Connected" : "Not connected"}
                {status.external_account_id ? ` • Channel: ${status.external_account_id}` : ""}
                {status.last_metric_date ? ` • Last metric: ${status.last_metric_date}` : ""}
              </p>
            )}
            {err && <p style={{marginTop:8, color:"#ef4444"}}>Error: {err}</p>}
          </div>

          <div style={{display:"flex", gap:8}}>
            <a
              href={`/api/hachi/oauth/youtube/start?workspace_id=${WID}`}
              target="_blank" rel="noreferrer"
              style={{padding:"8px 12px", borderRadius:8, background:"#111827", color:"#fff", textDecoration:"none"}}
            >
              {status?.connected ? "Reconnect YouTube" : "Connect YouTube"}
            </a>
            <button
              onClick={syncNow}
              disabled={busy || !status?.connected}
              style={{padding:"8px 12px", borderRadius:8, border:"1px solid #d1d5db", background:"#fff"}}
            >
              {busy ? "Syncing…" : "Sync now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
