import { avatarColor } from "../shared";

export default function Av({ name, initials, size = "", avatarUrl = "" }) {
  if (avatarUrl)
    return (
      <div className={`av ${size}`} style={{ overflow: "hidden", padding: 0 }}>
        <img
          src={avatarUrl}
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
          alt={name}
        />
      </div>
    );
  return (
    <div className={`av ${size}`} style={{ background: avatarColor(name) }}>
      {initials || name?.slice(0, 2).toUpperCase()}
    </div>
  );
}
