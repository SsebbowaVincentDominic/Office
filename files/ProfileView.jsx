import { useState } from "react";
import { DB, avatarColor, STATUSES } from "../shared";
import Av from "../components/Av";

function RecycledFilesSection({ currentUser, showToast }) {
  const recycled = DB.get(`hq_recycled_${currentUser.id}`, []);
  if (recycled.length === 0) return null;
  const iconMap = { video:"🎬", image:"🖼️", doc:"📄", code:"💻", sheet:"📊", arch:"📦", other:"📎" };
  const MEDIA = { video:["mp4","mov","avi","webm","mkv"], image:["png","jpg","jpeg","gif","webp","svg"], doc:["pdf","docx","doc","txt","md"], code:["js","ts","jsx","tsx","py","sql","json","html","css"], sheet:["xlsx","xls","csv"], arch:["zip","rar","7z"] };
  const getCat = (ext) => { for (const [c,e] of Object.entries(MEDIA)) if (e.includes(ext)) return c; return "other"; };
  return (
    <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:16, marginTop:12 }}>
      <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".6px", marginBottom:10 }}>
        🗑️ Recycled Files ({recycled.length})
      </div>
      <div style={{ fontSize:12, color:"var(--muted)", marginBottom:10 }}>Files from teams you have left.</div>
      {recycled.map((f,i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", background:"var(--bg)", borderRadius:8, marginBottom:6, border:"1px solid var(--border)" }}>
          <span style={{ fontSize:15 }}>{iconMap[getCat(f.type)] || "📎"}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12.5, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</div>
            <div style={{ fontSize:11, color:"var(--muted)" }}>From: {f.fromTeam} · {f.size}</div>
          </div>
          <button onClick={() => showToast("Download coming soon!")} style={{ fontSize:11, padding:"3px 8px", border:"1px solid var(--border)", borderRadius:6, background:"none", cursor:"pointer", fontFamily:"var(--font)" }}>↓</button>
        </div>
      ))}
    </div>
  );
}

export default function ProfileView({ currentUser, setCurrentUser, myTeams, activeTeamId, onSwitchTeam, onJoinTeam, onLogout, showToast }) {
  const [editing, setEditing]   = useState(false);
  const [name, setName]         = useState(currentUser.name);
  const [email, setEmail]       = useState(currentUser.email);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining]   = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinTab, setJoinTab]   = useState("dept");

  const saveProfile = () => {
    if (!name.trim()) return;
    const users = DB.get("hq_users", []);
    const updated = users.map(u => u.id === currentUser.id
      ? { ...u, name: name.trim(), email: email.trim(), initials: name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) }
      : u);
    DB.set("hq_users", updated);
    setCurrentUser(p => ({ ...p, name: name.trim(), email: email.trim(), initials: name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) }));
    setEditing(false);
    showToast("Profile saved ✓");
  };

  const handleJoin = () => {
    setJoinError("");
    const code = joinCode.trim().toUpperCase();
    if (!code) { setJoinError("Please enter a department code."); return; }
    const teams = DB.get("hq_teams", []);

    // Parse dept code: XXXX-XXXX-SUFFIX
    const parts = code.split("-");
    const teamCode   = parts.slice(0, 2).join("-");
    const deptSuffix = parts.length >= 3 ? parts[parts.length - 1] : null;

    const team = teams.find(t => t.inviteCode === teamCode);
    if (!team) { setJoinError("No team found with this code."); return; }
    if (team.members.find(m => m.userId === currentUser.id)) { setJoinError("You are already a member of this team."); return; }

    // Find matching dept by suffix
    const depts = DB.get(`hq_dept_${team.id}`, team.departments || []);
    const dept  = deptSuffix ? depts.find(d => {
      const stored = DB.get(`hq_dept_code_${d.id}`, null);
      if (stored) return stored === code;
      return d.id.slice(-4).toUpperCase() === deptSuffix;
    }) : null;

    setJoining(true);
    setTimeout(() => {
      // Add member
      const updatedTeams = teams.map(t => {
        if (t.id !== team.id) return t;
        const updatedMembers = [...t.members, { userId: currentUser.id, role: "member", joinedAt: Date.now() }];
        let assigned = false;
        let updatedDepts = depts.map(d => {
          if (assigned) return d;
          if (dept && d.id !== dept.id) return d;
          const idx = d.offices.findIndex(o => !o.userId);
          if (idx === -1) return d;
          assigned = true;
          return { ...d, offices: d.offices.map((o, i) => i === idx ? { ...o, userId: currentUser.id } : o) };
        });
        if (!assigned) {
          updatedDepts = updatedDepts.map(d => {
            if (assigned) return d;
            const idx = d.offices.findIndex(o => !o.userId);
            if (idx === -1) return d;
            assigned = true;
            return { ...d, offices: d.offices.map((o, i) => i === idx ? { ...o, userId: currentUser.id } : o) };
          });
        }
        DB.set(`hq_dept_${team.id}`, updatedDepts);
        return { ...t, members: updatedMembers };
      });
      DB.set("hq_teams", updatedTeams);
      setJoining(false);
      setJoinCode("");
      onJoinTeam(team.id, dept?.id || null);
      showToast(`Joined "${team.name}" ✓ — office assigned!`);
    }, 500);
  };

  const handleGuestJoin = () => {
    setJoinError("");
    const code = joinCode.trim().toUpperCase();
    if (!code) { setJoinError("Please enter a guest code."); return; }
    const teams = DB.get("hq_teams", []);
    const team = teams.find(t => t.inviteCode === code);
    if (!team) { setJoinError("No team found with this code."); return; }
    if (team.members.find(m => m.userId === currentUser.id)) { setJoinError("You are already part of this team."); return; }
    setJoining(true);
    setTimeout(() => {
      const updated = teams.map(t => t.id === team.id
        ? { ...t, members: [...t.members, { userId: currentUser.id, role: "guest", joinedAt: Date.now() }] }
        : t);
      DB.set("hq_teams", updated);
      setJoining(false);
      setJoinCode("");
      onJoinTeam(team.id, null);
      showToast(`Joined "${team.name}" as guest ✓`);
    }, 500);
  };

  const membership = (teamId) => {
    const teams = DB.get("hq_teams", []);
    const team = teams.find(t => t.id === teamId);
    return team?.members?.find(m => m.userId === currentUser.id)?.role || "member";
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const avatarUrl = ev.target.result;
      const users = DB.get("hq_users", []);
      DB.set("hq_users", users.map(u => u.id === currentUser.id ? { ...u, avatarUrl } : u));
      setCurrentUser(p => ({ ...p, avatarUrl }));
      showToast("Profile photo updated ✓");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-wrap">
      <div className="profile-hero">
        <div className="profile-av-row">
          <label className="profile-av-wrap" title="Change photo">
            <div className="profile-av-big" style={{ background: avatarColor(currentUser.name) }}>
              {currentUser.avatarUrl
                ? <img src={currentUser.avatarUrl} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt={currentUser.name} />
                : currentUser.initials}
            </div>
            <div className="profile-av-overlay">📷</div>
            <input type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatarUpload} />
          </label>
          <div>
            {editing ? (
              <input style={{ fontSize:18, fontWeight:700, border:"1px solid var(--border)", borderRadius:7, padding:"4px 8px", fontFamily:"var(--font)", outline:"none", marginBottom:6, width:"100%" }} value={name} onChange={e => setName(e.target.value)} />
            ) : (
              <div className="profile-name">{currentUser.name}</div>
            )}
            <div className={`profile-role-badge ${currentUser.role === "admin" ? "profile-role-admin" : "profile-role-member"}`}>
              {currentUser.role === "admin" ? "👑 Admin" : currentUser.role === "guest" ? "🎟️ Guest" : "👤 Member"}
            </div>
          </div>
        </div>

        <div className="profile-section" style={{ marginBottom:0 }}>
          <div className="profile-sec-title">Account Info</div>
          {editing ? (
            <>
              <div className="profile-field"><label className="profile-label">Display Name</label><input className="profile-input" value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="profile-field"><label className="profile-label">Email</label><input className="profile-input" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn btn-primary btn-sm" onClick={saveProfile}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setName(currentUser.name); setEmail(currentUser.email); }}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12 }}>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}><span style={{ fontSize:12, color:"var(--muted)", width:50 }}>Name</span><span style={{ fontSize:13, fontWeight:500 }}>{currentUser.name}</span></div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}><span style={{ fontSize:12, color:"var(--muted)", width:50 }}>Email</span><span style={{ fontSize:13, fontWeight:500 }}>{currentUser.email}</span></div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
            </>
          )}
        </div>
      </div>

      <div className="profile-section">
        <div className="profile-sec-title">My Teams ({myTeams.length})</div>
        <div className="profile-teams-list">
          {myTeams.map(team => (
            <div key={team.id} className={`profile-team-row ${team.id === activeTeamId ? "profile-team-active" : ""}`}>
              <div className="profile-team-dot" style={{ background: team.id === activeTeamId ? "#22c55e" : "#94a3b8" }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{team.name}</div>
                <div style={{ fontSize:11, color:"var(--muted)" }}>{team.members.length} member{team.members.length !== 1 ? "s" : ""} · {membership(team.id)}</div>
              </div>
              {team.id === activeTeamId
                ? <span style={{ fontSize:11, fontWeight:700, color:"var(--green)", background:"var(--green-bg)", padding:"2px 7px", borderRadius:99 }}>Active</span>
                : <button className="btn btn-ghost btn-sm" onClick={() => onSwitchTeam(team.id)}>Switch</button>}
            </div>
          ))}
        </div>

        {/* Join tabs */}
        <div style={{ marginTop:14 }}>
          <div style={{ display:"flex", gap:6, marginBottom:10 }}>
            <button onClick={() => { setJoinTab("dept"); setJoinError(""); setJoinCode(""); }}
              style={{ flex:1, padding:"9px", borderRadius:8, border:"1.5px solid", fontSize:12.5, fontWeight:600, fontFamily:"var(--font)", cursor:"pointer",
                background: joinTab==="dept" ? "var(--text)" : "var(--bg)", color: joinTab==="dept" ? "white" : "var(--muted)", borderColor: joinTab==="dept" ? "var(--text)" : "var(--border)" }}>
              👤 Join Team
            </button>
            <button onClick={() => { setJoinTab("guest"); setJoinError(""); setJoinCode(""); }}
              style={{ flex:1, padding:"9px", borderRadius:8, border:"1.5px solid", fontSize:12.5, fontWeight:600, fontFamily:"var(--font)", cursor:"pointer",
                background: joinTab==="guest" ? "#7c3aed" : "var(--bg)", color: joinTab==="guest" ? "white" : "var(--muted)", borderColor: joinTab==="guest" ? "#7c3aed" : "var(--border)" }}>
              🎟️ Guest
            </button>
          </div>

          {joinTab === "dept" ? (
            <div className="profile-join-box">
              <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>👤 Join a Department</div>
              <div className="profile-join-sub">Paste the department code from the admin. You'll land directly in that department with an office.</div>
              <input className="profile-code-input" placeholder="XXXX-XXXX-XXXX" value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && handleJoin()} maxLength={20} />
              {joinError && <div style={{ fontSize:12, color:"#ef4444", marginBottom:8 }}>⚠️ {joinError}</div>}
              <button className="btn btn-primary" onClick={handleJoin} disabled={joining} style={{ width:"100%" }}>
                {joining ? "Joining…" : "Join Team"}
              </button>
            </div>
          ) : (
            <div className="profile-join-box" style={{ borderColor:"#ddd6fe" }}>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>🎟️ Guest Access</div>
              <div className="profile-join-sub">Paste the guest code (XXXX-XXXX) from an admin. View and download files only — no office or links.</div>
              <input className="profile-code-input" placeholder="XXXX-XXXX" value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && handleGuestJoin()} maxLength={9} />
              {joinError && <div style={{ fontSize:12, color:"#ef4444", marginBottom:8 }}>⚠️ {joinError}</div>}
              <button onClick={handleGuestJoin} disabled={joining}
                style={{ width:"100%", padding:"10px", background:"#7c3aed", color:"white", border:"none", borderRadius:8, fontSize:13, fontWeight:600, fontFamily:"var(--font)", cursor:"pointer" }}>
                {joining ? "Joining…" : "Join as Guest"}
              </button>
            </div>
          )}
        </div>
      </div>

      <RecycledFilesSection currentUser={currentUser} showToast={showToast} />

      <button onClick={onLogout}
        style={{ width:"100%", marginTop:12, padding:"12px", background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca", borderRadius:10, fontSize:14, fontWeight:600, fontFamily:"var(--font)", cursor:"pointer" }}>
        🚪 Sign Out
      </button>
    </div>
  );
}
