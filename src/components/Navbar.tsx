import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SacertLogo } from './SacertLogo';
import { db } from '../services/db';
import {
  Bell,
  Radio,
  Search,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  onOpenVerify: () => void;
  onNavigate: (view: string) => void;
  activeView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenVerify,
  onNavigate,
  activeView,
}) => {
  const { currentUser, currentMember, logout, isAdmin } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = db.getNotifications(currentMember?.memberId);
  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const activeAlerts = db.getActiveEmergencyAlerts();

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white select-none">
      {/* Active Red Alert Ticker (if any emergency alert is active) */}
      {activeAlerts.length > 0 && (
        <div className="bg-red-700 text-white px-4 py-1.5 text-xs font-black tracking-wide flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 truncate">
            <Radio className="w-4 h-4 shrink-0 text-white animate-spin" />
            <span className="truncate">
              🚨 SACERT ACTIVE EMERGENCY ALERT: {activeAlerts[0].title} — Standby Channel 144.750 MHz
            </span>
          </div>
          <button
            onClick={() => onNavigate(isAdmin ? 'emergency-alerts' : 'dashboard')}
            className="text-[11px] underline font-bold uppercase tracking-wider shrink-0 ml-2 hover:text-red-100"
          >
            View Alert Protocol
          </button>
        </div>
      )}

      {/* Main Top Bar (Strict 3-zone contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark + crest */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <SacertLogo size={36} inverted showText={false} />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tight text-white leading-none font-serif">
                SACERT SAN ANDRES
              </span>
              <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase font-semibold">
                Emergency Response System
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-6 text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`transition-colors hover:text-white ${
              activeView === 'dashboard' ? 'text-white font-bold' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate(isAdmin ? 'members' : 'profile')}
            className={`transition-colors hover:text-white ${
              activeView === 'members' || activeView === 'profile' ? 'text-white font-bold' : ''
            }`}
          >
            {isAdmin ? 'Members Roster' : 'My 201 Record'}
          </button>
          <button
            onClick={() => onNavigate(isAdmin ? 'trainings' : 'my-trainings')}
            className={`transition-colors hover:text-white ${
              activeView === 'trainings' || activeView === 'my-trainings' ? 'text-white font-bold' : ''
            }`}
          >
            Trainings
          </button>
          <button
            onClick={() => onNavigate(isAdmin ? 'certificates' : 'my-certificates')}
            className={`transition-colors hover:text-white ${
              activeView === 'certificates' || activeView === 'my-certificates' ? 'text-white font-bold' : ''
            }`}
          >
            Certificates
          </button>
          <button
            onClick={() => onNavigate('contacts')}
            className={`transition-colors hover:text-white ${
              activeView === 'contacts' ? 'text-white font-bold' : ''
            }`}
          >
            Hotlines
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          {/* Public Verification Action Button */}
          <button
            onClick={onOpenVerify}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            title="Public Verification Portal"
          >
            <Search className="w-3.5 h-3.5 text-red-400" />
            <span>Verify ID/Cert</span>
          </button>

          {/* Notifications Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Notifications ({unreadNotifs.length} Unread)
                  </span>
                  <button
                    onClick={() => {
                      db.markAllNotificationsAsRead(currentMember?.memberId);
                    }}
                    className="text-[11px] text-red-700 hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 hover:bg-slate-50 transition-colors ${
                          !n.isRead ? 'bg-red-50/50' : ''
                        }`}
                        onClick={() => db.markNotificationAsRead(n.id)}
                      >
                        <p className="font-bold text-slate-900">{n.title}</p>
                        <p className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-center text-slate-400 text-xs">No notifications</p>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('notifications');
                    }}
                    className="text-xs text-red-700 font-bold hover:underline"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account / Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-left transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-red-700 text-white flex items-center justify-center text-xs font-bold">
                {currentUser?.fullName.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-white leading-none truncate max-w-[120px]">
                  {currentUser?.fullName.split(' ')[0]}
                </span>
                <span className="text-[10px] font-mono text-red-400 uppercase leading-tight font-semibold">
                  {currentUser?.role === 'SUPER_ADMIN'
                    ? 'Super Admin'
                    : currentUser?.role === 'ADMINISTRATOR'
                    ? 'Admin'
                    : 'Responder'}
                </span>
              </div>
            </button>

            {/* User Account Menu */}
            {showRoleSwitcher && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 py-3 z-50">
                <div className="px-4 pb-3 border-b border-slate-100">
                  <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Signed in as:</p>
                  <p className="text-sm font-extrabold text-slate-900 truncate mt-0.5">
                    {currentUser?.fullName}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold font-mono bg-red-100 text-red-800 rounded">
                    {currentUser?.role === 'SUPER_ADMIN'
                      ? 'Super Administrator'
                      : currentUser?.role === 'ADMINISTRATOR'
                      ? 'Administrator'
                      : 'Responder Member'} · {currentUser?.username.startsWith('@') ? currentUser?.username : `@${currentUser?.username}`}
                  </span>
                </div>

                <div className="pt-2 text-xs">
                  <button
                    onClick={() => {
                      setShowRoleSwitcher(false);
                      onNavigate(isAdmin ? 'settings' : 'account-settings');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 font-medium text-slate-700"
                  >
                    <KeyRound className="w-4 h-4 text-slate-400" />
                    Security & Password
                  </button>
                  <button
                    onClick={() => {
                      setShowRoleSwitcher(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 font-bold text-red-700"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    Sign Out Securely
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
