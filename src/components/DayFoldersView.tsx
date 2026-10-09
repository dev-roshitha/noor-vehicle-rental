import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  Calendar as CalendarIcon,
  User,
  Phone,
  FileText,
  Eye,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Search,
  Bike,
  Image as ImageIcon,
  Archive,
  Filter,
  Sparkles,
  CalendarDays,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Booking } from '../types';
import { formatCurrency, formatDate, downloadCSV } from '../utils/formatters';
import { BookingCalendar } from './BookingCalendar';
import { MonthlyBackupModal } from './MonthlyBackupModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const DayFoldersView: React.FC = () => {
  const {
    bookings,
    selectedDayFolder,
    setSelectedDayFolder,
    setActiveAgreementModal,
    setActiveBookingModal,
    deleteBooking,
  } = useApp();

  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerBooking, setSelectedCustomerBooking] = useState<Booking | null>(null);
  const [isMonthlyBackupOpen, setIsMonthlyBackupOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [viewModeFilter, setViewModeFilter] = useState<'all' | 'pickups' | 'returns'>('all');

  // Group all bookings by day folder date for quick folder list
  const dayFoldersMap: { [date: string]: Booking[] } = {};

  bookings.forEach((b) => {
    const folderDate = b.dayFolder || b.pickupDate || '2026-10-03';
    if (!dayFoldersMap[folderDate]) {
      dayFoldersMap[folderDate] = [];
    }
    dayFoldersMap[folderDate].push(b);
  });

  // Sorted folder dates
  const folderDates = Object.keys(dayFoldersMap).sort((a, b) => b.localeCompare(a));

  // Current selected date bookings:
  // Matches either exact dayFolder, exact pickupDate, or actively on rent during selectedDayFolder
  const currentFolderBookings = bookings.filter((b) => {
    let dateMatches = false;

    if (viewModeFilter === 'pickups') {
      dateMatches = b.pickupDate === selectedDayFolder || b.dayFolder === selectedDayFolder;
    } else if (viewModeFilter === 'returns') {
      dateMatches = b.returnDate === selectedDayFolder;
    } else {
      // 'all': matches dayFolder, pickupDate, or active during date
      dateMatches =
        b.dayFolder === selectedDayFolder ||
        b.pickupDate === selectedDayFolder ||
        b.returnDate === selectedDayFolder ||
        (b.pickupDate <= selectedDayFolder && b.returnDate >= selectedDayFolder);
    }

    if (!dateMatches) return false;

    if (!customerSearch) return true;
    const q = customerSearch.toLowerCase();
    return (
      b.customer.fullName.toLowerCase().includes(q) ||
      b.customer.phoneNumber.toLowerCase().includes(q) ||
      b.customer.idNumber.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.vehiclePlate.toLowerCase().includes(q) ||
      b.vehicleName.toLowerCase().includes(q)
    );
  });

  // Export current day folder summary as CSV
  const handleExportDayFolder = () => {
    const rows = [
      ['Noor Bike Rentals - Day Folder Export', selectedDayFolder],
      ['Generated On', new Date().toLocaleString()],
      ['Search Filter', customerSearch || 'All'],
      [],
      [
        'Booking ID',
        'Customer Name',
        'Phone',
        'Country',
        'ID Type',
        'ID Number',
        'Vehicle',
        'Plate',
        'Total Fee (LKR)',
        'Advance Paid (LKR)',
        'Balance Due (LKR)',
        'Status',
      ],
      ...currentFolderBookings.map((b) => [
        b.id,
        b.customer.fullName,
        b.customer.phoneNumber,
        b.customer.country,
        b.customer.idType,
        b.customer.idNumber,
        b.vehicleName,
        b.vehiclePlate,
        b.totalRentalFee,
        b.advanceAmount,
        b.balanceDue,
        b.status,
      ]),
    ];

    downloadCSV(`DayFolder_${selectedDayFolder}_Noor_Rentals.csv`, rows);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Top Banner with 1-Month Backup Action */}
      <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <CalendarDays className="w-4 h-4" />
            <span>Customer Archive, Calendar & Monthly Backup</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Daily Customer Records & Booking Calendar
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Search old bookings and customers by selecting any date on the calendar. Access verified IDs, driving license photos, vehicle inspection dossiers, and download 1-month comprehensive backups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 1-Month Complete Backup Button */}
          <button
            type="button"
            onClick={() => setIsMonthlyBackupOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <Archive className="w-4 h-4" />
            <span>1-Month Backup & Export</span>
          </button>

          <button
            type="button"
            onClick={handleExportDayFolder}
            className="px-4 py-2.5 rounded-xl bg-[#142236] hover:bg-[#1c304d] text-cyan-300 border border-[#203656] text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Day CSV</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Left Calendar & Folder Picker (5 cols) & Right Folder Dossiers (7 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Booking Calendar & Quick Date Folders (5 cols) */}
        <div className="xl:col-span-5 space-y-5">
          {/* Interactive Booking Calendar */}
          <BookingCalendar
            bookings={bookings}
            selectedDate={selectedDayFolder}
            onSelectDate={(date) => setSelectedDayFolder(date)}
            onSelectBooking={(b) => setActiveBookingModal(b)}
          />

          {/* Quick Recent Day Folders */}
          <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-cyan-400" />
                <span>Recent Archive Folders ({folderDates.length})</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Fast Select</span>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
              {folderDates.map((date) => {
                const count = dayFoldersMap[date]?.length || 0;
                const isSelected = selectedDayFolder === date;

                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDayFolder(date)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#142338] border-cyan-500/60 shadow-sm text-white'
                        : 'bg-[#111a28] border-[#1b283d] hover:bg-[#162337] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderOpen
                        className={`w-4 h-4 ${
                          isSelected ? 'text-cyan-400' : 'text-slate-400'
                        }`}
                      />
                      <div>
                        <span className="text-xs font-mono font-bold block leading-tight">
                          {date}
                          {date === '2026-10-03' && (
                            <span className="ml-1.5 px-1 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-700/50 text-[9px] font-bold rounded">
                              Today
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {formatDate(date)}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-[#172336] text-slate-300'
                      }`}
                    >
                      {count} {count === 1 ? 'record' : 'records'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Dossiers for Selected Date (7 cols) */}
        <div className="xl:col-span-7 space-y-4">
          {/* Header Controls for Date */}
          <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <FolderOpen className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Customer Dossiers:</span>
                  <span className="font-mono text-cyan-300">{selectedDayFolder}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {currentFolderBookings.length} matching bookings & customer dossiers
                </p>
              </div>
            </div>

            {/* Quick search input */}
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customer, phone, passport or plate..."
                className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Filter Bar: All / Pickups / Returns */}
          <div className="flex items-center justify-between px-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Show:</span>
              <button
                type="button"
                onClick={() => setViewModeFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  viewModeFilter === 'all'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-[#121c2d] text-slate-400 hover:text-white border border-[#1f2e46]'
                }`}
              >
                All on this Date
              </button>
              <button
                type="button"
                onClick={() => setViewModeFilter('pickups')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  viewModeFilter === 'pickups'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-[#121c2d] text-slate-400 hover:text-white border border-[#1f2e46]'
                }`}
              >
                Pickups
              </button>
              <button
                type="button"
                onClick={() => setViewModeFilter('returns')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  viewModeFilter === 'returns'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-[#121c2d] text-slate-400 hover:text-white border border-[#1f2e46]'
                }`}
              >
                Returns
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Date: {formatDate(selectedDayFolder)}
            </span>
          </div>

          {/* Customer Records in this Folder */}
          <div className="space-y-4">
            {currentFolderBookings.length === 0 ? (
              <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-12 text-center space-y-3">
                <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  No bookings found for date <strong className="text-white font-mono">{selectedDayFolder}</strong>.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedDayFolder('2026-10-03')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
                  >
                    View Today (Oct 3, 2026)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMonthlyBackupOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#142136] hover:bg-[#1a2d48] border border-[#203450] text-cyan-300 text-xs font-semibold transition-colors"
                  >
                    Open Monthly Archive
                  </button>
                </div>
              </div>
            ) : (
              currentFolderBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-700 transition-colors"
                >
                  {/* Top Customer Info Row */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Customer Photo */}
                      <img
                        src={
                          b.customer.documents.profilePhoto ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={b.customer.fullName}
                        className="w-14 h-14 rounded-2xl object-cover bg-slate-800 border-2 border-cyan-500/40 shadow-md"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-base text-white">
                            {b.customer.fullName}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#142136] text-slate-300 border border-[#203450]">
                            {b.customer.country}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                          <span className="text-emerald-400 font-mono font-semibold">
                            {b.customer.phoneNumber}
                          </span>
                          <span>·</span>
                          <span className="font-mono text-slate-300">
                            {b.customer.idType}: {b.customer.idNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details & Vehicle */}
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                          {b.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${
                            b.status === 'Active'
                              ? 'bg-blue-950 text-blue-400 border border-blue-800'
                              : b.status === 'Overdue'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-200 mt-1">
                        {b.vehicleName} ·{' '}
                        <span className="font-mono text-amber-300">{b.vehiclePlate}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatDate(b.pickupDate)} → {formatDate(b.returnDate)} ({b.days} days)
                      </p>
                    </div>
                  </div>

                  {/* Financial & Security Deposit Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#121c2d] p-3 rounded-xl border border-[#1f2e46] text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Total Rental Fee</span>
                      <span className="font-mono font-bold text-white">
                        {formatCurrency(b.totalRentalFee)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block">Advance Paid</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatCurrency(b.advanceAmount)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block">Balance Due</span>
                      <span
                        className={`font-mono font-bold ${
                          b.balanceDue > 0 ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        {formatCurrency(b.balanceDue)}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] block">Deposit Held</span>
                      <span className="font-mono font-bold text-cyan-300">
                        {b.securityDeposit > 0 ? formatCurrency(b.securityDeposit) : 'Passport / ID'}
                      </span>
                      <span className="text-[9px] text-slate-500 block uppercase">
                        {b.depositHeldType}
                      </span>
                    </div>
                  </div>

                  {/* Verified ID & Document Gallery */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Stored Identity & License Documents ({b.id})
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {/* ID Front */}
                      <div className="relative group rounded-xl overflow-hidden bg-slate-900 border border-[#1f2f48] aspect-video">
                        <img
                          src={
                            b.customer.documents.idFront ||
                            'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80'
                          }
                          alt="ID Front"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 text-center">
                          <span className="text-[9px] font-bold text-slate-200 block">
                            {b.customer.idType} Front
                          </span>
                        </div>
                      </div>

                      {/* ID Back */}
                      <div className="relative group rounded-xl overflow-hidden bg-slate-900 border border-[#1f2f48] aspect-video">
                        <img
                          src={
                            b.customer.documents.idBack ||
                            'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80'
                          }
                          alt="ID Back"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 text-center">
                          <span className="text-[9px] font-bold text-slate-200 block">
                            {b.customer.idType} Back
                          </span>
                        </div>
                      </div>

                      {/* Driver's License */}
                      <div className="relative group rounded-xl overflow-hidden bg-slate-900 border border-[#1f2f48] aspect-video">
                        <img
                          src={
                            b.customer.documents.driverLicense ||
                            'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80'
                          }
                          alt="Driving License"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5 text-center">
                          <span className="text-[9px] font-bold text-emerald-400 block">
                            Driving License
                          </span>
                        </div>
                      </div>

                      {/* Customer Signature & Contract */}
                      <div className="relative group rounded-xl overflow-hidden bg-slate-900 border border-[#1f2f48] aspect-video flex flex-col items-center justify-center p-2 text-center">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1" />
                        <span className="text-[10px] font-bold text-white block">
                          Verified & Signed
                        </span>
                        <span className="text-[9px] text-slate-400 block font-mono">
                          {b.createdAt.split('T')[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1b283d]">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#131d2d] text-slate-400 font-mono">
                        Pickup: {b.pickupTime} · Return: {b.returnTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveAgreementModal(b)}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Print Rental Agreement</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveBookingModal(b)}
                        className="px-3 py-1.5 rounded-xl bg-[#142136] hover:bg-[#1a2d48] border border-[#203450] text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Booking</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBookingToDelete(b)}
                        title="Delete Booking Record"
                        className="p-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 text-rose-400 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Monthly Backup Modal */}
      {isMonthlyBackupOpen && (
        <MonthlyBackupModal onClose={() => setIsMonthlyBackupOpen(false)} />
      )}

      {/* In-App Delete Confirmation Modal */}
      {bookingToDelete && (
        <DeleteConfirmModal
          booking={bookingToDelete}
          onConfirm={() => {
            deleteBooking(bookingToDelete.id);
            setBookingToDelete(null);
          }}
          onClose={() => setBookingToDelete(null)}
        />
      )}
    </div>
  );
};
