import React, { useEffect, useState } from 'react';
import { EmergencyAlert } from '../types';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { soundService } from '../utils/audio';
import { AlertTriangle, BellRing, CheckCircle2, ShieldAlert, Radio } from 'lucide-react';

export const EmergencyAlertModal: React.FC = () => {
  const { currentMember, currentUser } = useAuth();
  const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const checkAlerts = () => {
      const allActive = db.getActiveEmergencyAlerts();
      if (!currentMember && !currentUser) {
        setActiveAlerts([]);
        return;
      }

      // Filter alerts that current user/member hasn't acknowledged yet
      const memberId = currentMember?.memberId || currentUser?.memberId;
      if (!memberId) {
        setActiveAlerts([]);
        return;
      }

      const unacknowledged = allActive.filter((alert) => {
        // Check target audience
        if (alert.targetAudience === 'ACTIVE_ONLY' && currentMember?.membershipStatus !== 'ACTIVE') {
          return false;
        }
        if (alert.targetAudience === 'SPECIFIC_MEMBERS' && alert.targetMemberIds) {
          if (!alert.targetMemberIds.includes(memberId)) return false;
        }
        // Check if already acknowledged
        const hasAck = alert.acknowledgements.some((ack) => ack.memberId === memberId);
        return !hasAck;
      });

      if (unacknowledged.length > 0 && activeAlerts.length === 0) {
        // Trigger emergency sound
        soundService.playEmergencyChime();
      }

      setActiveAlerts(unacknowledged);
      setAcknowledged(false);
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 6000);
    const unsubscribe = db.subscribe(checkAlerts);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [currentMember, currentUser]);

  const activeAlert = activeAlerts[currentAlertIndex];
  if (!activeAlert) return null;

  const handleAcknowledge = () => {
    const memberId = currentMember?.memberId || currentUser?.memberId || 'ADMIN-USER';
    const memberName = currentMember?.fullName || currentUser?.fullName || 'SACERT Staff';

    db.acknowledgeEmergencyAlert(activeAlert.id, memberId, memberName);
    setAcknowledged(true);

    setTimeout(() => {
      if (currentAlertIndex < activeAlerts.length - 1) {
        setCurrentAlertIndex((prev) => prev + 1);
        setAcknowledged(false);
      } else {
        setActiveAlerts([]);
        setCurrentAlertIndex(0);
      }
    }, 600);
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'EMERGENCY':
        return {
          bg: 'bg-red-950/80',
          border: 'border-red-600',
          badge: 'bg-red-600 text-white animate-pulse',
          headerBg: 'bg-red-700',
          iconColor: 'text-red-500',
          buttonBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        };
      case 'URGENT':
        return {
          bg: 'bg-amber-950/80',
          border: 'border-amber-600',
          badge: 'bg-amber-600 text-white',
          headerBg: 'bg-amber-700',
          iconColor: 'text-amber-500',
          buttonBg: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
        };
      case 'IMPORTANT':
        return {
          bg: 'bg-blue-950/80',
          border: 'border-blue-600',
          badge: 'bg-blue-600 text-white',
          headerBg: 'bg-blue-700',
          iconColor: 'text-blue-500',
          buttonBg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        };
      default:
        return {
          bg: 'bg-slate-950/80',
          border: 'border-slate-600',
          badge: 'bg-slate-600 text-white',
          headerBg: 'bg-slate-800',
          iconColor: 'text-slate-400',
          buttonBg: 'bg-slate-700 hover:bg-slate-800 focus:ring-slate-500',
        };
    }
  };

  const style = getPriorityStyle(activeAlert.priority);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg bg-slate-900 border-2 ${style.border} rounded-2xl shadow-2xl overflow-hidden transition-all transform scale-100 ring-4 ring-red-500/20`}
      >
        {/* Top Banner */}
        <div className={`${style.headerBg} p-4 text-white flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-black/30 rounded-lg">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-200 block">
                SACERT Rapid Dispatch Center
              </span>
              <h3 className="text-base font-black tracking-wide">
                {activeAlert.priority === 'EMERGENCY' ? '🚨 CRITICAL EMERGENCY BROADCAST' : 'SYSTEM BROADCAST'}
              </h3>
            </div>
          </div>
          <span className={`px-2.5 py-1 text-xs font-black uppercase rounded-md tracking-wider ${style.badge}`}>
            {activeAlert.priority}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-slate-100">
          <div className="space-y-2">
            <h4 className="text-lg font-extrabold text-white leading-snug">
              {activeAlert.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>Origin: {activeAlert.sentBy}</span>
              <span>·</span>
              <span>
                {new Date(activeAlert.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                {new Date(activeAlert.sentAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-sm sm:text-base leading-relaxed text-slate-200 font-medium">
            "{activeAlert.message}"
          </div>

          <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-xs text-red-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p>
              Your acknowledgement timestamp will be recorded immediately into the Municipal EOC deployment log.
            </p>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={handleAcknowledge}
              disabled={acknowledged}
              className={`w-full py-3.5 px-6 rounded-xl font-black text-white text-base tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all focus:outline-none focus:ring-4 ${style.buttonBg} ${
                acknowledged ? 'opacity-80 scale-98' : 'hover:scale-[1.01]'
              }`}
            >
              {acknowledged ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  ACKNOWLEDGEMENT RECORDED...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  ACKNOWLEDGE RECEIPT & STANDBY
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-950 px-6 py-2.5 text-center text-[11px] font-mono text-slate-500 border-t border-slate-800">
          Emergency Operations Protocol · Ref ID: {activeAlert.id}
        </div>
      </div>
    </div>
  );
};
