import React from 'react';
import { NavbarProps } from '../types';

export default function Navbar({ activeTab, onTabChange, systemStatus = 'SECURE' }: NavbarProps) {
  const navItems = [
    { id: 'dashboard', label: 'SOC Dashboard' },
    { id: 'noc', label: 'Network Operations (NOC)' },
    { id: 'scanner', label: 'Message Scanner' },
    { id: 'reports', label: 'Threat Reports' },
  ];

  const statusColors = {
    SECURE: 'bg-emerald-500/10 text-emerald-800 border-emerald-300',
    ELEVATED: 'bg-amber-500/10 text-amber-800 border-amber-300',
    CRITICAL: 'bg-rose-500/10 text-rose-800 border-rose-300',
  };

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1B4332] flex items-center justify-center text-white font-black tracking-wider shadow-sm">
            SS
          </div>
          <div>
            <h1 className="text-sm font-black text-[#1B4332] uppercase tracking-wider">
              SmishShield SOC
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">
              National Phishing & SMS Threat Defense
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-[#1B4332] shadow-sm'
                    : 'text-slate-600 hover:text-[#1B4332] hover:bg-white/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* System Status Indicator */}
        <div className={`px-3 py-1 rounded-lg border text-[11px] font-bold font-mono flex items-center gap-2 ${statusColors[systemStatus]}`}>
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          SYSTEM: {systemStatus}
        </div>
      </div>
    </header>
  );
}