import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { DB, seedDemoData, makeDefaultTeam, genId } from "../shared";

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser]   = useState(null);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [allTeams, setAllTeams]         = useState([]);
  const [authed, setAuthed]             = useState(false);

  // Boot: restore session
  useEffect(() => {
    seedDemoData();
    const session = DB.get("hq_session", null);
    if (session?.userId) {
      const users = DB.get("hq_users", []);
      const user  = users.find(u => u.id === session.userId);
      if (user) {
        const teams      = DB.get("hq_teams", []);
        const validTeam  = teams.find(t => t.id === session.activeTeamId && t.members.some(m => m.userId === user.id));
        const fallback   = teams.find(t => t.members.some(m => m.userId === user.id));
        const teamId     = validTeam?.id || fallback?.id;
        setCurrentUser(user);
        setActiveTeamId(teamId);
        setAllTeams(teams);
        setAuthed(true);
      }
    }
  }, []);

  const login = useCallback((user, teamId) => {
    setCurrentUser(user);
    setActiveTeamId(teamId);
    setAllTeams(DB.get("hq_teams", []));
    setAuthed(true);
  }, []);

  const logout = useCallback(() => {
    DB.del("hq_session");
    setCurrentUser(null);
    setActiveTeamId(null);
    setAllTeams([]);
    setAuthed(false);
  }, []);

  const switchTeam = useCallback((teamId) => {
    setActiveTeamId(teamId);
    const session = DB.get("hq_session", {});
    DB.set("hq_session", { ...session, activeTeamId: teamId });
    setAllTeams(DB.get("hq_teams", []));
  }, []);

  const createProject = useCallback(() => {
    if (!currentUser) return;
    const team  = makeDefaultTeam(currentUser);
    const teams = DB.get("hq_teams", []);
    DB.set("hq_teams", [...teams, team]);
    DB.set(`hq_dept_${team.id}`, []);
    setAllTeams([...teams, team]);
    switchTeam(team.id);
    return team;
  }, [currentUser, switchTeam]);

  const refreshTeams = useCallback(() => {
    setAllTeams(DB.get("hq_teams", []));
  }, []);

  const activeTeam    = allTeams.find(t => t.id === activeTeamId) || null;
  const myTeams       = allTeams.filter(t => t.members.some(m => m.userId === currentUser?.id));
  const allUsers      = DB.get("hq_users", []);
  const allTeamUsers  = allUsers.filter(u => activeTeam?.members?.some(m => m.userId === u.id));
  const myRole        = activeTeam?.members?.find(m => m.userId === currentUser?.id)?.role || currentUser?.role || "member";

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      activeTeamId, setActiveTeamId,
      allTeams, setAllTeams,
      activeTeam, myTeams, allTeamUsers, myRole,
      authed,
      login, logout, switchTeam, createProject, refreshTeams,
    }}>
      {children}
    </AppContext.Provider>
  );
}
