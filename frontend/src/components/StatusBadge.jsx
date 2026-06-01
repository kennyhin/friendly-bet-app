const STATUS = {
  created:              { label: 'Awaiting Opponent', cls: 'badge-created'  },
  awaiting_deposit:     { label: 'Awaiting Deposits', cls: 'badge-awaiting' },
  funded:               { label: '🔴 Live',           cls: 'badge-funded'   },
  pending_confirmation: { label: 'Confirming Result', cls: 'badge-pending'  },
  paid_out:             { label: 'Settled',           cls: 'badge-paid'     },
  cancelled:            { label: 'Cancelled',         cls: 'badge-cancelled'},
  disputed:             { label: 'Disputed',          cls: 'badge-disputed' },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS[status] ?? { label: status, cls: 'badge-created' }
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
}
