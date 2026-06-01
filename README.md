# Friendly Bet — Peer-to-Peer Betting App

> Friends-only betting with secure escrow and automatic payouts via Stripe Connect.

---

## Current State (as of May 31, 2026)

**A fully working prototype is built and running.** The frontend is a complete React app with mock data (localStorage) standing in for Firebase and Stripe. Every screen of the core bet lifecycle is functional and testable in the browser right now — no backend credentials required.

### What's working end-to-end
- Create a bet (event, picks, amount, optional note)
- Live preview card while filling the form
- Invite link generation for the opponent
- Friend accepts bet via invite link (sees their side/buy-in)
- Mock Stripe deposit flow for both players (with loading + success states)
- Deposit tracker (shows who's paid, auto-transitions to "Live" when both deposit)
- Winner claims result → opponent confirms or disputes
- Winner sees celebration banner; loser sees "Better luck next time"
- "Demo mode" user switcher in the header (Alice / Bob / Charlie) to play all sides

### What's mocked (needs real implementation)
- **Auth**: user switcher replaces Google sign-in — swap for Firebase Auth
- **Database**: localStorage replaces Firestore — swap `store.js` functions
- **Payments**: fake card form replaces real Stripe — swap with Stripe Payment Element + backend

---

## Project Structure

```
friendly-bet/
├── frontend/               ← React + Vite app (THE WORKING PROTOTYPE)
│   ├── index.html
│   ├── package.json        ← npm deps: react, react-dom, react-router-dom, vite
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx        ← entry point
│       ├── App.jsx         ← HashRouter + routes
│       ├── index.css       ← all styles (CSS variables, components, layout)
│       ├── store.js        ← localStorage mock store (swap this for Firebase)
│       ├── components/
│       │   ├── Header.jsx      ← sticky header + demo user switcher
│       │   ├── BetCard.jsx     ← compact bet card for home page list
│       │   └── StatusBadge.jsx ← status pill (created/live/settled/etc.)
│       └── pages/
│           ├── Home.jsx        ← dashboard: active + past bets
│           ├── CreateBet.jsx   ← bet creation form with live preview
│           ├── BetDetail.jsx   ← full lifecycle view + deposit + result flow
│           └── JoinBet.jsx     ← invite accept page (opponent's entry point)
│
├── backend/
│   └── index.js            ← Firebase Functions stubs (NOT implemented yet)
│
├── database.rules          ← Firestore security rules (defined, untested)
├── docs/
│   ├── API.md
│   └── DATA_MODELS.md
└── .claude/
    └── launch.json         ← dev server config for Claude Code preview
```

---

## Running Locally

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5174
```

---

## Bet Lifecycle (Data Model)

```
created → awaiting_deposit → funded → pending_confirmation → paid_out
                                                           ↘ disputed
          (also: cancelled at any pre-funded stage)
```

Each bet in the store:
```js
{
  id: string,
  creatorId: string,          // 'alice' | 'bob' | 'charlie' (mock user IDs)
  opponentId: string | null,
  event: string,              // "Lakers vs Celtics"
  creatorPick: string,        // "Lakers"
  opponentPick: string,       // "Celtics"
  amount: number,             // per-person amount
  note: string,
  status: string,             // see lifecycle above
  creatorDeposited: boolean,
  opponentDeposited: boolean,
  claimedWinnerId: string | null,
  winnerId: string | null,
  createdAt: number,
  updatedAt: number,
}
```

---

## Routes

| Path | Page | Notes |
|------|------|-------|
| `/#/` | Home | Dashboard, list of user's bets |
| `/#/create` | CreateBet | Form + live preview |
| `/#/bet/:id` | BetDetail | Full lifecycle, deposit, result |
| `/#/join/:id` | JoinBet | Invite link destination |

Hash-based routing (react-router-dom HashRouter) so it works on GitHub Pages without server config.

---

## The store.js Swap Plan (Firebase)

When you're ready to wire in real Firebase, `frontend/src/store.js` is the only file that needs replacing. Every exported function maps directly to a Firestore operation:

| Current mock function | Real Firebase equivalent |
|---|---|
| `createBet(data)` | `addDoc(collection(db, 'bets'), data)` |
| `getBetById(id)` | `getDoc(doc(db, 'bets', id))` |
| `getUserBets(userId)` | `query(collection(db, 'bets'), where(...))` |
| `deposit(betId)` | `updateDoc` + check both deposits → update status |
| `acceptBet(betId)` | `updateDoc(doc(db, 'bets', betId), { opponentId, status })` |
| `claimWin(betId)` | `updateDoc` → set claimedWinnerId + status |
| `confirmWinner(betId, confirmed)` | `updateDoc` → set winnerId + trigger payout |

Real-time updates: swap the `subscribe` / `useStore` pattern for Firestore `onSnapshot`.

---

## The Stripe Integration Plan

1. **User onboarding**: Stripe Connect OAuth — user links their bank account
2. **Deposit**: Create a `PaymentIntent` on the backend for `amount`, charge the user's card, hold funds in platform Stripe account (escrow)
3. **Payout**: On `confirmWinner`, backend calls `stripe.transfers.create` to send `amount * 2` to winner's connected Stripe account
4. **Frontend**: Replace the mock card form in `BetDetail.jsx → DepositFlow` with a real [Stripe Payment Element](https://stripe.com/docs/payments/payment-element)

Backend endpoints needed (stub skeletons exist in `backend/index.js`):
- `POST /createPaymentIntent` — creates Stripe PaymentIntent, returns client secret
- `POST /confirmPayout` — transfers funds to winner's Stripe account
- `POST /webhook/stripe` — handles `payment_intent.succeeded` events

---

## Next Steps (Priority Order)

1. **Set up Firebase project** — enable Firestore + Firebase Auth (Google provider)
2. **Set up Stripe Connect** — apply for Standard or Express account
3. **Wire up `.env`** — copy `.env.example`, fill in Firebase + Stripe keys
4. **Replace `store.js`** — swap localStorage calls for Firestore (see table above)
5. **Add real auth** — replace demo user switcher with `signInWithGoogle()` + Firebase Auth state
6. **Wire Stripe deposits** — replace `DepositFlow` component with Stripe Payment Element
7. **Implement payout** — backend `confirmPayout` endpoint → `stripe.transfers.create`
8. **Deploy** — frontend to Vercel/Netlify, backend to Firebase Functions

---

## Tech Stack (Final)

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + react-router-dom (HashRouter) |
| Styling | Custom CSS (CSS variables, no framework) |
| Mock data | localStorage (prototype only) |
| Real database | Firebase Firestore |
| Auth | Firebase Auth (Google sign-in) |
| Payments | Stripe Connect (escrow + payouts) |
| Backend | Firebase Functions (Node.js) |
| Hosting | Frontend → Vercel / Backend → Firebase Functions |

---

## Legal Note

Friendly Bet facilitates peer-to-peer bets between consenting adults. Users are responsible for ensuring compliance with local laws on gambling and money transmission. Consult a qualified attorney before launching publicly.

---

*Built with Claude Code — prototype complete May 2026*
