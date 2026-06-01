# FriendlyBet - Data Models

## User
Stored in Firebase Auth + Firestore `users` collection

```javascript
{
  uid: string, // Firebase UID
  email: string,
  displayName: string,
  photoURL: string,
  createdAt: timestamp,
  stripeAccountId: string, // Stripe Connect account ID (when onboarded)
  settings: {
    notifications: boolean,
    emailUpdates: boolean
  }
}
```

## Bet
Firestore `bets` collection

```javascript
{
  betId: string, // auto-generated ID
  creatorUid: string, // references users/{uid}
  opponentUid: string | null,
  
  sport: string, // basketball, football, etc.
  teams: string, // "Spurs vs Lakers"
  gameDate: timestamp,
  
  betType: string, // winner, spread, over-under, prop
  selection: string, // creator's pick
  opponentSelection: string | null,
  
  amount: number, // in USD (what each person puts in)
  description: string,
  
  status: string, // pending, waiting_for_opponent, funded, settled, cancelled, disputed
  
  creatorDeposit: boolean,
  opponentDeposit: boolean,
  
  result: string | null, // creator_win, opponent_win, push
  
  createdAt: timestamp,
  updatedAt: timestamp,
  settledAt: timestamp | null
}
```

## Transaction
Firestore `transactions` collection

```javascript
{
  transactionId: string,
  betId: string, // references bets/{betId}
  userId: string, // references users/{uid}
  
  type: string, // deposit, withdrawal, refund, platform_fee
  amount: number, // in USD cents (Stripe uses cents)
  currency: string, // usd
  
  stripePaymentIntentId: string,
  stripeTransferId: string, // for payouts
  
  status: string, // pending, succeeded, failed, cancelled
  
  description: string,
  
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## GameResult (optional, for API verification)
Firestore `gameResults` collection

```javascript
{
  gameId: string, // external API game ID
  sport: string,
  homeTeam: string,
  awayTeam: string,
  gameDate: timestamp,
  
  homeScore: number,
  awayScore: number,
  
  winner: string, // homeTeam or awayTeam
  
  // For spread bets
  spread: number, // point spread (negative = home team favored)
  
  // For over/under
  totalPoints: number,
  
  retrievedAt: timestamp,
  source: string // balldontlie, espn, etc.
}
```

## Relationships
- A User can create many Bets (as creator)
- A User can join many Bets (as opponent)
- A Bet has exactly 2 participants (creator and opponent)
- A Bet has many Transactions (deposits, payouts, fees)
- A Bet has at most 1 GameResult (if using API verification)