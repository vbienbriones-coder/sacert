import React, { useState } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  GraduationCap,
  Award,
  Radio,
  Clock,
  AlertTriangle,
  UserPlus,
  FilePlus2,
  CalendarPlus,
  Send,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  FileCheck,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
  onOpenVerify: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenVerify,
}) => {
  const { currentUser } = useAuth();

  const members = db.getMembers(true);
  const activeMembers = members.filter((m) => m.membershipStatus === 'ACTIVE' && !m.deletedAt);
  const inactiveMembers = members.filter((m) => m.membershipStatus === 'INACTIVE' || m.deletedAt);
  const pendingMembers = members.filter((m) => m.membershipStatus === 'SUSPENDED');

  const trainings = db.getTrainings();
  const certificates = db.getCertificates();
  const validCertificates = certificates.filter((c) => c.status === 'VALID' || c.status === 'REISSUED');

  // Expiring soon (within 90 days)
  const expiringSoonCount = certificates.filter((c) => {
    if (!c.expiryDate || c.status !== 'VALID') return false;
    const expiry = new Date(c.expiryDate).getTime();
    const now = Date.now();
    const diffDays = (expiry - now) / (1000 * 3600 * 24);
    return diffDays > 0 && diffDays <= 90;
  }).length;

  const announcements = db.getAnnouncements();
  const emergencyAlerts = db.getEmergencyAlerts();
  const activeAlerts = emergencyAlerts.filter((a) => a.active);
  const registrations = db.getRegistrations();
  const pendingRegistrations = registrations.filter((r) => r.status === 'PENDING');
  const auditLogs = db.getAuditLogs().slice(0, 6);
  const users = db.getUsers();

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Command Center
            </span>
            <span className="text-xs text-slate-500 font-mono">· SACERT Operations Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1">
            SACERT OPERATIONS DASHBOARD
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Emergency Response Management & Personnel Readiness Roster
          </p>
        </div>

        {/* Quick Primary Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {pendingRegistrations.length > 0 && (
            <button
              onClick={() => onNavigate('registrations')}
              className="px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs animate-pulse cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-700" />
              <span>{pendingRegistrations.length} Pending Registrations</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('members')}
            className="px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4 text-red-400" />
            Add Member
          </button>
          <button
            onClick={() => onNavigate('certificates')}
            className="px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FilePlus2 className="w-4 h-4 text-amber-400" />
            Issue Certificate
          </button>
          <button
            onClick={() => onNavigate('emergency-alerts')}
            className="px-3.5 py-2 text-xs font-extrabold text-white bg-red-700 hover:bg-red-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs animate-pulse"
          >
            <Radio className="w-4 h-4 text-white" />
            Emergency Broadcast
          </button>
        </div>
      </div>

      {/* Active Emergency Alert Banner (if any) */}
      {activeAlerts.length > 0 && (
        <div className="p-4 bg-red-950/90 border-2 border-red-600 rounded-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-start gap-3">
            <span className="p-2 bg-red-600 text-white rounded-lg mt-0.5 animate-bounce">
              <Radio className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 bg-red-600 rounded">
                  ACTIVE ALERT
                </span>
                <span className="text-xs text-red-200">
                  Broadcasted: {new Date(activeAlerts[0].sentAt).toLocaleTimeString()}
                </span>
              </div>
              <h3 className="text-base font-extrabold mt-1 text-white">{activeAlerts[0].title}</h3>
              <p className="text-xs text-slate-200 mt-0.5 line-clamp-1">"{activeAlerts[0].message}"</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('emergency-alerts')}
            className="px-4 py-2 bg-white text-red-900 hover:bg-red-50 text-xs font-black rounded-lg shrink-0 transition-colors"
          >
            Manage Deployment & Acknowledgment Log ({activeAlerts[0].acknowledgements.length} Acknowledged)
          </button>
        </div>
      )}

      {/* Requirement 2 Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div
          onClick={() => onNavigate('members')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">TOTAL MEMBERS</span>
            <Users className="w-5 h-5 text-slate-400 group-hover:text-red-700 transition-colors" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono tabular-nums">
              {members.length}
            </span>
            <span className="text-xs font-semibold text-emerald-700">Roster Total</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{activeMembers.length} Active</span>
            <span>·</span>
            <span>{inactiveMembers.length} Inactive</span>
          </div>
        </div>

        {/* Active Responders */}
        <div
          onClick={() => onNavigate('members')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">ACTIVE RESPONDERS</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700 font-mono tabular-nums">
              {activeMembers.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">Deployable</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>{pendingMembers.length} Suspended / Review</span>
          </div>
        </div>

        {/* Total Trainings */}
        <div
          onClick={() => onNavigate('trainings')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">TOTAL TRAININGS</span>
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono tabular-nums">
              {trainings.length}
            </span>
            <span className="text-xs font-semibold text-blue-700">Courses</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>
              {trainings.filter((t) => t.status === 'COMPLETED').length} Completed ·{' '}
              {trainings.filter((t) => t.status === 'UPCOMING').length} Upcoming
            </span>
          </div>
        </div>

        {/* Certificates Issued */}
        <div
          onClick={() => onNavigate('certificates')}
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">CERTIFICATES ISSUED</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono tabular-nums">
              {certificates.length}
            </span>
            <span className="text-xs font-semibold text-emerald-700 font-mono">
              ({validCertificates.length} Valid)
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span className={expiringSoonCount > 0 ? 'text-amber-700 font-bold' : ''}>
              {expiringSoonCount} Expiring Soon
            </span>
            <span>
              {certificates.filter((c) => c.status === 'REVOKED').length} Revoked
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Recent Roster & Recent Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                Recent Members Roster
              </h2>
            </div>
            <button
              onClick={() => onNavigate('members')}
              className="text-xs text-red-700 hover:text-red-900 font-bold flex items-center gap-1"
            >
              View All ({members.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {members.slice(0, 5).map((m) => (
              <div key={m.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                    {m.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900">{m.fullName}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-mono text-slate-700 font-semibold">{m.memberId}</span>
                      <span>·</span>
                      <span>{m.designation}</span>
                      <span>·</span>
                      <span>Brgy. {m.barangay}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                      m.membershipStatus === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {m.membershipStatus}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{m.responderLevel.split('-')[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Certificates */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                Recent Issued Certificates
              </h2>
            </div>
            <button
              onClick={() => onNavigate('certificates')}
              className="text-xs text-red-700 hover:text-red-900 font-bold flex items-center gap-1"
            >
              View All ({certificates.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {certificates.slice(0, 5).map((c) => (
              <div key={c.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-red-800">{c.certificateNumber}</span>
                    <span
                      className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                        c.status === 'VALID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'REISSUED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="font-extrabold text-slate-900 mt-0.5">{c.recipientName}</p>
                  <p className="text-slate-500 text-[11px] truncate max-w-xs">{c.trainingTitle}</p>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  <span>Issued: {c.dateIssued}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Training Activities, Announcements & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trainings Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
              Training Courses
            </h2>
            <button
              onClick={() => onNavigate('trainings')}
              className="text-xs text-red-700 hover:text-red-900 font-bold"
            >
              Manage
            </button>
          </div>
          <div className="p-3 space-y-3 text-xs">
            {trainings.map((t) => (
              <div key={t.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-700">{t.trainingId}</span>
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
                <p className="font-bold text-slate-900 mt-1">{t.title}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
                  <span>{t.startDate}</span>
                  <span>{t.hours} hrs · {t.participants.length} enrolled</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
              Recent Announcements
            </h2>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs text-red-700 hover:text-red-900 font-bold"
            >
              Broadcast
            </button>
          </div>
          <div className="p-3 space-y-3 text-xs">
            {announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                      a.priority === 'EMERGENCY'
                        ? 'bg-red-600 text-white'
                        : a.priority === 'IMPORTANT'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {a.priority}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{a.date}</span>
                </div>
                <p className="font-bold text-slate-900 mt-1">{a.title}</p>
                <p className="text-slate-600 mt-1 line-clamp-2 text-[11px]">{a.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log preview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
              Recent Audit Log
            </h2>
            <button
              onClick={() => onNavigate('audit-log')}
              className="text-xs text-red-700 hover:text-red-900 font-bold"
            >
              Full Log
            </button>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-3">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{log.adminName.split(' ')[0]}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="font-semibold text-slate-800 text-[11px] mt-0.5">
                  {log.action.replace(/_/g, ' ')}
                </p>
                <p className="text-slate-500 text-[10px] truncate">{log.target}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
