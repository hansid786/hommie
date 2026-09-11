/**
 * Serverless Webhook Endpoint for Razorpay & Supabase (Vercel Node.js Function)
 * Listens for payment.captured, payment.failed, and refund.processed
 */

import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  if (!webhookSecret || !signature) return res.status(503).json({ error: 'Razorpay webhook is not configured' });

  const expected = crypto.createHmac('sha256', webhookSecret).update(JSON.stringify(req.body)).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  const signatureBuffer = Buffer.from(String(signature), 'utf8');
  if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return res.status(400).json({ error: 'Invalid Webhook Signature' });
  }

  const event = req.body.event;
  const payload = req.body.payload;

  console.info(`[Razorpay Webhook Received]: ${event}`);

  if (event === 'payment.captured') {
    const payment = payload.payment.entity;
    const bookingRef = payment.notes?.bookingRef || payment.description;
    console.log(`✅ Payment Captured for Booking: ${bookingRef}, Amount: ₹${payment.amount / 100}`);
    
    // Here you can update Supabase DB:
    // await supabase.from('bookings').update({ payment_status: 'paid', payment_id: payment.id }).eq('booking_ref', bookingRef);
  }

  return res.status(200).json({ status: 'ok', received: true });
}
