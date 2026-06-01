import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBetById, getCurrentUser, acceptBet, getUserById, useStore } from '../store'
import { Avatar } from '../components/Header'

export default function JoinBet() {
  useStore()
  const { id } = useParams()
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const bet = getBetById(id)

  if (!bet) {
    return (
      <div className="page text-center" style={{ paddingTop: 60 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🔍</div>
        <h2 style={{ marginBottom: 8 }}>Bet not found</h2>
        <p className="text-muted mb-20">This invite link may have expired or been cancelled.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Go home</button>
      </div>
    )
  }

  if (bet.status !== 'created') {
    return (
      <div className="page text-center" style={{ paddingTop: 60 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🚫</div>
        <h2 style={{ marginBottom: 8 }}>This bet is no longer open</h2>
        <p className="text-muted mb-20">Someone already joined, or it was cancelled.</p>
        <button className="btn btn-ghost" onClick={() => navigate(`/bet/${id}`)}>View bet</button>
      </div>
    )
  }

  if (bet.creatorId === currentUser.id) {
    const inviteUrl = `${window.location.origin}${window.location.pathname}#/join/${bet.id}`
    return (
      <div className="page text-center" style={{ paddingTop: 60 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🎯</div>
        <h2 style={{ marginBottom: 8 }}>This is your bet!</h2>
        <p className="text-muted mb-20">Share this link with your friend to have them join.</p>
        <div className="copy-link-box mb-16" style={{ maxWidth: 440, margin: '0 auto 16px' }}>
          <span className="copy-link-url">{inviteUrl}</span>
          <CopyButton text={inviteUrl} />
        </div>
        <p className="text-muted" style={{ fontSize: '0.82rem' }}>
          Tip: Switch user in the header to demo the accept flow →
        </p>
        <button className="btn btn-ghost mt-16" onClick={() => navigate(`/bet/${id}`)}>
          View bet
        </button>
      </div>
    )
  }

  const creator = getUserById(bet.creatorId)

  function join() {
    acceptBet(id)
    navigate(`/bet/${id}`)
  }

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← Home</button>
      </div>

      <div className="text-center mb-20">
        <Avatar user={creator} size="lg" />
        <div style={{ marginTop: 10, fontWeight: 700, fontSize: '1.1rem' }}>{creator?.name}</div>
        <div className="text-muted" style={{ fontSize: '0.875rem' }}>is challenging you to a bet</div>
      </div>

      <div className="card mb-16">
        <div className="card-header">
          <span style={{ fontWeight: 700 }}>{bet.event}</span>
        </div>
        <div className="card-body">
          <div className="bet-vs-row">
            <div className="bet-vs-side creator">
              <div className="vs-pick-label">Their pick</div>
              <div className="vs-pick-value">{bet.creatorPick}</div>
              <div className="vs-pick-name">{creator?.name.split(' ')[0]}</div>
            </div>
            <div className="bet-vs-divider">VS</div>
            <div className="bet-vs-side opponent">
              <div className="vs-pick-label">Your pick</div>
              <div className="vs-pick-value">{bet.opponentPick}</div>
              <div className="vs-pick-name">You ({currentUser.name.split(' ')[0]})</div>
            </div>
          </div>

          <div className="bet-amount-row mt-12">
            <div>
              <div className="bet-amount-value">${bet.amount * 2}</div>
              <div className="bet-amount-label">total pot</div>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>·</div>
            <div>
              <div className="bet-amount-value" style={{ fontSize: '1.1rem' }}>${bet.amount}</div>
              <div className="bet-amount-label">your buy-in</div>
            </div>
          </div>

          {bet.note && (
            <div className="alert alert-info mt-12">📝 {bet.note}</div>
          )}
        </div>
      </div>

      <div className="card mb-16">
        <div className="card-body">
          <div className="info-row">
            <span className="info-row-label">Your side</span>
            <span className="info-row-value" style={{ color: 'var(--secondary-dark)' }}>{bet.opponentPick}</span>
          </div>
          <div className="info-row">
            <span className="info-row-label">Buy-in required</span>
            <span className="info-row-value">${bet.amount}</span>
          </div>
          <div className="info-row">
            <span className="info-row-label">If you win</span>
            <span className="info-row-value" style={{ color: 'var(--secondary)' }}>+${bet.amount} profit</span>
          </div>
        </div>
      </div>

      <button className="btn btn-secondary btn-lg btn-full" onClick={join}>
        Accept bet — I'll take {bet.opponentPick} →
      </button>
      <div className="text-center mt-12">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>Decline</button>
      </div>
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button className="btn btn-primary btn-sm" onClick={copy} style={{ flexShrink: 0 }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}
