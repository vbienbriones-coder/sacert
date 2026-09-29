import React, { useState } from 'react';
import { db } from '../../services/db';
import { FileBarChart2, Printer, Download, Users, GraduationCap, Award, Activity } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'membership' | 'training' | 'certificate' | 'activity'>('membership');

  const members = db.getMembers(true);
  const trainings = db.getTrainings();
  const certificates = db.getCertificates();
  const auditLogs = db.getAuditLogs();
  const users = db.getUsers();

  // Membership statistics
  const activeCount = members.filter((m) => m.membershipStatus === 'ACTIVE' && !m.deletedAt).length;
  const inactiveCount = members.filter((m) => m.membershipStatus === 'INACTIVE' || m.deletedAt).length;
  const suspendedCount = members.filter((m) => m.membershipStatus === 'SUSPENDED').length;

  const barangayCounts: { [key: string]: number } = {};
  const designationCounts: { [key: string]: number } = {};

  members.forEach((m) => {
    barangayCounts[m.barangay] = (barangayCounts[m.barangay] || 0) + 1;
    designationCounts[m.designation] = (designationCounts[m.designation] || 0) + 1;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let filename = `SACERT_${activeReport}_Report_${new Date().toISOString().split('T')[0]}.csv`;
    let csvData = '';

    if (activeReport === 'membership') {
      csvData = 'Barangay,Members Count\n' +
        Object.entries(barangayCounts).map(([b, c]) => `"${b}",${c}`).join('\n') +
        '\n\nDesignation,Count\n' +
        Object.entries(designationCounts).map(([d, c]) => `"${d}",${c}`).join('\n');
    } else if (activeReport === 'training') {
      csvData = 'Training ID,Title,Provider,Hours,Enrolled,Completed,Rate\n' +
        trainings.map((t) => {
          const comp = t.participants.filter((p) => p.status === 'COMPLETED').length;
          const rate = t.participants.length > 0 ? Math.round((comp / t.participants.length) * 100) : 0;
          return `"${t.trainingId}","${t.title}","${t.provider}",${t.hours},${t.participants.length},${comp},${rate}%`;
        }).join('\n');
    } else if (activeReport === 'certificate') {
      csvData = 'Certificate No,Recipient,Member ID,Title,Date Issued,Status\n' +
        certificates.map((c) => `"${c.certificateNumber}","${c.recipientName}","${c.memberId}","${c.title}","${c.dateIssued}","${c.status}"`).join('\n');
    } else {
      csvData = 'Timestamp,Admin,Action,Target\n' +
        auditLogs.map((l) => `"${l.timestamp}","${l.adminName}","${l.action}","${l.target}"`).join('\n');
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              Analytical Intelligence
            </span>
            <span className="text-xs text-slate-500">· Operational Audit & Stats</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1">
            SACERT REPORTING & ANALYTICS
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Official summaries of responder distribution, training throughput, certification status, and readiness
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            Export Excel/CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveReport('membership')}
          className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeReport === 'membership'
              ? 'border-red-700 text-red-700 font-extrabold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Membership Distribution
        </button>
        <button
          onClick={() => setActiveReport('training')}
          className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeReport === 'training'
              ? 'border-red-700 text-red-700 font-extrabold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Training Throughput
        </button>
        <button
          onClick={() => setActiveReport('certificate')}
          className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeReport === 'certificate'
              ? 'border-red-700 text-red-700 font-extrabold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          Certificates & Validity
        </button>
        <button
          onClick={() => setActiveReport('activity')}
          className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeReport === 'activity'
              ? 'border-red-700 text-red-700 font-extrabold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          Activity & Logins
        </button>
      </div>

      {/* REPORT CONTENT VIEWS */}
      {activeReport === 'membership' && (
        <div className="space-y-6">
          {/* Summary metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Roster</span>
              <p className="text-2xl font-black font-mono mt-1 text-slate-900">{members.length}</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-emerald-700 uppercase">Active Responders</span>
              <p className="text-2xl font-black font-mono mt-1 text-emerald-700">{activeCount}</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Inactive / Resigned</span>
              <p className="text-2xl font-black font-mono mt-1 text-slate-700">{inactiveCount}</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-amber-700 uppercase">Suspended / Review</span>
              <p className="text-2xl font-black font-mono mt-1 text-amber-700">{suspendedCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Breakdown by Barangay */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                Responder Density by Barangay
              </h3>
              <div className="space-y-2">
                {Object.entries(barangayCounts).map(([b, count]) => {
                  const pct = Math.round((count / members.length) * 100);
                  return (
                    <div key={b} className="text-xs space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Brgy. {b}</span>
                        <span className="font-mono text-slate-500">{count} responders ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-700 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Breakdown by Designation */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                Distribution by Designation / Specialized Role
              </h3>
              <div className="space-y-2">
                {Object.entries(designationCounts).map(([d, count]) => {
                  const pct = Math.round((count / members.length) * 100);
                  return (
                    <div key={d} className="text-xs space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>{d}</span>
                        <span className="font-mono text-slate-500">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-700 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'training' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Training Title</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Hours</th>
                <th className="py-3 px-4">Enrolled</th>
                <th className="py-3 px-4">Completed</th>
                <th className="py-3 px-4">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {trainings.map((t) => {
                const comp = t.participants.filter((p) => p.status === 'COMPLETED').length;
                const rate = t.participants.length > 0 ? Math.round((comp / t.participants.length) * 100) : 0;
                return (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-blue-900">{t.trainingId}</td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">{t.title}</td>
                    <td className="py-3 px-4 text-slate-600">{t.startDate}</td>
                    <td className="py-3 px-4 text-slate-600">{t.hours} hrs</td>
                    <td className="py-3 px-4 text-slate-800">{t.participants.length}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{comp}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{rate}%</span>
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600" style={{ width: `${rate}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeReport === 'certificate' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total Issued</span>
              <p className="text-xl font-bold font-mono text-slate-900">{certificates.length}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Valid</span>
              <p className="text-xl font-bold font-mono text-emerald-700">
                {certificates.filter((c) => c.status === 'VALID' || c.status === 'REISSUED').length}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase">Expired</span>
              <p className="text-xl font-bold font-mono text-amber-700">
                {certificates.filter((c) => c.status === 'EXPIRED').length}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-red-700 uppercase">Revoked</span>
              <p className="text-xl font-bold font-mono text-red-700">
                {certificates.filter((c) => c.status === 'REVOKED').length}
              </p>
            </div>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">Certificate #</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Expiry</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {certificates.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-red-900">{c.certificateNumber}</td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-900">{c.recipientName}</td>
                  <td className="py-3 px-4 font-sans text-slate-600 truncate max-w-xs">{c.title}</td>
                  <td className="py-3 px-4 text-slate-600">{c.dateIssued}</td>
                  <td className="py-3 px-4 text-slate-600">{c.expiryDate || 'Permanent'}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-emerald-700">{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeReport === 'activity' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-extrabold text-sm text-slate-900">User Account Activity & Last Logins</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Last Login Time</th>
                <th className="py-3 px-4">Failed Attempts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {u.username.startsWith('@') ? u.username : `@${u.username}`}
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-800">{u.fullName}</td>
                  <td className="py-3 px-4 text-slate-600">{u.role}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        u.accountStatus === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {u.accountStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                  </td>
                  <td className="py-3 px-4">{u.failedLoginAttempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
