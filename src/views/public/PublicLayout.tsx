import React, { useState } from 'react';
import { SacertLogo } from '../../components/SacertLogo';
import {
  Radio,
  ShieldCheck,
  UserPlus,
  Award,
  CreditCard,
  LogIn,
  Home,
  Info,
  Menu,
  X,
  PhoneCall,
  Activity,
} from 'lucide-react';

interface PublicLayoutProps {
  currentPublicView: string;
  onNavigatePublic: (view: string) => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  currentPublicView,
  onNavigatePublic,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About SACERT', icon: Info },
    { id: 'register', label: 'Member Registration', icon: UserPlus, highlight: true },
    { id: 'verify-certificate', label: 'Certificate Verification', icon: Award },
    { id: 'verify-id', label: 'Member ID Verification', icon: CreditCard },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigatePublic(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-700 selection:text-white">
      {/* Top Emergency Radio & Tactical Status Ticker */}
      <div className="bg-red-700 text-white px-4 py-1.5 text-xs font-mono font-bold flex items-center justify-between shadow-xs">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <Radio className="w-4 h-4 text-white animate-spin shrink-0" />
            <span className="truncate">
              OFFICIAL TACTICAL FREQUENCY: <strong className="text-amber-300">425.025 MHz</strong> (Simplex / Direct) · 24/7 EOC STANDBY
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Net Active</span>
            </span>
            <span>·</span>
            <span>Always Alert. Always Prepared.</span>
          </div>
        </div>
      </div>

      {/* Main Public Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Organization Brand */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
          >
            <SacertLogo size={42} inverted showText={false} />
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-black tracking-tight text-white uppercase font-serif leading-tight group-hover:text-red-400 transition-colors">
                SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM
              </span>
              <span className="text-[10px] font-mono tracking-widest text-red-500 uppercase font-bold">
                Official Operational Command & Registry Portal
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-bold">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentPublicView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-red-700 text-white shadow-xs'
                      : item.highlight
                      ? 'bg-red-950/80 text-red-300 border border-red-700/60 hover:bg-red-900 hover:text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Login CTA */}
            <button
              onClick={() => handleNavClick('login')}
              className={`ml-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                currentPublicView === 'login'
                  ? 'bg-white text-slate-900'
                  : 'bg-red-700 hover:bg-red-800 text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Portal Login</span>
            </button>
          </nav>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => handleNavClick('login')}
              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-1 text-xs font-bold animate-fadeIn">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentPublicView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 ${
                    isActive
                      ? 'bg-red-700 text-white'
                      : item.highlight
                      ? 'bg-red-950/60 text-red-300 border border-red-800/40'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Public Body */}
      <main className="flex-1 bg-slate-950">
        {children}
      </main>

      {/* Official Public Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 px-4 sm:px-6 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <SacertLogo size={36} inverted showText={false} />
              <span className="font-serif font-black text-white text-sm sm:text-base uppercase tracking-tight">
                SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
              Official volunteer first responder corps dedicated to life preservation, incident command, swift-water rescue, and emergency medical triage.
            </p>
            <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-xs pt-1">
              <Radio className="w-4 h-4" />
              <span>Official Radio Frequency: 425.025 MHz (Simplex)</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3 font-mono">
              Public Portal
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => handleNavClick('home')} className="hover:text-white transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('about')} className="hover:text-white transition-colors">
                  About SACERT
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('register')} className="text-red-400 hover:text-red-300 font-bold">
                  Prospective Member Registration
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('verify-certificate')} className="hover:text-white transition-colors">
                  Verify Certificate
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('verify-id')} className="hover:text-white transition-colors">
                  Verify Responder ID
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3 font-mono">
              Operational Command
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Vincent B. Briones - President<br />
              Nicholson J. Dasalla - Vice President
            </p>
            <p className="mt-3 font-mono text-[11px] text-slate-500">
              Emergency Net: 425.025 MHz<br />
              Hotline: 0919-555-CERT
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div>
            © 2026 SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM. All rights reserved.
          </div>
          <div>
            Official Security & Registry System
          </div>
        </div>
      </footer>
    </div>
  );
};
