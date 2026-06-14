import { useState } from "react";
import { STATUSES } from "../shared";
import Av from "../components/Av";

const SETTING_CARDS = [
  { id: "members",     icon: "👥", name: "Members",      desc: "Manage team members and roles" },
  { id: "departments", icon: "🏗️", name: "Departments",  desc: "Add or edit departments" },
  { id: "permissions", icon: "🔐", name: "Permissions",  desc: "Configure role access" },
  { id: "project",     icon: "📋", name: "Project Info", desc: "Edit project name and details" },
];

export default function SettingsView({ departments, setDepartments, currentUser, activeTeam, allTeamUsers, showToast }) {
  const [panel, setPanel] = useState(null);
  const isAdmin = currentUser.role === "admin" || activeTeam?.members?.find(m => m.userId === currentUser.id)?.role === "admin";

  const [projInfo, setProjInfo] = useState({
    name:        activeTeam?.name        || "My Project",
    description: activeTeam?.description || "",
    website:     "",
    github:      "",
  });

  if (panel === "members") return (
    <div className="set-panel">
      <div className="set-back" onClick={() => setPanel(null)}>← Back to Settings</div>
      <div className="set-title">👥 Team Members</div>
      <div className="set-sub">All members currently on this project.</div>
      {allTeamUsers.map(u => {
        const membership = activeTeam?.members?.find(m => m.userId === u.id);
        const role = membership?.role || "member";
        return (
          <div key={u.id} className="ds-row">
            <div style={{ position: "relative" }}>
              <Av name={u.name} initials={u.initials} size="av-lg" />
              <span style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, borderRadius: "50%", background: (STATUSES[u.status || "online"]).color, border: "2px solid white" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="ds-nm">{u.name}{u.id === currentUser.id ? " (You)" : ""}</div>
              <div className="ds-ct">{u.email}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: role === "admin" ? "#fef3c7" : "#dbeafe", color: role === "admin" ? "#92400e" : "#1e40af" }}>{role}</span>
          </div>
        );
      })}
      <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--bg)", borderRadius: 9, border: "1px dashed var(--border)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Invite Code</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <code style={{ flex: 1, fontFamily: "var(--mono)", fontSize: 15, letterSpacing: 2, fontWeight: 700 }}>{activeTeam?.inviteCode}</code>
          <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard?.writeText(activeTeam?.inviteCode || ""); showToast("Invite code copied!"); }}>Copy</button>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Share this code with people you want to invite</div>
      </div>
    </div>
  );

  if (panel === "departments") return (
    <div className="set-panel">
      <div className="set-back" onClick={() => setPanel(null)}>← Back to Settings</div>
      <div className="set-title">🏗️ Departments</div>
      <div className="set-sub">Manage your team's departments.</div>
      {departments.map(d => (
        <div key={d.id} className="ds-row">
          <div className="ds-ic" style={{ background: d.accent + "22" }}>{d.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ds-nm">{d.name}</div>
            <div className="ds-ct">{d.offices.length} offices · {d.offices.filter(o => o.userId).length} occupied</div>
          </div>
          {isAdmin && <button className="btn btn-ghost btn-sm" onClick={() => showToast("Edit department coming soon!")}>Edit</button>}
        </div>
      ))}
      {isAdmin && <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={() => showToast("Add department coming soon!")}>+ Add Department</button>}
    </div>
  );

  if (panel === "permissions") return (
    <div className="set-panel">
      <div className="set-back" onClick={() => setPanel(null)}>← Back to Settings</div>
      <div className="set-title">🔐 Permissions</div>
      <div className="set-sub">Control what each role can access.</div>
      <div style={{ overflowX: "auto" }}>
        <table className="perm-table">
          <thead><tr><th>Resource</th><th>Admin</th><th>Member</th><th>Guest</th></tr></thead>
          <tbody>
            {["View HQ Map", "Upload Files", "Manage Members", "Edit Departments", "View Final Deliverables", "Change Permissions"].map(res => (
              <tr key={res}>
                <td style={{ fontWeight: 600 }}>{res}</td>
                <td><input type="checkbox" className="perm-check" defaultChecked disabled /></td>
                <td><input type="checkbox" className="perm-check" defaultChecked={!["Manage Members", "Change Permissions"].includes(res)} /></td>
                <td><input type="checkbox" className="perm-check" defaultChecked={["View HQ Map", "View Final Deliverables"].includes(res)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (panel === "project") return (
    <div className="set-panel">
      <div className="set-back" onClick={() => setPanel(null)}>← Back to Settings</div>
      <div className="set-title">📋 Project Info</div>
      <div className="set-sub">Edit your project details.</div>
      <div className="pi-field"><label className="pi-label">Project Name</label><input className="pi-input" value={projInfo.name} onChange={e => setProjInfo(p => ({ ...p, name: e.target.value }))} /></div>
      <div className="pi-field"><label className="pi-label">Description</label><textarea className="pi-textarea" rows={3} value={projInfo.description} onChange={e => setProjInfo(p => ({ ...p, description: e.target.value }))} /></div>
      <div className="pi-field"><label className="pi-label">Website</label><input className="pi-input" placeholder="https://…" value={projInfo.website} onChange={e => setProjInfo(p => ({ ...p, website: e.target.value }))} /></div>
      <div className="pi-field"><label className="pi-label">GitHub Org / Repo</label><input className="pi-input" placeholder="https://github.com/…" value={projInfo.github} onChange={e => setProjInfo(p => ({ ...p, github: e.target.value }))} /></div>
      <button className="btn btn-primary" onClick={() => showToast("Project info saved ✓")}>Save Changes</button>
    </div>
  );

  return (
    <div>
      <div className="set-title">⚙️ Settings</div>
      <div className="set-sub">Manage project, members, departments, and permissions.</div>
      <div className="sg">
        {SETTING_CARDS.map(s => (
          <div key={s.id} className="sc" onClick={() => setPanel(s.id)}>
            <div style={{ fontSize: 20, marginBottom: 7 }}>{s.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{s.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
