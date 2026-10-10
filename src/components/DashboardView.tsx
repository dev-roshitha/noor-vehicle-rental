import React, { useState } from 'react';
import {
  Bike,
  Calendar,
  Banknote,
  AlertTriangle,
  Clock,
  ChevronRight,
  Phone,
  FileText,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Printer,
  Trash2,
  RefreshCcw,
  Plus,
  CarFront,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Booking, VehicleCategory } from '../types';
import { formatCurrency, getTimeLeftString, getDocumentExpiryStatus } from '../utils/formatters';
import { DocumentExpiryAlert } from '../types';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const DashboardView: React.FC = () => {
  const {
    bookings,
    searchQuery,
    setCurrentTab,
    setIsAddVehicleOpen,
    setActiveBookingModal,
    setActiveAgreementModal,
    setActiveReceiptModal,
    setActiveVehicleModal,
    setIsLogReturnOpen,
    setSelectedVehicleForReturn,
    vehicles,
    deleteBooking,
    clearAllBookings,
    resetAllDataToZero,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<'all' | VehicleCategory>('all');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-03');
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [isResetAllModalOpen, setIsResetAllModalOpen] = useState(false);

  // Filter bookings (limited to 5 vehicles on dashboard as requested)
  const filteredBookings = bookings
    .filter((b) => {
      const matchesCat = categoryFilter === 'all' || b.vehicleCategory === categoryFilter;
      const matchesSearch =
        !searchQuery ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .slice(0, 5);

  // The 5 active fleet vehicles
  const dashboardVehicles = vehicles.slice(0, 5);

  // Calculate Document Expiry Alerts (< 30 days) with bike number
  const documentExpiryAlerts: DocumentExpiryAlert[] = [];
  dashboardVehicles.forEach((v) => {
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

  // Calculate Metrics
  const activeRentalsCount = bookings.filter((b) => b.status === 'On Rent' || b.status === 'Overdue').length;
  const returnsDueTodayCount = bookings.filter(
    (b) => b.returnDate === selectedDate && (b.status === 'On Rent' || b.status === 'Overdue')
  ).length;
  const overdueBookings = bookings.filter((b) => b.status === 'Overdue');
  
  // Total cash collected today
  const cashCollectedToday = bookings.reduce((sum, b) => {
    if (b.dayFolder === selectedDate) {
      return sum + (b.paymentStatus === 'Full' ? b.totalRentalFee : b.advanceAmount);
    }
    return sum;
  }, 0);

  // Breakdown by payment methods for today (including Koko Pay)
  const cashBreakdown = bookings
    .filter((b) => b.dayFolder === selectedDate)
    .reduce(
      (acc, b) => {
        const amount = b.paymentStatus === 'Full' ? b.totalRentalFee : b.advanceAmount;
        if (b.paymentMethod === 'Cash') acc.cash += amount;
        else if (b.paymentMethod === 'Card') acc.card += amount;
        else if (b.paymentMethod === 'Koko Pay') acc.koko += amount;
        else acc.bank += amount;
        return acc;
      },
      { cash: 0, card: 0, koko: 0, bank: 0 }
    );

  const totalCollected = cashBreakdown.cash + cashBreakdown.card + cashBreakdown.koko + cashBreakdown.bank || 1;

  const handleReturnClick = (booking: Booking) => {
    const matchedVehicle = vehicles.find((v) => v.id === booking.vehicleId) || null;
    setSelectedVehicleForReturn(matchedVehicle);
    setIsLogReturnOpen(true);
  };

  const openAddVehicle = () => {
    setCurrentTab('fleet');
    setIsAddVehicleOpen(true);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openAddVehicle}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-950/40 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* 4 Metric KPI Cards (matching Screenshot 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Rentals Out */}
        <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Active Rentals Out</p>
            <h3 className="text-2xl font-extrabold text-white mt-0.5">{activeRentalsCount}</h3>
            <p className="text-[11px] text-slate-400">Vehicles currently on rent</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 2: Returns Due Today */}
        <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Returns Due Today</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-0.5">{returnsDueTodayCount}</h3>
            <p className="text-[11px] text-slate-400">Due back by end of day</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 3: Cash Collected Today */}
        <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-teal-600/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Cash Collected Today</p>
            <h3 className="text-2xl font-extrabold text-white mt-0.5">{formatCurrency(cashCollectedToday)}</h3>
            <p className="text-[11px] text-slate-400">From today's customer bookings</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Card 4: Overdue Alerts */}
        <div
          onClick={() => {
            const el = document.getElementById('overdue-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`border rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden shadow-sm cursor-pointer transition-all ${
            overdueBookings.length > 0
              ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700/80'
              : 'bg-[#0e1726] border-[#1b283d]'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Overdue Alerts</p>
            <h3 className="text-2xl font-extrabold text-rose-400 mt-0.5">{overdueBookings.length}</h3>
            <p className="text-[11px] text-rose-300/80">Requires immediate attention</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Main Content Layout: Table on Left (8 cols), Widgets on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Operations Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Quick 5-Vehicles Fleet Status Strip */}
          <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  Fleet Status (5 Vehicles)
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                {vehicles.filter((v) => v.status === 'available').length} Available · {vehicles.filter((v) => v.status === 'on_rent').length} On Rent
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {dashboardVehicles.map((v) => {
                const currentBooking = bookings.find(
                  (b) => b.vehicleId === v.id && (b.status === 'On Rent' || b.status === 'Overdue')
                );
                const isOverdue = currentBooking?.status === 'Overdue';

                return (
                  <div
                    key={v.id}
                    onClick={() => setActiveVehicleModal(v)}
                    className="p-2.5 rounded-xl bg-[#121c2d] border border-[#1f2e46] hover:border-cyan-500/50 cursor-pointer transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-14 rounded-lg overflow-hidden bg-slate-900 mb-2">
                        <img
                          src={v.image}
                          alt={v.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span
                          className={`absolute top-1 right-1 px-1.5 py-0.2 rounded text-[8px] font-bold ${
                            isOverdue
                              ? 'bg-rose-950 text-rose-300 border border-rose-700/80 animate-pulse'
                              : v.status === 'available'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80'
                              : 'bg-blue-950 text-blue-300 border border-blue-700/80'
                          }`}
                        >
                          {isOverdue ? 'Overdue' : v.status === 'available' ? 'Available' : 'On Rent'}
                        </span>
                      </div>
                      <p className="font-bold text-white text-[11px] truncate group-hover:text-cyan-300">
                        {v.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] text-slate-400">{v.plateNumber}</span>
                        {(() => {
                          const revS = getDocumentExpiryStatus(v.revenueLicenseExpiry, '2026-10-03');
                          const insS = getDocumentExpiryStatus(v.insuranceExpiry, '2026-10-03');
                          if (revS.isWarning || insS.isWarning) {
                            return (
                              <span
                                title={`Document renewal due: ${revS.isWarning ? 'Revenue Licence ' : ''}${insS.isWarning ? 'Insurance' : ''}`}
                                className="text-[8px] font-bold text-amber-300 bg-amber-950/80 px-1 py-0.2 rounded border border-amber-700/60"
                              >
                                ⚠️ &lt;30d
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    <div className="pt-2 mt-1 border-t border-[#1a293e] flex items-center justify-between text-[10px]">
                      <span className="font-mono text-emerald-400 font-semibold">
                        Rs. {v.dailyRate.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400">{v.odometer} km</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
            {/* Category Filter Pills (Functional Buttons) */}
            <div className="flex items-center gap-1.5 p-1 bg-[#0a0f18] rounded-xl border border-[#162032]">
              {(['all', 'bikes', 'cars', 'tours'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    categoryFilter === cat
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat === 'bikes' ? 'Bikes / Scooties' : cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                {filteredBookings.length} Active Booking{filteredBookings.length === 1 ? '' : 's'}
              </span>

              {/* Date Filter selector */}
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[#0a0f18] border border-[#162032] rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Quick Fresh Start Reset Button */}
              <button
                type="button"
                onClick={() => setIsResetAllModalOpen(true)}
                title="Reset Cash, Income and All Bookings to 0"
                className="px-3 py-1.5 rounded-xl border border-rose-900/60 hover:bg-rose-950/40 text-[11px] font-bold text-rose-400 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCcw className="w-3 h-3" />
                <span>Reset to 0 (Fresh Start)</span>
              </button>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1b283d] text-slate-400 bg-[#0a0f18]/60 font-medium">
                    <th className="py-3.5 px-4">Booking ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Vehicle / Tour</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Due Time</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Time Left</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#162032]">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-14 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-bold text-white">Fresh Start — 0 Active Rentals</p>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {vehicles.length === 0
                              ? 'Add a vehicle to your fleet before creating your first booking.'
                              : 'All fleet vehicles are available and ready. Cash collected & operational income starts at 0.'}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                            {vehicles.length === 0 && (
                              <button
                                type="button"
                                onClick={openAddVehicle}
                                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-950/40 flex items-center gap-1.5"
                              >
                                <CarFront className="w-3.5 h-3.5" />
                                Add Your First Vehicle
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setCurrentTab('new-booking')}
                              className="px-4 py-2 rounded-xl bg-[#142136] hover:bg-[#1b2d48] border border-[#203450] text-slate-200 text-xs font-bold transition-all"
                            >
                              + Create First Booking
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const timeLeft = getTimeLeftString(b.returnDate, b.returnTime);
                      const isOverdue = b.status === 'Overdue' || timeLeft.isOverdue;

                      return (
                        <tr
                          key={b.id}
                          className="hover:bg-[#121c2e]/60 transition-colors group cursor-pointer"
                          onClick={() => setActiveBookingModal(b)}
                        >
                          {/* Booking ID */}
                          <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                            {b.id}
                          </td>

                          {/* Customer */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white whitespace-nowrap">
                              {b.customer.fullName}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <span>{b.customer.country}</span>
                              <span>·</span>
                              <span>{b.customer.phoneNumber}</span>
                            </div>
                          </td>

                          {/* Vehicle / Tour */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={b.vehicleImage}
                                alt={b.vehicleName}
                                className="w-9 h-7 rounded-md object-cover bg-slate-800 border border-[#1f2d44]"
                              />
                              <div>
                                <div className="font-semibold text-white whitespace-nowrap">
                                  {b.vehicleName}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {b.vehiclePlate}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                                b.vehicleCategory === 'bikes'
                                  ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/40'
                                  : b.vehicleCategory === 'cars'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40'
                                  : 'bg-amber-950/80 text-amber-400 border border-amber-800/40'
                              }`}
                            >
                              {b.vehicleCategory === 'bikes' ? 'Bikes' : b.vehicleCategory}
                            </span>
                          </td>

                          {/* Due Time */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-300 font-mono">
                            {b.returnTime}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                b.status === 'Overdue'
                                  ? 'bg-rose-900/60 text-rose-300 border border-rose-700/60 animate-pulse'
                                  : b.status === 'On Rent'
                                  ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50'
                                  : b.status === 'Active'
                                  ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50'
                                  : b.status === 'Returned'
                                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                  : 'bg-amber-900/50 text-amber-300 border border-amber-700/50'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>

                          {/* Time Left */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`font-semibold text-xs ${
                                isOverdue
                                  ? 'text-rose-400 font-mono'
                                  : b.status === 'Returned'
                                  ? 'text-slate-500'
                                  : 'text-emerald-400 font-mono'
                              }`}
                            >
                              {b.status === 'Returned' ? 'Completed' : timeLeft.text}
                            </span>
                          </td>

                          {/* Actions */}
                          <td
                            className="py-3.5 px-4 text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Open Customer Receipt PDF */}
                              <button
                                onClick={() => setActiveReceiptModal(b)}
                                title="Print / Download Customer Receipt PDF"
                                className="p-1.5 rounded-lg bg-[#142136] text-cyan-300 hover:text-white hover:bg-cyan-600/30 border border-[#20324d] transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Open Agreement / Print */}
                              <button
                                onClick={() => setActiveAgreementModal(b)}
                                title="View Customer Agreement & ID"
                                className="p-1.5 rounded-lg bg-[#142136] text-slate-300 hover:text-cyan-400 hover:bg-[#1b2b46] border border-[#20324d] transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              {/* WhatsApp Direct */}
                              <a
                                href={`https://wa.me/${b.customer.phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                  `Hello ${b.customer.fullName}, this is Noor Bike Rentals regarding your booking ${b.id} (${b.vehicleName}).`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                title="WhatsApp Customer"
                                className="p-1.5 rounded-lg bg-[#142136] text-slate-300 hover:text-emerald-400 hover:bg-[#1b2b46] border border-[#20324d] transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>

                              {/* Quick Return Vehicle */}
                              {b.status !== 'Returned' && (
                                <button
                                  onClick={() => handleReturnClick(b)}
                                  title="Log Vehicle Return"
                                  className="px-2.5 py-1 rounded-lg bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600 hover:text-white border border-cyan-500/40 text-[11px] font-semibold transition-all flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Return</span>
                                </button>
                              )}

                              {/* Delete Rental Booking Detail */}
                              <button
                                onClick={() => setBookingToDelete(b)}
                                title="Delete Rental Booking Detail"
                                className="p-1.5 rounded-lg bg-rose-950/30 text-rose-400 hover:text-white hover:bg-rose-600 border border-rose-900/50 transition-colors ml-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Widgets (4 cols) matching Screenshot 4 */}
        <div className="lg:col-span-4 space-y-6">
          {/* Widget 0: Vehicle Document Expiry Alerts (< 30 Days) */}
          <div className="bg-[#0e1726] border border-amber-500/40 rounded-2xl p-5 shadow-sm space-y-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-amber-300">Document Expiry (&lt; 30 Days)</span>
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60 font-mono">
                {documentExpiryAlerts.length} Alerts
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Vehicle Revenue Licence and Insurance renewals due within 30 days:
            </p>

            {documentExpiryAlerts.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>All 5 vehicles have valid revenue licenses & insurance (&gt; 30 days).</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {documentExpiryAlerts.map((alert, idx) => {
                  const targetVehicle = vehicles.find((v) => v.id === alert.vehicleId);
                  return (
                    <div
                      key={idx}
                      onClick={() => targetVehicle && setActiveVehicleModal(targetVehicle)}
                      className="p-3 rounded-xl bg-[#141d2d] border border-amber-900/60 hover:border-amber-400/70 transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
                          <Bike className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-white text-xs group-hover:text-amber-300">
                              Bike: {alert.plateNumber}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 font-medium">
                            {alert.vehicleName}
                          </p>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-bold">
                              {alert.documentType}
                            </span>
                            <span className="font-mono">{alert.expiryDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs font-mono font-bold block ${
                            alert.isExpired ? 'text-rose-400' : 'text-amber-400'
                          }`}
                        >
                          {alert.isExpired ? 'EXPIRED' : `${alert.daysRemaining}d left!`}
                        </span>
                        <button
                          type="button"
                          className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-black text-amber-300 text-[9px] font-bold transition-colors mt-1"
                        >
                          Renew
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Widget 1: Overdue Alerts */}
          <div
            id="overdue-section"
            className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Overdue Alerts</span>
              </h4>
              <button
                onClick={() => setCategoryFilter('all')}
                className="text-xs text-cyan-400 hover:underline font-medium"
              >
                View all
              </button>
            </div>

            {overdueBookings.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-500/60" />
                <span>No vehicles currently overdue! All returns are on schedule.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {overdueBookings.map((b) => {
                  const tl = getTimeLeftString(b.returnDate, b.returnTime);
                  return (
                    <div
                      key={b.id}
                      className="bg-[#141b2a] border border-rose-900/40 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-rose-700/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">
                            {b.customer.fullName}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {b.id} · {b.vehicleName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-rose-400 block">
                          {tl.text}
                        </span>
                        <div className="flex items-center justify-end gap-1.5 mt-1">
                          <a
                            href={`https://wa.me/${b.customer.phoneNumber.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded bg-[#1e2a3f] text-slate-300 hover:text-emerald-400"
                            title="Call customer"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => handleReturnClick(b)}
                            className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold hover:bg-rose-600 hover:text-white transition-colors"
                          >
                            Return
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Widget 2: Cash Collected Today Breakdown (matching screenshot 4) */}
          <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h4 className="font-bold text-sm text-white">Cash Collected Today</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Method distribution for today</p>
            </div>

            <div className="space-y-3.5">
              {/* Cash item */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span>Cash</span>
                  </div>
                  <span className="font-bold text-white font-mono">
                    {formatCurrency(cashBreakdown.cash)}
                  </span>
                </div>
                <div className="w-full bg-[#141d2c] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(cashBreakdown.cash / totalCollected) * 100}%` }}
                  />
                </div>
              </div>

              {/* Card item */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <div className="w-4 h-4 rounded bg-cyan-600/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                      💳
                    </div>
                    <span>Card / POS</span>
                  </div>
                  <span className="font-bold text-white font-mono">
                    {formatCurrency(cashBreakdown.card)}
                  </span>
                </div>
                <div className="w-full bg-[#141d2c] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(cashBreakdown.card / totalCollected) * 100}%` }}
                  />
                </div>
              </div>

              {/* Koko Pay item */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <div className="w-4 h-4 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">
                      ⚡
                    </div>
                    <span>Koko Pay</span>
                  </div>
                  <span className="font-bold text-white font-mono">
                    {formatCurrency(cashBreakdown.koko)}
                  </span>
                </div>
                <div className="w-full bg-[#141d2c] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(cashBreakdown.koko / totalCollected) * 100}%` }}
                  />
                </div>
              </div>

              {/* Bank Transfer item */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <div className="w-4 h-4 rounded bg-purple-600/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">
                      🏛️
                    </div>
                    <span>Bank Transfer</span>
                  </div>
                  <span className="font-bold text-white font-mono">
                    {formatCurrency(cashBreakdown.bank)}
                  </span>
                </div>
                <div className="w-full bg-[#141d2c] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(cashBreakdown.bank / totalCollected) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Jump to Financial Reports */}
            <button
              onClick={() => setCurrentTab('reports')}
              className="w-full mt-2 p-3 rounded-xl bg-[#142034] hover:bg-[#1a2b46] border border-[#20324f] flex items-center justify-between text-left text-xs font-semibold text-slate-200 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                <div>
                  <p className="text-white group-hover:text-cyan-300">View detailed reports</p>
                  <p className="text-[10px] text-slate-400 font-normal">
                    See full financial breakdown & profit
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>
      </div>

      {/* In-App Delete Confirmation Modal for Single Booking */}
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

      {/* In-App Confirmation Modal for Fresh Start / Clear All */}
      {isResetAllModalOpen && (
        <DeleteConfirmModal
          isAllDelete={true}
          onConfirm={async () => {
            await clearAllBookings();
            setIsResetAllModalOpen(false);
          }}
          onClose={() => setIsResetAllModalOpen(false)}
        />
      )}
    </div>
  );
};
