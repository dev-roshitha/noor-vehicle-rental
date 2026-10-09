import React, { useState } from 'react';
import { Search, Bell, AlertTriangle, FileText, ShieldAlert, Calendar, ChevronRight, X, Bike, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDocumentExpiryStatus } from '../utils/formatters';
import { DocumentExpiryAlert } from '../types';
import { NoorLogo } from './NoorLogo';

export const Header: React.FC = () => {
  const {
    currentTab,
    searchQuery,
    setSearchQuery,
    bookings,
    vehicles,
    setCurrentTab,
    setActiveVehicleModal,
    supabaseConnected,
    signOut,
    user,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const overdueList = bookings.filter((b) => b.status === 'Overdue');

  // Compute 30-day expiry alerts for both Insurance and Revenue License with bike number
  const documentExpiryAlerts: DocumentExpiryAlert[] = [];

  vehicles.forEach((v) => {
    // Check Revenue Licence
    if (v.revenueLicenseExpiry) {
      const status = getDocumentExpiryStatus(v.revenueLicenseExpiry, '2026-10-03');
      if (status.isWarning) {
        documentExpiryAlerts.push({
          vehicleId: v.id,
          vehicleName: v.name,
          plateNumber: v.plateNumber,
          documentType: 'Revenue Licence',
          expiryDate: v.revenueLicenseExpiry,
          daysRemaining: status.daysRemaining,
          isExpired: status.isExpired,
        });
      }
    }

    // Check Insurance
    if (v.insuranceExpiry) {
      const status = getDocumentExpiryStatus(v.insuranceExpiry, '2026-10-03');
      if (status.isWarning) {
        documentExpiryAlerts.push({
          vehicleId: v.id,
          vehicleName: v.name,
          plateNumber: v.plateNumber,
          documentType: 'Insurance',
          expiryDate: v.insuranceExpiry,
          daysRemaining: status.daysRemaining,
          isExpired: status.isExpired,
        });
      }
    }
  });

  const totalAlertsCount = overdueList.length + documentExpiryAlerts.length;

  const getHeaderInfo = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          date: 'Saturday, 3 Oct 2026',
          title: "Today's Operations",
          subtitle: 'Rentals, returns and tours at a glance.',
        };
      case 'new-booking':
        return {
          date: 'Saturday, 3 Oct 2026',
          title: 'New Booking',
          subtitle: 'Create a new rental or tour booking with customer verification.',
        };
      case 'fleet':
        return {
          date: 'Fleet & Tours',
          title: 'Our Fleet & Tours',
          subtitle: 'Manage your vehicles, scooty catalogue and tour packages.',
        };
      case 'day-folders':
        return {
          date: 'Customer Records',
          title: 'Day Folders & Customer IDs',
          subtitle: 'Organized daily records with ID proofs, driving licenses & signatures.',
        };
      case 'reports':
        return {
          date: 'Financial Analytics',
          title: 'Financial Reports',
          subtitle: 'Track revenue, expenses and business performance in Sri Lankan Rupees.',
        };
      case 'settings':
        return {
          date: 'Configuration',
          title: 'Personal Business Settings',
          subtitle: 'Manage rental policies, pricing rates, contact info and data backups.',
        };
      default:
        return { date: '', title: '', subtitle: '' };
    }
  };

  const info = getHeaderInfo();

  return (
    <header className="px-8 pt-6 pb-4 bg-[#0a0f18] border-b border-[#162032] flex flex-wrap items-center justify-between gap-4 relative">
      {/* Page Title */}
      <div>
        <p className="text-xs font-semibold text-slate-400 tracking-wide">{info.date}</p>
        <h1 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">{info.title}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{info.subtitle}</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative min-w-[280px] lg:min-w-[320px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookings, customers or vehicles..."
            className="w-full bg-[#121c2c] border border-[#1e2d42] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              ×
            </button>
          )}
        </div>

        {/* Supabase Cloud Database Indicator */}
        <div
          title="Supabase database connection"
          className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#121c2d] border border-emerald-800/40 text-[11px] font-mono text-emerald-300"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              supabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="font-semibold text-slate-200">Supabase</span>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          title={`Sign out ${user?.email ?? ''}`}
          className="p-2.5 rounded-xl border border-[#1e2d42] bg-[#121c2c] text-slate-300 hover:text-white hover:border-slate-500"
        >
          <LogOut className="w-4 h-4" />
        </button>

        {/* Overdue & Document Expiry Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title={
              totalAlertsCount
                ? `${totalAlertsCount} Alerts! (${documentExpiryAlerts.length} document expiries within 30 days)`
                : 'All documents & rentals up to date'
            }
            className={`relative p-2.5 rounded-xl border transition-colors ${
              totalAlertsCount > 0
                ? 'bg-[#182338] border-amber-500/40 text-amber-300 hover:border-amber-400'
                : 'bg-[#121c2c] border-[#1e2d42] text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            {totalAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-md shadow-rose-900/50">
                {totalAlertsCount}
              </span>
            )}
          </button>

          {/* Interactive Notifications Popover Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 top-12 z-50 w-96 bg-[#0e1726] border border-[#1b283d] rounded-2xl shadow-2xl overflow-hidden text-xs">
              <div className="p-3.5 bg-[#142033] border-b border-[#1f2f48] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white">Notifications & Expiry Alerts</span>
                </div>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto divide-y divide-[#182438] p-1">
                {/* 30-Day Revenue License & Insurance Reminders */}
                {documentExpiryAlerts.length > 0 && (
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      <span>⚠️ Document Expiry Reminders (&lt; 30 Days)</span>
                      <span>{documentExpiryAlerts.length}</span>
                    </div>

                    <div className="space-y-2 pt-1">
                      {documentExpiryAlerts.map((alert, idx) => {
                        const targetVehicle = vehicles.find((v) => v.id === alert.vehicleId);
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              if (targetVehicle) {
                                setActiveVehicleModal(targetVehicle);
                                setIsNotifOpen(false);
                              }
                            }}
                            className="p-2.5 rounded-xl bg-[#141d2d] border border-amber-900/50 hover:border-amber-500/60 transition-colors cursor-pointer group flex items-start justify-between gap-3"
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                                <Bike className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-white group-hover:text-amber-300">
                                    Bike: {alert.plateNumber}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-300 font-medium">
                                  {alert.vehicleName}
                                </p>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800/50 font-semibold">
                                    {alert.documentType}
                                  </span>
                                  <span>Expires: {alert.expiryDate}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span
                                className={`text-[10px] font-mono font-bold block ${
                                  alert.isExpired ? 'text-rose-400' : 'text-amber-400'
                                }`}
                              >
                                {alert.isExpired
                                  ? 'EXPIRED'
                                  : `${alert.daysRemaining} days left!`}
                              </span>
                              <span className="text-[9px] text-cyan-400 underline mt-1 block">
                                Renew Date →
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Overdue Rentals Section */}
                {overdueList.length > 0 && (
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-rose-400">
                      <span>🔴 Overdue Rentals</span>
                      <span>{overdueList.length}</span>
                    </div>

                    <div className="space-y-1.5">
                      {overdueList.map((b) => (
                        <div
                          key={b.id}
                          onClick={() => {
                            setCurrentTab('dashboard');
                            setIsNotifOpen(false);
                          }}
                          className="p-2 rounded-xl bg-rose-950/20 border border-rose-900/40 hover:border-rose-600/50 cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-white text-[11px]">{b.customer.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {b.id} · {b.vehicleName} ({b.vehiclePlate})
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-rose-400 font-mono">
                            OVERDUE
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {totalAlertsCount === 0 && (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    <p className="text-emerald-400 font-bold mb-1">All clear!</p>
                    <p>No overdue returns and all vehicle insurance and revenue licenses are valid beyond 30 days.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar / Badge with Noor Rentals Emblem */}
        <div className="flex items-center gap-2.5 pl-2 py-1 pr-3 rounded-xl bg-[#121c2c] border border-[#1e2d42]">
          <NoorLogo size="sm" showText={false} />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-white leading-tight">Noor Kandy</p>
            <p className="text-[10px] text-amber-400 font-medium leading-tight">Bike Rentals &amp; Tours</p>
          </div>
        </div>
      </div>
    </header>
  );
};
