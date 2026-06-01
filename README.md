# WannaBet? — Social Credit Betting App

> Friends-only prediction challenges using demo credits with no cash value.

**Live demo:** https://kennyhin.github.io/friendly-bet-app/
**Repo:** https://github.com/kennyhin/friendly-bet-app

---

## Current State (May 31, 2026)

Full working prototype. No Firebase or payment credentials needed — runs entirely in the browser with localStorage mock data and the free ESPN public API for live sports data.

### What works end-to-end
- ✅ Create a bet — Custom Bet (anything) or Sports Bet (live games from ESPN)
- ✅ Sports Bet flow: pick sport → live games → Moneyline / Spread / O/U / Player Prop → odds pick cards
- ✅ Real ESPN odds — spread, over/under, moneyline pulled live (no API key)
- ✅ Invite link → friend accepts, sees their side / credit stake
- ✅ Demo credit staking for both players, live stake tracker
- ✅ Auto-transitions to "Live" when both players stake credits
- ✅ Winner claims result → opponent confirms or disputes
- ✅ Celebration banner for winner, "better luck next time" for loser
- ✅ Demo credits balance shown in header (tracks stakes, refunds, awards)
- ✅ "Switch perspective" user dropdown (Alice / Bob / Charlie) to demo both sides

### What's mocked (replace for production)
| Layer | Now | Replace with |
|---|---|---|
| Database | `localStorage` in `store.js` | Firebase Firestore |
| Auth | Demo user switcher | Firebase Auth (Google sign-in) |
| Credits | Demo balances in `store.js` | Server-owned non-redeemable credit ledger |
| Backend | Stubs in `backend/index.js` | Firebase Functions |
| Sports data | ESPN public API ✅ real | Keep — no change needed |

---

## Running Locally

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5174
```

---

## Project Structure

```
friendly-bet/
├── frontend/                    ← React + Vite app (THE PROTOTYPE)
│   ├── package.json             ← react, react-dom, react-router-dom, vite
│   ├── vite.config.js           ← base: './' for GH Pages
│   └── src/
│       ├── main.jsx             ← entry point
│       ├── App.jsx              ← HashRouter + 4 routes
│       ├── index.css            ← Midnight Amber design system (CSS variables)
│       ├── store.js             ← localStorage mock — SWAP THIS for Firebase
│       ├── services/
│       │   └── sportsApi.js     ← ESPN API, odds formatters, bet pick builder
│       ├── components/
│       │   ├── Header.jsx       ← WannaBet? logo + credits + user switcher
│       │   ├── BetCard.jsx      ← dashboard list item (sports-aware)
│       │   └── StatusBadge.jsx  ← status pill
│       └── pages/
│           ├── Home.jsx         ← dashboard (active / past bets)
│           ├── CreateBet.jsx    ← Custom Bet + Sports Bet tabs
│           ├── BetDetail.jsx    ← full lifecycle, credit stake, result flow
│           └── JoinBet.jsx      ← invite link landing page
│
├── backend/
│   └── index.js                 ← Firebase Functions stubs (NOT implemented)
├── database.rules               ← Firestore security rules (NOT tested)
└── .env.example                 ← env var template
```

---

## Design System — Midnight Amber

```css
--bg:      #07080f   /* near-black, deep indigo tint */
--surface: #10132a   /* card background */
--primary: #f59e0b   /* electric amber — buttons, selections */
--teal:    #2dd4bf   /* pick card selected state */
--win:     #4ade80   /* win/success green */
--danger:  #f87171   /* red */
--text:    #eceeff   /* blue-white */
```

Logo gradient: amber → teal. Sport tabs: 4-column CSS grid (all 12 sports visible, no scroll).

---

## Sports Betting (ESPN API — free, no key)

**12 sports:** NFL · NBA · MLB · NHL · NCAAF · NCAAB · MLS · EPL · PGA · ATP · UFC · F1

**Bet types:**
- **Moneyline** — who wins (real ESPN moneyline odds)
- **Spread** — team vs the spread (real ESPN spread + juice)
- **Over/Under** — total score line (real ESPN total)
- **Player Prop** — player / stat / line / over or under (manual entry)

ESPN endpoint: `site.api.espn.com/apis/site/v2/sports/{league}/scoreboard`
Returns teams, logos, game time, spread, O/U, moneyline. CORS-friendly from the browser.

---

## Bet Data Model

```js
{
  id, creatorId, opponentId,
  event,           // "NY Knicks @ San Antonio Spurs"
  creatorPick,     // "NY -4.5 (-110)"
  opponentPick,    // "SA +4.5 (-110)"
  amount,          // per-person demo credit stake
  note,
  status,          // created | awaiting_deposit | funded | pending_confirmation
                   // | paid_out | cancelled | disputed
  creatorDeposited, opponentDeposited,
  claimedWinnerId, winnerId,
  betType,         // 'custom'|'moneyline'|'spread'|'over_under'|'player_prop'
  sport,           // 'nfl'|'nba'|'mlb'|... (null for custom)
  sportEmoji, sportName, gameId,
  createdAt, updatedAt
}
```

---

## Routes (HashRouter — works on GH Pages)

| Hash | Page |
|---|---|
| `/#/` | Home — dashboard |
| `/#/create` | CreateBet — Custom or Sports tab |
| `/#/bet/:id` | BetDetail — full lifecycle |
| `/#/join/:id` | JoinBet — invite link landing |

---

## The `store.js` → Firebase Swap

Every function in `store.js` maps directly to a Firestore operation:

| `store.js` function | Firebase equivalent |
|---|---|
| `createBet(data)` | `addDoc(collection(db, 'bets'), data)` |
| `getBetById(id)` | `getDoc(doc(db, 'bets', id))` |
| `getUserBets(userId)` | `query(collection(db, 'bets'), where(...))` |
| `acceptBet(betId)` | `updateDoc` → set opponentId + status |
| `deposit(betId)` | Server transaction → stake credits, set flag, check both → funded |
| `claimWin(betId)` | `updateDoc` → set claimedWinnerId + status |
| `confirmWinner(betId, bool)` | Server transaction → set winnerId + award demo credit pot |
| `cancelBet(betId)` | `updateDoc` → status = cancelled, refund balances |

Real-time: replace `subscribe`/`useStore` pub-sub with Firestore `onSnapshot`.

---

## Deploying to GitHub Pages

```bash
# 1. Build
cd frontend && npm run build

# 2. Push source
cd .. && git push app main

# 3. Deploy dist to gh-pages branch
cd /tmp && rm -rf fb-gh-pages && mkdir fb-gh-pages
cp -r "/path/to/Friendly Bet/frontend/dist/." fb-gh-pages/
cd fb-gh-pages
git init && git add . && git commit -m "Deploy"
git remote add origin https://github.com/kennyhin/friendly-bet-app
git push -f origin main:gh-pages
```

---

## Next Steps (Priority Order)

1. **Firebase project** — enable Firestore + Auth (Google sign-in provider)
2. **Server-owned credit ledger** — balances, stake holds, refunds, awards, audit events
3. **Fill in `.env`** — copy `.env.example`, add Firebase keys
4. **Swap `store.js`** — replace localStorage with real Firestore calls (table above)
5. **Real auth** — replace user switcher with `signInWithGoogle()` + Firebase Auth state
6. **Dispute/admin tools** — manual result resolution and balance correction
7. **Production deploy** — frontend → Vercel, backend → Firebase Functions

### UX backlog
- Push notifications (Firebase Cloud Messaging) when opponent accepts / stakes
- Auto-resolution via sports results API (winner determined automatically)
- Leaderboard between a group of friends
- Chat between bettors on a bet
- Social sharing ("I just staked 50 credits on the Chiefs")
- Full odds coverage via [The Odds API](https://the-odds-api.com/) (free tier: 500 req/mo)

---

## Legal

Friendly Bet / WannaBet? currently uses demo credits with no cash value. Do not add redemption, withdrawals, prizes, crypto, gift cards, or transferable value without legal review. Not affiliated with any sports league or organization.

---

*Built with Claude Code — prototype complete May 2026*
