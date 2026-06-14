import { useState } from "react";
import { STATUSES, FILE_COLORS, getFileCategory, FILE_CAT_ICONS } from "../shared";
import Av from "../components/Av";
import Dot from "../components/Dot";
import FileTypeBadge from "../components/FileTypeBadge";

export default function UserOfficeDrawer({ user, office, onClose, showToast, teamFiles }) {
  const [tab, setTab]         = useState("contact");
  const [msgText, setMsg]     = useState("");
  const [schedSlot, setSched] = useState(null);
  const [schedReason, setReason] = useState("");
  const [showSched, setShowS] = useState(false);

  const SCHEDULE_SLOTS = ["Mon 10:00 AM", "Mon 2:00 PM", "Tue 9:00 AM", "Tue 3:00 PM", "Wed 11:00 AM", "Wed 4:00 PM"];
  const userFiles = (teamFiles || []).filter(f => f.owner === user.id);
  const status = user.status || "online";

  const contactActions = [
    { icon: "💬", label: "Start Chat",     sub: "Open direct message",     act: () => showToast(`Chat opened with ${user.name.split(" ")[0]}`) },
    { icon: "📹", label: "Video Call",     sub: "Start a video call",      act: () => showToast(`Calling ${user.name.split(" ")[0]} via video…`) },
    { icon: "🎙️", label: "Voice Call",    sub: "Audio only",               act: () => showToast(`Voice calling ${user.name.split(" ")[0]}…`) },
    { icon: "📅", label: "Schedule Meet",  sub: "Pick a time slot",        act: () => setShowS(true) },
    { icon: "🔐", label: "Request Access", sub: "Ask to view their files", act: () => showToast(`Access request sent to ${user.name.split(" ")[0]}`) },
  ];

  return (
    <>
      <div className="ofc-panel" onClick={onClose}>
        <div className="ofc-drawer" onClick={e => e.stopPropagation()}>
          <div className="ofc-drhdr">
            <div style={{ position: "relative" }}>
              <Av name={user.name} initials={user.initials} size="av-lg" />
              <span style={{ position: "absolute", bottom: 0, right: 0, width: 11, height: 11, borderRadius: "50%", background: (STATUSES[status] || STATUSES.offline).color, border: "2px solid white" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="ofc-drname">{user.name}</div>
              <div className="ofc-drsub">{office?.label}</div>
              <div className="ofc-drstatus"><Dot status={status} /><span>{STATUSES[status]?.label}</span></div>
            </div>
            <button className="ofc-drclose" onClick={onClose}>✕</button>
          </div>

          <div className="ofc-drtabs">
            {[["contact", "📞 Contact"], ["message", "✉️ Message"], ["files", "📁 Files"]].map(([id, lbl]) => (
              <div key={id} className={`ofc-drtab${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{lbl}</div>
            ))}
          </div>

          <div className="ofc-drbody">
            {tab === "contact" && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 12 }}>Reach Out</div>
                {contactActions.map((a, i) => (
                  <div key={i} className="copt" onClick={() => { a.act(); if (a.label !== "Schedule Meet") onClose(); }}>
                    <div className="copt-ic">{a.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}><div className="copt-lbl">{a.label}</div><div className="copt-sub">{a.sub}</div></div>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>→</span>
                  </div>
                ))}
              </div>
            )}

            {tab === "message" && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Leave a Message</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>{user.name.split(" ")[0]} will see this when they check their office.</div>
                <div className="msg-box">
                  <textarea rows={4} placeholder={`Write a message to ${user.name.split(" ")[0]}…`} value={msgText} onChange={e => setMsg(e.target.value)} />
                  <div className="msg-box-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => setMsg("")}>Clear</button>
                    <button className="btn btn-primary btn-sm"
                      onClick={() => { if (msgText.trim()) { showToast(`Message sent to ${user.name.split(" ")[0]}!`); setMsg(""); onClose(); } }}
                      style={{ opacity: msgText.trim() ? 1 : .5 }}>Send</button>
                  </div>
                </div>
              </div>
            )}

            {tab === "files" && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Shared Files</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>Files {user.name.split(" ")[0]} has uploaded.</div>
                {userFiles.length === 0 && <div style={{ textAlign: "center", padding: "30px", color: "var(--muted)", fontSize: 12 }}>No files uploaded yet</div>}
                {userFiles.map(f => (
                  <div key={f.id} className="ofc-file-row">
                    <div className="ofc-file-ic" style={{ background: (FILE_COLORS[f.type] || FILE_COLORS.default) + "22" }}>
                      <span style={{ fontSize: 15 }}>{FILE_CAT_ICONS[getFileCategory(f.type)]}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ofc-file-nm">{f.name}</div>
                      <div className="ofc-file-meta">{f.size} · {f.date}</div>
                    </div>
                    {f.final && <span className="fbdg">✓</span>}
                    <FileTypeBadge type={f.type} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showSched && (
        <div className="overlay" onClick={() => setShowS(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-t">📅 Schedule a Meeting</div>
            <div className="modal-s">with {user.name}</div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px", display: "block", marginBottom: 5 }}>Reason for meeting</label>
            <textarea className="modal-ta" rows={2} placeholder="e.g. Sync on API design, sprint planning…" value={schedReason} onChange={e => setReason(e.target.value)} />
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px", display: "block", marginBottom: 7 }}>Pick a time slot</label>
            <div className="sched-grid">
              {SCHEDULE_SLOTS.map(s => (
                <div key={s} className={`sched-slot${schedSlot === s ? " sel" : ""}`} onClick={() => setSched(s)}>{s}</div>
              ))}
            </div>
            <div className="modal-acts">
              <button className="btn btn-ghost" onClick={() => setShowS(false)}>Cancel</button>
              <button className="btn btn-primary"
                disabled={!schedSlot || !schedReason.trim()}
                style={{ opacity: (schedSlot && schedReason.trim()) ? 1 : .5 }}
                onClick={() => { if (schedSlot && schedReason.trim()) { showToast(`Meeting scheduled: ${schedSlot}`); setShowS(false); onClose(); } }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
