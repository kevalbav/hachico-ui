"use client";
import { useEffect, useState } from "react";
import { getSettings } from "./lib/settings";
import { fmtNum, fmtPct } from "./lib/format";
import { monthBounds } from "./lib/date";
import Card from "./components/Card";
import Sparkline from "./components/Sparkline";

type SeriesPoint = { date: string; value: number; source?: string };
type CardT = {
  kpi_id: string; name: string; channel?: string; unit?: string;
  actual: number; target: number; pct_of_target: number | null;
  series?: SeriesPoint[];
};
type Rollup = { workspace_id: string; period: string; cards: CardT[] };

export default function Dashboard() {
  const [data, setData] = useState<Rollup | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [youtubeStatus, setYoutubeStatus] = useState<{connected: boolean, external_account_id?: string} | null>(null);
  const [syncing, setSyncing] = useState(false);

  const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

  async function loadYouTubeStatus() {
    const s = getSettings();
    try {
      const r = await fetch(`/api/hachi/integrations/youtube/status?workspace_id=${s.workspaceId}`);
      if (r.ok) {
        const status = await r.json();
        setYoutubeStatus(status);
      }
    } catch (e) {
      console.warn("YouTube status failed:", e);
    }
  }

  async function syncYouTube() {
    const s = getSettings();
    setSyncing(true);
    try {
      const r = await fetch(`/api/hachi/integrations/youtube/sync_channel?workspace_id=${s.workspaceId}`, {
        method: "POST"
      });
      if (!r.ok) throw new Error(`Sync failed: ${r.status}`);
      const result = await r.json();
      console.log("Sync result:", result);
      // Reload dashboard data
      await load();
    } catch (e) {
      alert(errMsg(e));
    } finally {
      setSyncing(false);
    }
  }

  async function connectYouTube() {
    const s = getSettings();
    // Redirect to OAuth flow
    window.location.href = `/api/hachi/oauth/youtube/start?workspace_id=${s.workspaceId}`;
  }

async function load() {
  const s = getSettings();
  try {
    console.log("Loading dashboard data..."); // ADD THIS
    const r = await fetch(`/api/hachi/metrics/progress/workspace/${s.workspaceId}/${s.period}`);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const roll: Rollup = await r.json();
    console.log("Dashboard data loaded:", roll);
      const { from, to } = monthBounds(roll.period);
      const cardsWithSeries = await Promise.all(
        roll.cards.map(async (c) => {
          try {
            const rr = await fetch(`/api/hachi/metrics?kpi_id=${encodeURIComponent(c.kpi_id)}&date_from=${from}&date_to=${to}`);
            const series: SeriesPoint[] = rr.ok ? await rr.json() : [];
            return { ...c, series };
          } catch (e) { console.warn("series fetch failed for", c.kpi_id, e); return { ...c, series: [] }; }
        })
      );
      setData({ ...roll, cards: cardsWithSeries });
    } catch (e) { setErr(errMsg(e)); }
    finally { setLoading(false); }
  }

  useEffect(() => { 
    load(); 
    loadYouTubeStatus();
  }, []);
  
  useEffect(() => {
    const fn = () => { setLoading(true); load(); };
    window.addEventListener("hachi:settings", fn);
    return () => window.removeEventListener("hachi:settings", fn);
  }, []);

  if (loading) return <p style={{ color:"#64748b" }}>Loading…</p>;
  if (err) return <p style={{ color:"#dc2626" }}>Error: {err}</p>;

  return (
    <div>
      {/* YouTube Integration Section */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>YouTube Integration</h3>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
              {youtubeStatus?.connected 
                ? `Connected: ${youtubeStatus.external_account_id}`
                : "Connect your YouTube channel to sync data"
              }
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {youtubeStatus?.connected ? (
              <button 
                onClick={syncYouTube} 
                disabled={syncing}
                className="hc-btn-primary"
              >
                {syncing ? "Syncing..." : "Sync Data"}
              </button>
            ) : (
              <button onClick={connectYouTube} className="hc-btn-primary">
                Connect YouTube
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      {(!data || data.cards.length === 0) ? <EmptyState /> : (
        <div className="cards-grid">
          {data.cards.map((c) => <KpiCard key={c.kpi_id} c={c} onSaved={load} />)}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <Card>
      <div style={{ textAlign:"center", padding:32 }}>
        <div style={{ margin:"0 auto 12px", width:48, height:48, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:16, background:"rgb(252,231,243)" }}>🐶</div>
        <h3 style={{ margin:"0 0 4px", fontSize:18, fontWeight:600 }}>No KPIs yet</h3>
        <p style={{ margin:"0 0 16px", color:"#64748b", fontSize:14 }}>Connect YouTube and sync data, or add KPIs manually.</p>
        <a className="hc-btn-primary" href="/kpis/add">Add KPIs</a>
      </div>
    </Card>
  );
}

function KpiCard({ c, onSaved }: { c: CardT; onSaved: () => void }) {
  const pct = c.pct_of_target;
  const pctText = fmtPct(pct, 1);
  const pctClamped = pct == null ? 0 : Math.max(0, Math.min(100, pct));
  const width = pctClamped.toFixed(1) + "%";
  const barColor = (pct == null) ? "var(--warm-border)" : (pct >= 100 ? "var(--green-progress)" : (pct >= 70 ? "var(--yellow-progress)" : "var(--red-progress)"));

  return (
    <Card>
      <div className="kpi-head">
        <div>
          <div className="kpi-sub">{c.channel}</div>
          <h4 className="kpi-title">{c.name}</h4>
        </div>
        <GoalEditor kpiId={c.kpi_id} currentTarget={c.target} onSaved={onSaved} />
      </div>

      <div className="kpi-stats">
        <div>Target: <b>{fmtNum(c.target)}</b></div>
        <div>Actual: <b>{fmtNum(c.actual)}</b></div>
        <div>Progress: <b>{pct == null ? "—" : pctText}</b></div>
      </div>

      <Sparkline points={(c.series || []).map(p => p.value)} />

      <div className="progress">
        <div className="progress-fill" style={{ width, background: barColor }} />
      </div>
    </Card>
  );
}

function GoalEditor({ kpiId, currentTarget, onSaved }: { kpiId: string; currentTarget: number; onSaved: () => void; }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(currentTarget || ""));
  const [busy, setBusy] = useState(false);

  useEffect(() => { setVal(String(currentTarget || "")); }, [currentTarget]);

  async function save() {
    const num = Number(val);
    if (!Number.isFinite(num) || num <= 0) { alert("Enter a positive number"); return; }
    setBusy(true);
    try {
      const period = new Date().toISOString().slice(0,7);
      const r = await fetch("/api/hachi/goals/set", {
        method: "POST", headers: { "content-type":"application/json" },
        body: JSON.stringify({ kpi_id: kpiId, period, target_value: num })
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      console.log("Goal saved successfully, calling onSaved()");
      setEditing(false);
      onSaved();
    } catch (e) { alert(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  }

  if (!editing) {
    return <button onClick={()=>setEditing(true)} className="hc-btn-ghost">Edit goal</button>;
  }
  return (
    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
      <input type="number" min="0" step="1" value={val} onChange={e=>setVal(e.target.value)} className="hc-input" style={{ width:120 }} />
      <button onClick={save} disabled={busy} className="hc-btn-primary">{busy ? "Saving…" : "Save"}</button>
      <button onClick={()=>{ setEditing(false); setVal(String(currentTarget||"")); }} className="hc-btn-ghost">Cancel</button>
    </div>
  );
}