import React from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/db';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  GraduationCap,
  Award,
  CreditCard,
  Megaphone,
  Radio,
  Bell,
  FileBarChart2,
  FileClock,
  ShieldCheck,
  Settings,
  UserCheck,
  PhoneCall,
  KeyRound,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  superOnly?: boolean;
  badge?: number;
}

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  className = '',
}) => {
  const { isAdmin, isSuperAdmin, logout, currentMember, currentUser } = useAuth();
  const pendingRegistrationsCount = db.getRegistrations('PENDING').length;

  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'members', label: 'MEMBERS', icon: Users },
    {
      id: 'registrations',
      label: 'REGISTRATIONS',
      icon: UserPlus,
      badge: pendingRegistrationsCount > 0 ? pendingRegistrationsCount : undefined,
    },
    { id: 'trainings', label: 'TRAININGS', icon: GraduationCap },
    { id: 'certificates', label: 'CERTIFICATES', icon: Award },
    { id: 'id-management', label: 'ID MANAGEMENT', icon: CreditCard },
    { id: 'announcements', label: 'ANNOUNCEMENTS', icon: Megaphone },
    { id: 'emergency-alerts', label: 'EMERGENCY ALERTS', icon: Radio, highlight: true },
    { id: 'notifications', label: 'NOTIFICATIONS', icon: Bell },
    { id: 'reports', label: 'REPORTS', icon: FileBarChart2 },
    { id: 'audit-log', label: 'AUDIT LOG', icon: FileClock },
    { id: 'administrators', label: 'ADMINISTRATORS', icon: ShieldCheck, superOnly: true },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  const memberNavItems: NavItem[] = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'profile', label: 'MY PROFILE', icon: UserCheck },
    { id: 'my-trainings', label: 'MY TRAININGS', icon: GraduationCap },
    { id: 'my-certificates', label: 'MY CERTIFICATES', icon: Award },
    { id: 'my-id', label: 'MY ID', icon: CreditCard },
    { id: 'announcements', label: 'ANNOUNCEMENTS', icon: Megaphone },
    { id: 'notifications', label: 'NOTIFICATIONS', icon: Bell },
    { id: 'contacts', label: 'EMERGENCY CONTACTS', icon: PhoneCall },
    { id: 'account-settings', label: 'ACCOUNT SETTINGS', icon: KeyRound },
  ];

  const items = isAdmin
    ? adminNavItems.filter((item) => !item.superOnly || isSuperAdmin)
    : memberNavItems;

  return (
    <aside
      className={`w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 select-none ${className}`}
    >
      <div className="py-4">
        {/* Navigation Category Label */}
        <div className="px-5 mb-3 flex items-center justify-between">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400">
            {isAdmin ? 'ADMINISTRATION SUITE' : 'RESPONDER PORTAL'}
          </span>
          {isAdmin && (
            <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono bg-red-900/60 text-red-200 border border-red-700/50 rounded">
              {currentUser?.role === 'SUPER_ADMIN' ? 'SUPER' : 'ADMIN'}
            </span>
          )}
        </div>

        {/* Navigation List */}
        <nav className="space-y-0.5 px-3">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
                  isActive
                    ? 'bg-red-700 text-white shadow-xs'
                    : item.highlight
                    ? 'text-red-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-red-500 animate-pulse'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500 text-white rounded-full leading-none animate-pulse">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Member/Admin Status Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-3">
        <div className="text-xs">
          <p className="text-[10px] font-mono text-slate-400 uppercase">
            Station Status:
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-slate-200 text-xs">EOC Ops Online</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
            Radio Net: 425.025 MHz
          </span>
        </div>

        <button
          onClick={logout}
          className="w-full py-2 px-3 text-xs font-bold text-slate-300 hover:text-red-400 hover:bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>SIGN OUT</span>
        </button>
      </div>
    </aside>
  );
};
