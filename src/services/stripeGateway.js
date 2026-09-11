// The server endpoint owns Stripe credentials; the client does not need a secret or publishable key.
export const isStripeConfigured = true;

export async function createStripeCheckout({ booking, amount }) {
  const response = await fetch('/api/stripe-create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookingRef: booking.bookingRef,
      serviceTitle: booking.serviceTitle,
      servicePrice: amount,
      customerEmail: booking.customerEmail || undefined
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.url) throw new Error(payload.error || 'Stripe checkout could not be started');
  window.location.assign(payload.url);
}
