import { useEffect } from "react";

export default function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, []);
  return <div className="toast">{msg}</div>;
}
