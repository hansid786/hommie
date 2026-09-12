// Production Payment Gateway & Escrow Settlement Engine
// Integrates Razorpay India SDK, Dynamic UPI QR Code, Stripe, and Escrow Verification

export const PAYMENT_MODES = {
  RAZORPAY_UPI: 'Razorpay Instant UPI & Cards',
  DIRECT_UPI_QR: 'Dynamic UPI QR Code (GPay / PhonePe / Paytm)',
  CASH_ON_DELIVERY: 'Cash / Direct UPI upon Completion'
};

export const calculateServiceFeeBreakdown = (baseLaborPrice) => {
  const labor = parseFloat(baseLaborPrice || 0);
  const platformTechFee = 10.00; // Fixed transparent tech fee
  const workerWelfareFund = 10.00; // Worker insurance & safety fund
  const totalCustomerPays = labor + platformTechFee + workerWelfareFund;
  const workerTakesHome = labor;
  const workerPayoutPercentage = parseFloat(((workerTakesHome / totalCustomerPays) * 100).toFixed(1));

  return {
    laborPrice: labor,
    platformTechFee,
    workerWelfareFund,
    totalCustomerPays,
    workerTakesHome,
    workerPayoutPercentage
  };
};

// Load Razorpay Checkout Script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateRazorpayPayment = async ({
  booking,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure
}) => {
  const isLoaded = await loadRazorpayScript();
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!RAZORPAY_KEY) {
    if (onFailure) onFailure('Secure payment is not configured yet');
    return false;
  }

  if (!isLoaded || !window.Razorpay) {
    if (onFailure) onFailure('Razorpay SDK could not be initialized');
    return false;
  }

  const options = {
    key: RAZORPAY_KEY,
    amount: Math.round(amount * 100), // in paise
    currency: 'INR',
    name: 'Doorstep Pro Services',
    description: `Booking #${booking.bookingRef} — ${booking.serviceTitle}`,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100&auto=format&fit=crop&q=80',
    prefill: {
      name: customerName || 'Hanzala',
      email: customerEmail || 'customer@example.com',
      contact: customerPhone || '+919845077123'
    },
    theme: {
      color: '#059669' // Emerald
    },
    handler: function (response) {
      if (!response?.razorpay_payment_id || !response?.razorpay_order_id || !response?.razorpay_signature) {
        if (onFailure) onFailure('Payment could not be verified. Please do not retry repeatedly; contact support if charged.');
        return;
      }
      if (onSuccess) {
        onSuccess({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          gateway: 'razorpay',
          verificationRequired: true
        });
      }
    },
    modal: {
      ondismiss: function () {
        if (onFailure) onFailure('Payment dismissed by customer');
      }
    }
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.open();
    return true;
  } catch (err) {
    if (onFailure) onFailure(err.message);
    return false;
  }
};
