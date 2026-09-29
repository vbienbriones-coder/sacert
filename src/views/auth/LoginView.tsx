import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SacertLogo } from '../../components/SacertLogo';
import { MemberRegistrationModal } from '../../components/MemberRegistrationModal';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight, UserPlus, Camera } from 'lucide-react';

interface LoginViewProps {
  onOpenVerify: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onOpenVerify }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const res = await login(username, password);
    setIsLoading(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between py-8 px-4 select-none relative overflow-hidden">
      {/* Background Graphic Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'radial-gradient(#C62828 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Bar for Public Verification and Member Registration */}
      <div className="max-w-4xl mx-auto w-full flex flex-wrap items-center justify-between gap-2 text-xs relative z-10">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>San Andres CERT Portal Active</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-700/70 text-red-200 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-red-400" />
            <span>Member Registration</span>
          </button>
          <button
            onClick={onOpenVerify}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
            <span>Public Verification</span>
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto relative z-10 space-y-5">
        {/* Emblem & Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <SacertLogo size={76} inverted showText={false} />
          </div>
          <p className="text-[11px] font-mono tracking-widest text-red-400 font-extrabold uppercase pt-2">
            OFFICIAL OPERATIONS COMMAND & REGISTRY
          </p>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-serif">
            SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM
          </h1>
          <p className="text-xs text-slate-400 italic">
            "Always Alert. Always Prepared."
          </p>
        </div>

        {/* Login Form Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wide">
              Official Portal Sign In
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter authorized administrator or responder credentials
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-700 text-red-200 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Username / Responder ID</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. @superadmin or @admin"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Secure Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-red-700/50 cursor-pointer"
            >
              <span>{isLoading ? 'Verifying...' : 'Sign In Securely'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Member Registration & ID Photo Upload Banner */}
          <div className="pt-3 border-t border-slate-800">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-white text-xs">New Responder Member?</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Register and upload your photo for your official SACERT ID card.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white text-[11px] font-extrabold uppercase tracking-wider rounded-lg shrink-0 transition-colors cursor-pointer"
              >
                Register
              </button>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <p className="text-[11px] text-center text-slate-500">
          SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM · Operational Registry 2026
        </p>
      </div>

      {/* Member Registration Modal */}
      <MemberRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccessLogin={(registeredUser) => {
          setUsername(registeredUser);
          setIsRegisterOpen(false);
        }}
      />

      <div />
    </div>
  );
};

