import { useState, useEffect } from 'react'

const KEY = 'fb_v1'

const MOCK_USERS = [
  { id: 'alice', name: 'Alice Chen', initials: 'AC', color: '#2563eb' },
  { id: 'bob', name: 'Bob Smith', initials: 'BS', color: '#10b981' },
  { id: 'charlie', name: 'Charlie Davis', initials: 'CD', color: '#f59e0b' },
]

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return { bets: [], currentUserId: 'alice' }
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
  listeners.forEach(fn => fn())
}

const listeners = new Set()

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useStore() {
  const [, tick] = useState(0)
  useEffect(() => {
    const unsub = subscribe(() => tick(n => n + 1))
    return unsub
  }, [])
}

export const getUsers = () => MOCK_USERS
export const getUserById = (id) => MOCK_USERS.find(u => u.id === id)

export function getCurrentUser() {
  return getUserById(load().currentUserId)
}

export function setCurrentUser(id) {
  const data = load()
  data.currentUserId = id
  save(data)
}

export function getBets() {
  return load().bets
}

export function getBetById(id) {
  return load().bets.find(b => b.id === id)
}

export function getUserBets(userId) {
  return load().bets.filter(b => b.creatorId === userId || b.opponentId === userId)
}

export function createBet(betData) {
  const { event, creatorPick, opponentPick, amount, note, ...rest } = betData
  const data = load()
  const bet = {
    id: Math.random().toString(36).slice(2, 10),
    creatorId: data.currentUserId,
    opponentId: null,
    event,
    creatorPick,
    opponentPick,
    amount: Number(amount),
    note: note || '',
    betType: 'custom',
    sport: null,
    sportEmoji: null,
    sportName: null,
    ...rest,
    status: 'created',
    creatorDeposited: false,
    opponentDeposited: false,
    claimedWinnerId: null,
    winnerId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  data.bets.push(bet)
  save(data)
  return bet
}

export function acceptBet(betId) {
  const data = load()
  const idx = data.bets.findIndex(b => b.id === betId)
  if (idx < 0) return null
  data.bets[idx] = {
    ...data.bets[idx],
    opponentId: data.currentUserId,
    status: 'awaiting_deposit',
    updatedAt: Date.now(),
  }
  save(data)
  return data.bets[idx]
}

export function deposit(betId) {
  const data = load()
  const idx = data.bets.findIndex(b => b.id === betId)
  if (idx < 0) return null
  const bet = data.bets[idx]
  const isCreator = bet.creatorId === data.currentUserId
  const update = isCreator
    ? { creatorDeposited: true }
    : { opponentDeposited: true }
  const updated = { ...bet, ...update, updatedAt: Date.now() }
  if (updated.creatorDeposited && updated.opponentDeposited) {
    updated.status = 'funded'
  }
  data.bets[idx] = updated
  save(data)
  return data.bets[idx]
}

export function claimWin(betId) {
  const data = load()
  const idx = data.bets.findIndex(b => b.id === betId)
  if (idx < 0) return null
  data.bets[idx] = {
    ...data.bets[idx],
    status: 'pending_confirmation',
    claimedWinnerId: data.currentUserId,
    updatedAt: Date.now(),
  }
  save(data)
  return data.bets[idx]
}

export function confirmWinner(betId, confirmed) {
  const data = load()
  const idx = data.bets.findIndex(b => b.id === betId)
  if (idx < 0) return null
  data.bets[idx] = {
    ...data.bets[idx],
    status: confirmed ? 'paid_out' : 'disputed',
    winnerId: confirmed ? data.bets[idx].claimedWinnerId : null,
    updatedAt: Date.now(),
  }
  save(data)
  return data.bets[idx]
}

export function cancelBet(betId) {
  const data = load()
  const idx = data.bets.findIndex(b => b.id === betId)
  if (idx < 0) return null
  data.bets[idx] = {
    ...data.bets[idx],
    status: 'cancelled',
    updatedAt: Date.now(),
  }
  save(data)
  return data.bets[idx]
}

export function resetAllData() {
  localStorage.removeItem(KEY)
  listeners.forEach(fn => fn())
}
