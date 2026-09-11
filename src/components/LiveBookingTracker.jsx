import React, { useEffect, useMemo, useState } from 'react';
import { Crosshair, LocateFixed, MapPin, ShieldCheck, Square, Wifi, WifiOff } from 'lucide-react';
import {
  getBookingById,
  startBookingLocationSharing,
  stopBookingLocationSharing,
  updateBookingLocation,
  subscribeHommieState
} from '../services/hommieState';

const ACTIVE_STATUSES = new Set([
  'requested', 'on_the_way', 'pro_assigned', 'scheduled_confirmed', 'en_route', 'arrived',
  'inspection_in_progress', 'quote_submitted', 'quote_approved',
  'work_in_progress', 'payment_pending'
]);

function formatCoordinate(value) {
  return typeof value === 'number' ? value.toFixed(5) : '—';
}

export default function LiveBookingTracker({ booking, role = 'customer' }) {
  const [currentBooking, setCurrentBooking] = useState(booking);
  const [isWatching, setIsWatching] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt');
  const [error, setError] = useState('');
  const [lastPosition, setLastPosition] = useState(null);

  useEffect(() => {
    setCurrentBooking(booking);
  }, [booking]);

  useEffect(() => {
    const refresh = () => setCurrentBooking(getBookingById(booking?.id) || booking);
    return subscribeHommieState(refresh);
  }, [booking]);

  useEffect(() => {
    if (!isWatching || !currentBooking?.id || !navigator.geolocation) return undefined;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const nextPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          updatedAt: new Date().toISOString()
        };
        setLastPosition(nextPosition);
        updateBookingLocation(currentBooking.id, role, nextPosition);
        setPermissionState('granted');
        setError('');
      },
      (geoError) => {
        setIsWatching(false);
        setPermissionState(geoError.code === geoError.PERMISSION_DENIED ? 'denied' : 'error');
        setError(geoError.code === geoError.PERMISSION_DENIED
          ? 'Location permission was denied. Allow location access in your browser to share live position.'
          : 'Your live location could not be read. Please try again outdoors or with GPS enabled.');
        stopBookingLocationSharing(currentBooking.id, role);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [currentBooking?.id, isWatching, role]);

  useEffect(() => () => {
    if (currentBooking?.id && isWatching) stopBookingLocationSharing(currentBooking.id, role);
  }, [currentBooking?.id, isWatching, role]);

  const isActive = ACTIVE_STATUSES.has(currentBooking?.status);
  const sharedPosition = lastPosition || currentBooking?.locationSharing?.[role];
  const sharedWith = role === 'customer' ? 'your assigned worker' : 'the customer and HOMMIE safety team';
  const statusLabel = isWatching ? 'Live location sharing on' : sharedPosition ? 'Last location saved' : 'Not sharing location';

  const beginSharing = () => {
    if (!navigator.geolocation) {
      setPermissionState('unsupported');
      setError('This browser does not support live GPS location.');
      return;
    }
    setError('');
    setPermissionState('prompt');
    startBookingLocationSharing(currentBooking.id, role);
    setIsWatching(true);
  };

  const endSharing = () => {
    setIsWatching(false);
    stopBookingLocationSharing(currentBooking.id, role);
  };

  const updatedAt = sharedPosition?.updatedAt
    ? new Date(sharedPosition.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'No update yet';

  if (!currentBooking || !isActive) return null;

  return (
    <section className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-sm" aria-label="Live booking location tracking">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            {isWatching ? <Wifi className="h-5 w-5" /> : <LocateFixed className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-800">Live service location</p>
            <h3 className="mt-1 text-base font-extrabold text-slate-950">{statusLabel}</h3>
            <p className="mt-1 text-xs leading-5 text-emerald-900/75">
              {isWatching ? `Sharing with ${sharedWith}. You can stop at any time.` : `Share your real GPS position only while this booking is active.`}
            </p>
          </div>
        </div>

        {isWatching ? (
          <button type="button" onClick={endSharing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50">
            <Square className="h-3.5 w-3.5" /> Stop sharing
          </button>
        ) : (
          <button type="button" onClick={beginSharing} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-600">
            <Crosshair className="h-3.5 w-3.5" /> Start live GPS
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-white/80 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Coordinates</p>
          <p className="mt-1 font-mono text-xs font-bold text-slate-900">{formatCoordinate(sharedPosition?.latitude)}, {formatCoordinate(sharedPosition?.longitude)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white/80 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Accuracy</p>
          <p className="mt-1 text-xs font-bold text-slate-900">{sharedPosition?.accuracy ? `±${sharedPosition.accuracy} metres` : 'Waiting for GPS'}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white/80 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Last update</p>
          <p className="mt-1 text-xs font-bold text-slate-900">{updatedAt}</p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-100 bg-white/70 p-3 text-xs text-slate-600">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
        <span>GPS sharing is permission-based and ends when you stop it or the booking is completed. HOMMIE does not track you in the background.</span>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {(currentBooking.address?.formattedAddress || currentBooking.addressText) && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
          <MapPin className="h-3.5 w-3.5" /> Service address: {currentBooking.address?.formattedAddress || currentBooking.addressText}
        </p>
      )}
    </section>
  );
}

export { ACTIVE_STATUSES };
