// FriendlyBet - Firebase Functions Entry Point

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Stripe = require('stripe');

admin.initializeApp();

// Stripe initialization (keys would be in Firebase config)
const stripe = Stripe(functions.config().stripe.secret_key);

// Middleware to verify Firebase ID token
const authMiddleware = (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).send({ error: { message: 'Unauthorized' } });
  }
  
  admin.auth().verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      next();
    })
    .catch(error => {
      res.status(401).send({ error: { message: 'Invalid token' } });
    });
};

// Health check
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from FriendlyBet API!");
});

// Example bet creation endpoint
exports.createBet = functions.https.onRequest(async (req, res) => {
  // Apply auth middleware
  authMiddleware(req, res, () => {
    // In a real implementation, this would:
    // 1. Validate request body
    // 2. Create bet document in Firestore
    // 3. Generate invite link
    // 4. Return bet info
    
    res.send({
      message: "Bet creation endpoint - implement full logic here",
      exampleResponse: {
        betId: "bet_example123",
        status: "pending",
        inviteLink: "https://friendlybet.app/bet/bet_example123?invite=abc"
      }
    });
  });
});

// Example join bet endpoint
exports.joinBet = functions.https.onRequest(async (req, res) => {
  authMiddleware(req, res, () => {
    res.send({
      message: "Join bet endpoint - implement full logic here"
    });
  });
});

// Example deposit endpoint
exports.depositFunds = functions.https.onRequest(async (req, res) => {
  authMiddleware(req, res, () => {
    res.send({
      message: "Deposit funds endpoint - implement Stripe integration here"
    });
  });
});

// Stripe webhook endpoint
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, functions.config().stripe.webhook_secret);
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Handle successful payment
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object;
      // Handle failed payment
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});
