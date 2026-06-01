const STATUS_CONFIG = {
  created:              { label: 'Awaiting opponent',  cls: 'badge-created' },
  awaiting_deposit:     { label: 'Awaiting deposits',  cls: 'badge-awaiting' },
  funded:               { label: 'Live',               cls: 'badge-funded' },
  pending_confirmation: { label: 'Confirming result',  cls: 'badge-pending' },
  paid_out:             { label: 'Settled',            cls: 'badge-paid' },
  cancelled:            { label: 'Cancelled',          cls: 'badge-cancelled' },
  disputed:             { label: 'Disputed',           cls: 'badge-disputed' },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'badge-created' }
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
}
