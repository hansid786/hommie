import { useState } from 'react';
import { 
  X, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  HeartHandshake,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const { sendOtp, verifyOtp } = useAuth();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: input, 2: otp
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverMsg, setServerMsg] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    const clean = phone.replace(/[^0-9]/g, '').slice(-10);
    if (clean.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(clean);
      if (res.success) {
        setServerMsg(res.devOtp ? `Demo verification OTP: ${res.devOtp}` : '6-digit OTP sent to your phone.');
        if (res.devOtp) setOtp(res.devOtp);
        setStep(2);
      } else {
        setError(res.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setError(err.message || 'Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const clean = phone.replace(/[^0-9]/g, '').slice(-10);
    if (!otp || otp.trim().length < 4) {
      setError('Please enter the verification OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyOtp(clean, otp.trim(), name);
      if (res.success && res.user) {
        if (onLoginSuccess) onLoginSuccess(res.user);
        onClose();
      } else {
        setError(res.error || 'Invalid OTP. Please check and try again.');
      }
    } catch (err) {
      setError(err.message || 'Verification error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoPhone, demoName) => {
    setPhone(demoPhone);
    setName(demoName);
    setIsLoading(true);
    try {
      const otpRes = await sendOtp(demoPhone);
      if (otpRes.success && otpRes.devOtp) {
        const verifyRes = await verifyOtp(demoPhone, otpRes.devOtp, demoName);
        if (verifyRes.success && verifyRes.user) {
          if (onLoginSuccess) onLoginSuccess(verifyRes.user);
          onClose();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base text-slate-900">HOMMIE Sign In</span>
          </div>
          <p className="text-xs text-slate-500">Secure phone authentication & verified access.</p>
        </div>

        {/* Error / Server message */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="9988776655"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 font-medium text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-slate-900 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Verification OTP</span>}
                {!isLoading && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-3.5">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{serverMsg || `OTP sent to ${phone}`}</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength="6"
                  required
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-widest text-xl font-mono font-bold py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify & Sign In</span>}
                {!isLoading && <ArrowRight className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-[11px] text-slate-500 hover:text-slate-900 py-1"
              >
                Change mobile number
              </button>
            </form>
          )}

          {/* Quick 1-Click Secure Demo Login Options */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block text-center">
              Quick Test Profiles (Neon Database)
            </span>

            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('9988776655', 'Hanzala')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Customer Profile (Hanzala)</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('9876543210', 'Rajesh Kumar')}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-between border border-emerald-200/60 transition-colors cursor-pointer"
              >
                <span>Verified Technician (Rajesh Kumar)</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('9900011223', 'HOMMIE Operations Lead')}
                className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-between border border-amber-200/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Admin Account (Ops Lead)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
