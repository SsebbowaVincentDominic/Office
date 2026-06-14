import { useState, useEffect } from "react";
import { DB, STATUSES, LINK_META, getFileCategory, FILE_CAT_ICONS } from "../shared";
import Av from "../components/Av";
import Dot from "../components/Dot";

export default function HQView({ departments, setDepartments, currentUser, allTeamUsers, teamFiles, onOfficeClick, onKnock, teamInviteCode, showToast, highlightDept, onClearHighlight }) {
  const [exp, setExp]                       = useState({});
  const [tab, setTab]                       = useState({});
  const [deptInvitePopup, setDeptInvitePopup] = useState(null);

  const toggle  = id => setExp(p => ({ ...p, [id]: !p[id] }));
  const getTab  = id => tab[id] || "links";
  const isAdmin = currentUser.role === "admin";

  useEffect(() => {
    if (highlightDept) {
      setExp(p => ({ ...p, [highlightDept]: true }));
      const t = setTimeout(() => onClearHighlight?.(), 6000);
      return () => clearTimeout(t);
    }
  }, [highlightDept]);

  const isNewMember = (userId) => {
    const member = allTeamUsers.find(u => u.id === userId);
    if (!member?.joinedAt) return false;
    return (Date.now() - member.joinedAt) < 48 * 60 * 60 * 1000;
  };

  const addOffice = (deptId) => {
    setDepartments(prev => prev.map(d => {
      if (d.id !== deptId) return d;
      const prefix = d.name.slice(0, 2).toUpperCase();
      const num = d.offices.length + 1;
      const label = `${prefix}-${String(num).padStart(3, "0")}`;
      return { ...d, offices: [...d.offices, { id: "o" + Date.now(), label, userId: null }] };
    }));
  };

  const resolveUser = (userId) => userId ? allTeamUsers.find(u => u.id === userId) : null;

  const getDeptCode = (deptId, teamCode) => {
    const key = `hq_dept_code_${deptId}`;
    let code = DB.get(key, null);
    if (!code) { code = teamCode + "-" + deptId.slice(-4).toUpperCase(); DB.set(key, code); }
    return code;
  };

  const rooms = [
    { id: "r1", name: "Meeting Room",       icon: "🗣️", occupants: [] },
    { id: "r2", name: "Presentation Room",  icon: "📊", occupants: [] },
    { id: "r3", name: "Final Deliverables", icon: "📦", occupants: [] },
  ];

  return (
    <div>
      <div className="hq-hd">
        <div className="hq-t">🏢 Company HQ</div>
        <div className="hq-s">{allTeamUsers.length} people in office · {departments.length} departments · tap any office to open it</div>
      </div>

      <div className="rbar">
        {rooms.map(r => (
          <div key={r.id} className="rchip">
            <span>{r.icon}</span><span>{r.name}</span>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>Empty</span>
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>No departments yet</div>
          <div style={{ fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>Departments are where your team works.<br />Add one to get started.</div>
          {isAdmin && (
            <button
              onClick={() => showToast("Go to Settings → Departments to add one.")}
              style={{ background: "var(--text)", color: "white", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)" }}>
              + Add Department →
            </button>
          )}
        </div>
      )}

      <div className="dgrid">
        {departments.map(dept => {
          const occupiedOffices = dept.offices.filter(o => o.userId);
          const deptFiles = (teamFiles || []).filter(f => f.dept === dept.id);
          const isExp = exp[dept.id];
          const isHighlighted = highlightDept === dept.id;
          return (
            <div key={dept.id} className="dc" style={isHighlighted ? { boxShadow: "0 0 0 3px #22c55e", borderColor: "#22c55e" } : {}}>
              <div className="dh" style={{ background: dept.bg }}>
                <div className="dic" style={{ background: dept.accent + "22" }}>{dept.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="dn">{dept.name}</div>
                  <div className="dct">{occupiedOffices.length}/{dept.offices.length} offices occupied</div>
                </div>
                {isAdmin && (
                  <div title="Add office" onClick={e => { e.stopPropagation(); addOffice(dept.id); }}
                    style={{ marginLeft: 6, width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#3b82f6", fontSize: 14, background: "#eff6ff", border: "1px solid #bfdbfe", transition: "all .15s", flexShrink: 0 }}>+</div>
                )}
                {isAdmin && (
                  <div title="Dept invite code" style={{ position: "relative", flexShrink: 0 }}>
                    <div
                      onClick={e => { e.stopPropagation(); getDeptCode(dept.id, teamInviteCode || ""); setDeptInvitePopup(deptInvitePopup === dept.id ? null : dept.id); }}
                      style={{ marginLeft: 4, width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#7c3aed", fontSize: 13, background: "#faf5ff", border: "1px solid #e9d5ff", transition: "all .15s", flexShrink: 0 }}>
                      🔗
                    </div>
                    {deptInvitePopup === dept.id && (
                      <div onClick={e => e.stopPropagation()}
                        style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "white", border: "1px solid var(--border)", borderRadius: 12, padding: 14, boxShadow: "0 8px 24px rgba(0,0,0,.13)", zIndex: 200, width: 240, animation: "fadeIn .15s ease" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>Dept Invite Code</div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, background: "#f4f3f0", border: "1px solid var(--border)", borderRadius: 8, padding: "9px 12px", letterSpacing: 1, textAlign: "center", marginBottom: 10, userSelect: "all", wordBreak: "break-all" }}>
                          {getDeptCode(dept.id, teamInviteCode || "")}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10, lineHeight: 1.5 }}>Share this code. Anyone who enters it in their profile → Join a Team will land in <strong>{dept.name}</strong>.</div>
                        <button
                          style={{ width: "100%", padding: "7px", background: "var(--text)", color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font)" }}
                          onClick={() => { const code = getDeptCode(dept.id, teamInviteCode || ""); navigator.clipboard?.writeText(code).catch(() => {}); showToast("Code copied!"); setDeptInvitePopup(null); }}>
                          Copy Code
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div className="dex" onClick={() => toggle(dept.id)}>{isExp ? "▲" : "▼"}</div>
              </div>

              <div className="ogrid">
                {dept.offices.map(office => {
                  const u = resolveUser(office.userId);
                  const isMe = office.userId === currentUser.id;
                  const newMember = u && !isMe && isNewMember(u.id);
                  return (
                    <div key={office.id} className={`ofc ${u ? "occ" : "vac"} ${isMe ? "me" : ""}`}
                      onClick={() => u && onOfficeClick(office, u, isMe)}>
                      <span className="olbl">{office.label}</span>
                      {u ? (
                        <>
                          <div style={{ position: "relative" }}>
                            <Av name={u.name} initials={u.initials} avatarUrl={u.avatarUrl || ""} />
                            {newMember && (
                              <span style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%", background: "#22c55e", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 900, color: "white" }}>N</span>
                            )}
                          </div>
                          <div className="onm">{isMe ? "You" : u.name.split(" ")[0]}</div>
                          <div className="ost"><Dot status={u.status || "online"} /><span style={{ fontSize: 10 }}>{STATUSES[u.status || "online"]?.label}</span></div>
                          {isMe && <span className="metag">● You</span>}
                          {newMember && <span style={{ fontSize: 8, fontWeight: 700, color: "#16a34a", background: "#dcfce7", borderRadius: 99, padding: "1px 4px", border: "1px solid #bbf7d0" }}>NEW</span>}
                        </>
                      ) : (
                        <span style={{ fontSize: 11, color: "#c4c0bb" }}>Vacant</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {isExp && (
                <div className="dpan">
                  <div className="dtabs">
                    {["links", "files"].map(t => (
                      <div key={t} className={`dtab${getTab(dept.id) === t ? " active" : ""}`}
                        onClick={() => setTab(p => ({ ...p, [dept.id]: t }))}>
                        {t === "links" ? `🔗 Tools (${dept.links?.length || 0})` : `📁 Files (${deptFiles.length})`}
                      </div>
                    ))}
                  </div>
                  {getTab(dept.id) === "links" ? (
                    <div className="llist">
                      {(dept.links || []).map(link => {
                        const m = LINK_META[link.type] || LINK_META.custom;
                        return (
                          <a key={link.id} href={link.url} target="_blank" rel="noopener" className="lrow">
                            <span style={{ fontSize: 16 }}>{m.icon}</span>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{link.label}</div>
                              <div className="lsub">{m.label}</div>
                            </div>
                            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>↗</span>
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="dfiles">
                      {deptFiles.map(f => (
                        <div key={f.id} className="lrow">
                          <span style={{ fontSize: 15 }}>{FILE_CAT_ICONS[getFileCategory(f.type)]}</span>
                          <span style={{ fontSize: 12.5, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                          {f.final && <span className="fbdg">✓</span>}
                          <span className="fmut" style={{ flexShrink: 0 }}>{f.size}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
