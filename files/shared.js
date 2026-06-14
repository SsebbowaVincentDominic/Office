import { useState, useCallback } from "react";

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
export const DB = {
  get: (k, fb) => { try { const v=localStorage.getItem(k); return v!==null?JSON.parse(v):fb; } catch{ return fb; } },
  set: (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch{} },
  del: (k)     => { try { localStorage.removeItem(k); } catch{} },
};

export function useLS(key, initial) {
  const [val, setVal] = useState(() => DB.get(key, initial));
  const set = useCallback(updater => {
    setVal(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      DB.set(key, next);
      return next;
    });
  }, [key]);
  return [val, set];
}

// ─── GENERATORS ───────────────────────────────────────────────────────────────
export const genCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({length:4}, ()=>chars[Math.floor(Math.random()*chars.length)]).join("") + "-" +
         Array.from({length:4}, ()=>chars[Math.floor(Math.random()*chars.length)]).join("");
};
export const genId = () => Math.random().toString(36).slice(2,10);

// ─── DEFAULT TEAM TEMPLATE ────────────────────────────────────────────────────
export function makeDefaultTeam(owner) {
  const code = genCode();
  const teamId = "team-" + genId();
  const d1 = "d-" + genId(); const d2 = "d-" + genId();
  return {
    id: teamId,
    name: owner.name.split(" ")[0] + "'s Project",
    description: "My workspace",
    inviteCode: code,
    ownerId: owner.id,
    members: [{ userId: owner.id, role: "admin", joinedAt: Date.now() }],
    departments: [
      {
        id: d1, name:"Development", icon:"⚙️", accent:"#3b82f6", bg:"#eff6ff",
        offices:[
          { id:"o-"+genId(), label:"D-101", userId: owner.id },
          { id:"o-"+genId(), label:"D-102", userId: null },
          { id:"o-"+genId(), label:"D-103", userId: null },
        ],
        links:[{ id:"l-"+genId(), type:"github", label:"Repo", url:"https://github.com" }],
      },
      {
        id: d2, name:"Design", icon:"🎨", accent:"#a855f7", bg:"#faf5ff",
        offices:[
          { id:"o-"+genId(), label:"DS-101", userId: null },
          { id:"o-"+genId(), label:"DS-102", userId: null },
        ],
        links:[{ id:"l-"+genId(), type:"figma", label:"UI Kit", url:"https://figma.com" }],
      },
    ],
    files: [],
    rooms: [
      { id:"r-"+genId(), name:"Meeting Room",      icon:"🗣️", occupants:[] },
      { id:"r-"+genId(), name:"Presentation Room", icon:"📊", occupants:[] },
      { id:"r-"+genId(), name:"Final Deliverables",icon:"📦", occupants:[] },
    ],
    createdAt: Date.now(),
  };
}

// ─── DEMO DATA SEEDER ────────────────────────────────────────────────────────
export function seedDemoData() {
  if (DB.get("hq_demo_seeded_v2", false)) return;

  const jjId   = "demo-jj-001";
  const u2Id   = "demo-u2-002";
  const u3Id   = "demo-u3-003";
  const u4Id   = "demo-u4-004";
  const u5Id   = "demo-u5-005";
  const u6Id   = "demo-u6-006";

  const demoUsers = [
    { id:jjId, name:"Dom Williams", email:"dom2005144@gmail.com", password:"123456",
      initials:"DW", role:"admin", status:"online", createdAt: Date.now() },
    { id:u2Id, name:"Sarah Kim",   email:"sarah@demo.dev", password:"demo123",
      initials:"SK", role:"member", status:"coding",     createdAt: Date.now() },
    { id:u3Id, name:"Alex Torres", email:"alex@demo.dev",  password:"demo123",
      initials:"AT", role:"member", status:"in-meeting",  createdAt: Date.now() },
    { id:u4Id, name:"Priya Rajan", email:"priya@demo.dev", password:"demo123",
      initials:"PR", role:"member", status:"reviewing",   createdAt: Date.now() },
    { id:u5Id, name:"Marcus Lee",  email:"marcus@demo.dev",password:"demo123",
      initials:"ML", role:"member", status:"idle",        createdAt: Date.now() },
    { id:u6Id, name:"Nina Osei",   email:"nina@demo.dev",  password:"demo123",
      initials:"NO", role:"member", status:"online",      createdAt: Date.now() },
  ];

  const team1Id = "demo-team-alpha";
  const team1 = {
    id: team1Id,
    name: "AlphaBuild",
    description: "Main product development workspace",
    inviteCode: "ALPH-9X2K",
    ownerId: jjId,
    members: [
      { userId: jjId, role: "admin",  joinedAt: Date.now() },
      { userId: u2Id, role: "member", joinedAt: Date.now() },
      { userId: u3Id, role: "member", joinedAt: Date.now() },
      { userId: u4Id, role: "member", joinedAt: Date.now() },
    ],
    departments: [
      {
        id:"td1-1", name:"Development", icon:"⚙️", accent:"#3b82f6", bg:"#eff6ff",
        offices:[
          { id:"to1", label:"D-101", userId: jjId  },
          { id:"to2", label:"D-102", userId: u2Id  },
          { id:"to3", label:"D-103", userId: u3Id  },
          { id:"to4", label:"D-104", userId: null  },
        ],
        links:[
          { id:"tl1", type:"github", label:"Backend Repo", url:"https://github.com" },
          { id:"tl2", type:"vscode", label:"API Project",  url:"vscode://file/project" },
        ],
      },
      {
        id:"td1-2", name:"Design", icon:"🎨", accent:"#a855f7", bg:"#faf5ff",
        offices:[
          { id:"to5", label:"DS-101", userId: u4Id },
          { id:"to6", label:"DS-102", userId: null },
        ],
        links:[
          { id:"tl3", type:"figma", label:"UI Kit v2", url:"https://figma.com" },
        ],
      },
      {
        id:"td1-3", name:"Marketing", icon:"📣", accent:"#f59e0b", bg:"#fffbeb",
        offices:[
          { id:"to7", label:"MK-101", userId: null },
          { id:"to8", label:"MK-102", userId: null },
        ],
        links:[
          { id:"tl4", type:"gdocs", label:"Campaign Brief", url:"https://docs.google.com" },
        ],
      },
    ],
    files: [],
    rooms: [
      { id:"r1", name:"Meeting Room",      icon:"🗣️", occupants:[u2Id, u3Id] },
      { id:"r2", name:"Presentation Room", icon:"📊", occupants:[] },
      { id:"r3", name:"Final Deliverables",icon:"📦", occupants:[] },
    ],
    createdAt: Date.now(),
  };

  const team2Id = "demo-team-nexus";
  const team2 = {
    id: team2Id,
    name: "Nexus Studio",
    description: "Design collective for brand projects",
    inviteCode: "NEXS-7T4M",
    ownerId: u5Id,
    members: [
      { userId: u5Id, role: "admin",  joinedAt: Date.now() },
      { userId: jjId, role: "member", joinedAt: Date.now() },
      { userId: u6Id, role: "member", joinedAt: Date.now() },
    ],
    departments: [
      {
        id:"td2-1", name:"Brand Design", icon:"🎨", accent:"#a855f7", bg:"#faf5ff",
        offices:[
          { id:"to9",  label:"BD-101", userId: u5Id },
          { id:"to10", label:"BD-102", userId: jjId },
          { id:"to11", label:"BD-103", userId: u6Id },
        ],
        links:[
          { id:"tl5", type:"figma",  label:"Brand Kit",   url:"https://figma.com" },
          { id:"tl6", type:"notion", label:"Style Guide", url:"https://notion.so" },
        ],
      },
      {
        id:"td2-2", name:"Research", icon:"🔬", accent:"#10b981", bg:"#ecfdf5",
        offices:[
          { id:"to12", label:"RS-101", userId: null },
          { id:"to13", label:"RS-102", userId: null },
        ],
        links:[
          { id:"tl7", type:"notion", label:"Research Notes", url:"https://notion.so" },
        ],
      },
    ],
    files: [],
    rooms: [
      { id:"r4", name:"Creative Room",    icon:"💡", occupants:[] },
      { id:"r5", name:"Client Prep Room", icon:"📊", occupants:[u5Id] },
    ],
    createdAt: Date.now(),
  };

  const team3Id = "demo-team-orbit";
  const team3 = {
    id: team3Id,
    name: "Orbit Labs",
    description: "R&D and experimental tech projects",
    inviteCode: "ORBT-2W9P",
    ownerId: u6Id,
    members: [
      { userId: u6Id, role: "admin",  joinedAt: Date.now() },
      { userId: jjId, role: "member", joinedAt: Date.now() },
      { userId: u2Id, role: "member", joinedAt: Date.now() },
      { userId: u3Id, role: "member", joinedAt: Date.now() },
      { userId: u4Id, role: "member", joinedAt: Date.now() },
    ],
    departments: [
      {
        id:"td3-1", name:"Engineering", icon:"🛠️", accent:"#3b82f6", bg:"#eff6ff",
        offices:[
          { id:"to14", label:"ENG-101", userId: u6Id },
          { id:"to15", label:"ENG-102", userId: jjId },
          { id:"to16", label:"ENG-103", userId: u2Id },
          { id:"to17", label:"ENG-104", userId: null },
        ],
        links:[
          { id:"tl8", type:"github", label:"Labs Repo",   url:"https://github.com" },
          { id:"tl9", type:"notion", label:"Experiments", url:"https://notion.so"  },
        ],
      },
      {
        id:"td3-2", name:"Data Science", icon:"📊", accent:"#10b981", bg:"#ecfdf5",
        offices:[
          { id:"to18", label:"DS-101", userId: u3Id },
          { id:"to19", label:"DS-102", userId: u4Id },
          { id:"to20", label:"DS-103", userId: null },
        ],
        links:[
          { id:"tl10", type:"notion", label:"Dataset Docs", url:"https://notion.so" },
        ],
      },
    ],
    files: [],
    rooms: [
      { id:"r6", name:"Lab Meeting Room",  icon:"🔬", occupants:[u3Id, u4Id] },
      { id:"r7", name:"Demo Room",         icon:"🚀", occupants:[] },
    ],
    createdAt: Date.now(),
  };

  const team1Files = [
    { id:"df1", name:"api-design.md",        dept:"td1-1", folder:"Backend",  size:"12 KB",  type:"md",   final:false, by:"Dom Williams", date:"Jun 3",  owner:jjId, url:null },
    { id:"df2", name:"schema.sql",           dept:"td1-1", folder:"Backend",  size:"8 KB",   type:"sql",  final:false, by:"Sarah Kim",    date:"Jun 3",  owner:u2Id, url:null },
    { id:"df3", name:"ui-kit-v2.fig",        dept:"td1-2", folder:"Design",   size:"4.2 MB", type:"fig",  final:false, by:"Priya Rajan",  date:"Jun 2",  owner:u4Id, url:null },
    { id:"df4", name:"wireframes.pdf",       dept:"td1-2", folder:"Design",   size:"1.1 MB", type:"pdf",  final:true,  by:"Priya Rajan",  date:"Jun 1",  owner:u4Id, url:null },
    { id:"df5", name:"market-research.docx", dept:"td1-3", folder:"Marketing",size:"340 KB", type:"docx", final:true,  by:"Alex Torres",  date:"May 31", owner:u3Id, url:null },
    { id:"df6", name:"auth-module.js",       dept:"td1-1", folder:"Backend",  size:"14 KB",  type:"js",   final:false, by:"Dom Williams", date:"Jun 4",  owner:jjId, url:null },
  ];

  const existingUsers = DB.get("hq_users", []);
  const existingEmails = existingUsers.map(u => u.email);
  const newUsers = demoUsers.filter(u => !existingEmails.includes(u.email));
  DB.set("hq_users", [...existingUsers, ...newUsers]);

  const existingTeams = DB.get("hq_teams", []);
  const existingTeamIds = existingTeams.map(t => t.id);
  const newTeams = [team1, team2, team3].filter(t => !existingTeamIds.includes(t.id));
  DB.set("hq_teams", [...existingTeams, ...newTeams]);

  if (!DB.get(`hq_dept_${team1Id}`, null)) DB.set(`hq_dept_${team1Id}`, team1.departments);
  if (!DB.get(`hq_dept_${team2Id}`, null)) DB.set(`hq_dept_${team2Id}`, team2.departments);
  if (!DB.get(`hq_dept_${team3Id}`, null)) DB.set(`hq_dept_${team3Id}`, team3.departments);
  if (!DB.get(`hq_files_${team1Id}`, null)) DB.set(`hq_files_${team1Id}`, team1Files);

  DB.set("hq_demo_seeded_v2", true);
}

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
export const STATUSES = {
  online:       { label:"Online",      color:"#22c55e" },
  coding:       { label:"Coding",      color:"#3b82f6" },
  "in-meeting": { label:"In Meeting",  color:"#f59e0b" },
  reviewing:    { label:"Reviewing",   color:"#8b5cf6" },
  idle:         { label:"Idle",        color:"#94a3b8" },
  offline:      { label:"Offline",     color:"#64748b" },
};

export const LINK_META = {
  github:{ icon:"🐙", label:"GitHub"      },
  vscode:{ icon:"💙", label:"VS Code"     },
  figma: { icon:"🎨", label:"Figma"       },
  gdocs: { icon:"📄", label:"Google Docs" },
  notion:{ icon:"📝", label:"Notion"      },
  custom:{ icon:"🔗", label:"Link"        },
};

export const FILE_COLORS = {
  md:"#3b82f6", sql:"#10b981", fig:"#a855f7", pdf:"#ef4444",
  docx:"#3b82f6", xlsx:"#22c55e", js:"#f59e0b", ts:"#3b82f6",
  mp4:"#ec4899", mov:"#ec4899", png:"#06b6d4", jpg:"#06b6d4",
  zip:"#6b7280", default:"#6b7280",
};

export const MEDIA_TYPES = {
  video: ["mp4","mov","avi","webm","mkv"],
  image: ["png","jpg","jpeg","gif","webp","svg"],
  doc:   ["pdf","docx","doc","txt","md"],
  code:  ["js","ts","jsx","tsx","py","sql","json","html","css"],
  sheet: ["xlsx","xls","csv"],
  arch:  ["zip","rar","7z"],
};

export const getFileCategory = (ext) => {
  for (const [cat, exts] of Object.entries(MEDIA_TYPES)) {
    if (exts.includes(ext)) return cat;
  }
  return "other";
};

export const FILE_CAT_ICONS = {
  video:"🎬", image:"🖼️", doc:"📄", code:"💻", sheet:"📊", arch:"📦", other:"📎"
};

export const AVATAR_COLORS = ["#1e40af","#7c3aed","#b45309","#065f46","#9f1239","#1d4ed8","#6d28d9","#0f766e"];
export const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0)||0) % AVATAR_COLORS.length];
export const fmtSize = (bytes) => bytes > 1048576 ? (bytes/1048576).toFixed(1)+" MB" : Math.round(bytes/1024)+" KB";

export const DEPT_ICONS  = ["⚙️","🎨","📣","🔬","💼","📐","🛠️","📊","🚀","💡","🔒","🌐"];
export const DEPT_COLORS = ["#3b82f6","#a855f7","#f59e0b","#10b981","#ef4444","#06b6d4","#8b5cf6","#f97316","#ec4899","#14b8a6"];

// ─── STYLES ───────────────────────────────────────────────────────────────────
export const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;width:100%;}
body{font-family:'DM Sans',sans-serif;background:#f4f3f0;color:#1a1916;font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased;}

:root{
  --bg:#f4f3f0; --surface:#fff; --border:#e5e3de;
  --text:#1a1916; --muted:#6b6963;
  --green:#16a34a; --green-bg:#dcfce7; --green-ring:#bbf7d0;
  --blue:#3b82f6; --blue-bg:#eff6ff;
  --font:'DM Sans',sans-serif; --mono:'DM Mono',monospace;
  --r:10px; --sh:0 1px 3px rgba(0,0,0,.08); --sh-md:0 4px 16px rgba(0,0,0,.11);
  --sw:240px;
}

.auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f4f3f0 0%,#e8e5e0 100%);padding:20px;}
.auth-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:36px 32px;width:100%;max-width:420px;box-shadow:0 8px 32px rgba(0,0,0,.12);}
.auth-logo{display:flex;align-items:center;gap:10px;margin-bottom:28px;}
.auth-logo-icon{width:38px;height:38px;background:var(--text);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;}
.auth-logo-name{font-weight:800;font-size:18px;letter-spacing:-.4px;}
.auth-tabs{display:flex;background:var(--bg);border-radius:9px;padding:3px;margin-bottom:20px;gap:2px;}
.auth-tab{flex:1;padding:7px;border-radius:7px;border:none;background:none;cursor:pointer;font-family:var(--font);font-size:13px;font-weight:500;color:var(--muted);transition:all .15s;}
.auth-tab.active{background:var(--surface);color:var(--text);box-shadow:var(--sh);}
.auth-field{margin-bottom:13px;}
.auth-label{display:block;font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px;}
.auth-input{width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;font-size:13.5px;font-family:var(--font);outline:none;transition:border .15s;background:var(--surface);}
.auth-input:focus{border-color:var(--text);}
.auth-input.err{border-color:#ef4444;}
.auth-err{font-size:12px;color:#ef4444;margin-top:4px;}
.auth-btn{width:100%;padding:11px;background:var(--text);color:white;border:none;border-radius:9px;font-size:14px;font-weight:600;font-family:var(--font);cursor:pointer;transition:all .15s;margin-top:4px;}
.auth-btn:hover{background:#333;}
.auth-btn:disabled{opacity:.5;cursor:not-allowed;}
.auth-divider{text-align:center;font-size:11px;color:var(--muted);margin:14px 0;}
.shell{display:flex;height:100vh;width:100%;overflow:hidden;position:relative;}
.sov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:40;animation:fadeIn .15s ease;}
.sov.show{display:block;}
.sidebar{width:var(--sw);height:100vh;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto;overflow-x:hidden;transition:transform .25s ease,width .25s ease;position:relative;z-index:50;}
.sidebar.col{width:52px;}
@media(max-width:720px){
  .sidebar{position:fixed;top:0;left:0;transform:translateX(-100%);z-index:50;}
  .sidebar.open{transform:translateX(0);}
  .sidebar.col{transform:translateX(-100%);}
  .main{width:100%!important;}
}
.team-sw{padding:0 8px 6px;flex-shrink:0;}
.team-sw-label{font-size:9px;font-weight:700;letter-spacing:.9px;color:var(--muted);text-transform:uppercase;padding:6px 6px 5px;display:block;}
.team-sw-btn{width:100%;display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:8px;cursor:pointer;font-size:12.5px;font-weight:500;background:var(--bg);border:1px solid var(--border);transition:all .15s;text-align:left;}
.team-sw-btn:hover{border-color:var(--text);}
.team-sw-dot{width:9px;height:9px;border-radius:50%;background:#22c55e;flex-shrink:0;}
.team-sw-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.team-sw-arrow{font-size:10px;color:var(--muted);flex-shrink:0;}
.team-sw-drop{position:absolute;left:8px;right:8px;top:100%;margin-top:4px;background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:var(--sh-md);z-index:300;overflow:hidden;animation:fadeIn .12s ease;}
.team-sw-item{display:flex;align-items:center;gap:9px;padding:9px 11px;cursor:pointer;font-size:13px;transition:background .1s;}
.team-sw-item:hover{background:var(--bg);}
.team-sw-item.active{background:#f8f8f6;}
.team-sw-item-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;flex-shrink:0;}
.team-sw-item-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;}
.team-sw-item-badge{font-size:9px;background:var(--text);color:white;padding:1px 5px;border-radius:99px;}
.sb-brand{padding:14px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:9px;flex-shrink:0;min-height:52px;overflow:hidden;}
.bl{width:28px;height:28px;background:var(--text);border-radius:7px;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;flex-shrink:0;}
.bn{font-weight:700;font-size:14px;letter-spacing:-.3px;line-height:1.2;white-space:nowrap;}
.bs{font-size:10px;color:var(--muted);white-space:nowrap;}
.stog{width:28px;height:28px;border-radius:7px;border:1px solid var(--border);background:var(--bg);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--muted);flex-shrink:0;margin-left:auto;transition:all .15s;}
.stog:hover{background:var(--text);color:white;border-color:var(--text);}
.ns{padding:12px 8px 6px;flex-shrink:0;}
.nl{font-size:9px;font-weight:700;letter-spacing:.9px;color:var(--muted);text-transform:uppercase;padding:0 6px 7px;white-space:nowrap;overflow:hidden;}
.sidebar.col .nl{opacity:0;}
.nb{display:flex;align-items:center;gap:9px;padding:7px 8px;width:100%;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:var(--muted);border:none;background:none;font-family:var(--font);transition:all .15s;white-space:nowrap;overflow:hidden;text-align:left;}
.nb:hover{background:var(--bg);color:var(--text);}
.nb.active{background:var(--text);color:white;}
.ni{font-size:15px;width:20px;text-align:center;flex-shrink:0;}
.nt{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.sidebar.col .nt{display:none;}
.nbadge{margin-left:auto;background:#ef4444;color:white;font-size:9px;padding:1px 5px;border-radius:99px;font-weight:700;flex-shrink:0;}
.sidebar.col .nbadge{display:none;}
.ms{padding:6px 8px 12px;flex-shrink:0;}
.mr{display:flex;align-items:center;gap:8px;padding:5px 6px;border-radius:7px;cursor:pointer;transition:background .15s;overflow:hidden;white-space:nowrap;}
.mr:hover{background:var(--bg);}
.sidebar.col .mi{display:none;}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
.topbar{height:52px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 16px;gap:10px;flex-shrink:0;overflow:hidden;}
.hbtn{width:30px;height:30px;border-radius:7px;border:1px solid var(--border);background:none;cursor:pointer;display:none;align-items:center;justify-content:center;font-size:15px;color:var(--muted);flex-shrink:0;}
@media(max-width:720px){.hbtn{display:flex;}}
.tpj{font-weight:700;font-size:14px;letter-spacing:-.3px;white-space:nowrap;}
.tpdv{width:1px;height:18px;background:var(--border);flex-shrink:0;}
.tpcr{font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tpsp{flex:1;min-width:0;}
.spw{position:relative;flex-shrink:0;}
.spl{display:flex;align-items:center;gap:6px;padding:5px 11px;border:1px solid var(--border);border-radius:99px;cursor:pointer;font-size:12px;font-weight:500;background:var(--surface);transition:all .15s;white-space:nowrap;}
.spl:hover{border-color:var(--text);}
.sdot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
@media(max-width:480px){.spll{display:none;}}
.sdd{position:absolute;top:calc(100% + 6px);right:0;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--sh-md);min-width:170px;z-index:200;overflow:hidden;animation:fadeIn .1s ease;}
.so{display:flex;align-items:center;gap:8px;padding:9px 13px;cursor:pointer;font-size:13px;transition:background .1s;}
.so:hover{background:var(--bg);}
.tp-team-badge{display:flex;align-items:center;gap:6px;padding:4px 10px;border:1px solid var(--border);border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;background:var(--bg);transition:all .15s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;}
.tp-team-badge:hover{border-color:var(--text);}
.av-btn{cursor:pointer;border-radius:50%;border:2px solid transparent;transition:all .15s;}
.av-btn:hover{border-color:var(--text);}
.content{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;}
.ibar{background:var(--text);color:white;border-radius:10px;padding:11px 14px;display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:18px;}
.icode{font-family:var(--mono);font-size:13px;font-weight:700;background:rgba(255,255,255,.15);padding:3px 9px;border-radius:6px;letter-spacing:1px;white-space:nowrap;}
.itxt{font-size:12px;opacity:.85;flex:1;min-width:100px;}
.icpy{padding:4px 10px;border-radius:7px;border:1px solid rgba(255,255,255,.3);background:none;color:white;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font);transition:background .15s;white-space:nowrap;}
.icpy:hover{background:rgba(255,255,255,.15);}
.profile-wrap{max-width:580px;}
.profile-hero{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:24px;margin-bottom:16px;box-shadow:var(--sh);}
.profile-av-row{display:flex;align-items:center;gap:16px;margin-bottom:20px;}
.profile-av-wrap{position:relative;cursor:pointer;width:64px;height:64px;flex-shrink:0;}
.profile-av-big{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:white;overflow:hidden;}
.profile-av-overlay{position:absolute;inset:0;border-radius:50%;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-size:18px;opacity:0;transition:opacity .15s;}
.profile-av-wrap:hover .profile-av-overlay{opacity:1;}
.profile-name{font-size:20px;font-weight:700;letter-spacing:-.4px;}
.profile-role-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;font-size:11px;font-weight:700;margin-top:4px;}
.profile-role-admin{background:#fef3c7;color:#92400e;border:1px solid #fde68a;}
.profile-role-member{background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe;}
.profile-section{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;margin-bottom:12px;}
.profile-sec-title{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:14px;}
.profile-field{margin-bottom:12px;}
.profile-label{font-size:11px;font-weight:600;color:var(--muted);margin-bottom:4px;display:block;}
.profile-input{width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;font-family:var(--font);outline:none;}
.profile-input:focus{border-color:var(--text);}
.profile-teams-list{display:flex;flex-direction:column;gap:8px;}
.profile-team-row{display:flex;align-items:center;gap:10px;padding:11px 12px;background:var(--bg);border-radius:9px;border:1px solid var(--border);}
.profile-team-dot{width:10px;height:10px;border-radius:50%;background:#22c55e;flex-shrink:0;}
.profile-team-active{background:#f0fdf4;border-color:#86efac;}
.profile-join-box{border:1.5px dashed var(--border);border-radius:10px;padding:16px;text-align:center;margin-top:10px;}
.profile-join-title{font-size:13px;font-weight:600;margin-bottom:8px;}
.profile-join-sub{font-size:12px;color:var(--muted);margin-bottom:12px;}
.profile-code-input{width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;font-family:var(--mono);font-size:14px;letter-spacing:2px;text-align:center;outline:none;text-transform:uppercase;margin-bottom:10px;}
.profile-code-input:focus{border-color:var(--text);}
.hq-hd{margin-bottom:18px;}
.hq-t{font-size:20px;font-weight:700;letter-spacing:-.4px;}
.hq-s{font-size:12px;color:var(--muted);margin-top:2px;}
.rbar{display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap;}
.rchip{display:flex;align-items:center;gap:7px;padding:7px 13px;background:var(--surface);border:1px solid var(--border);border-radius:99px;font-size:12px;font-weight:500;cursor:pointer;transition:all .15s;}
.rchip:hover{border-color:var(--text);box-shadow:var(--sh);}
.dgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;}
@media(max-width:500px){.dgrid{grid-template-columns:1fr;}}
.dc{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:var(--sh);}
.dh{padding:12px 14px;display:flex;align-items:center;gap:9px;border-bottom:1px solid var(--border);}
.dic{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.dn{font-weight:700;font-size:13px;}
.dct{font-size:11px;color:var(--muted);margin-top:1px;}
.dex{margin-left:auto;width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--muted);font-size:10px;background:var(--bg);border:1px solid var(--border);transition:all .15s;flex-shrink:0;}
.dex:hover{background:var(--text);color:white;border-color:var(--text);}
.ogrid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding:10px;}
@media(max-width:400px){.ogrid{grid-template-columns:repeat(2,1fr);}}
.ofc{border-radius:9px;padding:9px 6px;min-height:72px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;position:relative;transition:all .2s;cursor:pointer;border:1.5px solid transparent;}
.ofc.occ{background:#f8fafc;border-color:var(--border);}
.ofc.occ:hover{border-color:#94a3b8;background:#f1f5f9;box-shadow:var(--sh);}
.ofc.vac{background:#fafafa;border:1.5px dashed #d1d5db;}
.ofc.vac:hover{border-color:#9ca3af;}
.ofc.me{background:var(--green-bg)!important;border-color:var(--green)!important;box-shadow:0 0 0 2px var(--green-ring);}
.olbl{font-size:9px;color:var(--muted);font-family:var(--mono);position:absolute;top:5px;left:6px;}
.onm{font-size:11px;font-weight:600;text-align:center;line-height:1.3;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 2px;}
.ost{font-size:10px;color:var(--muted);display:flex;align-items:center;gap:3px;}
.metag{font-size:9px;font-weight:700;color:var(--green);background:white;border-radius:99px;padding:1px 5px;border:1px solid var(--green-ring);}
.dpan{border-top:1px solid var(--border);background:#fafaf9;animation:slideDown .18s ease;}
.dtabs{display:flex;border-bottom:1px solid var(--border);}
.dtab{padding:8px 13px;font-size:12px;font-weight:500;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;transition:all .15s;margin-bottom:-1px;white-space:nowrap;}
.dtab.active{color:var(--text);border-bottom-color:var(--text);}
.llist{padding:8px;display:flex;flex-direction:column;gap:3px;}
.lrow{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:8px;cursor:pointer;transition:background .15s;text-decoration:none;color:inherit;}
.lrow:hover{background:var(--bg);}
.lsub{font-size:10.5px;color:var(--muted);}
.dfiles{padding:8px;}
.fmut{font-size:11px;color:var(--muted);}
.av{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white;flex-shrink:0;}
.av-sm{width:22px;height:22px;font-size:9px;}
.av-lg{width:42px;height:42px;font-size:16px;}
.av-xl{width:56px;height:56px;font-size:20px;}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:7px 14px;border-radius:8px;font-size:13px;font-weight:500;font-family:var(--font);cursor:pointer;border:none;transition:all .15s;white-space:nowrap;}
.btn-primary{background:var(--text);color:white;}
.btn-primary:hover{background:#333;}
.btn-ghost{background:none;color:var(--text);border:1px solid var(--border);}
.btn-ghost:hover{background:var(--bg);border-color:#94a3b8;}
.btn-danger{background:#fef2f2;color:#dc2626;border:1px solid #fecaca;}
.btn-danger:hover{background:#fee2e2;}
.btn-sm{padding:4px 10px;font-size:12px;}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .15s ease;}
.modal{background:var(--surface);border-radius:14px;padding:22px;width:100%;max-width:420px;max-height:90vh;overflow-y:auto;box-shadow:0 16px 48px rgba(0,0,0,.2);animation:slideUp .2s ease;}
.modal-lg{max-width:520px;}
.modal-t{font-size:16px;font-weight:700;letter-spacing:-.3px;margin-bottom:4px;}
.modal-s{font-size:12px;color:var(--muted);margin-bottom:16px;}
.modal-in{width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;font-family:var(--font);outline:none;margin-bottom:10px;}
.modal-in:focus{border-color:var(--text);}
.modal-ta{width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;font-family:var(--font);outline:none;resize:none;margin-bottom:10px;}
.modal-ta:focus{border-color:var(--text);}
.modal-acts{display:flex;gap:8px;justify-content:flex-end;margin-top:6px;}
.ofc-panel{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:400;display:flex;justify-content:flex-end;animation:fadeIn .15s ease;}
.ofc-drawer{width:340px;max-width:100vw;height:100vh;background:var(--surface);display:flex;flex-direction:column;overflow:hidden;box-shadow:-8px 0 32px rgba(0,0,0,.12);animation:slideFromRight .22s ease;}
@media(max-width:480px){.ofc-drawer{width:100vw;}}
.ofc-drhdr{padding:18px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;flex-shrink:0;}
.ofc-drname{font-weight:700;font-size:15px;letter-spacing:-.3px;line-height:1.2;}
.ofc-drsub{font-size:12px;color:var(--muted);margin-top:1px;}
.ofc-drstatus{font-size:11.5px;color:var(--muted);display:flex;align-items:center;gap:4px;margin-top:3px;}
.ofc-drclose{width:28px;height:28px;border-radius:7px;border:1px solid var(--border);background:var(--bg);cursor:pointer;font-size:13px;color:var(--muted);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;}
.ofc-drclose:hover{background:var(--text);color:white;border-color:var(--text);}
.ofc-drtabs{display:flex;border-bottom:1px solid var(--border);flex-shrink:0;}
.ofc-drtab{flex:1;padding:10px 4px;font-size:11.5px;font-weight:500;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;transition:all .15s;text-align:center;white-space:nowrap;}
.ofc-drtab.active{color:var(--text);border-bottom-color:var(--text);}
.ofc-drbody{flex:1;overflow-y:auto;padding:16px;}
.ofc-file-row{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:9px;border:1px solid var(--border);margin-bottom:6px;cursor:pointer;transition:all .15s;}
.ofc-file-row:hover{background:var(--bg);border-color:#94a3b8;}
.ofc-file-ic{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.ofc-file-nm{font-size:12.5px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.ofc-file-meta{font-size:11px;color:var(--muted);}
.copt{display:flex;align-items:center;gap:11px;padding:11px 12px;border-radius:9px;cursor:pointer;transition:background .15s;border:1px solid transparent;margin-bottom:5px;}
.copt:hover{background:var(--bg);border-color:var(--border);}
.copt-ic{width:36px;height:36px;border-radius:9px;background:var(--bg);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
.copt-lbl{font-size:13px;font-weight:600;}
.copt-sub{font-size:11px;color:var(--muted);}
.msg-box{border:1px solid var(--border);border-radius:10px;overflow:hidden;}
.msg-box textarea{width:100%;padding:11px 12px;border:none;font-family:var(--font);font-size:13px;resize:none;outline:none;}
.msg-box-actions{padding:8px 10px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:6px;background:#fafaf9;}
.sched-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-bottom:14px;}
.sched-slot{padding:8px 10px;border:1px solid var(--border);border-radius:8px;font-size:12.5px;cursor:pointer;text-align:center;transition:all .15s;}
.sched-slot:hover{border-color:var(--text);background:var(--bg);}
.sched-slot.sel{background:var(--text);color:white;border-color:var(--text);}
.fxhdr{display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap;}
.fxtit{font-size:18px;font-weight:700;letter-spacing:-.4px;flex:1;}
.fxlay{display:flex;gap:12px;flex:1;min-height:0;}
@media(max-width:600px){.fxlay{flex-direction:column;}}
.ftree{width:160px;flex-shrink:0;}
@media(max-width:600px){.ftree{width:100%;display:flex;flex-wrap:wrap;gap:5px;}}
.ftlbl{font-size:9.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;padding:0 4px 6px;}
@media(max-width:600px){.ftlbl{display:none;}}
.fti{padding:7px 10px;border-radius:8px;font-size:12.5px;font-weight:500;cursor:pointer;color:var(--muted);transition:all .15s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.fti:hover{background:var(--bg);color:var(--text);}
.fti.active{background:var(--text);color:white;}
.fti-new{color:var(--muted);border:1px dashed var(--border);}
.fti-new:hover{border-color:var(--text);color:var(--text);background:none;}
@media(max-width:600px){.fti,.fti-new{padding:4px 9px;font-size:11.5px;}}
.fpan{flex:1;background:var(--surface);border:1px solid var(--border);border-radius:10px;overflow:hidden;box-shadow:var(--sh);}
.fph{display:flex;align-items:center;gap:8px;padding:9px 13px;border-bottom:1px solid var(--border);background:#fafaf9;}
.fppath{font-size:12px;font-family:var(--mono);color:var(--muted);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.ftbl{width:100%;border-collapse:collapse;}
.ftbl th{padding:7px 12px;font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid var(--border);text-align:left;background:#fafaf9;}
.ftbl td{padding:9px 12px;font-size:13px;border-bottom:1px solid var(--border);}
.fr{cursor:pointer;transition:background .1s;}
.fr:hover{background:var(--bg);}
.fr:last-child td{border-bottom:none;}
.fnm{display:flex;align-items:center;gap:7px;}
.ffnm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;}
@media(max-width:500px){.hide-sm{display:none;}}
.ftyp{font-size:10px;font-weight:700;color:white;padding:2px 6px;border-radius:5px;text-transform:uppercase;white-space:nowrap;}
.fbdg{font-size:10px;font-weight:700;color:var(--green);background:var(--green-bg);padding:2px 7px;border-radius:99px;border:1px solid var(--green-ring);white-space:nowrap;}
.folder-add-row{display:flex;gap:5px;align-items:center;margin-top:6px;}
.folder-add-input{flex:1;padding:6px 9px;border:1px solid var(--border);border-radius:7px;font-size:12.5px;font-family:var(--font);outline:none;}
.folder-add-input:focus{border-color:var(--text);}
.dz{border:2px dashed var(--border);border-radius:10px;padding:28px;text-align:center;background:var(--bg);transition:all .2s;}
.dz.on{border-color:var(--text);background:#f8f8f6;}
.dzt{font-size:13px;color:var(--muted);}
.fdr-hero{background:var(--text);color:white;border-radius:12px;padding:20px 22px;margin-bottom:20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
.fdr-hero-icon{font-size:32px;flex-shrink:0;}
.fdr-hero-title{font-size:18px;font-weight:700;letter-spacing:-.3px;}
.fdr-hero-sub{font-size:12px;opacity:.75;margin-top:2px;}
.fdr-stat{background:rgba(255,255,255,.12);border-radius:8px;padding:8px 14px;text-align:center;min-width:70px;}
.fdr-stat-n{font-size:20px;font-weight:700;}
.fdr-stat-l{font-size:10px;opacity:.75;}
.fdr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;}
.fdr-card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px;cursor:pointer;transition:all .15s;}
.fdr-card:hover{box-shadow:var(--sh-md);border-color:#94a3b8;}
.fdr-empty{text-align:center;padding:40px 20px;color:var(--muted);font-size:13px;}
.sg{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;margin-top:14px;}
.sc{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px;cursor:pointer;transition:all .15s;}
.sc:hover{box-shadow:var(--sh-md);border-color:#94a3b8;transform:translateY(-1px);}
.set-panel{max-width:580px;}
.set-back{font-size:12px;color:var(--muted);cursor:pointer;display:inline-flex;align-items:center;gap:4px;margin-bottom:12px;padding:5px 0;}
.set-back:hover{color:var(--text);}
.set-title{font-size:18px;font-weight:700;letter-spacing:-.4px;margin-bottom:4px;}
.set-sub{font-size:12px;color:var(--muted);margin-bottom:18px;}
.ds-row{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:10px;margin-bottom:7px;}
.ds-ic{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}
.ds-nm{font-weight:700;font-size:13px;}
.ds-ct{font-size:11px;color:var(--muted);}
.perm-table{width:100%;border-collapse:collapse;}
.perm-table th,.perm-table td{padding:9px 12px;font-size:12.5px;border-bottom:1px solid var(--border);text-align:left;}
.perm-table th{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;}
.perm-check{width:16px;height:16px;cursor:pointer;accent-color:var(--green);}
.pi-field{margin-bottom:14px;}
.pi-label{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:5px;}
.pi-input{width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;font-family:var(--font);outline:none;}
.pi-input:focus{border-color:var(--text);}
.pi-textarea{width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;font-family:var(--font);outline:none;resize:none;}
.pi-textarea:focus{border-color:var(--text);}
.prev-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;}
.prev-img{max-width:100%;max-height:300px;border-radius:8px;object-fit:contain;}
.prev-vid{width:100%;border-radius:8px;}
.prev-icon{font-size:64px;text-align:center;padding:30px 0;}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--text);color:white;padding:10px 18px;border-radius:99px;font-size:13px;font-weight:500;z-index:1000;box-shadow:0 4px 20px rgba(0,0,0,.25);animation:slideUp .2s ease;white-space:nowrap;}
.kcard{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px;box-shadow:var(--sh);margin-bottom:8px;}
.ki{display:flex;align-items:flex-start;gap:12px;}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideFromRight{from{transform:translateX(100%)}to{transform:translateX(0)}}
`;
