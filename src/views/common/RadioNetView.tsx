import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { RadioNetConfig, CallsignEntry } from '../../types';
import { playRadioTone, playEmergencySiren } from '../../utils/audio';
import {
  Radio,
  Signal,
  Wifi,
  ShieldAlert,
  Volume2,
  VolumeX,
  Edit2,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Phone,
  Mic,
  Activity,
} from 'lucide-react';

export const RadioNetView: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [config, setConfig] = useState<RadioNetConfig>(db.getRadioNetConfig());
  const [isEditing, setIsEditing] = useState(false);
  const [formConfig, setFormConfig] = useState<RadioNetConfig>(config);
  const [successMsg, setSuccessMsg] = useState('');
  const [newCallsign, setNewCallsign] = useState<CallsignEntry>({
    callsign: '',
    memberName: '',
    designation: 'Community Responder',
    unit: 'Barangay Unit',
    status: 'ACTIVE',
  });
  const [isAddingCallsign, setIsAddingCallsign] = useState(false);
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      const c = db.getRadioNetConfig();
      setConfig(c);
      if (!isEditing) setFormConfig(c);
    });
    return () => unsub();
  }, [isEditing]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = db.updateRadioNetConfig(formConfig, currentUser?.fullName || 'Administrator');
    setConfig(updated);
    setIsEditing(false);
    setSuccessMsg('Radio Net configuration and frequency parameters updated.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddCallsign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCallsign.callsign || !newCallsign.memberName) return;
    const updated = db.addCallsign(newCallsign, currentUser?.fullName || 'Administrator');
    setConfig(updated);
    setNewCallsign({
      callsign: '',
      memberName: '',
      designation: 'Community Responder',
      unit: 'Barangay Unit',
      status: 'ACTIVE',
    });
    setIsAddingCallsign(false);
    setSuccessMsg('Tactical callsign added to radio roster.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRemoveCallsign = (callsign: string) => {
    if (!window.confirm(`Remove callsign ${callsign} from the net roster?`)) return;
    const updated = db.removeCallsign(callsign, currentUser?.fullName || 'Administrator');
    setConfig(updated);
  };

  const handleTestRadioChime = () => {
    setIsPlayingTestTone(true);
    playRadioTone();
    setTimeout(() => setIsPlayingTestTone(false), 800);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Tactical Telecommunications Directorate
            </span>
            <span className="text-xs text-slate-500 font-mono">· 24/7 Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1 flex items-center gap-2.5">
            <Radio className="w-8 h-8 text-red-700" />
            <span>SACERT OFFICIAL RADIO NET</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Emergency communications channel, standard operating procedures, and active tactical callsign roster
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleTestRadioChime}
            className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Audio radio tone check"
          >
            <Volume2 className={`w-4 h-4 text-red-600 ${isPlayingTestTone ? 'animate-ping' : ''}`} />
            <span>Radio Tone Test</span>
          </button>

          {isAdmin && !isEditing && (
            <button
              onClick={() => {
                setFormConfig(config);
                setIsEditing(true);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors shadow-xs"
            >
              <Edit2 className="w-4 h-4 text-amber-400" />
              <span>Configure Radio Net</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Massive Frequency Callout Box (Fulfilling Requirement #8) */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white rounded-2xl p-6 sm:p-8 border-2 border-red-700/80 shadow-2xl relative overflow-hidden">
        {/* Subtle background radar circles */}
        <div className="absolute right-0 top-0 bottom-0 w-80 pointer-events-none opacity-10 flex items-center justify-center">
          <div className="w-72 h-72 rounded-full border-4 border-red-500 animate-ping" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-red-400 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>OFFICIAL PRIMARY TACTICAL FREQUENCY</span>
            </div>
            {/* BIG BOLD FREQUENCY DISPLAY */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-md">
                {config.frequency || '425.025 MHz'}
              </span>
              <span className="text-sm sm:text-base font-bold text-amber-400 font-mono uppercase">
                {config.repeaterShift || 'Simplex'}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-400 shrink-0" />
              <span>{config.netName || 'SACERT Tactical Primary Net'}</span>
            </p>
          </div>

          {/* Quick Technical Specs Pill Group */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-slate-900/90 border border-slate-700/80 p-3 rounded-xl">
              <span className="text-[10px] text-slate-400 block uppercase">Band / Mode</span>
              <span className="text-sm font-black text-white">UHF FM</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-700/80 p-3 rounded-xl">
              <span className="text-[10px] text-slate-400 block uppercase">CTCSS PL Tone</span>
              <span className="text-sm font-black text-amber-400">{config.plTone || '88.5 Hz'}</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-700/80 p-3 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block uppercase">Net Controller</span>
              <span className="text-xs font-bold text-emerald-400 truncate block">
                {config.activeCallsign || 'SACERT BASE-1'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Net Bulletin / Announcement */}
        {config.importantAnnouncements && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-start gap-2.5 text-xs text-amber-200 bg-amber-950/30 p-3 rounded-xl border border-amber-800/40">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 uppercase tracking-wider block text-[10px] font-mono">
                Current Net Bulletin:
              </strong>
              <span>{config.importantAnnouncements}</span>
            </div>
          </div>
        )}
      </div>

      {/* Admin Edit Form Modal/Drawer */}
      {isEditing && (
        <div className="bg-white rounded-2xl border-2 border-red-700 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-red-700" />
              <span>Edit Radio Net Configuration</span>
            </h3>
            <button
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-600 font-bold text-sm"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Official Frequency</label>
                <input
                  type="text"
                  required
                  value={formConfig.frequency}
                  onChange={(e) => setFormConfig({ ...formConfig, frequency: e.target.value })}
                  placeholder="425.025 MHz"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-red-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Radio Net Name</label>
                <input
                  type="text"
                  required
                  value={formConfig.netName}
                  onChange={(e) => setFormConfig({ ...formConfig, netName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Repeater / Shift & Tone</label>
                <input
                  type="text"
                  value={formConfig.repeaterShift || ''}
                  onChange={(e) => setFormConfig({ ...formConfig, repeaterShift: e.target.value })}
                  placeholder="Simplex (Direct) / CTCSS 88.5 Hz"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Standard Operating Instructions</label>
              <textarea
                rows={3}
                value={formConfig.operatingInstructions}
                onChange={(e) => setFormConfig({ ...formConfig, operatingInstructions: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Emergency Communication Procedures</label>
              <textarea
                rows={3}
                value={formConfig.emergencyProcedures}
                onChange={(e) => setFormConfig({ ...formConfig, emergencyProcedures: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Net Controller Name / Officer</label>
                <input
                  type="text"
                  value={formConfig.netController}
                  onChange={(e) => setFormConfig({ ...formConfig, netController: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Active Base Callsign</label>
                <input
                  type="text"
                  value={formConfig.activeCallsign}
                  onChange={(e) => setFormConfig({ ...formConfig, activeCallsign: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Important Announcements / Daily Net Bulletin</label>
              <input
                type="text"
                value={formConfig.importantAnnouncements}
                onChange={(e) => setFormConfig({ ...formConfig, importantAnnouncements: e.target.value })}
                placeholder="E.g. Daily Net Call is conducted every 0800H and 1700H on 425.025 MHz."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Radio Parameters</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid: SOPs & Emergency Protocols */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Operating Instructions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Mic className="w-5 h-5 text-red-700" />
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
              Radio Operating Instructions
            </h3>
          </div>
          <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
            <p className="whitespace-pre-line">{config.operatingInstructions}</p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block mb-2">
              Essential Tactical Pro-Words:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <strong className="text-red-700 block">ROGER:</strong>
                <span>Message received and understood.</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <strong className="text-red-700 block">SAY AGAIN:</strong>
                <span>Repeat your last transmission.</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <strong className="text-red-700 block">STANDBY:</strong>
                <span>Wait, pause transmission briefly.</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <strong className="text-red-700 block">WILCO:</strong>
                <span>Will comply with instructions.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Communication Procedures */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="w-5 h-5 text-red-700" />
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
              Emergency Distress Procedures
            </h3>
          </div>
          <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
            <p className="whitespace-pre-line">{config.emergencyProcedures}</p>
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 block">
              Priority Radio Traffic Rules:
            </span>
            <p className="text-slate-800 leading-snug">
              During declared disasters or search and rescue operations, the <strong>425.025 MHz</strong> channel is reserved strictly for tactical emergency traffic. Casual conversations or keying without callsign identification is strictly prohibited.
            </p>
          </div>
        </div>
      </div>

      {/* Tactical Callsigns Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
              <Signal className="w-4 h-4 text-red-700" />
              <span>SACERT Radio Callsigns Directory (425.025 MHz)</span>
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Active responder stations registered on the primary tactical net
            </p>
          </div>

          {isAdmin && !isAddingCallsign && (
            <button
              onClick={() => setIsAddingCallsign(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Callsign</span>
            </button>
          )}
        </div>

        {/* Add Callsign Form */}
        {isAddingCallsign && (
          <form onSubmit={handleAddCallsign} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <div className="font-bold text-slate-900">Register New Tactical Callsign</div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Callsign</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SACERT DELTA-4"
                  value={newCallsign.callsign}
                  onChange={(e) => setNewCallsign({ ...newCallsign, callsign: e.target.value.toUpperCase() })}
                  className="w-full p-2 bg-white border border-slate-300 rounded font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Operator / Responder</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={newCallsign.memberName}
                  onChange={(e) => setNewCallsign({ ...newCallsign, memberName: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tactical Unit / Station</label>
                <input
                  type="text"
                  placeholder="e.g. Water Rescue Unit"
                  value={newCallsign.unit}
                  onChange={(e) => setNewCallsign({ ...newCallsign, unit: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Status</label>
                <select
                  value={newCallsign.status}
                  onChange={(e) => setNewCallsign({ ...newCallsign, status: e.target.value as any })}
                  className="w-full p-2 bg-white border border-slate-300 rounded font-bold"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="STANDBY">STANDBY</option>
                  <option value="MONITORING">MONITORING</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingCallsign(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded"
              >
                Add Station
              </button>
            </div>
          </form>
        )}

        {/* Callsigns Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Tactical Callsign</th>
                <th className="py-2.5 px-4">Designated Operator</th>
                <th className="py-2.5 px-4">Assigned Unit</th>
                <th className="py-2.5 px-4">Net Status</th>
                {isAdmin && <th className="py-2.5 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(config.callsignsRoster || []).map((entry) => (
                <tr key={entry.callsign} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-black text-slate-900">
                    {entry.callsign}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">
                    {entry.memberName}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px]">
                    {entry.unit}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        entry.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : entry.status === 'STANDBY'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleRemoveCallsign(entry.callsign)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete callsign"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
