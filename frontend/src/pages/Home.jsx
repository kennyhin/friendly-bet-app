import { useNavigate } from 'react-router-dom'
import { getCurrentUser, getUserBets, useStore, resetAllData } from '../store'
import BetCard from '../components/BetCard'

const ACTIVE = ['created', 'awaiting_deposit', 'funded', 'pending_confirmation']
const PAST   = ['paid_out', 'cancelled', 'disputed']

export default function Home() {
  useStore()
  const navigate = useNavigate()
  const user = getCurrentUser()
  const bets = getUserBets(user.id)
  const active = bets.filter(b => ACTIVE.includes(b.status))
  const past   = bets.filter(b => PAST.includes(b.status))

  if (bets.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">⚡</div>
          <h3>What do you WannaBet?</h3>
          <p>Put money behind your predictions. Sports lines, spreads, props, or literally anything — if you can bet it, we've got it.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/create')}>
            Make a Bet
          </button>
          <div className="mt-20">
            <button className="btn btn-ghost btn-sm" onClick={() => { seedDemo(user.id) }}>
              Load demo data
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
            Welcome back
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
            {user.name.split(' ')[0]} ⚡
          </h1>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/create')}>+ New Bet</button>
      </div>

      {active.length > 0 && (
        <div className="mb-20">
          <div className="section-title">Active · {active.length}</div>
          <div className="stacked-list">
            {active.map(b => <BetCard key={b.id} bet={b} currentUserId={user.id} />)}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <div className="section-title">Past</div>
          <div className="stacked-list">
            {past.map(b => <BetCard key={b.id} bet={b} currentUserId={user.id} />)}
          </div>
        </div>
      )}

      <div className="mt-24 text-center">
        <button
          className="btn btn-ghost btn-sm"
          style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}
          onClick={() => { resetAllData(); window.location.reload() }}
        >
          Reset demo data
        </button>
      </div>
    </div>
  )
}

function seedDemo(currentUserId) {
  const KEY = 'fb_v1'
  const data = {
    currentUserId,
    bets: [
      {
        id: 'demo1', creatorId: 'alice', opponentId: 'bob',
        event: 'Kansas City Chiefs @ Buffalo Bills', creatorPick: 'Chiefs ML (-160)', opponentPick: 'Bills ML (+135)',
        amount: 50, note: '', betType: 'moneyline', sport: 'nfl', sportEmoji: '🏈', sportName: 'NFL',
        status: 'funded', creatorDeposited: true, opponentDeposited: true,
        claimedWinnerId: null, winnerId: null,
        createdAt: Date.now() - 1000 * 60 * 60 * 2, updatedAt: Date.now() - 1000 * 60 * 30,
      },
      {
        id: 'demo2', creatorId: 'alice', opponentId: 'bob',
        event: 'LAL @ BOS', creatorPick: 'Lakers +4.5 (-110)', opponentPick: 'Celtics -4.5 (-110)',
        amount: 25, note: 'Loser buys dinner', betType: 'spread', sport: 'nba', sportEmoji: '🏀', sportName: 'NBA',
        status: 'awaiting_deposit', creatorDeposited: true, opponentDeposited: false,
        claimedWinnerId: null, winnerId: null,
        createdAt: Date.now() - 1000 * 60 * 45, updatedAt: Date.now() - 1000 * 60 * 10,
      },
      {
        id: 'demo3', creatorId: 'alice', opponentId: null,
        event: 'LeBron James vs. Kevin Durant — who retires first',
        creatorPick: 'LeBron', opponentPick: 'Durant',
        amount: 100, note: '', betType: 'custom', sport: null, sportEmoji: null,
        status: 'created', creatorDeposited: false, opponentDeposited: false,
        claimedWinnerId: null, winnerId: null,
        createdAt: Date.now() - 1000 * 60 * 10, updatedAt: Date.now() - 1000 * 60 * 10,
      },
      {
        id: 'demo4', creatorId: 'bob', opponentId: 'charlie',
        event: 'PHI Eagles @ DAL Cowboys', creatorPick: 'Over 47.5 pts', opponentPick: 'Under 47.5 pts',
        amount: 30, note: '', betType: 'over_under', sport: 'nfl', sportEmoji: '🏈', sportName: 'NFL',
        status: 'paid_out', creatorDeposited: true, opponentDeposited: true,
        claimedWinnerId: 'bob', winnerId: 'bob',
        createdAt: Date.now() - 1000 * 60 * 60 * 48, updatedAt: Date.now() - 1000 * 60 * 60 * 24,
      },
    ],
  }
  localStorage.setItem(KEY, JSON.stringify(data))
  window.location.reload()
}
