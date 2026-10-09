import React, { useState } from 'react';
import {
  Download,
  Calendar,
  X,
  FileText,
  DollarSign,
  Users,
  Bike,
  CheckCircle2,
  Printer,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Booking } from '../types';
import { formatCurrency, formatDate, downloadCSV } from '../utils/formatters';

interface Props {
  onClose: () => void;
}

export const MonthlyBackupModal: React.FC<Props> = ({ onClose }) => {
  const { bookings, vehicles, dailyFinances, businessProfile } = useApp();

  // Selected Month (Format: YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Available unique months from bookings and finances
  const monthsSet = new Set<string>();
  // Add recent 6 months
  ['2026-10', '2026-09', '2026-08', '2026-07', '2026-06', '2026-05'].forEach((m) =>
    monthsSet.add(m)
  );

  bookings.forEach((b) => {
    if (b.pickupDate && b.pickupDate.length >= 7) {
      monthsSet.add(b.pickupDate.substring(0, 7));
    }
  });

  const availableMonths = Array.from(monthsSet).sort((a, b) => b.localeCompare(a));

  // Filter bookings for the selected month
  const monthBookings = bookings.filter((b) => {
    const pickupM = b.pickupDate?.substring(0, 7);
    const returnM = b.returnDate?.substring(0, 7);
    return pickupM === selectedMonth || returnM === selectedMonth;
  });

  // Calculate monthly metrics
  const totalBookingsCount = monthBookings.length;
  const uniqueCustomersCount = new Set(monthBookings.map((b) => b.customer.idNumber || b.customer.phoneNumber)).size;
  const totalMonthlyRevenue = monthBookings.reduce((sum, b) => sum + (b.totalRentalFee || 0), 0);
  const totalAdvanceCollected = monthBookings.reduce((sum, b) => sum + (b.advanceAmount || 0), 0);
  const totalBalanceDue = monthBookings.reduce((sum, b) => sum + (b.balanceDue || 0), 0);
  const totalRentalDays = monthBookings.reduce((sum, b) => sum + (b.days || 1), 0);

  // Month label (e.g. October 2026)
  const getMonthLabel = (mStr: string) => {
    const [year, month] = mStr.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // 1. Export 1-Month Backup JSON
  const handleExportJSON = () => {
    const backupData = {
      backupType: '1-Month Customer & Booking Archive',
      month: selectedMonth,
      monthName: getMonthLabel(selectedMonth),
      exportedAt: new Date().toISOString(),
      business: businessProfile,
      summary: {
        totalBookings: totalBookingsCount,
        uniqueCustomers: uniqueCustomersCount,
        totalRevenueLKR: totalMonthlyRevenue,
        advanceCollectedLKR: totalAdvanceCollected,
        balanceDueLKR: totalBalanceDue,
        totalRentalDays,
      },
      bookings: monthBookings,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NoorRentals_Backup_${selectedMonth}_${getMonthLabel(selectedMonth).replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess('Complete 1-Month JSON backup downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  // 2. Export 1-Month CSV Spreadsheet
  const handleExportCSV = () => {
    const rows = [
      ['NOOR BIKE RENTALS - 1-MONTH CUSTOMER & BOOKING BACKUP', getMonthLabel(selectedMonth)],
      ['Export Date', new Date().toLocaleString()],
      ['Total Bookings', totalBookingsCount],
      ['Total Revenue (LKR)', totalMonthlyRevenue],
      ['Advance Collected (LKR)', totalAdvanceCollected],
      ['Balance Due (LKR)', totalBalanceDue],
      [],
      [
        'Booking ID',
        'Customer Name',
        'Phone / WhatsApp',
        'Nationality / Country',
        'ID Type',
        'ID / Passport Number',
        'Vehicle Name',
        'License Plate',
        'Pickup Date',
        'Pickup Time',
        'Return Date',
        'Return Time',
        'Rental Days',
        'Daily Rate (LKR)',
        'Total Fee (LKR)',
        'Advance Paid (LKR)',
        'Balance Due (LKR)',
        'Deposit Amount',
        'Deposit Type',
        'Payment Method',
        'Payment Status',
        'Rental Status',
        'Day Folder Date',
      ],
      ...monthBookings.map((b) => [
        b.id || '',
        b.customer.fullName || '',
        b.customer.phoneNumber || '',
        b.customer.country || '',
        b.customer.idType || '',
        b.customer.idNumber || '',
        b.vehicleName || '',
        b.vehiclePlate || '',
        b.pickupDate || '',
        b.pickupTime || '',
        b.returnDate || '',
        b.returnTime || '',
        b.days || 1,
        b.ratePerDay || 0,
        b.totalRentalFee || 0,
        b.advanceAmount || 0,
        b.balanceDue || 0,
        b.securityDeposit || 0,
        b.depositHeldType || 'Passport',
        b.paymentMethod || '',
        b.paymentStatus || '',
        b.status || '',
        b.dayFolder || '',
      ]),
    ];

    downloadCSV(`NoorRentals_1Month_Backup_${selectedMonth}.csv`, rows);

    setDownloadSuccess('1-Month Detailed CSV spreadsheet downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  // 3. Print 1-Month Audit Summary Dossier
  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#1b283d] flex items-center justify-between bg-[#0a0f18]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">
                1-Month Complete Customer & Booking Backup
              </h2>
              <p className="text-xs text-slate-400">
                Safeguard all customer records, verified IDs, and rental contracts by month
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 text-base ml-2"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Select Month Control */}
          <div className="bg-[#121c2d] p-4 rounded-xl border border-[#1f2e46] space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Select Backup Month:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availableMonths.map((mStr) => {
                const isSelected = selectedMonth === mStr;
                return (
                  <button
                    key={mStr}
                    type="button"
                    onClick={() => setSelectedMonth(mStr)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      isSelected
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-md'
                        : 'bg-[#0a0f18] text-slate-300 border-[#1f2e46] hover:bg-[#18263c]'
                    }`}
                  >
                    {getMonthLabel(mStr)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Month Overview Summary Cards */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              {getMonthLabel(selectedMonth)} Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#121c2d] p-3 rounded-xl border border-[#1f2e46]">
                <span className="text-[11px] text-slate-400 block">Total Bookings</span>
                <span className="text-lg font-mono font-extrabold text-cyan-300">
                  {totalBookingsCount}
                </span>
              </div>
              <div className="bg-[#121c2d] p-3 rounded-xl border border-[#1f2e46]">
                <span className="text-[11px] text-slate-400 block">Unique Customers</span>
                <span className="text-lg font-mono font-extrabold text-emerald-400">
                  {uniqueCustomersCount}
                </span>
              </div>
              <div className="bg-[#121c2d] p-3 rounded-xl border border-[#1f2e46]">
                <span className="text-[11px] text-slate-400 block">Total Revenue</span>
                <span className="text-sm font-mono font-extrabold text-white">
                  {formatCurrency(totalMonthlyRevenue)}
                </span>
              </div>
              <div className="bg-[#121c2d] p-3 rounded-xl border border-[#1f2e46]">
                <span className="text-[11px] text-slate-400 block">Days Rented</span>
                <span className="text-lg font-mono font-extrabold text-amber-400">
                  {totalRentalDays}
                </span>
              </div>
            </div>
          </div>

          {downloadSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Export Actions Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Download 1-Month Backup Files
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Full JSON Backup */}
              <button
                type="button"
                onClick={handleExportJSON}
                className="p-4 rounded-xl bg-[#142136] hover:bg-[#1b2d48] border border-[#203450] text-left space-y-1.5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Download JSON Backup</span>
                  </span>
                  <Download className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Full raw archive of {monthBookings.length} bookings, customer details, passport/NIC records, and payments.
                </p>
              </button>

              {/* Option 2: Formatted CSV Spreadsheet */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="p-4 rounded-xl bg-[#142136] hover:bg-[#1b2d48] border border-[#203450] text-left space-y-1.5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Download CSV Spreadsheet</span>
                  </span>
                  <Download className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Excel-compatible spreadsheet with all customer columns, vehicle numbers, rates, and balances.
                </p>
              </button>
            </div>
          </div>

          {/* Quick List Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider">
                Included Bookings in {getMonthLabel(selectedMonth)} ({monthBookings.length})
              </span>
              <span className="font-mono text-[11px]">{selectedMonth}</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {monthBookings.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#111a28] text-center text-xs text-slate-500">
                  No bookings found for {getMonthLabel(selectedMonth)}.
                </div>
              ) : (
                monthBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-lg bg-[#111a28] border border-[#1c293d] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">
                        {b.customer.fullName} ·{' '}
                        <span className="font-mono text-cyan-300">{b.id}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {b.vehicleName} ({b.vehiclePlate}) · {formatDate(b.pickupDate)} to{' '}
                        {formatDate(b.returnDate)}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-xs">
                      {formatCurrency(b.totalRentalFee)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#1b283d] flex items-center justify-between bg-[#0a0f18]">
          <span className="text-[11px] text-slate-400 font-mono">
            {monthBookings.length} records ready for backup
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#142136] hover:bg-[#1b2d48] border border-[#203450] text-xs font-bold text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
