# FriendlyBet API Documentation

## Base URL
`/api/v1`

## Authentication
All endpoints require a valid Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

## Users
### Get Current User
`GET /me`

Returns:
```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "photoURL": "string",
  "createdAt": "timestamp"
}
```

## Bets
### Create a Bet
`POST /bets`

Body:
```json
{
  "sport": "basketball",
  "teams": "Spurs vs Lakers",
  "gameDate": "2026-06-01T20:00:00Z",
  "betType": "winner",
  "selection": "Spurs", // user's selection
  "amount": 10,
  "description": "Friendly wager"
}
```

Response:
```json
{
  "betId": "bet_abc123",
  "status": "pending",
  "inviteLink": "https://friendlybet.app/bet/bet_abc123?invite=xyz"
}
```

### Join a Bet
`POST /bets/:betId/join`

Body:
```json
{
  "selection": "Lakers" // must be different from creator's selection for winner bets
}
```

### Deposit Funds
`POST /bets/:betId/deposit`

Body:
```json
{
  "paymentMethodId": "pm_card_visa", // from Stripe Elements
  "amount": 10 // in USD
}
```

Triggers Stripe PaymentIntent creation and confirmation.

### Get Bet Status
`GET /bets/:betId`

Returns:
```json
{
  "betId": "bet_abc123",
  "creator": { "uid": "...", "displayName": "..." },
  "opponent": { "uid": "...", "displayName": "..." } | null,
  "sport": "basketball",
  "teams": "Spurs vs Lakers",
  "gameDate": "2026-06-01T20:00:00Z",
  "betType": "winner",
  "selection": "Spurs",
  "opponentSelection": "Lakers" | null,
  "amount": 10,
  "description": "Friendly wager",
  "status": "pending|waiting_for_opponent|funded|settled|cancelled",
  "creatorDeposit": true|false,
  "opponentDeposit": true|false,
  "result": "creator_win|opponent_win|push" | null,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Settle Bet
`POST /bets/:betId/settle`

Body (only callable after game ends and both deposits confirmed):
```json
{
  "result": "creator_win" // or "opponent_win" or "push"
}
```

Transfers funds via Stripe Connect:
- Winner receives amount * 2 (minus platform fee)
- In case of push, both get their amount back

### List User's Bets
`GET /me/bets`

Query params: `status` (optional), `limit` (default 20), `offset` (default 0)

Returns array of bet objects.

## Webhooks
### Stripe Webhook
`POST /webhooks/stripe`

Expects Stripe signature verification. Handles:
- `payment_intent.succeeded` - mark deposit as complete
- `payment_intent.payment_failed` - mark deposit as failed
- `account.updated` - for Connect onboarding

## Error Responses
All errors return:
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object" | null
  }
}
```