import React, { useState } from 'react';
import { 
  HeartHandshake, 
  User, 
  Wrench, 
  ShieldCheck, 
  Phone, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  MapPin,
  ChevronRight,
  Shield,
  Sparkles,
  Zap,
  Building2,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function AuthView({ onSuccess, initialMode = 'login' }) {
  const { login, register } = useAuth();
  const { showToast } = useNotifications();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [role, setRole] = useState('customer'); // 'customer' | 'worker'
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [trade, setTrade] = useState('AC Repair');
  const [locality, setLocality] = useState('Gomti Nagar, Lucknow');
  const [baseRate, setBaseRate] = useState('349');
  const [experienceYears, setExperienceYears] = useState('6');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError('');

    const identifier = loginIdentifier.trim();
    if (!identifier || !password) {
      setFormError('Enter your email or phone number and password to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(identifier, password);
      if (res.success) {
        showToast(`Welcome back, ${res.user.name}!`);
        if (onSuccess) onSuccess(res.user);
      }
    } catch (error) {
      setFormError(error.message || 'Unable to sign in. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');
    if (password.trim().length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await register({
        fullName: fullName || (role === 'worker' ? 'Arjun Singh' : 'Hanzala'),
        phone: phone ? `+91 ${phone}` : '+91 98450 21984',
        email: email.trim(),
        password: password.trim(),
        role,
        trade,
        locality,
        baseRate,
        experienceYears
      });

      if (res.success) {
        showToast(`Account created successfully! Welcome to the marketplace.`);
        if (onSuccess) onSuccess(res.user);
      }
    } catch (error) {
      setFormError(error.message || 'Unable to create your account. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-8 px-4 bg-slate-950 font-sans">
      
      {/* HOMMIE brand and entry point */}
      <div className="max-w-md w-full text-center space-y-3 mb-7">
        <div className="mx-auto inline-flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <span className="text-3xl font-black tracking-[-0.06em] text-white">HOMMIE</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Trusted home services in Lucknow</span>
        </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {mode === 'login' ? 'Welcome back to HOMMIE' : 'Start your HOMMIE journey'}
        </h1>
        <p className="text-xs text-slate-300 font-medium">
          {role === 'customer' ? 'Book trusted professionals for every home need.' : 'Grow your local service business with better jobs.'}
        </p>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">
        
        {/* Mode Switcher (Sign In vs Register) */}
        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2.5 rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2.5 rounded-xl transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Role Selection */}
        {mode === 'register' && <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                role === 'customer'
                  ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 shadow-2xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${role === 'customer' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black block text-slate-900">Customer</span>
                  <span className="text-[10px] text-slate-500">Book Services</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('worker')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                role === 'worker'
                  ? 'border-emerald-600 bg-emerald-50/50 text-slate-900 shadow-2xs'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${role === 'worker' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black block text-slate-900">Partner Pro</span>
                  <span className="text-[10px] text-slate-500">Receive Jobs</span>
                </div>
              </div>
            </button>
          </div>
        </div>}

        {/* Form Body */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {formError && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {formError}
              </div>
            )}
            <div>
              <label className="font-bold text-slate-700 block mb-1" htmlFor="login-identifier">
                Email address or registered phone
              </label>
              <div className="relative">
                <input
                  id="login-identifier"
                  type="text"
                  required
                  placeholder="you@example.com or +91 98450 21984"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700" htmlFor="login-password">Password</label>
                <span className="text-[11px] text-slate-400 font-semibold">Secure sign-in</span>
              </div>
              <input
                id="login-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                placeholder={role === 'worker' ? 'Arjun Singh' : 'Hanzala'}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="98450 21984"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Locality / Sector</label>
                <input
                  type="text"
                  required
                  placeholder="Gomti Nagar, Lucknow"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-medium"
                />
              </div>
            </div>

            {role === 'worker' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary Trade</label>
                  <select
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-medium"
                  >
                    <option value="AC Repair">AC Repair</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Deep Cleaning">Deep Cleaning</option>
                    <option value="RO & Water Purifier">RO Purifier</option>
                    <option value="Painting">Painting</option>
                    <option value="Vehicle Mechanic">Mechanic</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Starting Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={baseRate}
                    onChange={(e) => setBaseRate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Creating Profile...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

      </div>

      {/* Trust Guarantee Footer */}
      <div className="mt-6 flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Aadhaar KYC Verified</span>
        </span>
        <span>•</span>
        <span>95%+ Direct Worker Payout</span>
        <span>•</span>
        <span>Zero Hidden Fees</span>
      </div>

    </div>
  );
}
