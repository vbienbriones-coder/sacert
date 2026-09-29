import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import {
  UserCheck,
  CreditCard,
  Award,
  GraduationCap,
  Megaphone,
  Radio,
  PhoneCall,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

interface MemberDashboardProps {
  onNavigate: (view: string) => void;
  onOpenVerify: () => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  onNavigate,
  onOpenVerify,
}) => {
  const { currentMember, currentUser } = useAuth();

  const member = currentMember || db.getMembers()[0];
  const certificates = db.getCertificatesByMemberId(member.memberId);
  const trainings = db.getTrainings().filter((t) =>
    t.participants.some((p) => p.memberId === member.memberId)
  );
  const announcements = db.getAnnouncements().slice(0, 3);
  const activeAlerts = db.getActiveEmergencyAlerts();

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Responder Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Photo Avatar */}
            <div className="w-20 h-24 rounded-xl border-2 border-red-500 bg-slate-800 flex items-center justify-center font-bold text-white text-2xl overflow-hidden shrink-0 shadow-lg">
              {member.profilePhoto ? (
                <img src={member.profilePhoto} alt={member.fullName} className="w-full h-full object-cover" />
              ) : (
                <UserCheck className="w-10 h-10 text-red-400" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-red-700 text-white rounded">
                  {member.memberId}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-700 text-white rounded flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> ACTIVE RESPONDER
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-serif">
                {member.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-red-300 font-semibold">
                {member.designation} · {member.responderLevel}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                Station: Brgy. {member.barangay}, San Andres · Blood: {member.bloodType}
              </p>
            </div>
          </div>

          {/* Quick Member Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('my-id')}
              className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all"
            >
              <CreditCard className="w-4 h-4" />
              My Digital ID
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-600 flex items-center gap-2 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              View 201 Profile
            </button>
          </div>
        </div>
      </div>

      {/* Active Emergency Alert Banner */}
      {activeAlerts.length > 0 && (
        <div className="p-5 bg-red-950/80 border-2 border-red-600 rounded-2xl text-white flex items-start gap-4 shadow-lg animate-pulse">
          <span className="p-2.5 bg-red-600 text-white rounded-xl shrink-0 mt-0.5">
            <Radio className="w-6 h-6 animate-bounce" />
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase bg-red-600 px-2 py-0.5 rounded font-mono">
                ACTIVE INCIDENT STANDBY
              </span>
              <span className="text-xs text-red-200">Broadcasted to SACERT Net</span>
            </div>
            <h3 className="text-base font-extrabold text-white">{activeAlerts[0].title}</h3>
            <p className="text-xs sm:text-sm text-slate-200 font-medium">"{activeAlerts[0].message}"</p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('my-trainings')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">TRAININGS LOG</span>
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-black font-mono text-slate-900 tabular-nums">
            {trainings.length}
          </p>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            {trainings.filter((t) => t.status === 'COMPLETED').length} Completed Modules
          </p>
        </div>

        <div
          onClick={() => onNavigate('my-certificates')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">CERTIFICATES</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black font-mono text-slate-900 tabular-nums">
            {certificates.length}
          </p>
          <p className="text-xs text-slate-500 mt-2 font-medium">Official Credentials on File</p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">DEPLOYMENTS</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black font-mono text-emerald-700 tabular-nums">
            {member.deploymentsCount}
          </p>
          <p className="text-xs text-slate-500 mt-2 font-medium">Field Response Missions</p>
        </div>

        <div
          onClick={() => onNavigate('contacts')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">HOTLINES</span>
            <PhoneCall className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-base font-extrabold text-slate-900 mt-1">24/7 EOC Net</p>
          <p className="text-xs font-mono text-red-700 font-bold mt-1">144.750 MHz</p>
        </div>
      </div>

      {/* Grid: Announcements & Assigned Trainings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Announcements */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-red-700" />
              <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                Command Announcements
              </h2>
            </div>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs text-red-700 font-bold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{a.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">{a.date}</span>
                </div>
                <p className="text-slate-600 mt-1 line-clamp-2">{a.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Trainings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-700" />
              <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                My Training Roster
              </h2>
            </div>
            <button
              onClick={() => onNavigate('my-trainings')}
              className="text-xs text-blue-700 font-bold hover:underline"
            >
              Full History
            </button>
          </div>
          <div className="space-y-3">
            {trainings.map((t) => (
              <div key={t.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{t.title}</span>
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                      t.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1 font-mono">
                  {t.startDate} · {t.hours} hrs · Venue: {t.venue}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
