import React, { useState, useEffect } from 'react';
import { EmergencyAlert, PriorityLevel } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { soundService } from '../../utils/audio';
import {
  Radio,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  ShieldAlert,
  X,
  Volume2,
  StopCircle,
} from 'lucide-react';

export const EmergencyAlertCenter: React.FC = () => {
  const { currentUser } = useAuth();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(db.getEmergencyAlerts());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAlertForAcks, setSelectedAlertForAcks] = useState<EmergencyAlert | null>(null);
  const [msgSuccess, setMsgSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '🚨 RED ALERT: PRE-EMPTIVE DEPLOYMENT STANDBY',
    message: 'All SACERT responders are requested to standby for possible deployment. Check communications link on 144.750 MHz.',
    priority: 'EMERGENCY' as PriorityLevel,
    targetAudience: 'ALL' as 'ALL' | 'ACTIVE_ONLY',
  });

  const reload = () => setAlerts(db.getEmergencyAlerts());

  useEffect(() => {
    const unsub = db.subscribe(reload);
    return () => unsub();
  }, []);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const adminName = currentUser?.fullName || 'Administrator';

    const newAlert = db.createEmergencyAlert(
      {
        title: formData.title,
        message: formData.message,
        priority: formData.priority,
        sentBy: adminName,
        sentAt: new Date().toISOString(),
        targetAudience: formData.targetAudience,
      },
      adminName
    );

    // Audio test chime
    soundService.playEmergencyChime();

    reload();
    setIsCreateModalOpen(false);
    setMsgSuccess(`Emergency alert "${newAlert.title}" broadcasted successfully. Push dispatched to responders.`);
  };

  const handleStandDown = (alertId: string) => {
    if (window.confirm('Stand down this emergency alert? This will archive the broadcast and remove active popup popovers from responder devices.')) {
      const adminName = currentUser?.fullName || 'Administrator';
      db.resolveEmergencyAlert(alertId, adminName);
      reload();
      setMsgSuccess('Emergency alert marked as Stand-Down.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Emergency Broadcast Center
            </span>
            <span className="text-xs text-slate-500">· Real-Time Responder Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1">
            SACERT RAPID POPUP DISPATCH
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Transmit high-priority alert popups to responder devices with real-time receipt & acknowledgement tracking
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 text-xs font-black text-white bg-red-700 hover:bg-red-800 rounded-lg flex items-center gap-2 transition-all shadow-md animate-pulse"
        >
          <Radio className="w-4 h-4" />
          BROADCAST EMERGENCY ALERT
        </button>
      </div>

      {msgSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-lg flex items-center justify-between">
          <span>✓ {msgSuccess}</span>
          <button onClick={() => setMsgSuccess('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Broadcast Feed */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-5 rounded-2xl border transition-all ${
              alert.active
                ? 'bg-red-950/20 border-red-600 shadow-md ring-1 ring-red-500/30'
                : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span
                  className={`p-2 rounded-lg ${
                    alert.active ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <Radio className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${
                        alert.priority === 'EMERGENCY'
                          ? 'bg-red-600 text-white'
                          : alert.priority === 'URGENT'
                          ? 'bg-amber-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {alert.priority}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        alert.active
                          ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {alert.active ? 'LIVE DISPATCH' : 'STAND-DOWN / ARCHIVED'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 mt-1">{alert.title}</h3>
                </div>
              </div>

              {alert.active && (
                <button
                  onClick={() => handleStandDown(alert.id)}
                  className="px-3.5 py-1.5 text-xs font-bold text-red-700 hover:text-white hover:bg-red-700 border border-red-300 rounded-lg flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <StopCircle className="w-4 h-4" />
                  Stand Down Alert
                </button>
              )}
            </div>

            <div className="py-3 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-200/80 my-3">
              "{alert.message}"
            </div>

            {/* Bottom info & Acknowledgement Tracking */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-mono">
              <div className="flex items-center gap-2">
                <span>Dispatched by: {alert.sentBy}</span>
                <span>·</span>
                <span>Sent: {new Date(alert.sentAt).toLocaleString()}</span>
              </div>

              <button
                onClick={() => setSelectedAlertForAcks(alert)}
                className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800 flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Acknowledgements ({alert.acknowledgements.length} Responders Logged)
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= BROADCAST EMERGENCY MODAL ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden border-2 border-red-600">
            <div className="bg-red-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-white animate-spin" />
                <h3 className="font-black text-sm text-white">RAPID EMERGENCY BROADCAST</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-white hover:text-red-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alert Headline *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-white font-bold text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Message Body *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded text-slate-100 text-xs focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white font-bold"
                  >
                    <option value="EMERGENCY">EMERGENCY (Red Screen & Tone)</option>
                    <option value="URGENT">URGENT</option>
                    <option value="IMPORTANT">IMPORTANT</option>
                    <option value="NORMAL">NORMAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Recipient Group</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white"
                  >
                    <option value="ALL">All Enrolled Members</option>
                    <option value="ACTIVE_ONLY">Active Responders Only</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-200 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p>
                  This will generate an immediate full-screen modal with audible emergency chime on all logged-in responder accounts requiring affirmative acknowledgment.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded font-black tracking-wide flex items-center gap-2 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  DISPATCH BROADCAST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Acknowledgements Log Modal */}
      {selectedAlertForAcks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-red-400 uppercase font-bold">
                  Receipt Log
                </span>
                <h3 className="font-bold text-sm text-white">RESPONDER ACKNOWLEDGEMENT AUDIT</h3>
              </div>
              <button
                onClick={() => setSelectedAlertForAcks(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="font-bold text-slate-900">{selectedAlertForAcks.title}</p>
                <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                  Sent: {new Date(selectedAlertForAcks.sentAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-700">
                  Responders who Acknowledged ({selectedAlertForAcks.acknowledgements.length})
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                {selectedAlertForAcks.acknowledgements.length > 0 ? (
                  selectedAlertForAcks.acknowledgements.map((ack, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between font-mono">
                      <div>
                        <p className="font-bold text-slate-900">{ack.memberName}</p>
                        <span className="text-[10px] text-slate-500">{ack.memberId}</span>
                      </div>
                      <div className="text-right text-[11px]">
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> ACKNOWLEDGED
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          {new Date(ack.acknowledgedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-center text-slate-400 italic">
                    Awaiting member acknowledgements...
                  </p>
                )}
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedAlertForAcks(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-bold text-slate-700"
                >
                  Close Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
