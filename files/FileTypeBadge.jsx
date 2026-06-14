import { FILE_COLORS } from "../shared";

export default function FileTypeBadge({ type }) {
  return (
    <span className="ftyp" style={{ background: FILE_COLORS[type] || FILE_COLORS.default }}>
      {type}
    </span>
  );
}
