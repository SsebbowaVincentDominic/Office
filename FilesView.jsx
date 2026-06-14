import { useState } from "react";
import { useLS, getFileCategory, FILE_CAT_ICONS } from "../shared";
import FileTypeBadge from "../components/FileTypeBadge";
import UploadModal from "../modals/UploadModal";
import PreviewModal from "../modals/PreviewModal";

export default function FilesView({ currentUser, teamId, showToast }) {
  const [files, setFiles]     = useLS(`hq_files_${teamId}`, []);
  const [folders, setFolders] = useLS(`hq_folders_${teamId}`, ["General", "Backend", "Design", "Marketing"]);
  const [folder, setFolder]   = useState("all");
  const [finalsOnly, setFinals] = useState(false);
  const [showUpload, setUpload] = useState(false);
  const [preview, setPreview]   = useState(null);
  const [addingFolder, setAddF] = useState(false);
  const [newFolder, setNF]      = useState("");

  const shownFolders = ["all", "Final Deliverables", ...folders];
  const shown = files
    .filter(f => { if (folder === "Final Deliverables") return f.final; if (folder !== "all") return f.folder === folder; return true; })
    .filter(f => finalsOnly ? f.final : true);

  const addFolder = () => {
    if (!newFolder.trim()) return;
    setFolders(p => [...p, newFolder.trim()]);
    setNF("");
    setAddF(false);
    showToast(`Folder "${newFolder.trim()}" created`);
  };

  return (
    <div>
      <div className="fxhdr">
        <div className="fxtit">📁 Files</div>
        <button className="btn btn-ghost btn-sm" onClick={() => setFinals(p => !p)}>{finalsOnly ? "Show All" : "⭐ Finals"}</button>
        <button className="btn btn-primary btn-sm" onClick={() => setUpload(true)}>+ Upload</button>
      </div>
      <div className="fxlay">
        <div className="ftree">
          <div className="ftlbl">Folders</div>
          {shownFolders.map(f => (
            <div key={f} className={`fti${folder === f ? " active" : ""}`} onClick={() => setFolder(f)}>
              {f === "all" ? "📂 All Files" : f === "Final Deliverables" ? "📦 Finals" : `📁 ${f}`}
            </div>
          ))}
          {addingFolder ? (
            <div className="folder-add-row" style={{ marginTop: 6 }}>
              <input className="folder-add-input" placeholder="Name…" value={newFolder} onChange={e => setNF(e.target.value)} onKeyDown={e => e.key === "Enter" && addFolder()} autoFocus />
              <button className="btn btn-primary btn-sm" onClick={addFolder}>+</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setAddF(false)}>✕</button>
            </div>
          ) : (
            <div className="fti fti-new" onClick={() => setAddF(true)}>＋ New Folder</div>
          )}
        </div>
        <div className="fpan">
          <div className="fph">
            <span className="fppath">/{folder === "all" ? "" : folder}</span>
            <span style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>{shown.length} files</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="ftbl">
              <thead>
                <tr><th>Name</th><th className="hide-sm">Type</th><th className="hide-sm">Size</th><th className="hide-sm">By</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {shown.length === 0 && <tr><td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "var(--muted)", fontSize: 12 }}>No files here</td></tr>}
                {shown.map(f => (
                  <tr key={f.id} className="fr" onClick={() => setPreview(f)}>
                    <td><div className="fnm"><span style={{ fontSize: 15 }}>{FILE_CAT_ICONS[getFileCategory(f.type)]}</span><span className="ffnm">{f.name}</span>{f.final && <span className="fbdg">✓ Final</span>}</div></td>
                    <td className="hide-sm"><FileTypeBadge type={f.type} /></td>
                    <td className="fmut hide-sm">{f.size}</td>
                    <td className="fmut hide-sm">{f.by}</td>
                    <td className="fmut">{f.date}</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); showToast("Downloading…"); }}>↓</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showUpload && (
        <UploadModal
          folders={folders}
          onClose={() => setUpload(false)}
          currentUser={currentUser}
          onUpload={f => { setFiles(p => [...p, { ...f, id: "f" + Date.now(), dept: "d1" }]); showToast(`"${f.name}" uploaded!`); }}
        />
      )}
      {preview && <PreviewModal file={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
