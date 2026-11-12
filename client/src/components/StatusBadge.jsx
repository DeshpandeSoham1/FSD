const tones = {
  PENDING: "badge-amber",
  ACCEPTED: "badge-ok",
  ACTIVE: "badge-active",
  COMPLETED: "badge-muted",
  REJECTED: "badge-red",
  DISPUTED: "badge-red",
  CANCELLED: "badge-muted",
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${tones[status] || "badge-muted"}`}>{status}</span>;
}
