import React from 'react';
import { CheckCircle2, MapPin, ShieldCheck } from 'lucide-react';

const ACTIVE_STATUSES = new Set([
  'requested', 'on_the_way', 'pro_assigned', 'scheduled_confirmed', 'en_route', 'arrived',
  'inspection_in_progress', 'quote_submitted', 'quote_approved', 'work_in_progress', 'payment_pending'
]);

export default function LiveBookingTracker({ booking }) {
  if (!booking || !ACTIVE_STATUSES.has(booking.status)) return null;

  const address = booking.address?.formattedAddress || booking.addressText;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Service visit details">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">Service visit secured</p>
          <h3 className="mt-1 text-base font-extrabold text-slate-950">Your professional has the details they need</h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            HOMMIE uses your saved service address for this booking. We never request or share live location tracking.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Visit address</p>
          <p className="mt-1 flex items-start gap-1.5 text-xs font-bold leading-5 text-slate-900">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            {address || 'Address shared securely after booking'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Privacy promise</p>
          <p className="mt-1 flex items-start gap-1.5 text-xs font-bold leading-5 text-slate-900">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            Shared only for this service visit
          </p>
        </div>
      </div>
    </section>
  );
}

export { ACTIVE_STATUSES };
