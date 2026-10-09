import React, { useEffect, useState } from 'react';
import {
  Save,
  CheckCircle2,
  Database,
  Download,
  Upload,
  RefreshCcw,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  Shield,
  Camera,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { BackupData } from '../context/AppContext';
import { NoorLogo } from './NoorLogo';

export const SettingsView: React.FC = () => {
  const {
    businessProfile,
    updateBusinessProfile,
    vehicles,
    bookings,
    tours,
    dailyFinances,
    supabaseConnected,
    syncAllToSupabase,
    restoreBackup,
    resetAllDataToZero,
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState(businessProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormData(businessProfile);
  }, [businessProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await updateBusinessProfile(formData);
    if (saved) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleExportFullJSON = () => {
    const fullBackup = {
      timestamp: new Date().toISOString(),
      profile: businessProfile,
      vehicles,
      bookings,
      tours,
      dailyFinances,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Noor_Bike_Rentals_Full_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const parsed = JSON.parse(event.target?.result as string);
            if (Array.isArray(parsed.vehicles) && Array.isArray(parsed.bookings)) {
              const restored = await restoreBackup(parsed as BackupData);
              if (!restored) alert('The backup could not be restored to Supabase.');
            } else {
              alert('Invalid backup file format.');
            }
          } catch (err) {
            alert('Error parsing JSON backup file.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white">Business Settings & Data Storage</h2>
          <p className="text-xs text-slate-400 mt-1">
            Personal management configuration for Noor Bike Rentals, Sri Lanka.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-600/40 text-emerald-400 text-xs font-bold font-mono">
          Currency: LKR / Rs.
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Business settings updated and saved!</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-6 space-y-5 shadow-sm">
        <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-[#1b283d] pb-3">
          <Building className="w-4 h-4 text-cyan-400" />
          <span>Shop & Contact Profile</span>
        </h3>

        {/* Brand Logo Upload & Preview */}
        <div className="p-4 bg-[#121c2d] border border-[#1f2e46] rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NoorLogo size="lg" showText={false} />
            <div>
              <p className="font-bold text-white text-xs">Official Noor Rentals Logo</p>
              <p className="text-[11px] text-slate-400">
                Displayed on your dashboard, sidebar, and customer rental agreements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-sm">
              <Camera className="w-3.5 h-3.5" />
              <span>Upload Custom Logo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result) {
                        setFormData((prev) => ({
                          ...prev,
                          logoUrl: ev.target!.result as string,
                        }));
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
            </label>

            {formData.logoUrl && (
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, logoUrl: undefined }))}
                className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 text-xs font-medium"
              >
                Reset to Default
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Rental Business Name</label>
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
              className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Owner Name</label>
            <input
              type="text"
              required
              value={formData.ownerName}
              onChange={(e) => setFormData((prev) => ({ ...prev, ownerName: e.target.value }))}
              className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">WhatsApp / Phone Number</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Rental Shop Location</label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Terms & Conditions (Printed on Agreements)
          </label>
          <textarea
            value={formData.termsAndConditions}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, termsAndConditions: e.target.value }))
            }
            rows={4}
            className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
          />
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-md shadow-cyan-950/40"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Supabase Cloud Database Connection Card */}
      <div className="bg-[#0e1726] border border-emerald-900/60 rounded-2xl p-6 space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1b283d] pb-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-400" />
            <span>Supabase Cloud Database</span>
          </h3>
          <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-xs font-mono font-bold flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${supabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{supabaseConnected ? 'Realtime connected' : 'Connecting...'}</span>
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Fleet, bookings, tours, customer records, finances, and business preferences are stored in Supabase. Authenticated staff clients receive live database updates.
        </p>

        {syncStatusMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#111a28] p-3.5 rounded-xl border border-[#1b283d]">
          <div>
            <span className="text-slate-400 block text-[11px]">Database Type</span>
            <span className="font-bold text-white font-mono">Supabase Postgres</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Data access</span>
            <span className="font-bold text-emerald-400 font-mono">Authenticated staff only</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Realtime tables</span>
            <span className="font-bold text-cyan-400 font-mono">All business data</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            disabled={isSyncing}
            onClick={async () => {
              setIsSyncing(true);
              const ok = await syncAllToSupabase();
              setIsSyncing(false);
              if (ok) {
                setSyncStatusMsg('All business data synchronized with Supabase successfully!');
                setTimeout(() => setSyncStatusMsg(null), 4000);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-md shadow-emerald-950/40 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing to Cloud...' : 'Sync all data to Supabase'}</span>
          </button>
        </div>
      </div>

      {/* Backup & Restore Data Section */}
      <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-[#1b283d] pb-3">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Cloud Backup Management</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Business records are stored in Supabase. Export a full backup file for safekeeping, or restore it directly into the connected Supabase project.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportFullJSON}
            className="px-4 py-2.5 rounded-xl bg-[#142136] hover:bg-[#1a2d4a] border border-[#203450] text-xs font-bold text-cyan-300 flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Complete Database (JSON)</span>
          </button>

          <button
            type="button"
            onClick={handleImportJSON}
            className="px-4 py-2.5 rounded-xl bg-[#142136] hover:bg-[#1a2d4a] border border-[#203450] text-xs font-bold text-slate-300 flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import / Restore Backup</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              if (
                confirm(
                  'Fresh Start: Are you sure you want to reset all bookings and operational data to 0 in Supabase?'
                )
              ) {
                const reset = await resetAllDataToZero();
                if (!reset) alert('The Supabase reset could not be completed.');
              }
            }}
            className="px-4 py-2.5 rounded-xl border border-rose-900/60 hover:bg-rose-950/40 text-xs font-bold text-rose-400 flex items-center gap-2 transition-colors ml-auto"
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Reset All Data to 0 (New Start)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
