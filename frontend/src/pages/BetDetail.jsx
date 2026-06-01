import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { getBetById, getCurrentUser, getUserById, deposit, claimWin, confirmWinner, cancelBet, useStore } from '../store'
import { Avatar } from '../components/Header'
import StatusBadge from '../components/StatusBadge'

export default function BetDetail() {
  useStore()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isNew = searchParams.get('new') === '1'
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const bet = getBetById(id)

  if (!bet) {
    return (
      <div className="page text-center" style={{ paddingTop: 60 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>🔍</div>
        <h2 style={{ marginBottom: 8, fontWeight: 900 }}>Bet not found</h2>
        <button className="btn btn-primary mt-16" onClick={() => navigate('/')}>Go home</button>
      </div>
    )
  }

  const isCreator  = bet.creatorId === currentUser.id
  const isOpponent = bet.opponentId === currentUser.id
  const isMember   = isCreator || isOpponent
  const creator    = getUserById(bet.creatorId)
  const opponent   = bet.opponentId ? getUserById(bet.opponentId) : null
  const other      = isCreator ? opponent : creator
  const inviteUrl  = `${window.location.origin}${window.location.pathname}#/join/${bet.id}`

  const iHaveDeposited  = isCreator ? bet.creatorDeposited : bet.opponentDeposited
  const claimedWinner   = bet.claimedWinnerId ? getUserById(bet.claimedWinnerId) : null
  const iClaimedWin     = bet.claimedWinnerId === currentUser.id
  const winner          = bet.winnerId ? getUserById(bet.winnerId) : null
  const iWon            = bet.winnerId === currentUser.id

  return (
    <div className="page">
      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← Back</button>
      </div>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {bet.sportEmoji && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              {bet.sportEmoji} {bet.sportName} {bet.betType && bet.betType !== 'custom' ? `· ${BET_TYPE_LABEL[bet.betType]}` : ''}
            </div>
          )}
          <h1 style={{ fontSize: '1.15rem', fontWeight: 900, lineHeight: 1.3, marginBottom: 6, letterSpacing: '-0.3px' }}>
            {bet.event}
          </h1>
          <StatusBadge status={bet.status} />
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '-1px' }}>${bet.amount * 2}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>total pot</div>
        </div>
      </div>

      {/* VS card */}
      <div className="card mb-16">
        <div className="card-body" style={{ padding: 14 }}>
          <div className="bet-vs-row">
            <div className="bet-vs-side creator">
              <Avatar user={creator} />
              <div className="vs-pick-label">{creator?.name.split(' ')[0]}'s pick</div>
              <div className="vs-pick-value">{bet.creatorPick}</div>
              {isCreator && <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 800 }}>YOU</div>}
            </div>
            <div className="bet-vs-divider">VS</div>
            <div className="bet-vs-side opponent">
              {opponent ? (
                <>
                  <Avatar user={opponent} />
                  <div className="vs-pick-label">{opponent.name.split(' ')[0]}'s pick</div>
                  <div className="vs-pick-value">{bet.opponentPick}</div>
                  {isOpponent && <div style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 800 }}>YOU</div>}
                </>
              ) : (
                <>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px dashed var(--border-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1rem' }}>?</div>
                  <div className="vs-pick-label">Opponent</div>
                  <div className="vs-pick-value">{bet.opponentPick}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Awaiting...</div>
                </>
              )}
            </div>
          </div>

          {bet.note && <div className="alert alert-info mt-12" style={{ fontSize: '0.82rem' }}>📝 {bet.note}</div>}

          <div className="info-row mt-8" style={{ padding: '8px 0 0' }}>
            <span className="info-row-label">Wager</span>
            <span className="info-row-value" style={{ color: 'var(--text-muted)' }}>${bet.amount} each · <span style={{ color: 'var(--primary)', fontWeight: 900 }}>${bet.amount * 2}</span> pot</span>
          </div>
        </div>
      </div>

      {/* ── Action zones by status ── */}

      {/* NEW bet — show invite link prominently */}
      {isNew && bet.status === 'created' && (
        <div className="card mb-16" style={{ border: '1.5px solid var(--primary)' }}>
          <div className="card-header" style={{ background: 'var(--primary-dim)', borderColor: 'transparent' }}>
            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>⚡ Bet created!</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.875rem', marginBottom: 12, color: 'var(--text-muted)' }}>
              Send this link to your friend to accept:
            </p>
            <div className="copy-link-box">
              <span className="copy-link-url">{inviteUrl}</span>
              <CopyButton text={inviteUrl} />
            </div>
            <p className="text-muted mt-8" style={{ fontSize: '0.75rem' }}>
              Demo: copy the link → switch users in the header → paste to accept
            </p>
          </div>
        </div>
      )}

      {/* CREATED — not new, creator waiting */}
      {!isNew && bet.status === 'created' && isCreator && (
        <div className="card mb-16">
          <div className="card-body">
            <div className="alert alert-warning mb-12">⏳ Waiting for someone to accept</div>
            <div className="copy-link-box">
              <span className="copy-link-url">{inviteUrl}</span>
              <CopyButton text={inviteUrl} />
            </div>
          </div>
          <div className="card-footer">
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => cancelBet(id)}>Cancel bet</button>
          </div>
        </div>
      )}

      {/* CREATED — non-member with invite link */}
      {bet.status === 'created' && !isMember && (
        <button className="btn btn-primary btn-lg btn-full mb-16" onClick={() => navigate(`/join/${id}`)}>
          Accept this bet →
        </button>
      )}

      {/* AWAITING DEPOSIT */}
      {bet.status === 'awaiting_deposit' && isMember && (
        <div className="card mb-16">
          <div className="card-header">
            <span style={{ fontWeight: 800 }}>Deposits</span>
          </div>
          <div className="card-body" style={{ padding: '14px 16px' }}>
            <div className="deposit-progress mb-16">
              <div className={`deposit-track ${bet.creatorDeposited ? 'done' : 'waiting'}`}>
                {bet.creatorDeposited ? '✓' : '○'} {creator?.name.split(' ')[0]} {bet.creatorDeposited ? 'deposited' : 'pending'}
              </div>
              <div className={`deposit-track ${bet.opponentDeposited ? 'done' : 'waiting'}`}>
                {bet.opponentDeposited ? '✓' : '○'} {opponent?.name.split(' ')[0]} {bet.opponentDeposited ? 'deposited' : 'pending'}
              </div>
            </div>
            {!iHaveDeposited
              ? <DepositFlow bet={bet} onDeposit={() => deposit(id)} />
              : <div className="alert alert-success">✓ You've deposited ${bet.amount}. Waiting for {other?.name.split(' ')[0]}...</div>
            }
          </div>
          {isCreator && (
            <div className="card-footer">
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', fontSize: '0.8rem' }} onClick={() => cancelBet(id)}>Cancel bet</button>
            </div>
          )}
        </div>
      )}

      {/* FUNDED — live */}
      {bet.status === 'funded' && isMember && (
        <div className="card mb-16" style={{ border: '1px solid rgba(0,230,118,0.25)' }}>
          <div className="card-header" style={{ background: 'var(--primary-dim)' }}>
            <span style={{ fontWeight: 800, color: 'var(--primary)' }}>🔴 Bet is Live</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary)', opacity: 0.8 }}>Both deposits confirmed</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.875rem', marginBottom: 16, color: 'var(--text-muted)' }}>
              Once the event concludes, claim your result below.
            </p>
            <button className="btn btn-primary btn-full" onClick={() => claimWin(id)}>
              🏆 I won this bet!
            </button>
          </div>
        </div>
      )}

      {/* PENDING CONFIRMATION */}
      {bet.status === 'pending_confirmation' && isMember && (
        <div className="card mb-16">
          <div className="card-body">
            {iClaimedWin ? (
              <div className="alert alert-info">
                <strong>You claimed victory.</strong> Waiting for {other?.name.split(' ')[0]} to confirm...
              </div>
            ) : (
              <div>
                <div className="alert alert-warning mb-16">
                  <strong>{claimedWinner?.name}</strong> says they won. Do you agree?
                </div>
                <div className="action-row">
                  <button className="btn btn-primary" onClick={() => confirmWinner(id, true)}>✓ Yes, they won</button>
                  <button className="btn btn-danger"  onClick={() => confirmWinner(id, false)}>✗ Dispute</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAID OUT */}
      {bet.status === 'paid_out' && (
        iWon ? (
          <div className="celebration-banner">
            <div style={{ fontSize: '2rem', marginBottom: 8, position: 'relative' }}>🎉</div>
            <h2>You won!</h2>
            <div className="celebration-amount">${bet.amount * 2}</div>
            <p>Payout is on its way to your account</p>
          </div>
        ) : isMember ? (
          <div className="alert alert-danger mb-16" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>😔</div>
            <strong>{winner?.name}</strong> won ${bet.amount * 2}.<br />
            <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Better luck next time</span>
          </div>
        ) : (
          <div className="alert alert-success mb-16">✓ <strong>{winner?.name}</strong> won this bet.</div>
        )
      )}

      {/* DISPUTED */}
      {bet.status === 'disputed' && (
        <div className="alert alert-danger mb-16">⚠️ This bet is under dispute. A moderator would review and resolve it in the full app.</div>
      )}

      {/* CANCELLED */}
      {bet.status === 'cancelled' && (
        <div className="alert mb-16" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
          This bet was cancelled. Any deposits would be refunded automatically.
        </div>
      )}

      {/* Details */}
      <div className="card">
        <div className="card-header">
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Details</span>
        </div>
        <div className="card-body" style={{ padding: '0 18px' }}>
          <div className="info-row"><span className="info-row-label">Created by</span><span className="info-row-value">{creator?.name}</span></div>
          <div className="info-row"><span className="info-row-label">Opponent</span><span className="info-row-value">{opponent?.name ?? '—'}</span></div>
          <div className="info-row"><span className="info-row-label">Amount</span><span className="info-row-value">${bet.amount} each</span></div>
          {bet.betType && bet.betType !== 'custom' && (
            <div className="info-row"><span className="info-row-label">Bet type</span><span className="info-row-value">{BET_TYPE_LABEL[bet.betType] ?? bet.betType}</span></div>
          )}
          <div className="info-row"><span className="info-row-label">Status</span><span className="info-row-value"><StatusBadge status={bet.status} /></span></div>
        </div>
      </div>
    </div>
  )
}

function DepositFlow({ bet, onDeposit }) {
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function pay(e) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false); setDone(true)
    setTimeout(onDeposit, 400)
  }

  function fmt4(v) { return v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim() }
  function fmtExp(v) { const d = v.replace(/\D/g,'').slice(0,4); return d.length >= 3 ? d.slice(0,2)+'/'+d.slice(2) : d }

  if (done) return (
    <div className="alert alert-success text-center" style={{ padding: '20px' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>✓</div>
      <strong>Payment confirmed!</strong><br />
      <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>${bet.amount} held securely in escrow</span>
    </div>
  )

  return (
    <form onSubmit={pay}>
      <div className="stripe-box">
        <div className="stripe-header">
          <span className="stripe-header-title">Deposit ${bet.amount}</span>
          <span className="stripe-header-logo">STRIPE</span>
        </div>
        <div className="stripe-body">
          <div className="form-group">
            <label className="form-label">Card number</label>
            <input className="form-input" placeholder="4242 4242 4242 4242" value={card.number} onChange={e => setCard(c => ({...c, number: fmt4(e.target.value)}))} required />
          </div>
          <div className="stripe-row">
            <div className="form-group">
              <label className="form-label">Expiry</label>
              <input className="form-input" placeholder="MM/YY" value={card.expiry} onChange={e => setCard(c => ({...c, expiry: fmtExp(e.target.value)}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">CVC</label>
              <input className="form-input" placeholder="123" value={card.cvc} onChange={e => setCard(c => ({...c, cvc: e.target.value.replace(/\D/g,'').slice(0,3)}))} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span style={{ display:'flex', alignItems:'center', gap:8 }}><Spinner /> Processing...</span> : `Pay $${bet.amount} →`}
          </button>
          <div className="stripe-secure">🔒 Held securely in escrow until the bet settles</div>
        </div>
      </div>
    </form>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  async function copy() { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <button className="btn btn-primary btn-sm" onClick={copy} type="button" style={{ flexShrink: 0 }}>
      {copied ? '✓ Copied' : 'Copy link'}
    </button>
  )
}

const BET_TYPE_LABEL = {
  moneyline:   'Moneyline',
  spread:      'Spread',
  over_under:  'Over/Under',
  player_prop: 'Player Prop',
}
