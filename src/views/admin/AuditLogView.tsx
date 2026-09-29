import React, { useState } from 'react';
import { db } from '../../services/db';
import { AuditLog } from '../../types';
import { FileClock, Search, Download, ShieldCheck, Filter } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const auditLogs = db.getAuditLogs();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filtered = auditLogs.filter((log) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQ =
      !q ||
      log.action.toLowerCase().includes(q) ||
      log.adminName.toLowerCase().includes(q) ||
      log.target.toLowerCase().includes(q) ||
      (log.targetId && log.targetId.toLowerCase().includes(q));

    const matchAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchQ && matchAction;
  });

  const distinctActions = Array.from(new Set(auditLogs.map((l) => l.action))).sort();

  const handleExportCSV = () => {
    const headers = ['Log ID', 'Timestamp', 'Administrator', 'Action', 'Target', 'Target ID', 'Previous Value', 'New Value', 'IP Address'];
    const rows = filtered.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.adminName}"`,
      `"${l.action}"`,
      `"${l.target}"`,
      `"${l.targetId || ''}"`,
      `"${l.previousValue || ''}"`,
      `"${l.newValue || ''}"`,
      `"${l.ipAddress || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SACERT_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              Immutable Audit Trail
            </span>
            <span className="text-xs text-slate-500">· {auditLogs.length} Total Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1">
            ADMINISTRATIVE AUDIT LOG
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Read-only chronological trail of system modifications, credential issues, certificates, and alerts
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          Export Audit Trail CSV
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, administrator, target, or ID..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
        >
          <option value="ALL">All Recorded Actions</option>
          {distinctActions.map((act) => (
            <option key={act} value={act}>
              {act.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Administrator</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Modifications / Log</th>
                <th className="py-3 px-4">Origin Host</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                    <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-sans font-bold text-slate-900 whitespace-nowrap">
                    {log.adminName}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                    <div>{log.target}</div>
                    {log.targetId && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Ref: {log.targetId}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate text-slate-600 font-sans">
                    {log.newValue && <div>New: {log.newValue}</div>}
                    {log.previousValue && (
                      <div className="text-slate-400 text-[10px]">Prev: {log.previousValue}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[10px]">
                    {log.ipAddress || '192.168.1.10'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
