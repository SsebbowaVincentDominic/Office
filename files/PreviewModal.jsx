import { getFileCategory, FILE_CAT_ICONS } from "../shared";
import FileTypeBadge from "../components/FileTypeBadge";

export default function PreviewModal({ file, onClose }) {
  const cat = getFileCategory(file.type);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <FileTypeBadge type={file.type} />
          <span style={{ fontWeight: 700, fontSize: 14, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="prev-wrap">
          {cat === "image" && file.url
            ? <img src={file.url} className="prev-img" alt={file.name} />
            : cat === "video" && file.url
            ? <video src={file.url} className="prev-vid" controls />
            : <div className="prev-icon">{FILE_CAT_ICONS[cat]}</div>}
          <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
            {file.size} · Uploaded by {file.by} · {file.date}
          </div>
          {file.final && <span className="fbdg">✓ Final Deliverable</span>}
        </div>
        <div className="modal-acts" style={{ marginTop: 14 }}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <button className="btn btn-primary">↓ Download</button>
        </div>
      </div>
    </div>
  );
}
