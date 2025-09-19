"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import { getSettings } from "../lib/settings";

/* -------------------- Types -------------------- */
type Task = {
  id: string;
  text: string;
  done: boolean;
  carried_from?: string | null;
};

type DayResp = {
  workspace_id: string;
  date: string; // YYYY-MM-DD
  tasks: Task[];
};

type MonthResp = {
  workspace_id: string;
  period: string; // YYYY-MM
  days: { date: string; tasks: Task[] }[];
};

/* -------------------- Helpers (pure) -------------------- */
const periodNow = () => new Date().toISOString().slice(0, 7);
const todayISO = () => new Date().toISOString().slice(0, 10);

function prevPeriod(p: string): string {
  const [y, m] = p.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1)); // previous month
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

function formatMonth(p: string): string {
  const [y, m] = p.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function carryBadge(today: DayResp | null): string {
  if (!today || !today.tasks?.length) return "";
  const carried = today.tasks.filter((t) => t.carried_from).length;
  return carried ? `carried over: ${carried}` : "";
}

/* ======================================================== */

export default function DayPage() {
  /* ---------- State ---------- */
  const [workspaceId, setWorkspaceId] = useState<string>("w_001");
  const [today, setToday] = useState<DayResp | null>(null);
  const [months, setMonths] = useState<MonthResp[]>([]);
  const [newText, setNewText] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);

  // inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  const nowPeriod = useMemo(periodNow, []);

  /* ---------- Sync workspace from Controls ---------- */
  useEffect(() => {
    const sync = () => setWorkspaceId(getSettings().workspaceId);
    sync(); // initial read
    window.addEventListener("hachi:settings", sync);
    return () => window.removeEventListener("hachi:settings", sync);
  }, []);

  /* ---------- Data loaders (stable) ---------- */
  const loadToday = useCallback(async () => {    
    const url = `/api/hachi/day/today/${workspaceId}`;     
    const r = await fetch(url);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const data: DayResp = await r.json();
    setToday(data);
  }, [workspaceId]);

  const loadMonths = useCallback(async () => {
    const periods = [nowPeriod, prevPeriod(nowPeriod)];
    const data: MonthResp[] = [];
    for (const p of periods) {
      const r = await fetch(`/api/hachi/day/${workspaceId}/month/${p}`);
      if (r.ok) data.push(await r.json());
    }
    setMonths(data);
  }, [workspaceId, nowPeriod]);

  useEffect(() => {
    let active = true;
    (async () => {
      await loadToday();
      if (!active) return;
      await loadMonths();
    })();
    return () => {
      active = false;
    };
  }, [loadToday, loadMonths]);

  /* ---------- Actions (Today) ---------- */
  async function addTask() {
    const text = newText.trim();
    if (!text || !today) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/hachi/day/${workspaceId}/${today.date}/add`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (r.ok) {
        setNewText("");
        await loadToday();
      }
    } finally {
      setBusy(false);
    }
  }

  async function toggle(task: Task, done: boolean) {
    if (!today) return;
    const res = await fetch(
      `/api/hachi/day/${workspaceId}/${today.date}/${task.id}/toggle`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ done }),
      }
    );
    if (!res.ok) {
      alert(`Toggle failed: ${res.status}`);
      return;
    }
    await loadToday();
  }

  async function remove(task: Task) {
    if (!today) return;
    const res = await fetch(
      `/api/hachi/day/${workspaceId}/${today.date}/${task.id}`,
      { method: "DELETE" }
    );
    if (!res.ok) {
      const txt = await res.text();
      alert(`Delete failed: ${res.status} ${txt}`);
      return;
    }
    await loadToday();
    await loadMonths(); // also refresh history
  }

  const doneCount = (today?.tasks || []).filter((t) => t.done).length;

  async function clearCompleted() {
    if (!today || doneCount === 0) return;
    const ok = window.confirm(
      `Clear ${doneCount} completed item(s) from today?`
    );
    if (!ok) return;
    const res = await fetch(
      `/api/hachi/day/${workspaceId}/${today.date}/clear_done`,
      { method: "POST" }
    );
    if (!res.ok) {
      const txt = await res.text();
      alert(`Clear failed: ${res.status} ${txt}`);
      return;
    }
    await loadToday();
    await loadMonths();
  }

  async function saveEdit(taskId: string) {
    if (!today) return;
    const text = editingText.trim();
    if (!text) {
      setEditingId(null);
      return;
    }
    const res = await fetch(
      `/api/hachi/day/${workspaceId}/${today.date}/${taskId}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      }
    );
    if (!res.ok) {
      alert(`Update failed: ${res.status}`);
      return;
    }
    setEditingId(null);
    await loadToday();
  }

  /* ---------- Render ---------- */
  return (
    <div className="day-wrapper">
      {/* TODAY */}
      <Card className="day-card">
        <div className="day-title">
          <h3>Today • {today?.date || todayISO()}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {carryBadge(today) && (
              <span style={{ fontSize: 12, color: "var(--warm-text-secondary)" }}>
                {carryBadge(today)}
              </span>
            )}
            <button
              className="hc-btn-ghost"
              onClick={clearCompleted}
              disabled={doneCount === 0}
            >
              Clear completed
            </button>
          </div>
        </div>

        {/* New task row */}
        <div className="todo-new">
          <input
            className="hc-input"
            style={{ flex: 1 }}
            placeholder="Add a task…"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
            }}
          />
          <button
            className="hc-btn-primary"
            disabled={busy || !newText.trim()}
            onClick={addTask}
          >
            Add
          </button>
        </div>

        {/* Today list */}
        <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
          {today?.tasks?.length ? (
            today.tasks.map((t) => (
              <div key={t.id} className="todo-row">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={(e) => toggle(t, e.target.checked)}
                />

                {editingId === t.id ? (
                  <input
                    className="hc-input"
                    style={{ flex: 1 }}
                    autoFocus
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(t.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={() => setEditingId(null)}
                  />
                ) : (
                  <div
                    className={`todo-text ${t.done ? "done" : ""}`}
                    onDoubleClick={() => {
                      setEditingId(t.id);
                      setEditingText(t.text);
                    }}
                  >
                    {t.text}
                    {t.carried_from ? (
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>
                        {" "}
                        (from {t.carried_from})
                      </span>
                    ) : null}
                  </div>
                )}

                <div className="todo-actions">
                  <button
                    className="hc-btn-ghost"
                    onClick={() => {
                      setEditingId(t.id);
                      setEditingText(t.text);
                    }}
                  >
                    Edit
                  </button>
                  <button className="hc-btn-ghost" onClick={() => remove(t)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: "#9ca3af" }}>No tasks yet.</div>
          )}
        </div>
      </Card>

      {/* HISTORY (Keep-style): previous months in collapsible sections with 3-up cards of completed tasks per day */}
      {months.map((m) => {
        const daysWithDone = m.days
          .filter((d) => d.date !== today?.date)
          .map((d) => ({
            date: d.date,
            done: d.tasks.filter((t) => t.done),
            left: d.tasks.filter((t) => !t.done).length,
          }))
          .filter((d) => d.done.length > 0);

        return (
          <details
            key={m.period}
            className="month-group"
            open={m.period === nowPeriod}
          >
            <summary>{formatMonth(m.period)}</summary>
            <div className="month-body">
              <div className="keep-grid">
                {daysWithDone.length === 0 ? (
                  <div className="keep-empty">No completed tasks yet.</div>
                ) : (
                  daysWithDone.map((d) => (
                    <div key={d.date} className="keep-card">
                      <h4>
                        {d.date} • {d.done.length} done
                        {d.left ? ` • ${d.left} left` : ""}
                      </h4>
                      <div className="keep-list">
                        {d.done.map((t) => (
                          <div key={t.id} className="keep-item">
                            <span className="keep-dot" />
                            <div>{t.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}
