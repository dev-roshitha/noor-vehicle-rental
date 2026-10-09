import React, { useState } from 'react';
import {
  FileText,
  Phone,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Clock,
  Banknote,
  ShieldCheck,
  Bike,
  User,
  MapPin,
  ExternalLink,
  Printer,
  Trash2,
} from 'lucide-react';
import { Booking } from '../types';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, getTimeLeftString } from '../utils/formatters';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface Props {
  booking: Booking;
  onClose: () => void;
}

export const BookingDetailModal: React.FC<Props> = ({ booking, onClose }) => {
  const {
    setActiveAgreementModal,
    setActiveReceiptModal,
    setIsLogReturnOpen,
    setSelectedVehicleForReturn,
    vehicles,
    deleteBooking,
  } = useApp();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const timeLeft = getTimeLeftString(booking.returnDate, booking.returnTime);

  const handleReturn = () => {
    const matched = vehicles.find((v) => v.id === booking.vehicleId) || null;
    setSelectedVehicleForReturn(matched);
    setIsLogReturnOpen(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1b283d] pb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800/40">
              {booking.id}
            </span>
            <div>
              <h3 className="font-bold text-base text-white">Rental Booking Details</h3>
              <p className="text-xs text-slate-400">
                Created: {formatDate(booking.createdAt.split('T')[0])}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 text-lg">
            ✕
          </button>
        </div>

        {/* Customer & Vehicle Snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer */}
          <div className="p-4 rounded-xl bg-[#121c2d] border border-[#1f2e46] space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Customer Info
            </span>
            <div className="flex items-center gap-3">
              <img
                src={
                  booking.customer.documents.profilePhoto ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                }
                alt=""
                className="w-12 h-12 rounded-xl object-cover border border-[#223550]"
              />
              <div>
                <p className="font-bold text-sm text-white">{booking.customer.fullName}</p>
                <p className="text-xs text-cyan-400 font-mono font-medium">{booking.customer.phoneNumber}</p>
                <p className="text-[11px] text-slate-400">
                  {booking.customer.country} · {booking.customer.idType} ({booking.customer.idNumber})
                </p>
              </div>
            </div>
          </div>

          {/* Vehicle */}
          <div className="p-4 rounded-xl bg-[#121c2d] border border-[#1f2e46] space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Vehicle Rented
            </span>
            <div className="flex items-center gap-3">
              <img
                src={booking.vehicleImage}
                alt=""
                className="w-14 h-12 rounded-xl object-cover border border-[#223550]"
              />
              <div>
                <p className="font-bold text-sm text-white">{booking.vehicleName}</p>
                <p className="text-xs text-slate-300 font-mono font-bold bg-[#172336] px-2 py-0.5 rounded inline-block mt-0.5">
                  {booking.vehiclePlate}
                </p>
                <p className="text-[11px] text-emerald-400 font-mono mt-1">
                  {formatCurrency(booking.ratePerDay)} / day
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule & Due Timer */}
        <div className="p-4 rounded-xl bg-[#121c2d] border border-[#1f2e46] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Status:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                booking.status === 'Overdue'
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
              }`}
            >
              {booking.status} ({timeLeft.text})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
            <div>
              <span className="text-slate-400 block">Pickup:</span>
              <span className="font-mono text-white font-bold">
                {booking.pickupDate} at {booking.pickupTime}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Scheduled Return:</span>
              <span className="font-mono text-white font-bold">
                {booking.returnDate} at {booking.returnTime}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="p-4 rounded-xl bg-[#090e17] border border-[#1b283d] space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>
              Total Rental Fee ({booking.days} days × {formatCurrency(booking.ratePerDay)}):
            </span>
            <span className="font-bold font-mono text-white">
              {formatCurrency(booking.totalRentalFee)}
            </span>
          </div>
          <div className="flex justify-between text-emerald-400">
            <span>Advance Received ({booking.paymentMethod}):</span>
            <span className="font-bold font-mono">{formatCurrency(booking.advanceAmount)}</span>
          </div>
          <div className="flex justify-between text-amber-400 pt-1 border-t border-[#182336]">
            <span>Balance Due on Return:</span>
            <span className="font-bold font-mono text-sm">{formatCurrency(booking.balanceDue)}</span>
          </div>
          <div className="flex justify-between text-slate-400 pt-1">
            <span>Security Deposit:</span>
            <span className="font-mono text-cyan-300">
              {booking.depositHeldType}: {formatCurrency(booking.securityDeposit)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${booking.customer.phoneNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#142136] text-emerald-400 hover:bg-[#1a2d48] border border-[#203450] text-xs font-bold flex items-center gap-1.5"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp Customer</span>
            </a>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              title="Delete Booking Record"
              className="px-3.5 py-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveReceiptModal(booking);
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Customer Receipt (PDF)</span>
            </button>

            <button
              onClick={() => {
                setActiveAgreementModal(booking);
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-[#142136] text-slate-300 hover:bg-[#1a2d48] border border-[#203450] text-xs font-bold flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Full Agreement</span>
            </button>

            {booking.status !== 'Returned' && (
              <button
                onClick={handleReturn}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Log Vehicle Return</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {isDeleteModalOpen && (
        <DeleteConfirmModal
          booking={booking}
          onConfirm={() => {
            deleteBooking(booking.id);
            setIsDeleteModalOpen(false);
            onClose();
          }}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};
