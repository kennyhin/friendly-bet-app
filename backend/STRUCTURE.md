# FriendlyBet - Backend Structure

## Firebase Functions Structure
```
functions/
├── index.js              # Main entry point
├── bets.js               # Bet-related endpoints
├── payments.js           # Stripe payment handling
├── webhooks.js           # Stripe webhook handlers
├── utils/
│   ├── auth.js           # Auth middleware
│   ├── validation.js     # Input validation
│   └── sports-api.js     # Sports data integration
└── config/
    └── stripe.js         # Stripe configuration
```

## Key Endpoints
- POST /bets
- POST /bets/:betId/join
- POST /bets/:betId/deposit
- GET /bets/:betId
- POST /bets/:betId/settle
- GET /me/bets
- POST /webhooks/stripe

## Stripe Integration
- Uses Stripe Connect (Standard accounts)
- Onboarding flow for users to connect their bank
- PaymentIntents for secure card processing
- Automatic transfers to winner on settlement
- Application fee (platform takes small percentage)

## Security Measures
- Firebase Auth middleware on all endpoints
- Input validation and sanitization
- Stripe webhook signature verification
- Rate limiting on sensitive endpoints
- HTTPS only (Firebase enforces this)
- No sensitive data stored (PCI via Stripe)

## Deployment
- Deploy via Firebase CLI: `firebase deploy --only functions`
- Environment variables for Stripe keys
- Separate dev/prod projects