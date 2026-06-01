# Friendly Bet

A peer-to-peer sports betting app for friends.

## Overview

This app allows friends to create bets on sports games, deposit money into escrow, and have the winner automatically paid out after the game.

## Tech Stack

- **Frontend**: React/Vue (TBD)
- **Backend**: Node.js/Express
- **Database**: Firebase Firestore
- **Payments**: Stripe Connect
- **Authentication**: Firebase Auth (Google sign-in)

## Features

- Create bets on NBA games (or any sport)
- Invite friends to take the opposite side
- Both players deposit money via Stripe
- Automatic payout to winner after game ends
- Game result verification (manual or API)
- Bet history

## Setup

1. Create Firebase project
2. Set up Stripe Connect account
3. Configure environment variables
4. Install dependencies: `npm install`
5. Start server: `npm start`

## Environment Variables

- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account JSON
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `PORT` - Server port (default: 3000)

## Legal Notice

This is a gambling application. Please check local laws and regulations before use.