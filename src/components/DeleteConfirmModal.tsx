import React from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { Booking } from '../types';

interface Props {
  booking?: Booking | null;
  isAllDelete?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<Props> = ({
  booking,
  isAllDelete = false,
  onConfirm,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0e1726] border border-rose-900/60 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-950/60 via-rose-900/30 to-[#121c2d] border-b border-rose-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white">
              {isAllDelete ? 'Reset All to 0 & Delete All Bookings' : 'Delete Rental Booking'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {isAllDelete ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/40 text-rose-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-200">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Start Fresh: Reset All Records</span>
                </div>
                <p className="text-[11px] text-rose-300/90 leading-relaxed">
                  This will permanently delete <strong>all bookings</strong> from Supabase. Cash collected, total income, and trip counts will be set back to <strong>0</strong>.
                </p>
              </div>
              <p className="text-slate-300">
                Are you sure you want to clear all data and start completely fresh?
              </p>
            </div>
          ) : booking ? (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#141d2d] border border-[#1f2d42] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-cyan-300">{booking.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    {booking.status}
                  </span>
                </div>
                <div className="text-slate-300">
                  <p className="font-bold text-white text-sm">{booking.customer.fullName}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {booking.customer.phoneNumber} · {booking.customer.country}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#1a2538] flex items-center justify-between text-[11px] text-slate-300">
                  <span>Vehicle: <strong className="text-white">{booking.vehicleName}</strong></span>
                  <span className="font-mono text-emerald-400">{booking.vehiclePlate}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-300/90 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Deleting this booking will release <strong>{booking.vehiclePlate}</strong> back to available and deduct its advance/full payment from today's cash records.
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0a0f18] border-t border-[#1a2538] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#142136] hover:bg-[#1a2d48] border border-[#203450] text-xs font-semibold text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-950/50 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isAllDelete ? 'Yes, Delete All & Start Fresh' : 'Yes, Delete Booking'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
