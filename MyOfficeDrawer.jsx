import { useState } from "react";
import { useLS, STATUSES, LINK_META, FILE_COLORS, getFileCategory, FILE_CAT_ICONS } from "../shared";
import Av from "../components/Av";
import Dot from "../components/Dot";
import FileTypeBadge from "../components/FileTypeBadge";
import UploadModal from "../modals/UploadModal";
import PreviewModal from "../modals/PreviewModal";

export default function MyOfficeDrawer({ office, currentUser, onClose, showToast, teamFiles, setTeamFiles }) {
  const [tab, setTab]          = useState("files");
  const [myFiles, setMyFiles]  = useLS(`hq_myfiles_${currentUser.id}`, []);
  const [folders, setFolders]  = useLS(`hq_myfolders_${currentUser.id}`, ["Notes", "Code Snippets", "Drafts"]);
  const [activeFolder, setAF]  = useState("all");
  const [showUpload, setUpload] = useState(false);
  const [newFolder, setNF]      = useState("");
  const [addingFolder, setAddF] = useState(false);
  const [preview, setPreview]   = useState(null);

  const shownFiles = activeFolder === "all" ? myFiles : myFiles.filter(f => f.folder === activeFolder);
  const handleUpload = (f) => setMyFiles(p => [...p, { ...f, id: "mf" + Date.now() }]);
  const addFolder = () => {
    if (!newFolder.trim()) return;
    setFolders(p => [...p, newFolder.trim()]);
    setNF("");
    setAddF(false);
    showToast(`Folder "${newFolder.trim()}" created`);
  };
  const status = currentUser.status || "online";

  return (
    <div className="ofc-panel" onClick={onClose}>
      <div className="ofc-drawer" onClick={e => e.stopPropagation()}>
        <div className="ofc-drhdr">
          <div style={{ position: "relative" }}>
            <Av name={currentUser.name} initials={currentUser.initials} size="av-lg" avatarUrl={currentUser.avatarUrl || ""} />
            <span style={{ position: "absolute", bottom: 0, right: 0, width: 11, height: 11, borderRadius: "50%", background: (STATUSES[status] || STATUSES.online).color, border: "2px solid white" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div className="ofc-drname">Your Office</div>
              <span style={{ fontSize: 9, fontWeight: 700, color: "var(--green)", background: "var(--green-bg)", padding: "2px 6px", borderRadius: 99, border: "1px solid var(--green-ring)" }}>● You</span>
            </div>
            <div className="ofc-drsub">{office?.label}</div>
            <div className="ofc-drstatus"><Dot status={status} /><span>{STATUSES[status]?.label}</span></div>
          </div>
          <button className="ofc-drclose" onClick={onClose}>✕</button>
        </div>

        <div className="ofc-drtabs">
          {[["files", "📁 My Files"], ["folders", "📂 Folders"], ["links", "🔗 My Links"]].map(([id, lbl]) => (
            <div key={id} className={`ofc-drtab${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>{lbl}</div>
          ))}
        </div>

        <div className="ofc-drbody">
          {tab === "files" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>My Files</span>
                <button className="btn btn-primary btn-sm" onClick={() => setUpload(true)}>+ Upload</button>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {["all", ...folders].map(f => (
                  <div key={f} onClick={() => setAF(f)}
                    style={{ padding: "4px 10px", borderRadius: 99, fontSize: 11.5, fontWeight: 500, cursor: "pointer", background: activeFolder === f ? "var(--text)" : "var(--bg)", color: activeFolder === f ? "white" : "var(--muted)", border: "1px solid var(--border)" }}>
                    {f === "all" ? "All" : f}
                  </div>
                ))}
              </div>
              {shownFiles.length === 0 && <div style={{ textAlign: "center", padding: "30px", color: "var(--muted)", fontSize: 12 }}>No files yet</div>}
              {shownFiles.map(f => (
                <div key={f.id} className="ofc-file-row" onClick={() => setPreview(f)}>
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

          {tab === "folders" && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>My Folders</div>
              {folders.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--bg)", borderRadius: 9, marginBottom: 6, cursor: "pointer" }}
                  onClick={() => { setTab("files"); setAF(f); }}>
                  <span style={{ fontSize: 18 }}>📁</span>
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{f}</span>
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Open →</span>
                </div>
              ))}
              {addingFolder ? (
                <div className="folder-add-row">
                  <input className="folder-add-input" placeholder="Folder name…" value={newFolder} onChange={e => setNF(e.target.value)} onKeyDown={e => e.key === "Enter" && addFolder()} autoFocus />
                  <button className="btn btn-primary btn-sm" onClick={addFolder}>+</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setAddF(false)}>✕</button>
                </div>
              ) : (
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 6 }} onClick={() => setAddF(true)}>+ New Folder</button>
              )}
            </div>
          )}

          {tab === "links" && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>My Tool Links</div>
              {[{ type: "github", label: "My Fork", url: "https://github.com" }, { type: "vscode", label: "Local Workspace", url: "vscode://file/project" }].map((l, i) => {
                const m = LINK_META[l.type];
                return (
                  <a key={i} href={l.url} target="_blank" rel="noopener" className="lrow" style={{ background: "var(--bg)", borderRadius: 9, marginBottom: 6, border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 18 }}>{m.icon}</span>
                    <div><div style={{ fontSize: 13, fontWeight: 600 }}>{l.label}</div><div className="lsub">{m.label}</div></div>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)" }}>↗</span>
                  </a>
                );
              })}
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 6 }} onClick={() => showToast("Add link coming soon!")}>+ Add Link</button>
            </div>
          )}
        </div>
      </div>

      {showUpload && <UploadModal folders={["all", ...folders]} onClose={() => setUpload(false)} onUpload={handleUpload} currentUser={currentUser} />}
      {preview    && <PreviewModal file={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
