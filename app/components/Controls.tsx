"use client";
import { useEffect, useState } from "react";
import { getSettings, setSettings, shiftPeriod } from "../lib/settings";

export default function Controls() {
  const [ws, setWs] = useState(getSettings());

  useEffect(() => {
    // sync with current localStorage on mount
    setWs(getSettings());
  }, []);

  function updatePeriod(next: string) {
    const s = setSettings({ period: next });
    setWs(s);
    window.dispatchEvent(new Event("hachi:settings"));
  }

  function updateWorkspaceId(next: string) {
    const s = setSettings({ workspaceId: next });
    setWs(s);
    window.dispatchEvent(new Event("hachi:settings"));
  }

  return (
    <div style={{display:"flex", gap:12, alignItems:"center", padding:"8px 0"}}>
      <div style={{display:"flex", gap:8, alignItems:"center"}}>
        <button onClick={()=>updatePeriod(shiftPeriod(ws.period, -1))}
          style={{padding:"4px 8px", border:"1px solid #e5e7eb", borderRadius:8}}>&lt;</button>
        <div style={{minWidth:88, textAlign:"center"}}>{ws.period}</div>
        <button onClick={()=>updatePeriod(shiftPeriod(ws.period, +1))}
          style={{padding:"4px 8px", border:"1px solid #e5e7eb", borderRadius:8}}>&gt;</button>
      </div>
      <div style={{display:"flex", gap:6, alignItems:"center"}}>
        <label style={{fontSize:12, color:"#6b7280"}}>Workspace</label>
        <input
          value={ws.workspaceId}
          onChange={e=>updateWorkspaceId(e.target.value)}
          style={{border:"1px solid #e5e7eb", borderRadius:8, padding:"6px 8px"}}
        />
      </div>
    </div>
  );
}
