# Friendly Bet - Peer-to-Peer Sports Betting App

## Overview
Friendly Bet is a peer-to-peer betting platform designed for friends to create and settle bets on sports games, events, or any agreeable outcome. Built with security, transparency, and ease of use in mind.

## Tech Stack

### Frontend
- React/Vue.js (TBD) - Responsive web interface
- Tailwind CSS - Utility-first styling
- Web3Modal/WalletConnect (optional) - Crypto wallet integration

### Backend
- Node.js/Express - REST API server
- Firebase/Firestore - Real-time database
- Firebase Authentication - User management (Google sign-in)
- Stripe Connect - Payment processing & payouts

### Infrastructure
- Vercel/Netlify - Frontend hosting
- Firebase Functions - Backend hosting (optional)
- MongoDB Atlas/PostgreSQL - Alternative DB option

## Core Features

### 1. Bet Creation
- Select teams/participants
- Set wager amount
- Add description/terms
- Generate shareable link/invite

### 2. Peer Interaction
- Invite friends via link, SMS, or app notification
- Friends accept and choose their position
- Both parties confirm participation

### 3. Secure Payments
- Stripe Connect integration
- Funds held in escrow until bet settlement
- Instant payouts to winner's bank account
- PCI-DSS compliant payment processing

### 4. Result Resolution
- Manual confirmation (both parties agree)
- Optional API integration for auto-resolution (sports, weather, etc.)
- Dispute resolution mechanism

### 5. User Experience
- Clean, intuitive interface
- Real-time updates
- Transaction history
- Bet history and statistics
- Mobile-responsive design

## Data Models

### Bet
```javascript
{
  id: string,
  creatorId: string,        // User who created the bet
  opponentId: string|null,  // User who accepted the bet (null until accepted)
  event: {
    id: string,             // External event ID (game, match, etc.)
    name: string,           // e.g., "Spurs vs Lakers"
    sport: string,          // e.g., "basketball"
    startTime: timestamp,
    endTime: timestamp|null // When result is known
  },
  terms: {
    creatorChoice: string,  // What creator is betting on
    opponentChoice: string|null, // What opponent chose
    amount: number,         // Wager amount in USD
    currency: string = "usd"
  },
  status: enum[             // Bet lifecycle states
    'created',      // Bet created, waiting for opponent
    'awaiting_deposit', // Opponent accepted, waiting for funds
    'funded',       // Both parties have deposited
    'settled',      // Event concluded, winner determined
    'paid_out',     // Winner has been paid
    'cancelled',    // Bet was cancelled
    'disputed'      // Parties disagree on outcome
  ],
  timestamps: {
    createdAt: timestamp,
    updatedAt: timestamp,
    settledAt: timestamp|null,
    paidOutAt: timestamp|null
  },
  metadata: {
    description: string,
    tags: string[],         // e.g., ['nba', 'basketball', 'playoffs']
    isPrivate: boolean      // True for friend-only bets
  }
}
```

### User
```javascript
{
  id: string,               // Firebase UID
  email: string,
  displayName: string,
  photoURL: string|null,
  stripeAccountId: string|null, // Connected Stripe account
  createdAt: timestamp,
  totalBets: number,
  totalWon: number,
  totalLost: number,
  totalEarned: number       // Net winnings
}
```

### Transaction
```javascript
{
  id: string,
  betId: string,
  type: enum['deposit', 'payout', 'refund', 'fee'],
  amount: number,
  currency: string,
  status: enum['pending', 'succeeded', 'failed'],
  stripePaymentIntentId: string|null,
  stripeTransferId: string|null,
  userId: string,           // Which user this transaction affects
  createdAt: timestamp
}
```

## Payment Flow (Stripe Connect)

1. **Account Connection**: Users connect their Stripe account via OAuth
2. **Deposit**: 
   - User A deposits $X → Money goes to Platform's Stripe account (held in escrow)
   - User B deposits $X → Money goes to Platform's Stripe account (held in escrow)
3. **Payout**:
   - On bet resolution: Platform transfers $2X to winner's Stripe account
   - Winner can then transfer to their bank

### Stripe Fees
- 2.9% + $0.30 per successful charge
- Additional 0.25% for Instant Payouts (optional)
- No charge for failed payments

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user profile

### Bets
- `GET /api/bets` - List user's bets
- `POST /api/bets` - Create new bet
- `GET /api/bets/:id` - Get bet details
- `PUT /api/bets/:id` - Update bet (accept, choose side, etc.)
- `DELETE /api/bets/:id` - Cancel bet
- `POST /api/bets/:id/confirm-result` - Confirm bet result

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/confirm-payment` - Confirm payment success
- `POST /api/webhook/stripe` - Stripe webhook endpoint

### Events (Optional - for auto-resolution)
- `GET /api/events/sports/nba/today` - Get today's NBA games
- `GET /api/events/sports/nba/:date` - Get NBA games for date
- `GET /api/events/sports/nba/:gameId` - Get specific game details

## Security Considerations

1. **Authentication**: Firebase Auth with Google sign-in
2. **Authorization**: Firestore security rules (see database.rules)
3. **Payment Security**: Stripe handles PCI compliance
4. **Data Protection**: All sensitive data encrypted at rest
5. **Rate Limiting**: Prevent abuse of API endpoints
6. **Input Validation**: Sanitize all user inputs
7. **CSRF Protection**: Implement CSRF tokens for forms
8. **HTTPS Only**: Enforce TLS for all connections

## Deployment

### Local Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Firebase, Stripe, and other secrets

# Start development server
npm run dev
```

### Production
1. Set up Firebase project
2. Configure Stripe Connect account
3. Set environment variables
4. Deploy frontend to Vercel/Netlify
5. Deploy backend to Firebase Functions or traditional server
6. Configure webhooks in Stripe dashboard

## Future Enhancements

- [ ] Crypto wallet integration (USDC, Ethereum)
- [ ] Group bets (more than 2 people)
- [ ] Bet sharing to social media
- [ ] Leaderboards and achievements
- [ ] Chat functionality between bettors
- [ ] Bet templates for common wagers
- [ ] Push notifications
- [ ] Mobile app (React Native/Flutter)
- [ ] League/tournament betting
- [ ] Props betting (player stats, etc.)

## Legal Disclaimer

⚠️ **Important**: Friendly Bet facilitates peer-to-peer betting between consenting adults. Users are responsible for ensuring that their use of the platform complies with all local, state, and federal laws regarding gambling and money transmission. The platform does not provide legal advice.

Stripe Connect is used for payment processing, but users should review Stripe's Terms of Service and Acceptable Use Policy.

For questions about legality in your jurisdiction, consult with a qualified attorney.

---

*Built with ❤️ for friendly competition*