import React, { useState } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { Notification } from '../../types';
import { Bell, CheckCheck, Trash2, Radio, Award, GraduationCap, Megaphone, Info } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { currentMember, currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(
    db.getNotifications(currentMember?.memberId)
  );
  const [filterType, setFilterType] = useState<string>('ALL');

  const reload = () => {
    setNotifications(db.getNotifications(currentMember?.memberId));
  };

  const handleMarkAllRead = () => {
    db.markAllNotificationsAsRead(currentMember?.memberId);
    reload();
  };

  const handleMarkRead = (id: string) => {
    db.markNotificationAsRead(id);
    reload();
  };

  const filtered = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'EMERGENCY':
        return <Radio className="w-4 h-4 text-red-600 animate-pulse" />;
      case 'CERTIFICATE':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'TRAINING':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-4 h-4 text-slate-700" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              Activity Alerts
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1">
            NOTIFICATION CENTER
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Emergency alerts, training schedules, certification approvals, and administrative updates
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4 text-emerald-600" />
          Mark All as Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 text-xs">
        {['ALL', 'EMERGENCY', 'TRAINING', 'CERTIFICATE', 'ANNOUNCEMENT'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`py-2 px-3 font-bold border-b-2 transition-colors ${
              filterType === type
                ? 'border-red-700 text-red-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                !n.isRead
                  ? 'bg-red-50/50 border-red-200 shadow-2xs'
                  : 'bg-white border-slate-200 opacity-80'
              }`}
            >
              <div className="p-2 bg-white rounded-lg border border-slate-200 shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900">{n.title}</h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{n.message}</p>
              </div>
              {!n.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 mt-2" />
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-medium text-xs">No notifications in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
