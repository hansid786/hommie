import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).json({ error: 'Stripe webhook is not configured. Add STRIPE_WEBHOOK_SECRET from the Stripe webhook endpoint.' });

  const rawBody = await readRawBody(req);
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${error.message}` });
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object;
    if (session.payment_status === 'paid' || event.type === 'checkout.session.async_payment_succeeded') {
      console.info('[stripe-webhook] verified payment', session.metadata?.bookingRef, session.payment_intent);
    }
  }

  return res.status(200).json({ received: true });
}
