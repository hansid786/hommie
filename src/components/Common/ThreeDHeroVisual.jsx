import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Wrench,
  Sparkles,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  Activity,
  Cpu,
  Wind,
  Droplets
} from 'lucide-react';
import Spatial3DCard from './Spatial3DCard';

export default function ThreeDHeroVisual({ onQuickBook }) {
  const [hoveredBadge, setHoveredBadge] = useState(null);

  return (
    <div className="relative w-full max-w-lg mx-auto py-6 flex items-center justify-center select-none" style={{ perspective: '1200px' }}>
      {/* 3D Ambient Light Aura */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-amber-500/25 to-emerald-500/25 blur-3xl pointer-events-none animate-pulse"></div>

      {/* Main 3D Spatial Master Plate */}
      <Spatial3DCard
        maxTilt={14}
        perspective={1200}
        enableGlare={true}
        className="w-full rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/95 to-slate-950 border border-white/20 p-6 sm:p-7 shadow-[0_30px_70px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
      >
        {/* Layer 1: Top 3D Header Bar (Z-plane: 20px) */}
        <div style={{ transform: 'translateZ(25px)' }} className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Live Hyperlocal Grid
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-amber-300">
            <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>18 Pros Active</span>
          </div>
        </div>

        {/* Layer 2: Center 3D Isometric Service Radar Stage (Z-plane: 45px) */}
        <div style={{ transform: 'translateZ(45px)' }} className="my-6 relative py-4 flex flex-col items-center justify-center">
          {/* Concentric 3D Depth Rings */}
          <div className="relative w-48 h-48 rounded-full border border-amber-500/20 flex items-center justify-center shadow-[inset_0_0_30px_rgba(245,158,11,0.1)]">
            <div className="w-36 h-36 rounded-full border border-emerald-500/30 flex items-center justify-center animate-[spin_12s_linear_infinite]">
              <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center">
                {/* Central Dispatch Core Hub */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex flex-col items-center justify-center font-black shadow-[0_0_30px_rgba(245,158,11,0.6)] cursor-pointer hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 fill-slate-950" />
                  <span className="text-[9px] uppercase tracking-tighter">HOMMIE</span>
                </div>
              </div>
            </div>

            {/* Orbiting 3D Nodes */}
            <div
              style={{ transform: 'translateZ(30px)' }}
              className="absolute -top-2 left-6 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-amber-400/40 text-[10px] font-extrabold text-amber-300 shadow-lg flex items-center gap-1"
            >
              <Wind className="w-3 h-3 text-cyan-400" />
              <span>AC Fast Repair (22m)</span>
            </div>

            <div
              style={{ transform: 'translateZ(35px)' }}
              className="absolute -bottom-2 right-4 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-emerald-400/40 text-[10px] font-extrabold text-emerald-300 shadow-lg flex items-center gap-1"
            >
              <Droplets className="w-3 h-3 text-blue-400" />
              <span>Plumbing Pro (15m)</span>
            </div>

            <div
              style={{ transform: 'translateZ(40px)' }}
              className="absolute top-1/2 -left-4 -translate-y-1/2 px-2 py-1 rounded-xl bg-slate-900/90 border border-white/20 text-[10px] font-extrabold text-white shadow-lg flex items-center gap-1"
            >
              <Cpu className="w-3 h-3 text-amber-400" />
              <span>Electrician</span>
            </div>
          </div>
        </div>

        {/* Layer 3: Floating 3D Pro Spotlight Card (Z-plane: 55px) */}
        <div
          style={{ transform: 'translateZ(55px)' }}
          className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-xl shadow-xl transition-all"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=80"
                  alt="Technician"
                  className="w-10 h-10 rounded-xl object-cover border border-amber-400 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <CheckCircle2 className="w-2 h-2 text-white" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-extrabold text-white">Arjun Sharma</h4>
                  <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[9px] font-black">
                    4.9 ★
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">Master HVAC & Electrician • 1.2 km away</p>
              </div>
            </div>

            <button
              onClick={onQuickBook}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md cursor-pointer hover:scale-105 active:scale-95"
            >
              Match Pro
            </button>
          </div>
        </div>

        {/* Layer 4: 3D Guarantee Footer Ribbon (Z-plane: 20px) */}
        <div style={{ transform: 'translateZ(20px)' }} className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">30-Day Escrow Protection</span>
          </div>
          <span className="font-mono text-amber-400 font-bold">₹0 Middleman Fee</span>
        </div>
      </Spatial3DCard>
    </div>
  );
}
