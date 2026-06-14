import { useState, useEffect, useRef, useCallback } from "react";
import { DB, useLS, seedDemoData, makeDefaultTeam, genId, STATUSES, LINK_META, css } from "./shared";

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
import Av            from "./components/Av";
import Dot           from "./components/Dot";
import Toast         from "./components/Toast";
import FileTypeBadge from "./components/FileTypeBadge";

// ─── DRAWERS ──────────────────────────────────────────────────────────────────
import MyOfficeDrawer   from "./drawers/MyOfficeDrawer";
import UserOfficeDrawer from "./drawers/UserOfficeDrawer";

// ─── PAGES ────────────────────────────────────────────────────────────────────
import AuthScreen             from "./pages/AuthScreen";
import HQView                 from "./pages/HQView";
import FilesView              from "./pages/FilesView";
import FinalDeliverablesRoom  from "./pages/FinalDeliverablesRoom";
import SettingsView           from "./pages/SettingsView";
import ProfileView            from "./pages/ProfileView";

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function ProjectHQ() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [allTeams, setAllTeams] = useState([]);

  useEffect(() => {
    seedDemoData();
    const session = DB.get("hq_session", null);
    if (session?.userId) {
      const users = DB.get("hq_users", []);
      const user  = users.find(u => u.id === session.userId);
      if (user) {
        const teams     = DB.get("hq_teams", []);
        const validTeam = teams.find(t => t.id === session.activeTeamId && t.members.some(m => m.userId === user.id));
        const fallback  = teams.find(t => t.members.some(m => m.userId === user.id));
        const teamId    = validTeam?.id || fallback?.id;
        setCurrentUser(user);
        setActiveTeamId(teamId);
        setAllTeams(teams);
      }
    }
  }, []);

  const handleAuth = (user, teamId) => {
    setCurrentUser(user);
    setActiveTeamId(teamId);
    setAllTeams(DB.get("hq_teams", []));
  };

  const handleLogout = () => {
    DB.del("hq_session");
    setCurrentUser(null);
    setActiveTeamId(null);
  };

  if (!currentUser) return <AuthScreen onAuth={handleAuth} />;

  return (
    <App
      currentUser={currentUser}
      setCurrentUser={setCurrentUser}
      activeTeamId={activeTeamId}
      setActiveTeamId={setActiveTeamId}
      allTeams={allTeams}
      setAllTeams={setAllTeams}
      onLogout={handleLogout}
    />
  );
}

// ─── MAIN APP SHELL ───────────────────────────────────────────────────────────
function App({ currentUser, setCurrentUser, activeTeamId, setActiveTeamId, allTeams, setAllTeams, onLogout }) {
  const [view, setView]             = useState("hq");
  const [myStatus, setMyStatus]     = useState(currentUser.status || "coding");
  const [showStatusDD, setStatusDD] = useState(false);
  const [showTeamDD, setTeamDD]     = useState(false);
  const [sidebarOpen, setSBOpen]    = useState(false);
  const [sidebarCol, setSBCol]      = useState(false);
  const [toast, setToast]           = useState(null);
  const [knockBadge, setKnockBadge] = useState(1);
  const [myOfficeDr, setMyOfc]      = useState(false);
  const [userOfficeDr, setUserOfc]  = useState(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [highlightDept, setHighlightDept] = useState(null);
  const teamSwRef = useRef(null);

  const activeTeam   = allTeams.find(t => t.id === activeTeamId) || allTeams[0];
  const allUsers     = DB.get("hq_users", []);
  const myTeams      = allTeams.filter(t => t.members.some(m => m.userId === currentUser.id));
  const allTeamUsers = allUsers.filter(u => activeTeam?.members?.some(m => m.userId === u.id));

  // ── Departments: fresh-load from DB on every team switch ──
  const [departments, setDepartmentsRaw] = useState([]);

  const setDepartments = useCallback((updater) => {
    setDepartmentsRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      DB.set(`hq_dept_${activeTeamId}`, next);
      return next;
    });
  }, [activeTeamId]);

  useEffect(() => {
    if (!activeTeamId) return;
    const teams  = DB.get("hq_teams", []);
    const team   = teams.find(t => t.id === activeTeamId);
    const stored = DB.get(`hq_dept_${activeTeamId}`, null);
    if (stored) {
      setDepartmentsRaw(stored);
    } else if (team?.departments?.length) {
      DB.set(`hq_dept_${activeTeamId}`, team.departments);
      setDepartmentsRaw(team.departments);
    } else {
      setDepartmentsRaw([]);
    }
  }, [activeTeamId]);

  // ── Team files ──
  const [teamFiles] = useLS(`hq_files_${activeTeamId}`, []);

  // ── Poll for live updates ──
  useEffect(() => {
    const interval = setInterval(() => {
      const fresh = DB.get("hq_teams", []);
      if (JSON.stringify(fresh) !== JSON.stringify(allTeams)) setAllTeams(fresh);
      if (activeTeamId) {
        const freshDepts = DB.get(`hq_dept_${activeTeamId}`, null);
        if (freshDepts) setDepartmentsRaw(freshDepts);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [allTeams, activeTeamId]);

  const showToast = msg => setToast(msg);

  const navigate = id => {
    setView(id);
    setSBOpen(false);
    if (id === "knocks") setKnockBadge(0);
  };

  const switchTeam = (teamId) => {
    setActiveTeamId(teamId);
    DB.set("hq_session", { userId: currentUser.id, activeTeamId: teamId });
    setTeamDD(false);
    setView("hq");
    const teams = DB.get("hq_teams", []);
    const team  = teams.find(t => t.id === teamId);
    showToast(`Switched to "${team?.name}"`);
  };

  const handleJoinTeam = (teamId, deptId) => {
    setAllTeams(DB.get("hq_teams", []));
    if (deptId) setHighlightDept(deptId);
    switchTeam(teamId);
  };

  const handleCreateNewProject = () => {
    const team  = makeDefaultTeam(currentUser);
    const teams = DB.get("hq_teams", []);
    DB.set("hq_teams", [...teams, team]);
    DB.set(`hq_dept_${team.id}`, []);
    setAllTeams([...teams, team]);
    switchTeam(team.id);
    showToast("New project created!");
  };

  const handleExitTeam = () => {
    const teams = DB.get("hq_teams", []);
    const team  = teams.find(t => t.id === activeTeamId);
    if (!team) return;
    const myMembership = team.members.find(m => m.userId === currentUser.id);
    const isTeamAdmin  = myMembership?.role === "admin";

    if (isTeamAdmin) {
      const secondary = team.members.find(m => m.userId !== currentUser.id && m.role === "secondary-admin");
      let updatedTeams;
      if (secondary) {
        updatedTeams = teams.map(t => t.id !== activeTeamId ? t : {
          ...t, members: t.members.filter(m => m.userId !== currentUser.id).map(m => m.userId === secondary.userId ? { ...m, role: "admin" } : m),
        });
        const secName = allTeamUsers.find(u => u.id === secondary.userId)?.name || "Secondary admin";
        showToast(`${secName} is now the admin.`);
      } else {
        updatedTeams = teams.filter(t => t.id !== activeTeamId);
        try { localStorage.removeItem(`hq_dept_${activeTeamId}`); } catch (e) {}
        try { localStorage.removeItem(`hq_files_${activeTeamId}`); } catch (e) {}
        showToast("Project deleted.");
      }
      DB.set("hq_teams", updatedTeams);
      setAllTeams(updatedTeams);
    } else {
      const myFiles = DB.get(`hq_files_${activeTeamId}`, []).filter(f => f.owner === currentUser.id);
      if (myFiles.length > 0) {
        const recycled = DB.get(`hq_recycled_${currentUser.id}`, []);
        DB.set(`hq_recycled_${currentUser.id}`, [...recycled, ...myFiles.map(f => ({ ...f, fromTeam: team.name, recycledAt: Date.now() }))]);
      }
      const depts = DB.get(`hq_dept_${activeTeamId}`, []);
      DB.set(`hq_dept_${activeTeamId}`, depts.map(d => ({ ...d, offices: d.offices.map(o => o.userId === currentUser.id ? { ...o, userId: null } : o) })));
      const updatedTeams = teams.map(t => t.id !== activeTeamId ? t : { ...t, members: t.members.filter(m => m.userId !== currentUser.id) });
      DB.set("hq_teams", updatedTeams);
      setAllTeams(updatedTeams);
      showToast("You left the team. Files saved to Recycled Files.");
    }

    setConfirmExit(false);
    const remaining = DB.get("hq_teams", []).filter(t => t.members.some(m => m.userId === currentUser.id));
    if (remaining.length > 0) switchTeam(remaining[0].id);
    else handleCreateNewProject();
  };

  const myRole      = activeTeam?.members?.find(m => m.userId === currentUser.id)?.role || currentUser.role || "member";
  const isGuest     = myRole === "guest";
  const enrichedUser = { ...currentUser, role: myRole, status: myStatus };

  // Guests can only see files + profile
  useEffect(() => {
    if (isGuest && !["files", "profile"].includes(view)) setView("files");
  }, [isGuest, view]);

  const handleOfficeClick = (office, user, isMe) => {
    if (isMe) setMyOfc(office);
    else      setUserOfc({ user, office });
  };

  // Close team dropdown on outside click
  useEffect(() => {
    const handler = e => { if (teamSwRef.current && !teamSwRef.current.contains(e.target)) setTeamDD(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const NAV = [
    { id: "hq",       icon: "🏢", label: "HQ Map",      guestHide: true  },
    { id: "files",    icon: "📁", label: "Files"                          },
    { id: "links",    icon: "🔗", label: "Tool Links",   guestHide: true  },
    { id: "finals",   icon: "📦", label: "Finals Room",  guestHide: true  },
    { id: "knocks",   icon: "🔔", label: "Knocks",       guestHide: true, badge: knockBadge },
    { id: "settings", icon: "⚙️", label: "Settings",    guestHide: true  },
    { id: "profile",  icon: "👤", label: "Profile"                        },
  ];
  const visibleNav = isGuest ? NAV.filter(n => !n.guestHide) : NAV;

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        <div className={`sov${sidebarOpen ? " show" : ""}`} onClick={() => setSBOpen(false)} />

        {/* SIDEBAR */}
        <aside className={`sidebar${sidebarCol ? " col" : ""}${sidebarOpen ? " open" : ""}`}>
          <div className="sb-brand">
            <div className="bl">🏢</div>
            {!sidebarCol && <div><div className="bn">Project HQ</div><div className="bs">{activeTeam?.name || "My Workspace"}</div></div>}
            <div className="stog" onClick={() => setSBCol(p => !p)}>{sidebarCol ? "→" : "←"}</div>
          </div>

          {/* Team switcher */}
          {!sidebarCol && (
            <div className="team-sw" style={{ position: "relative" }} ref={teamSwRef}>
              <span className="team-sw-label">Workspace</span>
              <button className="team-sw-btn" onClick={() => setTeamDD(p => !p)}>
                <span className="team-sw-dot" />
                <span className="team-sw-name">{activeTeam?.name || "My Project"}</span>
                <span className="team-sw-arrow">⌄</span>
              </button>
              {showTeamDD && (
                <div className="team-sw-drop">
                  {myTeams.map(t => (
                    <div key={t.id} className={`team-sw-item${t.id === activeTeamId ? " active" : ""}`} onClick={() => switchTeam(t.id)}>
                      <span className="team-sw-item-dot" style={{ background: t.id === activeTeamId ? "#22c55e" : "#94a3b8" }} />
                      <span className="team-sw-item-name">{t.name}</span>
                      {t.id === activeTeamId && <span className="team-sw-item-badge">Active</span>}
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid var(--border)", padding: "6px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
                    <button className="btn btn-ghost btn-sm" style={{ width: "100%", fontSize: 12 }} onClick={() => { setTeamDD(false); navigate("profile"); }}>🔗 Join a team</button>
                    <button className="btn btn-ghost btn-sm" style={{ width: "100%", fontSize: 12 }} onClick={() => { setTeamDD(false); handleCreateNewProject(); }}>＋ New project</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nav */}
          <div className="ns">
            {!sidebarCol && <div className="nl">Navigation</div>}
            {visibleNav.map(n => (
              <button key={n.id} className={`nb${view === n.id ? " active" : ""}`} onClick={() => navigate(n.id)}>
                <span className="ni">{n.icon}</span>
                <span className="nt">{n.label}</span>
                {n.badge > 0 && <span className="nbadge">{n.badge}</span>}
              </button>
            ))}
          </div>

          {/* Team members list */}
          {!sidebarCol && (
            <div className="ms">
              <div className="nl" style={{ padding: "0 6px 7px" }}>Team ({allTeamUsers.length})</div>
              {allTeamUsers.map(u => (
                <div key={u.id} className="mr" onClick={() => {
                  if (u.id === currentUser.id) setMyOfc({ label: "Your Office" });
                  else setUserOfc({ user: u, office: { label: "Office" } });
                }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <Av name={u.name} initials={u.initials} avatarUrl={u.avatarUrl || ""} />
                    <span style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: (STATUSES[u.id === currentUser.id ? myStatus : u.status || "online"] || STATUSES.offline).color, border: "1.5px solid white" }} />
                  </div>
                  <div className="mi" style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                    <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.id === currentUser.id ? "You" : u.name}</div>
                    <div style={{ fontSize: 10.5, color: "var(--muted)" }}>{u.id === currentUser.id ? STATUSES[myStatus]?.label : STATUSES[u.status || "online"]?.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* MAIN */}
        <div className="main">
          {/* Topbar */}
          <div className="topbar">
            <button className="hbtn" onClick={() => setSBOpen(p => !p)}>☰</button>
            <span className="tpj">{activeTeam?.name || "Project HQ"}</span>
            <span className="tpdv" />
            <span className="tpcr">{NAV.find(n => n.id === view)?.label}</span>
            <div className="tpsp" />

            {/* Status dropdown */}
            <div className="spw">
              <div className="spl" onClick={() => { setStatusDD(p => !p); setTeamDD(false); }}>
                <span className="sdot" style={{ background: STATUSES[myStatus].color }} />
                <span className="spll">{STATUSES[myStatus].label}</span>
                <span style={{ fontSize: 9, color: "var(--muted)" }}>▾</span>
              </div>
              {showStatusDD && (
                <div className="sdd">
                  {Object.entries(STATUSES).filter(([k]) => k !== "offline").map(([key, s]) => (
                    <div key={key} className="so" onClick={() => { setMyStatus(key); setStatusDD(false); showToast(`Status → ${s.label}`); }}>
                      <span className="sdot" style={{ background: s.color }} />{s.label}
                      {myStatus === key && <span style={{ marginLeft: "auto", fontSize: 11 }}>✓</span>}
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid var(--border)", padding: "7px 13px" }}>
                    <div className="so" style={{ padding: 0, color: "#ef4444" }} onClick={() => { setStatusDD(false); onLogout(); }}>
                      <span style={{ fontSize: 13 }}>🚪</span> Sign Out
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="av-btn" onClick={() => navigate("profile")}>
              <Av name={currentUser.name} initials={currentUser.initials} avatarUrl={currentUser.avatarUrl || ""} />
            </div>
          </div>

          {/* Content */}
          <div className="content">
            {/* Guest banner */}
            {isGuest && (
              <div style={{ background: "linear-gradient(135deg,#faf5ff,#ede9fe)", border: "1px solid #ddd6fe", borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14 }}>🎟️</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#6d28d9", flex: 1 }}>Guest — {currentUser.name} · View &amp; download only</span>
                <button onClick={onLogout} style={{ padding: "5px 12px", background: "#7c3aed", color: "white", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, fontFamily: "var(--font)", cursor: "pointer", flexShrink: 0 }}>Sign Out</button>
              </div>
            )}

            {view === "hq" && (
              <HQView
                departments={departments}
                setDepartments={setDepartments}
                currentUser={enrichedUser}
                allTeamUsers={allTeamUsers}
                teamFiles={teamFiles}
                onOfficeClick={handleOfficeClick}
                onKnock={u => setUserOfc({ user: u, office: { label: "Office" } })}
                teamInviteCode={activeTeam?.inviteCode || ""}
                showToast={showToast}
                highlightDept={highlightDept}
                onClearHighlight={() => setHighlightDept(null)}
                onExitTeam={() => setConfirmExit(true)}
              />
            )}

            {view === "files" && (
              <FilesView currentUser={enrichedUser} teamId={activeTeamId} showToast={showToast} />
            )}

            {view === "finals" && (
              <FinalDeliverablesRoom teamId={activeTeamId} showToast={showToast} />
            )}

            {view === "settings" && (
              <SettingsView
                departments={departments}
                setDepartments={setDepartments}
                currentUser={enrichedUser}
                activeTeam={activeTeam}
                allTeamUsers={allTeamUsers}
                showToast={showToast}
              />
            )}

            {view === "profile" && (
              <ProfileView
                currentUser={enrichedUser}
                setCurrentUser={setCurrentUser}
                myTeams={myTeams}
                activeTeamId={activeTeamId}
                onSwitchTeam={switchTeam}
                onJoinTeam={handleJoinTeam}
                onLogout={onLogout}
                showToast={showToast}
              />
            )}

            {view === "links" && (
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.4px", marginBottom: 4 }}>🔗 All Tool Links</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 18 }}>External tools linked across all departments.</div>
                {departments.filter(d => d.links && d.links.length > 0).length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)", fontSize: 13 }}>No tool links yet.</div>
                )}
                {departments.map(dept => dept.links && dept.links.length > 0 && (
                  <div key={dept.id} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 8 }}>{dept.icon} {dept.name}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {dept.links.map(link => {
                        const m = LINK_META[link.type] || LINK_META.custom;
                        return (
                          <a key={link.id} href={link.url} target="_blank" rel="noopener"
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 13px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, textDecoration: "none", color: "inherit", fontSize: 13, fontWeight: 500, boxShadow: "var(--sh)" }}>
                            <span style={{ fontSize: 17 }}>{m.icon}</span>
                            <div><div>{link.label}</div><div style={{ fontSize: 10, color: "var(--muted)" }}>{m.label}</div></div>
                            <span style={{ marginLeft: 8, fontSize: 11, color: "var(--muted)" }}>↗</span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {view === "knocks" && (
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.4px", marginBottom: 4 }}>🔔 Knocks</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 18 }}>Incoming chat and meeting requests.</div>
                <div className="kcard">
                  <div className="ki">
                    <Av name="Sarah K." initials="SK" size="av-lg" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Sarah K. knocked on your office</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>"Hey, can we sync on the API schema? 5 mins?"</div>
                      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                        <button className="btn btn-primary btn-sm" onClick={() => showToast("Meeting accepted!")}>Accept</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => showToast("Knock dismissed.")}>Decline</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => showToast("Message sent!")}>Reply</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawers */}
      {myOfficeDr && (
        <MyOfficeDrawer
          office={myOfficeDr}
          currentUser={enrichedUser}
          onClose={() => setMyOfc(false)}
          showToast={showToast}
          teamFiles={teamFiles}
        />
      )}
      {userOfficeDr && (
        <UserOfficeDrawer
          user={userOfficeDr.user}
          office={userOfficeDr.office}
          onClose={() => setUserOfc(null)}
          showToast={showToast}
          teamFiles={teamFiles}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Confirm exit modal */}
      {confirmExit && (
        <div className="overlay" onClick={() => setConfirmExit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-t">{myRole === "admin" ? "⚠️ Leave & Delete Project?" : "🚪 Leave Team?"}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18, lineHeight: 1.6 }}>
              {myRole === "admin"
                ? activeTeam?.members?.find(m => m.userId !== currentUser.id && m.role === "secondary-admin")
                  ? `A secondary admin will take over "${activeTeam?.name}". Your access will be removed.`
                  : `You are the only admin. Leaving will permanently delete "${activeTeam?.name}" and all its data.`
                : `You will leave "${activeTeam?.name}". Any files you uploaded will be saved under Recycled Files in your profile.`
              }
            </div>
            <div className="modal-acts">
              <button className="btn btn-ghost" onClick={() => setConfirmExit(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleExitTeam}>
                {myRole === "admin" ? "Delete & Leave" : "Leave Team"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
