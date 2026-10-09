import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  CarFront,
  BarChart3,
  FolderLock,
  Settings,
  Bike,
  CalendarDays,
} from 'lucide-react';
import { useApp, NavTab } from '../context/AppContext';
import { NoorLogo } from './NoorLogo';

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, bookings } = useApp();

  const overdueCount = bookings.filter((b) => b.status === 'Overdue').length;

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-booking', label: 'New Booking', icon: PlusCircle },
    { id: 'fleet', label: 'Fleet & Tours', icon: CarFront },
    { id: 'day-folders', label: 'Calendar & Day Folders', icon: CalendarDays },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-[#0a0f18] border-r border-[#1a2538] flex flex-col justify-between shrink-0 min-h-screen text-slate-300 select-none">
      {/* Brand Header with Uploaded Noor Rentals Logo */}
      <div>
        <div className="p-4 border-b border-[#162032] flex items-center justify-between">
          <NoorLogo size="md" showText={true} />
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#18314e] text-cyan-300 shadow-sm border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111c2e]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'dashboard' && overdueCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full">
                    {overdueCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Settings */}
      <div className="p-3 border-t border-[#162032] space-y-2">
        <button
          onClick={() => setCurrentTab('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            currentTab === 'settings'
              ? 'bg-[#18314e] text-cyan-300 border border-cyan-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#111c2e]'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>

        <div className="bg-[#0e1726] border border-[#1b283d] rounded-xl p-3 text-[11px] text-slate-400">
          <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Personal Edition
            </span>
            <span className="text-emerald-400 font-mono">LKR / Rs.</span>
          </div>
          <p className="text-slate-400 text-[10px] leading-relaxed">
            Noor Bike Rentals Management Weligama, Sri Lanka.
          </p>
        </div>
      </div>
    </aside>
  );
};
