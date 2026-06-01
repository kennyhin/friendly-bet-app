import { Link } from 'react-router-dom'
import { getUserById } from '../store'
import { Avatar } from './Header'
import StatusBadge from './StatusBadge'

function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function BetCard({ bet, currentUserId }) {
  const isCreator = bet.creatorId === currentUserId
  const otherId   = isCreator ? bet.opponentId : bet.creatorId
  const other     = otherId ? getUserById(otherId) : null
  const myPick    = isCreator ? bet.creatorPick : bet.opponentPick
  const theirPick = isCreator ? bet.opponentPick : bet.creatorPick

  return (
    <Link to={`/bet/${bet.id}`} className="bet-card-item">
      <div className="bet-card-top">
        <div style={{ flex: 1, minWidth: 0 }}>
          {bet.sportEmoji && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
              {bet.sportEmoji} {bet.sportName ?? ''}
              {bet.betType && bet.betType !== 'custom' && (
                <span style={{ marginLeft: 6, color: 'var(--text-dim)' }}>· {BET_TYPE_LABEL[bet.betType] ?? bet.betType}</span>
              )}
            </div>
          )}
          <div className="bet-card-event">{bet.event}</div>
          <div className="bet-card-picks mt-4">
            <span className="pick-tag pick-tag-you">{myPick}</span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>vs</span>
            <span className="pick-tag pick-tag-them">{theirPick}</span>
          </div>
        </div>
        <StatusBadge status={bet.status} />
      </div>

      <div className="bet-card-meta mt-8">
        {other ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Avatar user={other} size="sm" />
            vs {other.name.split(' ')[0]}
          </span>
        ) : (
          <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.78rem' }}>
            ⏳ Waiting for opponent
          </span>
        )}
        <span style={{ color: 'var(--text-dim)' }}>·</span>
        <span style={{ fontWeight: 800, color: 'var(--primary)' }}>${bet.amount} each</span>
        <span style={{ color: 'var(--text-dim)' }}>·</span>
        <span>{timeAgo(bet.createdAt)}</span>
      </div>
    </Link>
  )
}

const BET_TYPE_LABEL = {
  moneyline:   'Moneyline',
  spread:      'Spread',
  over_under:  'Over/Under',
  player_prop: 'Player Prop',
}
