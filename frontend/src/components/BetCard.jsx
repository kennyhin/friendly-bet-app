import { Link } from 'react-router-dom'
import { getUserById } from '../store'
import { Avatar } from './Header'
import StatusBadge from './StatusBadge'

function timeAgo(ts) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function BetCard({ bet, currentUserId }) {
  const isCreator = bet.creatorId === currentUserId
  const otherId = isCreator ? bet.opponentId : bet.creatorId
  const other = otherId ? getUserById(otherId) : null
  const myPick = isCreator ? bet.creatorPick : bet.opponentPick
  const theirPick = isCreator ? bet.opponentPick : bet.creatorPick

  return (
    <Link to={`/bet/${bet.id}`} className="bet-card-item">
      <div className="bet-card-top">
        <div>
          <div className="bet-card-event">{bet.event}</div>
          <div className="bet-card-picks mt-4">
            <span className="pick-tag pick-tag-you">You: {myPick}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>vs</span>
            <span className="pick-tag pick-tag-them">{theirPick}</span>
          </div>
        </div>
        <StatusBadge status={bet.status} />
      </div>

      <div className="bet-card-meta">
        {other ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Avatar user={other} size="sm" />
            vs {other.name.split(' ')[0]}
          </span>
        ) : (
          <span style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '0.8rem' }}>
            Waiting for opponent
          </span>
        )}
        <span style={{ color: 'var(--text-muted)' }}>·</span>
        <span style={{ fontWeight: 700, color: 'var(--text)' }}>${bet.amount} each</span>
        <span style={{ color: 'var(--text-muted)' }}>·</span>
        <span>{timeAgo(bet.createdAt)}</span>
      </div>
    </Link>
  )
}
