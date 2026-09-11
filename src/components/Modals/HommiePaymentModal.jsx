import React, { useState } from 'react';
import { Smartphone, Banknote, ShieldCheck, CheckCircle2, X, Lock } from 'lucide-react';
import { processBookingPayment } from '../../services/hommieState';
import { initiateRazorpayPayment } from '../../services/paymentGateway';
import { createStripeCheckout, isStripeConfigured } from '../../services/stripeGateway';

const UPI_ID = import.meta.env.VITE_HOMMIE_UPI_ID || 'hommie.pay@okhdfcbank';

export default function HommiePaymentModal({ isOpen, onClose, booking, onPaymentSuccess }) {
  const [method, setMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  if (!isOpen || !booking) return null;

  const finalAmount = booking.pricingSummary?.finalAmount || booking.servicePrice + 30;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${UPI_ID}&pn=HOMMIE&am=${finalAmount}&cu=INR&tn=${booking.bookingRef}`)}`;

  const completePayment = (paymentDetails = {}) => {
    processBookingPayment(booking.id, {
      method,
      upiApp: null,
      status: method === 'cash' ? 'pending_confirmation' : 'paid',
      gateway: paymentDetails.gateway || 'manual_upi',
      paymentId: paymentDetails.paymentId || null,
      orderId: paymentDetails.orderId || null
    });
    setIsProcessing(false);
    setPaymentDone(true);
    window.setTimeout(() => onPaymentSuccess?.(), 1200);
  };

  const handlePay = async () => {
    setIsProcessing(true);
    if (method === 'card' && isStripeConfigured) {
      try {
        await createStripeCheckout({ booking, amount: finalAmount });
      } catch (error) {
        setIsProcessing(false);
        window.alert(error.message);
      }
      return;
    }
    if (method === 'upi' && import.meta.env.VITE_RAZORPAY_KEY_ID) {
      const opened = await initiateRazorpayPayment({
        booking,
        amount: finalAmount,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        onSuccess: completePayment,
        onFailure: () => setIsProcessing(false)
      });
      if (!opened) setIsProcessing(false);
      return;
    }
    window.setTimeout(() => completePayment(), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lucknow checkout</span><h3 className="font-extrabold text-slate-900">Pay for {booking.serviceTitle}</h3></div>
          <button aria-label="Close payment" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>
        {paymentDone ? (
          <div className="py-8 text-center space-y-3"><div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto"><CheckCircle2 className="w-8 h-8" /></div><h3 className="text-xl font-extrabold text-slate-950">{method === 'cash' ? 'Cash payment requested' : 'UPI payment recorded'}</h3><p className="text-xs text-slate-500">{method === 'cash' ? `Pay ₹${finalAmount} directly to ${booking.workerName} after the service.` : `UPI reference will be verified by HOMMIE operations.`}</p></div>
        ) : (
          <div className="mt-5 space-y-5">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between"><div><span className="text-xs text-amber-900 font-semibold block">Total amount due</span><span className="text-2xl font-extrabold text-amber-950">₹{finalAmount}</span></div><span className="text-xs font-mono font-bold text-amber-800 bg-white px-2.5 py-1 rounded-lg border border-amber-200">{booking.bookingRef}</span></div>
            <div><label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Choose payment method</label><div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setMethod('upi')} className={`p-3 rounded-2xl border text-center ${method === 'upi' ? 'border-amber-500 bg-amber-50 font-bold' : 'border-slate-200 bg-slate-50'}`}><Smartphone className="w-4 h-4 mx-auto mb-1 text-amber-600" /><span className="text-xs">Manual UPI / QR</span></button>
              <button type="button" onClick={() => setMethod('cash')} className={`p-3 rounded-2xl border text-center ${method === 'cash' ? 'border-emerald-500 bg-emerald-50 font-bold' : 'border-slate-200 bg-slate-50'}`}><Banknote className="w-4 h-4 mx-auto mb-1 text-emerald-600" /><span className="text-xs">Cash to professional</span></button>
              <button type="button" onClick={() => setMethod('card')} disabled={!isStripeConfigured} className={`p-3 rounded-2xl border text-center ${method === 'card' ? 'border-sky-500 bg-sky-50 font-bold' : 'border-slate-200 bg-slate-50'} disabled:opacity-50`}><Lock className="w-4 h-4 mx-auto mb-1 text-sky-600" /><span className="text-xs">Card / Stripe</span></button>
            </div></div>
            {method === 'card' ? <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900"><p className="font-bold">Secure Stripe checkout</p><p className="mt-1">You will be redirected to Stripe to pay by card or any supported payment method.</p></div> : method === 'upi' ? <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3"><img src={qrUrl} alt="HOMMIE UPI payment QR code" className="w-36 h-36 mx-auto rounded-xl border border-slate-300" /><p className="text-[11px] text-slate-500">Scan with GPay, PhonePe, Paytm, or any UPI app.</p><p className="text-xs font-mono text-slate-700">{UPI_ID}</p></div> : <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700"><p>Give <strong>₹{finalAmount}</strong> to {booking.workerName}. The professional will confirm receipt after the job.</p></div>}
            <div className="flex items-center gap-2 text-[11px] text-slate-500"><ShieldCheck className="w-4 h-4 text-emerald-600" /><span>HOMMIE support can review payment disputes.</span></div>
            <button onClick={handlePay} disabled={isProcessing} className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-extrabold text-sm hover:bg-emerald-500 transition flex items-center justify-center gap-2"><Lock className="w-4 h-4" />{isProcessing ? 'Opening secure checkout...' : method === 'cash' ? 'Confirm cash arrangement' : method === 'card' ? 'Continue to Stripe' : import.meta.env.VITE_RAZORPAY_KEY_ID ? 'Pay securely with Razorpay' : 'I have paid via UPI'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
