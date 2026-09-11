import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!stripe) return res.status(503).json({ error: 'Stripe is not configured' });

  try {
    const { bookingRef, serviceTitle, servicePrice, customerEmail } = req.body || {};
    const labor = Number(servicePrice);
    if (!bookingRef || !serviceTitle || !Number.isFinite(labor) || labor <= 0 || labor > 500000) {
      return res.status(400).json({ error: 'Invalid booking payment details' });
    }

    const totalInPaise = Math.round((labor + 20) * 100);
    const origin = req.headers.origin || process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` || 'http://localhost:5173';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: typeof customerEmail === 'string' ? customerEmail : undefined,
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: { name: serviceTitle, description: `HOMMIE booking ${bookingRef}` },
          unit_amount: totalInPaise
        },
        quantity: 1
      }],
      metadata: { bookingRef },
      success_url: `${origin}/?payment=success&booking=${encodeURIComponent(bookingRef)}`,
      cancel_url: `${origin}/?payment=cancelled&booking=${encodeURIComponent(bookingRef)}`,
      integration_identifier: `hommie_checkout_${Math.random().toString(36).slice(2, 10)}`
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('[stripe-create-checkout]', error.message);
    return res.status(500).json({ error: 'Unable to create secure checkout' });
  }
}
