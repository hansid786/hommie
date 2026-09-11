import React, { useState, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  Clock,
  MapPin,
  Star,
  ChevronRight,
  Sparkles,
  Zap,
  Droplets,
  Wind,
  Cpu,
  Hammer,
  ArrowRight,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Phone,
  Home,
  SlidersHorizontal,
  ThumbsUp,
  Award,
  Users,
  BadgeCheck,
  Check,
  HelpCircle,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import {
  getCategories,
  getProfessionals,
  getActiveLocality,
  getActiveCity,
  getCustomerHomeAssets,
  getBookings,
  getCustomerServiceAddress,
  subscribeHommieState
} from '../../services/hommieState';

const categoryIcons = {
  'ac-service': Wind,
  'electrician': Zap,
  'plumber': Droplets,
  'appliance': Cpu,
  'carpenter': Hammer,
  'cleaning': Sparkles
};

const QUICK_SEARCH_CHIPS = [
  'AC Deep Clean',
  'Short Circuit / MCB',
  'Tap Leakage',
  'RO Filter Service',
  'Washing Machine Drum',
  'Main Door Lock'
];

export default function CustomerHomeView({
  onSelectCategory,
  onOpenBookingModal,
  onViewProProfile,
  onOpenLocationModal,
  onNavigate
}) {
  const [categories, setCategories] = useState([]);
  const [featuredPros, setFeaturedPros] = useState([]);
  const [activeLocality, setActiveLocality] = useState(null);
  const [activeCity, setActiveCity] = useState(null);
  const [homeAssets, setHomeAssets] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [serviceAddress, setServiceAddress] = useState(getCustomerServiceAddress() || {});
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const refreshData = () => {
    setCategories(getCategories());
    setActiveLocality(getActiveLocality());
    setActiveCity(getActiveCity());
    setHomeAssets(getCustomerHomeAssets());
    setServiceAddress(getCustomerServiceAddress() || {});

    const activeLoc = getActiveLocality();
    const pros = getProfessionals({
      locality: activeLoc?.name,
      verifiedOnly: false
    });
    setFeaturedPros(pros.slice(0, 4));

    const bookings = getBookings();
    const inFlight = bookings.filter((b) =>
      !['completed', 'cancelled_by_customer', 'cancelled_by_pro'].includes(b.status)
    );
    setActiveBookings(inFlight.slice(0, 1));
  };

  useEffect(() => {
    refreshData();
    const unsub = subscribeHommieState(refreshData);
    return unsub;
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('discovery', { query: searchQuery });
    }
  };

  const handleChipClick = (chip) => {
    setSearchQuery(chip);
    onNavigate('discovery', { query: chip });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 pb-24 md:pb-16 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. HERO SECTION - PREMIUM COMMERCIAL GRADE */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-8 sm:pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Top Live Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <button
              onClick={onOpenLocationModal}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md text-xs sm:text-sm font-semibold text-slate-100 transition shadow-sm cursor-pointer group"
            >
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span>
                Sector: <strong className="text-white font-extrabold">{activeLocality?.name || 'Gomti Nagar'}</strong>, {activeCity?.name || 'Lucknow'}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold backdrop-blur-md shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>18 Verified Pros Online</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-slate-200 text-xs font-semibold backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>30-Day Guarantee</span>
              </span>
            </div>
          </div>

          <div className="mb-6 max-w-2xl rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-3.5 sm:p-4 shadow-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">Exact Service Address</p>
                <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[240px] sm:max-w-md">
                  {serviceAddress?.formattedAddress || 'Add your exact home / flat address'}
                </h2>
                <p className="text-[10px] text-slate-300 hidden sm:block">Shared securely only with your confirmed technician.</p>
              </div>
            </div>
            <button
              onClick={onOpenLocationModal}
              className="shrink-0 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 text-xs font-bold text-slate-100 transition shadow-xs cursor-pointer"
            >
              {serviceAddress?.formattedAddress ? 'Change' : '+ Add Address'}
            </button>
          </div>

          {/* Active In-Flight Order Floating Bar (if customer has an active booking) */}
          {activeBookings.length > 0 && (
            <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-xl border border-amber-300 flex items-center justify-between gap-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                  <Clock className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-white px-2.5 py-0.5 rounded-full">
                      Active Dispatch
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900">{activeBookings[0].bookingRef}</span>
                  </div>
                  <p className="text-sm font-extrabold text-slate-950 mt-1">
                    {activeBookings[0].serviceTitle} • {activeBookings[0].workerName} is {activeBookings[0].status.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('bookings')}
                className="px-5 py-2.5 rounded-2xl bg-slate-950 text-white font-black text-xs hover:bg-slate-900 transition shrink-0 inline-flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Track Live Status</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          )}

          {/* 2-Column Hero: Headline + Emergency Quick Match */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Headline Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Zero Middleman Commissions • 95% Direct Pro Payouts</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                Your home repairs, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400">handled with pride.</span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-slate-300 font-medium leading-relaxed max-w-xl">
                Direct access to background-verified independent electricians, plumbers, and AC technicians in your neighbourhood. Transparent quotes approved by you before work begins.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="pt-2">
                <div className="relative flex items-center bg-white rounded-2xl shadow-2xl p-2 focus-within:ring-4 focus-within:ring-amber-400/30 transition">
                  <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 'AC servicing', 'MCB tripping', 'Tap leakage'..."
                    className="w-full px-3 py-2.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-slate-950 text-amber-400 font-extrabold text-xs sm:text-sm hover:bg-slate-900 transition shrink-0 shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </button>
                </div>

                {/* Quick Search Chips */}
                <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                    Trending:
                  </span>
                  {QUICK_SEARCH_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleChipClick(chip)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-slate-200 hover:text-white transition shrink-0 backdrop-blur-md cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </form>
            </div>

            {/* Right Dispatch Cards Column */}
            <div className="lg:col-span-5 space-y-4">
              {/* Urgent Emergency Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-amber-400/40 shadow-2xl backdrop-blur-xl relative overflow-hidden group hover:border-amber-400 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                    ⚡ 15–30 Min Dispatch
                  </span>
                </div>

                <h3 className="font-extrabold text-white text-lg">Emergency Instant Dispatch</h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Sudden short circuits, burst pipes, or broken AC cooling. Nearest online technicians alerted instantly.
                </p>

                <button
                  onClick={() => onNavigate('discovery', { urgent: true })}
                  className="mt-5 w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <span>Request Immediate Pro</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Scheduled Appointment Card */}
              <div className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 text-white flex items-center justify-center font-bold shrink-0">
                    <Calendar className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Schedule for Tomorrow or Later</h4>
                    <p className="text-xs text-slate-400">Choose custom 2-hour slot & compare technician profiles</p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('discovery')}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition shrink-0 cursor-pointer"
                >
                  Book Slot →
                </button>
              </div>
            </div>
          </div>

          {/* 4 Trust Metrics Bar */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-2xl font-black text-amber-400 block">4.9/5 ★</span>
              <span className="text-[11px] text-slate-400 font-medium">Over 15,000+ Verified Reviews</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-2xl font-black text-emerald-400 block">100% Verified</span>
              <span className="text-[11px] text-slate-400 font-medium">Aadhaar & Police Background</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-2xl font-black text-amber-400 block">30-Day</span>
              <span className="text-[11px] text-slate-400 font-medium">Free Rework Warranty</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-2xl font-black text-emerald-400 block">95% Payout</span>
              <span className="text-[11px] text-slate-400 font-medium">Direct to Skilled Workers</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE SERVICE CATEGORIES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold mb-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Standardized Visit Fees</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
              Explore Home Services
            </h2>
          </div>

          <button
            onClick={() => onNavigate('discovery')}
            className="text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 transition"
          >
            <span>All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.id] || Sparkles;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className="group relative flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-md transition text-center cursor-pointer"
              >
                {cat.badge && (
                  <span className="absolute -top-2.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                    {cat.badge}
                  </span>
                )}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shadow-2xs"
                  style={{ backgroundColor: `${cat.accentColor}18`, color: cat.accentColor }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-amber-700 transition">
                  {cat.shortName}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Insp: <strong>₹{cat.inspectionFee}</strong>
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. MY HOME MAINTENANCE SNAPSHOT */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-3 border border-amber-400/30">
              <Home className="w-3.5 h-3.5" />
              <span>Digital Appliance Passport</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              Keep a verified maintenance record of your home.
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              Track warranty dates, model numbers, and prior repair invoices for your ACs, geysers, and water purifiers. Book one-tap tune-ups without re-explaining specifications.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('my-home')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm hover:bg-amber-400 transition inline-flex items-center gap-2 shadow-md"
              >
                <span>Open My Home ({homeAssets.length} Logged)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-3 absolute right-6 top-6 bottom-6 w-96 opacity-95">
            {homeAssets.slice(0, 2).map((asset) => (
              <div key={asset.id} className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">
                    {asset.location}
                  </span>
                  <h4 className="font-bold text-sm text-white truncate mt-2">{asset.brand} {asset.name}</h4>
                  <p className="text-[11px] text-slate-300 mt-1">Warranty: {asset.warrantyTill || 'Active'}</p>
                </div>
                <div className="text-[10px] text-amber-200 bg-black/30 p-2 rounded-xl mt-2 border border-white/10 truncate">
                  "{asset.notes}"
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. VERIFIED NEIGHBORHOOD PROFESSIONALS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold mb-1 border border-emerald-200/80">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Aadhaar & Police Background Checked</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
              Verified Pros in {activeLocality?.name || 'Indiranagar'}
            </h2>
          </div>

          <button
            onClick={() => onNavigate('discovery')}
            className="text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1 transition"
          >
            <span>Browse All ({featuredPros.length}+)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredPros.map((pro) => (
            <div
              key={pro.id}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-amber-400 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={pro.avatar}
                      alt={pro.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                    />
                    {pro.verifications?.hommieVerified && (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white shadow-xs" title="HOMMIE Verified Pro">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-slate-900 text-sm truncate group-hover:text-amber-600 transition">
                      {pro.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate font-medium">{pro.trade}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{pro.ratingAvg.toFixed(1)}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] text-slate-500">{pro.ratingCount} reviews</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {pro.headline}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {pro.primaryLocality}
                  </span>
                  <span className="font-extrabold text-slate-900">
                    From ₹{pro.baseRate}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center gap-2">
                <button
                  onClick={() => onViewProProfile(pro.id)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs hover:bg-slate-200 transition"
                >
                  Profile & Rates
                </button>
                <button
                  onClick={() => onOpenBookingModal(pro)}
                  className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs hover:bg-amber-400 transition shadow-2xs"
                >
                  Book Visit
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOMMIE PROMISE / 4 PILLARS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950">How HOMMIE Protects You</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Building authentic trust between homeowners and skilled independent service workers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold mb-3 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-950 text-sm">30-Day Service Guarantee</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                If the same issue reoccurs within 30 days of inspection or repair, the pro revisits without new inspection fees.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-100/80 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold mb-3 shadow-xs">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-950 text-sm">No Surprise Quotes</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Pros diagnose on-site and send an itemized in-app quote. Work begins only after your explicit tap-to-approve.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold mb-3 shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-950 text-sm">100% Direct Pro Payouts</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Zero commission taken from the technician's labor fee. You build a long-term relationship with someone who knows your home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-6">
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-950">Frequently Asked Questions</h3>
          <p className="text-xs text-slate-500 mt-0.5">Everything you need to know about HOMMIE dispatches</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How does the diagnostic visit fee work?',
              a: 'Every trade has a standard inspection fee (₹149 - ₹249). The pro visits, examines the appliance, and gives you a clear itemized quote. If you approve the repair, the inspection fee is adjusted against your final bill.'
            },
            {
              q: 'How fast is the Urgent Instant Dispatch?',
              a: 'Urgent requests are broadcast to nearby verified pros who are currently Online in your sector. Earliest arrival is typically between 15 to 30 minutes.'
            },
            {
              q: 'How does the 30-Day Guarantee protect me?',
              a: 'If any repaired component fails or the same issue recurs within 30 days of completion, the pro will revisit at no extra inspection fee under the HOMMIE rework guarantee.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <span>{item.q}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-90 text-amber-600' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="p-4 pt-0 text-xs text-slate-600 border-t border-slate-100 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
