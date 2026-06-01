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
          <div className="empty-state-icon">🎯</div>
          <h3>No bets yet</h3>
          <p>Challenge a friend on anything — sports, trivia, who buys lunch. Loser pays up automatically.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/create')}>
            Create your first bet
          </button>
          <div className="mt-20">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                seedDemoData(user.id)
              }}
            >
              Load demo data
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
          Hey {user.name.split(' ')[0]} 👋
        </h1>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/create')}>
          + New Bet
        </button>
      </div>

      {active.length > 0 && (
        <div className="mb-20">
          <div className="section-title">Active ({active.length})</div>
          <div className="stacked-list">
            {active.map(bet => (
              <BetCard key={bet.id} bet={bet} currentUserId={user.id} />
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <div className="section-title">Past</div>
          <div className="stacked-list">
            {past.map(bet => (
              <BetCard key={bet.id} bet={bet} currentUserId={user.id} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-24 text-center">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { resetAllData(); window.location.reload() }}
          style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
        >
          Reset demo data
        </button>
      </div>
    </div>
  )
}

function seedDemoData(currentUserId) {
  const KEY = 'fb_v1'
  const data = { currentUserId, bets: [] }

  const betA = {
    id: 'demo_abc123',
    creatorId: 'alice',
    opponentId: 'bob',
    event: 'Lakers vs Clippers — Jan 15',
    creatorPick: 'Lakers',
    opponentPick: 'Clippers',
    amount: 25,
    note: 'Loser buys dinner too',
    status: 'funded',
    creatorDeposited: true,
    opponentDeposited: true,
    claimedWinnerId: null,
    winnerId: null,
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    updatedAt: Date.now() - 1000 * 60 * 30,
  }

  const betB = {
    id: 'demo_def456',
    creatorId: 'alice',
    opponentId: null,
    event: 'Super Bowl LVIII — who wins MVP',
    creatorPick: 'Patrick Mahomes',
    opponentPick: 'Brock Purdy',
    amount: 50,
    note: '',
    status: 'created',
    creatorDeposited: false,
    opponentDeposited: false,
    claimedWinnerId: null,
    winnerId: null,
    createdAt: Date.now() - 1000 * 60 * 10,
    updatedAt: Date.now() - 1000 * 60 * 10,
  }

  const betC = {
    id: 'demo_ghi789',
    creatorId: 'bob',
    opponentId: 'charlie',
    event: 'World Cup Final 2026',
    creatorPick: 'Brazil',
    opponentPick: 'France',
    amount: 100,
    note: '',
    status: 'paid_out',
    creatorDeposited: true,
    opponentDeposited: true,
    claimedWinnerId: 'bob',
    winnerId: 'bob',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
  }

  data.bets = [betA, betB, betC]
  localStorage.setItem(KEY, JSON.stringify(data))
  window.location.reload()
}
