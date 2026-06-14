import { useState } from "react";
import { useLS, getFileCategory, FILE_CAT_ICONS } from "../shared";
import FileTypeBadge from "../components/FileTypeBadge";
import PreviewModal from "../modals/PreviewModal";

export default function FinalDeliverablesRoom({ teamId, showToast }) {
  const [files]   = useLS(`hq_files_${teamId}`, []);
  const finals    = files.filter(f => f.final);
  const [preview, setPreview] = useState(null);

  return (
    <div>
      <div className="fdr-hero">
        <div className="fdr-hero-icon">📦</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="fdr-hero-title">Final Deliverables Room</div>
          <div className="fdr-hero-sub">All files marked as final across every department</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div className="fdr-stat"><div className="fdr-stat-n">{finals.length}</div><div className="fdr-stat-l">Finals</div></div>
          <div className="fdr-stat"><div className="fdr-stat-n">{[...new Set(finals.map(f => f.dept))].length}</div><div className="fdr-stat-l">Depts</div></div>
        </div>
      </div>
      {finals.length === 0 ? (
        <div className="fdr-empty">
          <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>No final deliverables yet</div>
          <div>Upload files and mark them as ✓ Final to see them here</div>
        </div>
      ) : (
        <div className="fdr-grid">
          {finals.map(f => (
            <div key={f.id} className="fdr-card" onClick={() => setPreview(f)}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{FILE_CAT_ICONS[getFileCategory(f.type)]}</div>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{f.size} · by {f.by}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                <FileTypeBadge type={f.type} />
                <span className="fbdg">✓ Final</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {preview && <PreviewModal file={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
