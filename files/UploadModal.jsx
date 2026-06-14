import { useState, useRef } from "react";
import { fmtSize, getFileCategory, FILE_CAT_ICONS } from "../shared";
import FileTypeBadge from "../components/FileTypeBadge";

export default function UploadModal({ onClose, onUpload, folders, currentUser }) {
  const [files, setFiles]     = useState([]);
  const [folder, setFolder]   = useState(folders[0] || "General");
  const [isFinal, setIsFinal] = useState(false);
  const [dragging, setDrag]   = useState(false);
  const inputRef = useRef();

  const handle = (picked) => {
    const arr = Array.from(picked).map(f => ({
      id: "f" + Date.now() + Math.random(),
      name: f.name,
      size: fmtSize(f.size),
      type: f.name.split(".").pop().toLowerCase(),
      rawFile: f,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
    }));
    setFiles(arr);
  };

  const confirm = () => {
    if (!files.length) return;
    files.forEach(f =>
      onUpload({ ...f, folder, final: isFinal, by: currentUser.name, date: "Today", owner: currentUser.id, url: f.preview || null })
    );
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-t">📤 Upload Files</div>
        <div className="modal-s">Drop files below — images, videos, docs, code, anything.</div>
        <div
          className={`dz${dragging ? " on" : ""}`}
          style={{ marginBottom: 12, cursor: "pointer" }}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
          onClick={() => inputRef.current.click()}
        >
          <div className="dzt">{dragging ? "Drop here!" : <><strong>Click or drag</strong> files here</>}</div>
          <input ref={inputRef} type="file" multiple style={{ display: "none" }} onChange={e => handle(e.target.files)} />
        </div>
        {files.length > 0 && (
          <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 6, maxHeight: 120, overflowY: "auto" }}>
            {files.map(f => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--bg)", borderRadius: 8 }}>
                <span style={{ fontSize: 16 }}>{FILE_CAT_ICONS[getFileCategory(f.type)]}</span>
                <span style={{ fontSize: 12.5, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                <span style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>{f.size}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 4 }}>SAVE TO FOLDER</label>
          <select className="modal-in" style={{ marginBottom: 0 }} value={folder} onChange={e => setFolder(e.target.value)}>
            {folders.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "var(--green-bg)", border: "1px solid var(--green-ring)", borderRadius: 9, cursor: "pointer", marginBottom: 14, userSelect: "none" }}>
          <input type="checkbox" checked={isFinal} onChange={e => setIsFinal(e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--green)", cursor: "pointer" }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>✓ Mark as Final Deliverable</div>
            <div style={{ fontSize: 11, color: "#166534" }}>Pins this file to the Final Deliverables section</div>
          </div>
        </label>
        <div className="modal-acts">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={confirm} disabled={!files.length} style={{ opacity: files.length ? 1 : .5 }}>
            Upload {files.length > 0 ? `(${files.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
