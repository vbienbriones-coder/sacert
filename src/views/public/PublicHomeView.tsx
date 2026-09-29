import React, { useState } from 'react';
import { db } from '../../services/db';
import { SacertLogo } from '../../components/SacertLogo';
import { playRadioTone } from '../../utils/audio';
import {
  Radio,
  ShieldCheck,
  UserPlus,
  Award,
  CreditCard,
  LogIn,
  Search,
  CheckCircle2,
  Activity,
  Volume2,
  Users,
  GraduationCap,
  Flame,
  LifeBuoy,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface PublicHomeViewProps {
  onNavigatePublic: (view: string) => void;
  onOpenVerify: (code?: string, type?: 'cert' | 'member') => void;
}

export const PublicHomeView: React.FC<PublicHomeViewProps> = ({
  onNavigatePublic,
  onOpenVerify,
}) => {
  const [quickVerifyCode, setQuickVerifyCode] = useState('');
  const [isPlayingTone, setIsPlayingTone] = useState(false);

  const members = db.getMembers(false);
  const activeMembers = members.filter((m) => m.membershipStatus === 'ACTIVE');
  const certificates = db.getCertificates();
  const trainings = db.getTrainings();

  const handleQuickVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = quickVerifyCode.trim();
    if (!code) return;
    if (code.toUpperCase().startsWith('CERT') || code.includes('-CERT-')) {
      onOpenVerify(code, 'cert');
    } else {
      onOpenVerify(code, 'member');
    }
  };

  const handleTestTone = () => {
    setIsPlayingTone(true);
    playRadioTone();
    setTimeout(() => setIsPlayingTone(false), 800);
  };

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-red-950/70 border-2 border-red-700/60 rounded-3xl p-6 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
          {/* Subtle watermarked logo in background */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none translate-x-20">
            <SacertLogo size={550} inverted showText={false} />
          </div>

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-900/60 border border-red-600/80 rounded-full text-red-200 text-xs font-mono font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Official First Responder Command</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight font-serif leading-none">
                SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM
              </h1>
              <p className="text-lg sm:text-xl font-bold text-red-400 font-serif italic pt-1">
                "Always Alert. Always Prepared."
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              An elite, community-based disaster operations corps trained in incident command, emergency medical response, swift-water rescue, urban search, and rapid tactical communications across all operational sectors.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigatePublic('register')}
                className="px-6 py-3.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl hover:shadow-red-700/30 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Join SACERT · Register as Member</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigatePublic('verify-certificate')}
                className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Verify Credentials</span>
              </button>

              <button
                onClick={() => onNavigatePublic('login')}
                className="px-5 py-3.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <LogIn className="w-4 h-4 text-red-700" />
                <span>Member / Admin Login</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Radio Net Callout Banner (Requirement #8) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 border-2 border-red-700 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-700/20 border-2 border-red-600 flex items-center justify-center shrink-0">
              <Radio className="w-9 h-9 text-red-500 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-extrabold tracking-widest text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800">
                  TACTICAL RADIO COMMUNICATIONS
                </span>
                <span className="text-xs text-slate-400 font-mono">24/7 EOC Net</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                PRIMARY FREQUENCY: <span className="text-amber-400">425.025 MHz</span>
              </h3>
              <p className="text-xs text-slate-300">
                SACERT Tactical Primary Net · UHF Simplex (Direct) · CTCSS 88.5 Hz · Base Station: SACERT BASE-1
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleTestTone}
              className="flex-1 md:flex-none px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
              title="Test radio tone simulator"
            >
              <Volume2 className={`w-4 h-4 text-amber-400 ${isPlayingTone ? 'animate-ping' : ''}`} />
              <span>Test Radio Tone</span>
            </button>
            <button
              onClick={() => onNavigatePublic('about')}
              className="flex-1 md:flex-none px-4 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Net Radio SOPs</span>
            </button>
          </div>
        </div>
      </section>

      {/* Real-time Metrics Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <Users className="w-5 h-5 text-red-500 mb-1" />
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {activeMembers.length}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Responders
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <GraduationCap className="w-5 h-5 text-blue-400 mb-1" />
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {trainings.length}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Completed Trainings
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <Award className="w-5 h-5 text-amber-400 mb-1" />
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {certificates.length}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Issued Certificates
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <Radio className="w-5 h-5 text-emerald-400 mb-1" />
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              425.025
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tactical Radio (MHz)
            </div>
          </div>
        </div>
      </section>

      {/* Fast Public Verification Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Public Security Registry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight">
              VERIFY SACERT CERTIFICATE OR MEMBER ID
            </h2>
            <p className="text-xs text-slate-400">
              Enter any Certificate Number (e.g. CERT-2026-0089) or Member ID (e.g. SACERT-2026-0001) to verify official registry status
            </p>

            <form onSubmit={handleQuickVerifySubmit} className="flex flex-col sm:flex-row gap-2 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Enter Certificate No. or Member ID..."
                  value={quickVerifyCode}
                  onChange={(e) => setQuickVerifyCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-red-600 font-bold"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-colors cursor-pointer"
              >
                Verify Now
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Operational Capabilities / Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-serif tracking-tight">
            CORE DISASTER RESPONSE CAPABILITIES
          </h2>
          <p className="text-xs text-slate-400">
            Specialized disaster management disciplines maintained by the San Andres Community Emergency Response Team
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-red-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-red-700/20 text-red-500 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-white text-base">Emergency Medical Response</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rapid medical triage, Basic Life Support (BLS), CPR/AED resuscitation, hemorrhage control, and trauma stabilization before hospital transfer.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-red-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-700/20 text-amber-500 flex items-center justify-center">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-white text-base">Swift Water & Coastal Rescue</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Water Search and Rescue (WASAR), boat evacuation drills, coastal flood monitoring, and life-saving operations during typhoon surges.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-red-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-700/20 text-blue-400 flex items-center justify-center">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-white text-base">Tactical Comms (425.025 MHz)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              24/7 dedicated UHF emergency radio net control, relay dispatch, satellite reporting, and field telecommunications during grid blackouts.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3 hover:border-red-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-orange-700/20 text-orange-400 flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-white text-base">Light Search & Fire Auxiliary</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Confined space search, debris clearance, community fire suppression, triage marking, and crowd evacuation direction.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership Signatories Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl text-center space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">
            Executive Leadership & Signatories
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-16 pt-2">
            <div>
              <p className="text-sm font-bold text-white font-serif">VINCENT B. BRIONES</p>
              <p className="text-[11px] font-mono text-red-400 uppercase font-semibold">PRESIDENT (SACERT)</p>
            </div>
            <div className="hidden sm:block text-slate-700">|</div>
            <div>
              <p className="text-sm font-bold text-white font-serif">NICHOLSON J. DASALLA</p>
              <p className="text-[11px] font-mono text-red-400 uppercase font-semibold">VICE PRESIDENT (SACERT)</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
