import React, { useState } from 'react';
import {
  MapPin,
  ChevronDown,
  Calendar,
  Home,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getActiveCity, getActiveLocality, getBookings } from '../services/hommieState';

export default function HommieNavbar({
  onOpenLocationModal,
  onNavigate,
  currentView
}) {
  const { role } = useAuth();
  const activeCity = getActiveCity();
  const activeLocality = getActiveLocality();
  const bookings = getBookings();
  const activeBooking = bookings.find((b) =>
    !['completed', 'cancelled_by_customer', 'cancelled_by_pro'].includes(b.status)
  );

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_16px_rgba(19,34,56,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[4.5rem] flex items-center justify-between gap-3">
        {/* Brand & Locality */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              if (role === 'worker') onNavigate('pro-dashboard');
              else if (role === 'admin') onNavigate('admin');
              else onNavigate('home');
            }}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#132238] text-amber-400 flex items-center justify-center font-black text-lg shadow-sm group-hover:bg-[#203653] transition">
              H
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-950 text-lg tracking-tight leading-none">
                  HOMMIE
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[9px] font-bold uppercase tracking-wider">
                  Hyperlocal
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:block">
                Home Services Marketplace
              </span>
            </div>
          </button>

          {/* Locality Selector Pill */}
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="max-w-[120px] sm:max-w-[160px] truncate">
              {activeLocality?.name || 'Gomti Nagar'}, {activeCity?.name || 'Lucknow'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              currentView === 'home' ? 'bg-amber-500 text-slate-950' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onNavigate('discovery')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              currentView === 'discovery' ? 'bg-amber-500 text-slate-950' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Find Pros
          </button>

          <button
            onClick={() => onNavigate('my-home')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              currentView === 'my-home' ? 'bg-amber-500 text-slate-950' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>My Home Hub</span>
          </button>

          <button
            onClick={() => onNavigate('bookings')}
            className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              currentView === 'bookings' ? 'bg-amber-500 text-slate-950' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Bookings</span>
            {activeBooking && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </button>
        </nav>

        {/* Right: Quick Active Booking Pill & Role Switcher */}
        <div className="flex items-center gap-2">
          {activeBooking && (
            <button
              onClick={() => onNavigate('bookings')}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-950 text-xs font-bold shadow-xs hover:bg-amber-100 transition"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>Order Active: {activeBooking.bookingRef}</span>
              <ArrowRight className="w-3 h-3 text-amber-700" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
            <div className="w-6 h-6 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs">
              {role === 'worker' ? 'P' : role === 'admin' ? 'A' : 'C'}
            </div>
            <span>{role === 'worker' ? 'Professional' : role === 'admin' ? 'Operations' : 'Customer'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
