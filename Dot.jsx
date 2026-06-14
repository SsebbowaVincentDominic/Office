import { STATUSES } from "../shared";

export default function Dot({ status }) {
  return <span className="sdot" style={{ background: (STATUSES[status] || STATUSES.offline).color }} />;
}
