import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Printer,
  Plus,
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, downloadCSV } from '../utils/formatters';
import { ExpenseItem } from '../types';

export const ReportsView: React.FC = () => {
  const { dailyFinances, addDailyExpense, bookings } = useApp();

  const [timeframe, setTimeframe] = useState<'Day' | 'Week' | 'Month' | 'Year'>('Month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('October 2026');

  // Modal to add daily expense/update
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseDate, setExpenseDate] = useState('2026-10-03');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseItem['category']>('Fuel');
  const [expenseAmount, setExpenseAmount] = useState<number>(15000);
  const [expenseDescription, setExpenseDescription] = useState('');

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyRevenueData = monthLabels.map((month, monthIndex) => {
    const monthKey = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    const monthBookings = bookings.filter((booking) => booking.pickupDate.startsWith(monthKey));
    return {
      month,
      bikes: monthBookings.filter((booking) => booking.vehicleCategory === 'bikes')
        .reduce((total, booking) => total + booking.totalRentalFee, 0),
      cars: monthBookings.filter((booking) => booking.vehicleCategory === 'cars')
        .reduce((total, booking) => total + booking.totalRentalFee, 0),
      tours: monthBookings.filter((booking) => booking.vehicleCategory === 'tours')
        .reduce((total, booking) => total + booking.totalRentalFee, 0),
    };
  });
  const yearBookings = bookings.filter((booking) => booking.pickupDate.startsWith(selectedYear));
  const bikesRevenue = yearBookings.filter((booking) => booking.vehicleCategory === 'bikes')
    .reduce((total, booking) => total + booking.totalRentalFee, 0);
  const carsRevenue = yearBookings.filter((booking) => booking.vehicleCategory === 'cars')
    .reduce((total, booking) => total + booking.totalRentalFee, 0);
  const toursRevenue = yearBookings.filter((booking) => booking.vehicleCategory === 'tours')
    .reduce((total, booking) => total + booking.totalRentalFee, 0);
  const totalYearRevenue = bikesRevenue + carsRevenue + toursRevenue;

  const maxMonthlyRevenue = Math.max(1, ...monthlyRevenueData.map((item) => item.bikes + item.cars + item.tours));

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['Noor Bike Rentals - Financial Report', `Year ${selectedYear}`],
      ['Generated On', new Date().toLocaleString()],
      [],
      ['Date', 'Revenue (LKR)', 'Expenses (LKR)', 'Net Profit (LKR)'],
      ...dailyFinances.map((d) => [d.date, d.revenue, d.expenses, d.netBalance]),
    ];
    downloadCSV(`Noor_Rentals_Financial_Report_${selectedYear}.csv`, rows);
  };

  // Export Excel
  const handleExportExcel = () => {
    handleExportCSV();
  };

  // Print PDF
  const handlePrintPDF = () => {
    window.print();
  };

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || !expenseDescription) return;

    const saved = await addDailyExpense(expenseDate, {
      category: expenseCategory,
      description: expenseDescription,
      amount: expenseAmount,
    });

    if (!saved) return;
    setIsExpenseModalOpen(false);
    setExpenseDescription('');
    setExpenseAmount(15000);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Top Filter Bar (matching Screenshot 1) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Timeframe Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0e1726] border border-[#1b283d] rounded-2xl">
          {(['Day', 'Week', 'Month'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                timeframe === t
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}

          {/* Year Dropdown */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-[#121c2d] border border-[#1f2e46] text-xs font-bold text-white rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="2026">Year 2026</option>
            <option value="2025">Year 2025</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Daily Expense</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-[#0e1726] border border-[#1b283d] hover:border-slate-600 text-xs font-bold text-slate-300 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 rounded-xl bg-[#0e1726] border border-[#1b283d] hover:border-slate-600 text-xs font-bold text-slate-300 transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Excel</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-3.5 py-2.5 rounded-xl bg-[#0e1726] border border-[#1b283d] hover:border-slate-600 text-xs font-bold text-slate-300 transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-rose-400" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Main Revenue Card & Monthly Stacked Chart (matches Screenshot 1) */}
      <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-6 shadow-sm space-y-6">
        {/* Header & Legend */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Revenue</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h2 className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {formatCurrency(totalYearRevenue)}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Total gross revenue generated in {selectedYear}
            </p>
          </div>

          {/* Legend dots */}
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-sm" />
              <div>
                <span className="text-slate-400 block text-[11px]">Bikes & Scooties</span>
                <span className="font-bold text-white font-mono">
                  {formatCurrency(bikesRevenue)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
              <div>
                <span className="text-slate-400 block text-[11px]">Cars & Vans</span>
                <span className="font-bold text-white font-mono">
                  {formatCurrency(carsRevenue)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
              <div>
                <span className="text-slate-400 block text-[11px]">Tours</span>
                <span className="font-bold text-white font-mono">
                  {formatCurrency(toursRevenue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stacked Bar Chart */}
        <div className="pt-4 border-t border-[#162032]">
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {monthlyRevenueData.map((item) => {
              const monthTotal = item.bikes + item.cars + item.tours;
              const totalHeightPercent = Math.min(100, Math.round((monthTotal / maxMonthlyRevenue) * 100));

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] p-2 rounded-lg pointer-events-none absolute -translate-y-28 shadow-xl border border-slate-700 z-20 whitespace-nowrap">
                    <p className="font-bold">{item.month} {selectedYear}</p>
                    <p className="text-cyan-400">Bikes: {formatCurrency(item.bikes)}</p>
                    <p className="text-emerald-400">Cars: {formatCurrency(item.cars)}</p>
                    <p className="text-amber-400">Tours: {formatCurrency(item.tours)}</p>
                    <p className="font-bold text-white border-t border-slate-700 mt-1 pt-1">
                      Total: {formatCurrency(monthTotal)}
                    </p>
                  </div>

                  {/* Stacked bar cylinder */}
                  <div
                    className="w-full max-w-[42px] rounded-lg overflow-hidden flex flex-col justify-end transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${totalHeightPercent}%` }}
                  >
                    {/* Tours (Amber) */}
                    <div
                      className="bg-amber-500 w-full"
                      style={{ height: `${monthTotal ? (item.tours / monthTotal) * 100 : 0}%` }}
                    />
                    {/* Cars (Emerald) */}
                    <div
                      className="bg-emerald-500 w-full"
                      style={{ height: `${monthTotal ? (item.cars / monthTotal) * 100 : 0}%` }}
                    />
                    {/* Bikes (Cyan) */}
                    <div
                      className="bg-cyan-500 w-full"
                      style={{ height: `${monthTotal ? (item.bikes / monthTotal) * 100 : 0}%` }}
                    />
                  </div>

                  {/* Month Label */}
                  <span className="text-[11px] font-semibold text-slate-400 group-hover:text-cyan-300">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Breakdown Section (matches Screenshot 1) */}
      <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-white">Daily Breakdown</h3>
            <p className="text-xs text-slate-400">
              Daily revenue, expenses and net balance for {selectedMonth}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">📅 October 2026</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1b283d] text-slate-400 font-medium">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Revenue</th>
                <th className="py-3 px-4">Expenses</th>
                <th className="py-3 px-4 text-right">Net Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162032]">
              {dailyFinances.map((d) => (
                <tr key={d.date} className="hover:bg-[#121c2d]/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-white whitespace-nowrap">
                    {d.date}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                    {formatCurrency(d.revenue)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-rose-400 whitespace-nowrap">
                    {formatCurrency(d.expenses)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400 text-right whitespace-nowrap">
                    +{formatCurrency(d.netBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1b283d] pb-4">
              <div>
                <h3 className="font-bold text-base text-white">Add Daily Expense / Update</h3>
                <p className="text-xs text-slate-400">
                  Record fuel, maintenance, or helper wages for Noor Bike Rentals.
                </p>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Date</label>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Expense Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Fuel">Fuel / Petrol Stock</option>
                  <option value="Maintenance">Maintenance & Servicing</option>
                  <option value="Tires">Tires & Puncture Repair</option>
                  <option value="Insurance">Insurance & Government Taxes</option>
                  <option value="Wages">Helper / Cleaning Wages</option>
                  <option value="Other">Shop & Miscellaneous</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Amount (LKR)</label>
                <input
                  type="number"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engine oil and air filter for Honda Dio"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b283d]">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-5 py-2 rounded-xl border border-[#1f2e46] text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
