import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBet, getCurrentUser } from '../store'
import { SPORTS, PROP_STATS, fetchGames, fmtML, fmtSpread, fmtOdds, fmtDate, buildBetPicks } from '../services/sportsApi'

const PRESETS = [5, 10, 20, 50, 100]

export default function CreateBet() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [mode, setMode] = useState('custom') // 'custom' | 'sports'

  // ── Custom bet state ──
  const [form, setForm] = useState({ event: '', creatorPick: '', opponentPick: '', amount: '', note: '' })
  const [customAmount, setCustomAmount] = useState(false)
  const [errors, setErrors] = useState({})

  // ── Sports bet state ──
  const [sport, setSport] = useState(null)
  const [games, setGames] = useState([])
  const [gamesLoading, setGamesLoading] = useState(false)
  const [gamesError, setGamesError] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)
  const [betType, setBetType] = useState(null)
  const [side, setSide] = useState(null)
  const [propPlayer, setPropPlayer] = useState('')
  const [propStat, setPropStat] = useState('Points')
  const [propLine, setPropLine] = useState('')
  const [sportAmount, setSportAmount] = useState('')
  const [sportCustomAmt, setSportCustomAmt] = useState(false)
  const [manualSpread, setManualSpread] = useState('')
  const [manualTotal, setManualTotal] = useState('')

  // Fetch games when sport changes
  useEffect(() => {
    if (!sport) return
    setGames([]); setSelectedGame(null); setBetType(null); setSide(null); setGamesError(null)
    setGamesLoading(true)
    fetchGames(sport)
      .then(g => setGames(g))
      .catch(() => setGamesError('Could not load games. Try another sport or check your connection.'))
      .finally(() => setGamesLoading(false))
  }, [sport])

  // Reset bet type & side when game changes
  useEffect(() => { setBetType(null); setSide(null) }, [selectedGame])
  useEffect(() => { setSide(null) }, [betType])

  // ── Custom bet submit ──
  function submitCustom(e) {
    e.preventDefault()
    const errs = {}
    if (!form.event.trim())        errs.event        = 'Required'
    if (!form.creatorPick.trim())  errs.creatorPick  = 'Required'
    if (!form.opponentPick.trim()) errs.opponentPick = 'Required'
    if (!form.amount || Number(form.amount) < 1) errs.amount = 'Enter a valid amount'
    if (Object.keys(errs).length) { setErrors(errs); return }
    const bet = createBet({ ...form, amount: Number(form.amount), betType: 'custom' })
    navigate(`/bet/${bet.id}?new=1`)
  }

  // ── Sports bet submit ──
  function submitSports() {
    if (!selectedGame || !betType || !side) return
    if (betType === 'player_prop' && (!propPlayer || !propLine)) return
    const spread = selectedGame.odds?.spread ?? (manualSpread ? Number(manualSpread) : null)
    const total  = selectedGame.odds?.overUnder ?? (manualTotal ? Number(manualTotal) : null)
    const picks  = buildBetPicks(selectedGame, betType, side, propPlayer, propStat, propLine || total)
    const bet = createBet({
      ...picks,
      amount:    Number(sportAmount),
      betType,
      sport,
      sportEmoji: SPORTS.find(s => s.key === sport)?.emoji,
      sportName:  SPORTS.find(s => s.key === sport)?.name,
      gameId:    selectedGame.id,
    })
    navigate(`/bet/${bet.id}?new=1`)
  }

  const sportsBetReady = selectedGame && betType && side && Number(sportAmount) >= 1 &&
    (betType !== 'player_prop' || (propPlayer && propLine))

  return (
    <div className="page">
      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← Back</button>
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 4, letterSpacing: '-0.5px' }}>
        New Bet
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>
        Challenge a friend on anything — sports, trivia, who pays for dinner.
      </p>

      {/* Mode tabs */}
      <div className="mode-tabs">
        <button className={`mode-tab ${mode === 'custom' ? 'active' : ''}`} onClick={() => setMode('custom')}>
          ✏️ Custom Bet
        </button>
        <button className={`mode-tab ${mode === 'sports' ? 'active' : ''}`} onClick={() => setMode('sports')}>
          🏆 Sports Bet
        </button>
      </div>

      {/* ─── CUSTOM BET ─── */}
      {mode === 'custom' && (
        <form onSubmit={submitCustom}>
          <div className="card mb-12">
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Event or topic</label>
                <input className="form-input" placeholder="e.g. Lakers vs Clippers, who gets promoted first, etc." value={form.event} onChange={e => { setForm(f => ({...f, event: e.target.value})); setErrors(r => ({...r, event:''})) }} />
                {errors.event && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 4 }}>{errors.event}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Your pick</label>
                  <input className="form-input" placeholder="e.g. Lakers" value={form.creatorPick} onChange={e => { setForm(f => ({...f, creatorPick: e.target.value})); setErrors(r => ({...r, creatorPick:''})) }} />
                  {errors.creatorPick && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 4 }}>{errors.creatorPick}</div>}
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Opponent's pick</label>
                  <input className="form-input" placeholder="e.g. Clippers" value={form.opponentPick} onChange={e => { setForm(f => ({...f, opponentPick: e.target.value})); setErrors(r => ({...r, opponentPick:''})) }} />
                  {errors.opponentPick && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 4 }}>{errors.opponentPick}</div>}
                </div>
              </div>
            </div>
          </div>

          <AmountPicker value={form.amount} custom={customAmount} onPreset={v => { setForm(f => ({...f, amount: String(v)})); setCustomAmount(false) }} onCustom={() => { setCustomAmount(true); setForm(f => ({...f, amount: ''})) }} onChange={v => setForm(f => ({...f, amount: v}))} error={errors.amount} />

          <div className="card mb-16">
            <div className="card-body">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Note <span>(optional)</span></label>
                <input className="form-input" placeholder="Any extra terms..." value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} />
              </div>
            </div>
          </div>

          {/* Preview */}
          {form.event && form.creatorPick && form.opponentPick && form.amount && (
            <div className="preview-card mb-16">
              <div className="preview-card-header">Preview</div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 12 }}>{form.event}</div>
                <div className="bet-vs-row">
                  <div className="bet-vs-side creator">
                    <div className="vs-pick-label">Your pick</div>
                    <div className="vs-pick-value">{form.creatorPick}</div>
                    <div className="vs-pick-name">{user.name}</div>
                  </div>
                  <div className="bet-vs-divider">VS</div>
                  <div className="bet-vs-side opponent">
                    <div className="vs-pick-label">Their pick</div>
                    <div className="vs-pick-value">{form.opponentPick}</div>
                    <div className="vs-pick-name">Your friend</div>
                  </div>
                </div>
                <div className="bet-amount-row mt-12">
                  <div><div className="bet-amount-value green">${Number(form.amount) * 2}</div><div className="bet-amount-label">total pot</div></div>
                  <div style={{ color: 'var(--text-dim)' }}>·</div>
                  <div><div className="bet-amount-value" style={{ fontSize: '1.1rem' }}>${form.amount}</div><div className="bet-amount-label">each</div></div>
                </div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-full">
            Create Bet & Get Invite Link →
          </button>
        </form>
      )}

      {/* ─── SPORTS BET ─── */}
      {mode === 'sports' && (
        <div>
          {/* Step 1: Pick sport */}
          <Step num={1} label="Pick a sport" done={!!sport}>
            <div className="sport-tabs">
              {SPORTS.map(s => (
                <button key={s.key} className={`sport-tab ${sport === s.key ? 'active' : ''}`} onClick={() => setSport(s.key)}>
                  <span className="sport-tab-emoji">{s.emoji}</span>
                  <span className="sport-tab-name">{s.name}</span>
                </button>
              ))}
            </div>
          </Step>

          {/* Step 2: Pick game */}
          {sport && (
            <Step num={2} label="Select a game" done={!!selectedGame}>
              {gamesLoading && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Loading games...
                </div>
              )}
              {gamesError && (
                <div className="alert alert-danger">{gamesError}</div>
              )}
              {!gamesLoading && !gamesError && games.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No upcoming games found right now.
                </div>
              )}
              {games.map(g => (
                <GameCard key={g.id} game={g} selected={selectedGame?.id === g.id} onSelect={() => setSelectedGame(g)} />
              ))}
            </Step>
          )}

          {/* Step 3: Bet type */}
          {selectedGame && (
            <Step num={3} label="Bet type" done={!!betType}>
              <div className="bet-type-tabs">
                <button className={`bet-type-tab ${betType === 'moneyline' ? 'active' : ''}`} onClick={() => setBetType('moneyline')}>Moneyline</button>
                {(selectedGame.odds?.spread != null || true) && (
                  <button className={`bet-type-tab ${betType === 'spread' ? 'active' : ''}`} onClick={() => setBetType('spread')}>Spread</button>
                )}
                <button className={`bet-type-tab ${betType === 'over_under' ? 'active' : ''}`} onClick={() => setBetType('over_under')}>Over/Under</button>
                <button className={`bet-type-tab ${betType === 'player_prop' ? 'active' : ''}`} onClick={() => setBetType('player_prop')}>Player Prop</button>
              </div>
            </Step>
          )}

          {/* Step 4: Pick side */}
          {betType && selectedGame && (
            <Step num={4} label="Your pick" done={!!side}>
              {betType === 'moneyline' && (
                <MoneylinePicker game={selectedGame} side={side} onSide={setSide} />
              )}
              {betType === 'spread' && (
                <SpreadPicker game={selectedGame} side={side} onSide={setSide} manualSpread={manualSpread} setManualSpread={setManualSpread} />
              )}
              {betType === 'over_under' && (
                <OUPicker game={selectedGame} side={side} onSide={setSide} manualTotal={manualTotal} setManualTotal={setManualTotal} />
              )}
              {betType === 'player_prop' && (
                <PropPicker sport={sport} side={side} onSide={setSide} player={propPlayer} setPlayer={setPropPlayer} stat={propStat} setStat={setPropStat} line={propLine} setLine={setPropLine} />
              )}
            </Step>
          )}

          {/* Step 5: Amount */}
          {side && (
            <AmountPicker value={sportAmount} custom={sportCustomAmt} onPreset={v => { setSportAmount(String(v)); setSportCustomAmt(false) }} onCustom={() => { setSportCustomAmt(true); setSportAmount('') }} onChange={setSportAmount} />
          )}

          {/* Preview */}
          {sportsBetReady && (() => {
            const spread = selectedGame.odds?.spread ?? (manualSpread ? Number(manualSpread) : null)
            const total  = selectedGame.odds?.overUnder ?? (manualTotal ? Number(manualTotal) : null)
            const picks  = buildBetPicks(selectedGame, betType, side, propPlayer, propStat, propLine || total)
            return (
              <div className="preview-card mb-16 mt-16">
                <div className="preview-card-header">Preview</div>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 12, color: 'var(--text)' }}>{picks.event}</div>
                  <div className="bet-vs-row">
                    <div className="bet-vs-side creator">
                      <div className="vs-pick-label">Your pick</div>
                      <div className="vs-pick-value" style={{ fontSize: '0.85rem' }}>{picks.creatorPick}</div>
                      <div className="vs-pick-name">{user.name}</div>
                    </div>
                    <div className="bet-vs-divider">VS</div>
                    <div className="bet-vs-side opponent">
                      <div className="vs-pick-label">Opponent</div>
                      <div className="vs-pick-value" style={{ fontSize: '0.85rem' }}>{picks.opponentPick}</div>
                      <div className="vs-pick-name">Your friend</div>
                    </div>
                  </div>
                  <div className="bet-amount-row mt-12">
                    <div><div className="bet-amount-value green">${Number(sportAmount) * 2}</div><div className="bet-amount-label">total pot</div></div>
                    <div style={{ color: 'var(--text-dim)' }}>·</div>
                    <div><div className="bet-amount-value" style={{ fontSize: '1.1rem' }}>${sportAmount}</div><div className="bet-amount-label">each</div></div>
                  </div>
                </div>
              </div>
            )
          })()}

          <button
            className="btn btn-primary btn-lg btn-full mt-4"
            disabled={!sportsBetReady}
            onClick={submitSports}
          >
            Create Bet & Get Invite Link →
          </button>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ──

function Step({ num, label, done, children }) {
  return (
    <div className="card mb-12">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: done ? 'var(--primary)' : 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, color: done ? '#000' : 'var(--text-muted)', flexShrink: 0 }}>
            {done ? '✓' : num}
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{label}</span>
        </div>
      </div>
      <div className="card-body">{children}</div>
    </div>
  )
}

function GameCard({ game, selected, onSelect }) {
  const o = game.odds
  return (
    <div className={`game-card ${selected ? 'active' : ''}`} onClick={onSelect}>
      <div className="game-meta">
        {game.isLive ? <span className="game-live">● LIVE</span> : null}
        <span>{game.statusDetail}</span>
        {!game.isLive && <span>· {fmtDate(game.date)}</span>}
      </div>
      <div className="game-teams">
        <div className="game-team">
          {game.awayTeam.logo && <img className="team-logo" src={game.awayTeam.logo} alt="" />}
          <span className="team-abbr">{game.awayTeam.abbr || game.awayTeam.name}</span>
          {game.isLive && game.awayTeam.score != null && <span style={{ color: 'var(--text)', fontWeight: 900, marginLeft: 4 }}>{game.awayTeam.score}</span>}
        </div>
        <span className="game-at">@</span>
        <div className="game-team">
          {game.homeTeam.logo && <img className="team-logo" src={game.homeTeam.logo} alt="" />}
          <span className="team-abbr">{game.homeTeam.abbr || game.homeTeam.name}</span>
          {game.isLive && game.homeTeam.score != null && <span style={{ color: 'var(--text)', fontWeight: 900, marginLeft: 4 }}>{game.homeTeam.score}</span>}
        </div>
      </div>
      {o && (
        <div className="game-odds-row">
          {o.spread != null && <span className="odds-chip"><span className="line">{fmtSpread(o.spread, false)}</span> spread</span>}
          {o.overUnder != null && <span className="odds-chip">O/U <span className="line">{o.overUnder}</span></span>}
          {o.awayMoneyLine != null && <span className="odds-chip">ML <span className="line">{fmtML(o.awayMoneyLine)}</span> / <span className="line">{fmtML(o.homeMoneyLine)}</span></span>}
        </div>
      )}
    </div>
  )
}

function MoneylinePicker({ game, side, onSide }) {
  const o = game.odds
  const away = game.awayTeam
  const home = game.homeTeam
  return (
    <div className="pick-cards">
      <button className={`pick-card ${side === 'away' ? 'active' : ''}`} onClick={() => onSide('away')}>
        {away.logo && <img src={away.logo} alt="" style={{ width: 36, height: 36, objectFit: 'contain', marginBottom: 6 }} />}
        <div className="pick-team">{away.abbr || away.name}</div>
        <div className="pick-line">{fmtML(o?.awayMoneyLine)}</div>
        <div className="pick-juice">Moneyline</div>
      </button>
      <button className={`pick-card ${side === 'home' ? 'active' : ''}`} onClick={() => onSide('home')}>
        {home.logo && <img src={home.logo} alt="" style={{ width: 36, height: 36, objectFit: 'contain', marginBottom: 6 }} />}
        <div className="pick-team">{home.abbr || home.name}</div>
        <div className="pick-line">{fmtML(o?.homeMoneyLine)}</div>
        <div className="pick-juice">Moneyline</div>
      </button>
    </div>
  )
}

function SpreadPicker({ game, side, onSide, manualSpread, setManualSpread }) {
  const o = game.odds
  const away = game.awayTeam
  const home = game.homeTeam
  const hasOdds = o?.spread != null
  const spreadVal = hasOdds ? o.spread : (manualSpread ? Number(manualSpread) : null)
  const awaySpread = spreadVal != null ? fmtSpread(spreadVal, false) : '?'
  const homeSpread = spreadVal != null ? fmtSpread(spreadVal, true) : '?'
  return (
    <div>
      {!hasOdds && (
        <div className="form-group mb-12">
          <label className="form-label">Set the spread</label>
          <input className="form-input" placeholder="e.g. -3.5 (negative = away team favored)" value={manualSpread} onChange={e => setManualSpread(e.target.value)} />
          <div className="form-hint">Enter a negative number if the away team is favored.</div>
        </div>
      )}
      <div className="pick-cards">
        <button className={`pick-card ${side === 'away' ? 'active' : ''}`} onClick={() => onSide('away')}>
          {away.logo && <img src={away.logo} alt="" style={{ width: 32, height: 32, objectFit: 'contain', marginBottom: 6 }} />}
          <div className="pick-team">{away.abbr || away.name}</div>
          <div className="pick-line">{awaySpread}</div>
          <div className="pick-juice">{fmtOdds(o?.awaySpreadOdds)}</div>
        </button>
        <button className={`pick-card ${side === 'home' ? 'active' : ''}`} onClick={() => onSide('home')}>
          {home.logo && <img src={home.logo} alt="" style={{ width: 32, height: 32, objectFit: 'contain', marginBottom: 6 }} />}
          <div className="pick-team">{home.abbr || home.name}</div>
          <div className="pick-line">{homeSpread}</div>
          <div className="pick-juice">{fmtOdds(o?.homeSpreadOdds)}</div>
        </button>
      </div>
    </div>
  )
}

function OUPicker({ game, side, onSide, manualTotal, setManualTotal }) {
  const o = game.odds
  const hasTotal = o?.overUnder != null
  const total = hasTotal ? o.overUnder : (manualTotal || '?')
  return (
    <div>
      {!hasTotal && (
        <div className="form-group mb-12">
          <label className="form-label">Set the total</label>
          <input className="form-input" placeholder="e.g. 48.5" value={manualTotal} onChange={e => setManualTotal(e.target.value)} type="number" step="0.5" />
        </div>
      )}
      <div className="pick-cards">
        <button className={`pick-card ${side === 'over' ? 'active' : ''}`} onClick={() => onSide('over')}>
          <div className="pick-team">Over</div>
          <div className="pick-line">{total}</div>
          <div className="pick-juice">-110</div>
        </button>
        <button className={`pick-card ${side === 'under' ? 'active' : ''}`} onClick={() => onSide('under')}>
          <div className="pick-team">Under</div>
          <div className="pick-line">{total}</div>
          <div className="pick-juice">-110</div>
        </button>
      </div>
    </div>
  )
}

function PropPicker({ sport, side, onSide, player, setPlayer, stat, setStat, line, setLine }) {
  const stats = PROP_STATS[sport] ?? PROP_STATS.nba
  return (
    <div>
      <div className="form-group">
        <label className="form-label">Player name</label>
        <input className="form-input" placeholder="e.g. LeBron James" value={player} onChange={e => setPlayer(e.target.value)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Stat</label>
          <select className="form-input" value={stat} onChange={e => setStat(e.target.value)}>
            {stats.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Line</label>
          <input className="form-input" placeholder="e.g. 25.5" type="number" step="0.5" value={line} onChange={e => setLine(e.target.value)} />
        </div>
      </div>
      {player && line && (
        <div className="pick-cards mt-12">
          <button className={`pick-card ${side === 'over' ? 'active' : ''}`} onClick={() => onSide('over')}>
            <div className="pick-team">Over</div>
            <div className="pick-line">{line}</div>
            <div className="pick-juice">{stat}</div>
          </button>
          <button className={`pick-card ${side === 'under' ? 'active' : ''}`} onClick={() => onSide('under')}>
            <div className="pick-team">Under</div>
            <div className="pick-line">{line}</div>
            <div className="pick-juice">{stat}</div>
          </button>
        </div>
      )}
    </div>
  )
}

function AmountPicker({ value, custom, onPreset, onCustom, onChange, error }) {
  return (
    <div className="card mb-12">
      <div className="card-body">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Wager <span>(each person puts in this amount)</span></label>
          <div className="amount-presets">
            {PRESETS.map(p => (
              <button key={p} type="button" className={`amount-chip ${!custom && Number(value) === p ? 'active' : ''}`} onClick={() => onPreset(p)}>
                ${p}
              </button>
            ))}
            <button type="button" className={`amount-chip ${custom ? 'active' : ''}`} onClick={onCustom}>Custom</button>
          </div>
          {custom && (
            <input className="form-input mt-8" type="number" min="1" placeholder="Enter amount ($)" value={value} onChange={e => onChange(e.target.value)} autoFocus />
          )}
          {error && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 4 }}>{error}</div>}
        </div>
      </div>
    </div>
  )
}
