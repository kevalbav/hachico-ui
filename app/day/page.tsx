"use client";
import { useEffect, useState } from "react";
const WID = "w_001";
const TODAY = new Date().toISOString().slice(0,10);

type Task = { id: string; date: string; title: string; status: "open"|"done"; effort_mins: number };

export default function DayPlan() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");

  async function load() {
    const r = await fetch(`/api/hachi/tasks?workspace_id=${WID}&date=${TODAY}`);
    const j = await r.json();
    setTasks(j);
  }
  useEffect(() => { load(); }, []);

  async function addTask() {
    if (!title.trim()) return;
    await fetch("/api/hachi/tasks", {
      method:"POST",
      headers:{ "content-type":"application/json" },
      body: JSON.stringify({ workspace_id: WID, date: TODAY, title })
    });
    setTitle("");
    load();
  }

  async function toggle(id: string, status: "open"|"done") {
    await fetch(`/api/hachi/tasks/${id}/status`, {
      method:"POST",
      headers:{ "content-type":"application/json" },
      body: JSON.stringify({ status })
    });
    load();
  }

  return (
    <div style={{display:"grid", gap:16}}>
      <div style={{display:"flex", gap:8}}>
        <input
          value={title} onChange={e=>setTitle(e.target.value)}
          placeholder="Add a task for today…"
          style={{flex:1, border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 12px"}}
        />
        <button onClick={addTask} style={{padding:"8px 12px", borderRadius:8, background:"#0a0a0a", color:"#fff"}}>
          Add
        </button>
      </div>
      <ul style={{display:"grid", gap:8}}>
        {tasks.map(t => (
          <li key={t.id} style={{border:"1px solid #e5e7eb", borderRadius:12, padding:12, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <div style={t.status==="done" ? {textDecoration:"line-through", color:"#6b7280"} : undefined}>{t.title}</div>
            <button onClick={()=>toggle(t.id, t.status==="done" ? "open" : "done")}
              style={{fontSize:12, padding:"4px 8px", border:"1px solid #e5e7eb", borderRadius:8}}>
              {t.status==="done" ? "Mark open" : "Mark done"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
