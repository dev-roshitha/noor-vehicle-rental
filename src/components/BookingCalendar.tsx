import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Search,
  CheckCircle2,
  Clock,
  Bike,
  User,
  Phone,
  FileText,
  Eye,
  Filter,
} from 'lucide-react';
import { Booking } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface BookingCalendarProps {
  bookings: Booking[];
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  onSelectBooking: (booking: Booking) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookings,
  selectedDate,
  onSelectDate,
  onSelectBooking,
}) => {
  // Calendar month state (default to month of selectedDate or current)
  const initialYear = parseInt(selectedDate.substring(0, 4) || '2026', 10);
  const initialMonth = parseInt(selectedDate.substring(5, 7) || '10', 10) - 1;

  const [currentYear, setCurrentYear] = useState<number>(initialYear);
  const [currentMonth, setCurrentMonth] = useState<number>(initialMonth); // 0-indexed (0 = Jan)

  // Direct date jump input
  const [directDateInput, setDirectDateInput] = useState<string>(selectedDate);

  // Filter mode for the selected date
  const [dateFilterMode, setDateFilterMode] = useState<'all_active' | 'pickups' | 'returns'>('all_active');

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    const today = '2026-10-03';
    setCurrentYear(2026);
    setCurrentMonth(9); // October
    setDirectDateInput(today);
    onSelectDate(today);
  };

  const handleDirectDateSubmit = (newDate: string) => {
    if (!newDate) return;
    setDirectDateInput(newDate);
    const y = parseInt(newDate.substring(0, 4), 10);
    const m = parseInt(newDate.substring(5, 7), 10) - 1;
    if (!isNaN(y) && !isNaN(m)) {
      setCurrentYear(y);
      setCurrentMonth(m);
    }
    onSelectDate(newDate);
  };

  // Month metadata
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  // Helper to format date string YYYY-MM-DD
  const formatDayString = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  };

  // Calculate day booking counts across the month
  const dayStatsMap: { [dateStr: string]: { pickups: number; returns: number; active: number } } = {};

  bookings.forEach((b) => {
    const pDate = b.pickupDate;
    const rDate = b.returnDate;

    if (pDate) {
      if (!dayStatsMap[pDate]) dayStatsMap[pDate] = { pickups: 0, returns: 0, active: 0 };
      dayStatsMap[pDate].pickups += 1;
    }
    if (rDate) {
      if (!dayStatsMap[rDate]) dayStatsMap[rDate] = { pickups: 0, returns: 0, active: 0 };
      dayStatsMap[rDate].returns += 1;
    }
  });

  // Check how many bookings are active on any given date
  const getBookingsActiveOnDate = (dateStr: string) => {
    return bookings.filter((b) => {
      if (dateFilterMode === 'pickups') {
        return b.pickupDate === dateStr;
      }
      if (dateFilterMode === 'returns') {
        return b.returnDate === dateStr;
      }
      // 'all_active': includes pickups on date, returns on date, or dates in-between
      return b.pickupDate <= dateStr && b.returnDate >= dateStr;
    });
  };

  const selectedDayBookings = getBookingsActiveOnDate(selectedDate);

  // Generate calendar cells (blank padding + day cells)
  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  return (
    <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-5 space-y-4 shadow-sm">
      {/* Top Header & Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1b283d] pb-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg bg-[#142136] hover:bg-[#1a2d48] border border-[#203450] text-slate-300 hover:text-white transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-extrabold text-sm text-white font-mono min-w-[140px] text-center">
            {monthName}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg bg-[#142136] hover:bg-[#1a2d48] border border-[#203450] text-slate-300 hover:text-white transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleJumpToday}
            className="px-2.5 py-1 rounded-lg bg-[#142136] hover:bg-[#1a2d48] border border-[#203450] text-xs font-semibold text-cyan-300 transition-colors ml-2"
          >
            Today
          </button>
        </div>

        {/* Direct Date Search Picker */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#121c2d] border border-[#1f2e46] rounded-xl px-2.5 py-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400">Search Date:</span>
            <input
              type="date"
              value={directDateInput}
              onChange={(e) => handleDirectDateSubmit(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div>
        {/* Day-of-week Headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dw, idx) => (
            <span
              key={dw}
              className={`text-[10px] font-bold uppercase tracking-wider py-1 ${
                idx === 0 || idx === 6 ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {dw}
            </span>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((dayNum, idx) => {
            if (dayNum === null) {
              return <div key={`empty-${idx}`} className="h-10 rounded-lg bg-transparent" />;
            }

            const dayDateStr = formatDayString(dayNum);
            const isSelected = selectedDate === dayDateStr;
            const isToday = dayDateStr === '2026-10-03';
            const stats = dayStatsMap[dayDateStr];
            const hasActivity = stats && (stats.pickups > 0 || stats.returns > 0);

            return (
              <button
                key={dayDateStr}
                type="button"
                onClick={() => {
                  setDirectDateInput(dayDateStr);
                  onSelectDate(dayDateStr);
                }}
                className={`h-11 rounded-xl p-1 text-center flex flex-col items-center justify-between border transition-all relative ${
                  isSelected
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-950/40 z-10'
                    : isToday
                    ? 'bg-[#152338] text-emerald-300 border-emerald-500/50 hover:bg-[#1a2d48]'
                    : 'bg-[#111a28] text-slate-300 border-[#1a273b] hover:bg-[#162337] hover:border-slate-600'
                }`}
              >
                <span
                  className={`text-[11px] font-bold font-mono leading-none ${
                    isSelected ? 'text-white' : isToday ? 'text-emerald-400' : 'text-slate-200'
                  }`}
                >
                  {dayNum}
                </span>

                {/* Booking Activity Indicators */}
                <div className="flex items-center gap-1">
                  {hasActivity ? (
                    <span
                      className={`px-1 py-0.2 rounded-full text-[8px] font-extrabold font-mono leading-none ${
                        isSelected
                          ? 'bg-white text-slate-900'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                      }`}
                    >
                      {(stats.pickups || 0) + (stats.returns || 0)}
                    </span>
                  ) : (
                    <span className="w-1 h-1 rounded-full bg-transparent" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Summary & Filter Bar */}
      <div className="bg-[#121c2d] p-3 rounded-xl border border-[#1f2e46] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Selected Date:</span>
          <span className="font-extrabold text-white font-mono">{selectedDate}</span>
          <span className="text-slate-400">({formatDate(selectedDate)})</span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/50 font-mono font-bold text-[10px]">
            {selectedDayBookings.length} Bookings
          </span>
        </div>

        {/* View Mode Filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400">Filter:</span>
          <button
            type="button"
            onClick={() => setDateFilterMode('all_active')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              dateFilterMode === 'all_active'
                ? 'bg-cyan-600 text-white'
                : 'bg-[#18263c] text-slate-400 hover:text-white'
            }`}
          >
            All Active
          </button>
          <button
            type="button"
            onClick={() => setDateFilterMode('pickups')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              dateFilterMode === 'pickups'
                ? 'bg-cyan-600 text-white'
                : 'bg-[#18263c] text-slate-400 hover:text-white'
            }`}
          >
            Pickups ({dayStatsMap[selectedDate]?.pickups || 0})
          </button>
          <button
            type="button"
            onClick={() => setDateFilterMode('returns')}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              dateFilterMode === 'returns'
                ? 'bg-cyan-600 text-white'
                : 'bg-[#18263c] text-slate-400 hover:text-white'
            }`}
          >
            Returns ({dayStatsMap[selectedDate]?.returns || 0})
          </button>
        </div>
      </div>
    </div>
  );
};
