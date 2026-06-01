import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBet, getCurrentUser } from '../store'

const PRESETS = [5, 10, 20, 50, 100]

export default function CreateBet() {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const [form, setForm] = useState({
    event: '',
    creatorPick: '',
    opponentPick: '',
    amount: '',
    note: '',
  })
  const [customAmount, setCustomAmount] = useState(false)
  const [errors, setErrors] = useState({})

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.event.trim()) e.event = 'Required'
    if (!form.creatorPick.trim()) e.creatorPick = 'Required'
    if (!form.opponentPick.trim()) e.opponentPick = 'Required'
    if (!form.amount || Number(form.amount) < 1) e.amount = 'Enter a valid amount'
    return e
  }

  function submit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const bet = createBet(form)
    navigate(`/bet/${bet.id}?new=1`)
  }

  const filled = form.event && form.creatorPick && form.opponentPick && form.amount

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>← Back</button>
      </div>

      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>Create a bet</h1>
      <p className="text-muted mb-20" style={{ fontSize: '0.9rem' }}>
        Set the terms, then share a link with your friend to lock it in.
      </p>

      <form onSubmit={submit}>
        <div className="card">
          <div className="card-body">

            <div className="form-group">
              <label className="form-label">
                Event or topic
              </label>
              <input
                className="form-input"
                placeholder="e.g. Lakers vs Clippers, Jan 15"
                value={form.event}
                onChange={e => set('event', e.target.value)}
              />
              {errors.event && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 4 }}>{errors.event}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Your pick</label>
                <input
                  className="form-input"
                  placeholder="e.g. Lakers"
                  value={form.creatorPick}
                  onChange={e => set('creatorPick', e.target.value)}
                />
                {errors.creatorPick && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 4 }}>{errors.creatorPick}</div>}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Opponent's pick</label>
                <input
                  className="form-input"
                  placeholder="e.g. Clippers"
                  value={form.opponentPick}
                  onChange={e => set('opponentPick', e.target.value)}
                />
                {errors.opponentPick && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 4 }}>{errors.opponentPick}</div>}
              </div>
            </div>

          </div>
        </div>

        <div className="card mt-16">
          <div className="card-body">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Wager amount <span>(each person puts in this amount)</span></label>
              <div className="amount-presets">
                {PRESETS.map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`amount-chip ${!customAmount && Number(form.amount) === p ? 'selected' : ''}`}
                    onClick={() => { set('amount', String(p)); setCustomAmount(false) }}
                  >
                    ${p}
                  </button>
                ))}
                <button
                  type="button"
                  className={`amount-chip ${customAmount ? 'selected' : ''}`}
                  onClick={() => { setCustomAmount(true); set('amount', '') }}
                >
                  Custom
                </button>
              </div>
              {customAmount && (
                <input
                  className="form-input mt-8"
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  autoFocus
                />
              )}
              {errors.amount && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: 4 }}>{errors.amount}</div>}
            </div>
          </div>
        </div>

        <div className="card mt-16">
          <div className="card-body">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Note <span>(optional)</span>
              </label>
              <input
                className="form-input"
                placeholder="Any extra terms or context..."
                value={form.note}
                onChange={e => set('note', e.target.value)}
              />
            </div>
          </div>
        </div>

        {filled && (
          <div className="card mt-16" style={{ border: '2px solid var(--primary)' }}>
            <div className="card-header" style={{ background: 'var(--primary-light)' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>Preview</span>
            </div>
            <div className="card-body">
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>{form.event}</div>
              <div className="bet-vs-row">
                <div className="bet-vs-side creator">
                  <div className="vs-pick-label">Your pick</div>
                  <div className="vs-pick-value">{form.creatorPick}</div>
                  <div className="vs-pick-name">{user.name}</div>
                </div>
                <div className="bet-vs-divider">VS</div>
                <div className="bet-vs-side opponent">
                  <div className="vs-pick-label">Opponent's pick</div>
                  <div className="vs-pick-value">{form.opponentPick}</div>
                  <div className="vs-pick-name">Your friend</div>
                </div>
              </div>
              {form.amount && (
                <div className="bet-amount-row mt-12">
                  <div>
                    <div className="bet-amount-value">${Number(form.amount) * 2}</div>
                    <div className="bet-amount-label">total pot</div>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>·</div>
                  <div>
                    <div className="bet-amount-value" style={{ fontSize: '1.1rem' }}>${form.amount} each</div>
                    <div className="bet-amount-label">per person</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-20">
          <button type="submit" className="btn btn-primary btn-lg btn-full">
            Create bet & get invite link →
          </button>
        </div>
      </form>
    </div>
  )
}
