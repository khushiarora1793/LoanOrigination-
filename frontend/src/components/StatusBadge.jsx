export default function StatusBadge({ status }) {
  return <span className={`status status-${status?.toLowerCase() || 'pending'}`}>{status || 'PENDING'}</span>;
}
