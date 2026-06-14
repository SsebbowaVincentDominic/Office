import { useState } from "react";
import { DB, genId, makeDefaultTeam, seedDemoData, css } from "../shared";

export default function AuthScreen({ onAuth }) {
  const [mode, setMode]         = useState("login");
  const [role, setRole]         = useState("admin");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const submit = () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    if (mode === "signup" && !name.trim()) { setError("Please enter your name."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      seedDemoData();
      const users = DB.get("hq_users", []);

      if (mode === "signup") {
        if (users.find(u => u.email === email.toLowerCase())) {
          setError("An account with this email already exists. Please log in."); return;
        }
        const newUser = {
          id: "u-" + genId(),
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: password,
          initials: name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
          role: "admin",
          status: "online",
          createdAt: Date.now(),
        };
        DB.set("hq_users", [...users, newUser]);
        const team = makeDefaultTeam(newUser);
        const teams = DB.get("hq_teams", []);
        DB.set("hq_teams", [...teams, team]);
        DB.set("hq_session", { userId: newUser.id, activeTeamId: team.id });
        onAuth(newUser, team.id);
      } else {
        const user = users.find(u => u.email === email.toLowerCase().trim());
        if (!user) { setError("No account found with this email."); return; }
        if (user.password !== password) { setError("Incorrect password."); return; }
        const teams = DB.get("hq_teams", []);
        const prevSession = DB.get("hq_session", null);
        const prevTeam = teams.find(t => t.id === prevSession?.activeTeamId && t.members.some(m => m.userId === user.id));
        const anyTeam  = teams.find(t => t.members.some(m => m.userId === user.id));
        const activeTeamId = prevTeam?.id || anyTeam?.id;
        DB.set("hq_session", { userId: user.id, activeTeamId });
        onAuth(user, activeTeamId);
      }
    }, 400);
  };

  return (
    <div className="auth-wrap">
      <style>{css}</style>
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🏢</div>
          <div>
            <div className="auth-logo-name">Project HQ</div>
            <div style={{ fontSize: 10, color: "var(--muted)" }}>Virtual workspace for teams</div>
          </div>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab${mode === "login" ? " active" : ""}`} onClick={() => { setMode("login"); setError(""); }}>Sign In</button>
          <button className={`auth-tab${mode === "signup" ? " active" : ""}`} onClick={() => { setMode("signup"); setError(""); }}>Create Account</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          {mode === "login" ? (
            <div style={{ background: "#f8f7f5", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>
              👋 Welcome back. Sign in with your email and password.
            </div>
          ) : (
            <div style={{ background: "linear-gradient(135deg,#1a1916 0%,#2d2b28 100%)", borderRadius: 12, padding: "18px 16px", marginBottom: 4, color: "white", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>👋</div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-.3px", marginBottom: 4 }}>Welcome to Project HQ</div>
              <div style={{ fontSize: 12, opacity: .75, lineHeight: 1.5 }}>Create your account and get your own workspace. You can invite teammates or join existing projects after signing up.</div>
            </div>
          )}
        </div>

        {mode === "signup" && (
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <input className={`auth-input${error && !name.trim() ? " err" : ""}`} placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
          </div>
        )}

        <div className="auth-field">
          <label className="auth-label">Email</label>
          <input className="auth-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
        </div>
        <div className="auth-field">
          <label className="auth-label">Password</label>
          <input className="auth-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
        </div>

        {error && <div className="auth-err" style={{ marginBottom: 10 }}>⚠️ {error}</div>}

        <button className="auth-btn" onClick={submit} disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        {mode === "signup" && (
          <div className="auth-divider">
            By signing up, you become the admin of your own workspace.<br />You can join other teams via invite code in your profile.
          </div>
        )}

        <div className="auth-divider">— or —</div>
        <button
          className="auth-btn"
          style={{ background: "#f4f3f0", color: "var(--text)", border: "1px solid var(--border)", marginTop: 0 }}
          onClick={() => {
            setError("");
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              seedDemoData();
              const users = DB.get("hq_users", []);
              const user = users.find(u => u.email === "dom2005144@gmail.com");
              if (!user) { setError("Demo account not found — please refresh."); return; }
              const teams = DB.get("hq_teams", []);
              const adminTeam = teams.find(t => t.members.some(m => m.userId === user.id && m.role === "admin"));
              const anyTeam   = teams.find(t => t.members.some(m => m.userId === user.id));
              const activeTeamId = adminTeam?.id || anyTeam?.id;
              DB.set("hq_session", { userId: user.id, activeTeamId });
              onAuth(user, activeTeamId);
            }, 400);
          }}
        >
          🚀 Try Demo Account
        </button>
      </div>
    </div>
  );
}
