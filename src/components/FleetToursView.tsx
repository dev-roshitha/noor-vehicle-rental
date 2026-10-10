import React, { useState } from 'react';
import {
  Bike,
  CarFront,
  Compass,
  Plus,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Fuel,
  Gauge,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  Eye,
  Sliders,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Vehicle, VehicleCategory, VehicleStatus } from '../types';
import { formatCurrency, getDocumentExpiryStatus } from '../utils/formatters';

export const FleetToursView: React.FC = () => {
  const {
    vehicles,
    tours,
    bookings,
    logVehicleReturn,
    setActiveVehicleModal,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    selectedVehicleForReturn,
    setSelectedVehicleForReturn,
    isAddVehicleOpen,
    setIsAddVehicleOpen,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | VehicleStatus>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'rate-low' | 'rate-high' | 'name'>('newest');
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  // Return Widget State (matching Screenshot 2)
  const onRentVehicles = vehicles.filter((v) => v.status === 'on_rent');
  const [returnVehicleId, setReturnVehicleId] = useState<string>(
    selectedVehicleForReturn?.id || onRentVehicles[0]?.id || ''
  );

  const activeReturnVehicle = vehicles.find((v) => v.id === returnVehicleId) || onRentVehicles[0];

  const [returnOdometer, setReturnOdometer] = useState<number>(
    activeReturnVehicle ? activeReturnVehicle.odometer + 45 : 18420
  );
  const [returnFuelLevel, setReturnFuelLevel] = useState<number>(0.75); // 3/4
  const [returnNotes, setReturnNotes] = useState<string>('');
  const [extraCharge, setExtraCharge] = useState<number>(0);
  const [returnSuccessMessage, setReturnSuccessMessage] = useState<string>('');

  // Update odometer when vehicle changes
  const handleSelectVehicleForReturn = (id: string) => {
    setReturnVehicleId(id);
    const v = vehicles.find((item) => item.id === id);
    if (v) {
      setReturnOdometer(v.odometer + 50);
      setReturnFuelLevel(v.fuelLevel);
    }
  };

  // Process return
  const handleLogReturn = async () => {
    if (!activeReturnVehicle) return;

    // Find the active booking for this vehicle
    const matchedBooking = bookings.find(
      (b) =>
        b.vehicleId === activeReturnVehicle.id &&
        (b.status === 'On Rent' || b.status === 'Overdue')
    );

    if (matchedBooking) {
      const saved = await logVehicleReturn(
        matchedBooking.id,
        returnOdometer,
        returnFuelLevel,
        returnNotes,
        extraCharge
      );
      if (!saved) return;
      setReturnSuccessMessage(`Return logged successfully for ${activeReturnVehicle.name}!`);
      setTimeout(() => setReturnSuccessMessage(''), 4000);
      setReturnNotes('');
    } else {
      // Just update vehicle status
      const saved = await updateVehicle(activeReturnVehicle.id, {
        status: 'available',
        odometer: returnOdometer,
        fuelLevel: returnFuelLevel,
      });
      if (!saved) return;
      setReturnSuccessMessage(`Vehicle ${activeReturnVehicle.name} marked as Available.`);
      setTimeout(() => setReturnSuccessMessage(''), 4000);
    }
  };

  // Filter & Sort
  const filteredVehicles = vehicles
    .filter((v) => statusFilter === 'all' || v.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'rate-low') return a.dailyRate - b.dailyRate;
      if (sortBy === 'rate-high') return b.dailyRate - a.dailyRate;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.createdAt.localeCompare(a.createdAt);
    });

  // Counts
  const totalCount = vehicles.length;
  const availableCount = vehicles.filter((v) => v.status === 'available').length;
  const onRentCount = vehicles.filter((v) => v.status === 'on_rent').length;
  const maintenanceCount = vehicles.filter((v) => v.status === 'maintenance').length;

  // Add Vehicle Form State
  const [newVehicleData, setNewVehicleData] = useState({
    name: '',
    category: 'bikes' as VehicleCategory,
    plateNumber: '',
    dailyRate: 4000,
    status: 'available' as VehicleStatus,
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80',
    odometer: 10000,
    fuelLevel: 1.0,
    engineCC: '125cc',
    transmission: 'Automatic' as const,
    year: 2024,
    revenueGenerated: 0,
    totalTrips: 0,
    insuranceExpiry: '2027-12-31',
    revenueLicenseExpiry: '2027-10-15',
    lastServiceKm: 9000,
    nextServiceKm: 12000,
    notes: '',
  });

  const handleCreateVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleData.name || !newVehicleData.plateNumber) {
      alert('Please fill in vehicle name and license plate.');
      return;
    }
    const added = await addVehicle(newVehicleData);
    if (!added) return;
    setIsAddVehicleOpen(false);
    setNewVehicleData({
      name: '',
      category: 'bikes',
      plateNumber: '',
      dailyRate: 4000,
      status: 'available',
      image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80',
      odometer: 10000,
      fuelLevel: 1.0,
      engineCC: '125cc',
      transmission: 'Automatic',
      year: 2024,
      revenueGenerated: 0,
      totalTrips: 0,
      insuranceExpiry: '2027-12-31',
      revenueLicenseExpiry: '2027-10-15',
      lastServiceKm: 9000,
      nextServiceKm: 12000,
      notes: '',
    });
  };

  return (
    <div className="p-8 space-y-8">
      {/* Top Filter Chips & Actions Row (matches Screenshot 2) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40'
                : 'bg-[#0e1726] border border-[#1b283d] text-slate-400 hover:text-white'
            }`}
          >
            All {totalCount}
          </button>

          <button
            onClick={() => setStatusFilter('available')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              statusFilter === 'available'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'bg-[#0e1726] border border-[#1b283d] text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Available {availableCount}</span>
          </button>

          <button
            onClick={() => setStatusFilter('on_rent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              statusFilter === 'on_rent'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40'
                : 'bg-[#0e1726] border border-[#1b283d] text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>On Rent {onRentCount}</span>
          </button>

          <button
            onClick={() => setStatusFilter('maintenance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              statusFilter === 'maintenance'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                : 'bg-[#0e1726] border border-[#1b283d] text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Maintenance {maintenanceCount}</span>
          </button>
        </div>

        {/* Right Sort & Add Vehicle */}
        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#0e1726] border border-[#1b283d] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="rate-low">Price: Low to High</option>
            <option value="rate-high">Price: High to Low</option>
            <option value="name">Vehicle Name</option>
          </select>

          <button
            onClick={() => setIsAddVehicleOpen(true)}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-950/40 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Vehicle Cards (8 cols) + Log Vehicle Return Widget (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Fleet Cards Grid (8 cols) */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => setActiveVehicleModal(vehicle)}
                className="bg-[#0e1726] border border-[#1b283d] rounded-2xl overflow-hidden shadow-sm hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Vehicle Image */}
                  <div className="relative h-36 bg-slate-900 overflow-hidden">
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Category Tag (Bikes / Cars) */}
                    <div className="absolute bottom-2.5 left-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0d1624]/90 text-cyan-400 border border-cyan-800/40 capitalize">
                        {vehicle.category}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute bottom-2.5 right-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                          vehicle.status === 'available'
                            ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-700/50'
                            : vehicle.status === 'on_rent'
                            ? 'bg-blue-950/90 text-blue-400 border border-blue-700/50'
                            : 'bg-rose-950/90 text-rose-400 border border-rose-700/50'
                        }`}
                      >
                        {vehicle.status === 'on_rent'
                          ? 'On Rent'
                          : vehicle.status === 'available'
                          ? 'Available'
                          : 'Maintenance'}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {vehicle.name}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveVehicleModal(vehicle);
                        }}
                        className="text-slate-500 hover:text-slate-300 p-1"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="font-mono text-slate-400 bg-[#121c2d] px-2 py-0.5 rounded border border-[#1c2c42]">
                        {vehicle.plateNumber}
                      </span>
                      <span className="font-extrabold text-white font-mono">
                        {formatCurrency(vehicle.dailyRate)}/day
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 pt-2 flex items-center justify-between border-t border-[#162032]">
                      <span className="flex items-center gap-1 font-mono">
                        <Gauge className="w-3.5 h-3.5 text-slate-500" />
                        {vehicle.odometer} km
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        {vehicle.totalTrips} trips
                      </span>
                    </div>

                    {/* Revenue Licence & Insurance 30-Day Status Badges */}
                    <div className="pt-2 border-t border-[#162032] flex flex-col gap-1 text-[10px]">
                      {(() => {
                        const revStatus = getDocumentExpiryStatus(vehicle.revenueLicenseExpiry, '2026-10-03');
                        const insStatus = getDocumentExpiryStatus(vehicle.insuranceExpiry, '2026-10-03');
                        return (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Rev. Licence:</span>
                              <span
                                className={`font-mono font-semibold px-1.5 py-0.2 rounded ${
                                  revStatus.isWarning
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                    : 'text-slate-300'
                                }`}
                              >
                                {revStatus.isWarning ? `⚠️ ${revStatus.statusText}` : vehicle.revenueLicenseExpiry}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Insurance:</span>
                              <span
                                className={`font-mono font-semibold px-1.5 py-0.2 rounded ${
                                  insStatus.isWarning
                                    ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                    : 'text-slate-300'
                                }`}
                              >
                                {insStatus.isWarning ? `⚠️ ${insStatus.statusText}` : vehicle.insuranceExpiry}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Bottom Quick Action */}
                <div className="px-4 pb-3 pt-1 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveVehicleModal(vehicle);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-[#142136] hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-300 border border-[#203450] text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Profile</span>
                  </button>

                  <button
                    type="button"
                    disabled={
                      vehicle.status === 'on_rent' ||
                      bookings.some(
                        (booking) =>
                          booking.vehicleId === vehicle.id &&
                          (booking.status === 'On Rent' || booking.status === 'Overdue')
                      )
                    }
                    title={
                      vehicle.status === 'on_rent' ||
                      bookings.some(
                        (booking) =>
                          booking.vehicleId === vehicle.id &&
                          (booking.status === 'On Rent' || booking.status === 'Overdue')
                      )
                        ? 'Return this vehicle before deleting it'
                        : `Delete ${vehicle.name}`
                    }
                    aria-label={`Delete ${vehicle.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setVehicleToDelete(vehicle);
                    }}
                    className="py-1.5 px-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/70 text-rose-300 border border-rose-900/60 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {vehicle.status === 'on_rent' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setReturnVehicleId(vehicle.id);
                        setReturnOdometer(vehicle.odometer + 40);
                        const widget = document.getElementById('log-return-card');
                        widget?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="py-1.5 px-3 rounded-lg bg-cyan-600 text-white text-[11px] font-bold hover:bg-cyan-500 transition-colors whitespace-nowrap"
                    >
                      Return
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Log Vehicle Return Widget (4 cols) matching Screenshot 2 */}
        <div className="lg:col-span-4" id="log-return-card">
          <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-6 shadow-sm space-y-5 sticky top-6">
            <div>
              <h3 className="font-bold text-base text-white">Log Vehicle Return</h3>
              <p className="text-xs text-slate-400">Update vehicle details on customer return.</p>
            </div>

            {returnSuccessMessage && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-600/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{returnSuccessMessage}</span>
              </div>
            )}

            {/* Vehicle Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Vehicle</label>
              <div className="relative">
                <select
                  value={returnVehicleId}
                  onChange={(e) => handleSelectVehicleForReturn(e.target.value)}
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-3 text-xs text-white appearance-none focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.plateNumber}) {v.status === 'on_rent' ? '— 🔴 On Rent' : '— Available'}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  ▼
                </div>
              </div>
            </div>

            {/* Odometer Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Return Odometer (km)</label>
              <div className="relative">
                <input
                  type="number"
                  value={returnOdometer}
                  onChange={(e) => setReturnOdometer(Number(e.target.value))}
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                  km
                </span>
              </div>
            </div>

            {/* Fuel Gauge Slider (matches Screenshot 2: E, 1/4, 1/2, 3/4, F) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Fuel Level</span>
                <span className="text-cyan-400 font-mono">
                  {returnFuelLevel === 1
                    ? 'Full (F)'
                    : returnFuelLevel === 0.75
                    ? '3/4'
                    : returnFuelLevel === 0.5
                    ? '1/2'
                    : returnFuelLevel === 0.25
                    ? '1/4'
                    : 'Empty (E)'}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.25"
                value={returnFuelLevel}
                onChange={(e) => setReturnFuelLevel(Number(e.target.value))}
                className="w-full h-2 bg-[#121c2d] rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />

              <div className="flex justify-between text-[11px] font-mono text-slate-500 px-1">
                <span>E</span>
                <span>1/4</span>
                <span>1/2</span>
                <span>3/4</span>
                <span>F</span>
              </div>
            </div>

            {/* Extra Charge / Damages if any */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Extra Charges / Fuel Deduction (Rs.)
              </label>
              <input
                type="number"
                value={extraCharge}
                onChange={(e) => setExtraCharge(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Notes (optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Notes (optional)</label>
              <textarea
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="Add any additional notes (vehicle condition, scratches, helmet return)..."
                rows={3}
                className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Log Return Button */}
            <button
              onClick={handleLogReturn}
              className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Log return</span>
            </button>
          </div>
        </div>
      </div>

      {/* Popular Tours Section (matches Screenshot 2) */}
      <div className="space-y-4 pt-4 border-t border-[#162032]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white">Popular Tours</h3>
            <p className="text-xs text-slate-400">
              Showcase and manage your curated tour experiences in Sri Lanka.
            </p>
          </div>
          <button
            onClick={() => alert('Tour packages are ready for customer booking in the "New Booking" tab!')}
            className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>View all tours</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="bg-[#0e1726] border border-[#1b283d] rounded-2xl overflow-hidden shadow-sm hover:border-cyan-500/40 transition-all group"
            >
              <div className="relative h-44 bg-slate-900 overflow-hidden">
                <img
                  src={tour.image}
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1726] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-white drop-shadow-md">
                      {tour.title}
                    </h4>
                    <p className="text-[11px] text-slate-300 flex items-center gap-3 mt-1">
                      <span>⏱️ {tour.duration}</span>
                      <span>👥 {tour.capacity}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-base text-emerald-400 font-mono block">
                      {formatCurrency(tour.price)}
                    </span>
                    <span className="text-[10px] text-slate-300">{tour.priceUnit}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">{tour.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tour.highlights.map((h, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] bg-[#142136] text-cyan-300 border border-[#1f314d]"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {isAddVehicleOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1b283d] pb-4">
              <div>
                <h3 className="font-bold text-lg text-white">Add New Vehicle to Fleet</h3>
                <p className="text-xs text-slate-400">
                  Register a new scooty, bike, car, or van into Noor Bike Rentals.
                </p>
              </div>
              <button
                onClick={() => setIsAddVehicleOpen(false)}
                className="text-slate-400 hover:text-white p-1 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVehicleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Vehicle Name & Model</label>
                  <input
                    type="text"
                    required
                    value={newVehicleData.name}
                    onChange={(e) =>
                      setNewVehicleData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Honda Dio 110 or TVS NTorq"
                    className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={newVehicleData.category}
                    onChange={(e) =>
                      setNewVehicleData((prev) => ({
                        ...prev,
                        category: e.target.value as VehicleCategory,
                      }))
                    }
                    className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="bikes">Bike / Scooty</option>
                    <option value="cars">Car / Van</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">License Plate Number</label>
                  <input
                    type="text"
                    required
                    value={newVehicleData.plateNumber}
                    onChange={(e) =>
                      setNewVehicleData((prev) => ({ ...prev, plateNumber: e.target.value }))
                    }
                    placeholder="e.g. WP BDF-5542"
                    className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Daily Rate (LKR)</label>
                  <input
                    type="number"
                    required
                    value={newVehicleData.dailyRate}
                    onChange={(e) =>
                      setNewVehicleData((prev) => ({
                        ...prev,
                        dailyRate: Number(e.target.value),
                      }))
                    }
                    className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Initial Status</label>
                  <select
                    value={newVehicleData.status}
                    onChange={(e) =>
                      setNewVehicleData((prev) => ({
                        ...prev,
                        status: e.target.value as VehicleStatus,
                      }))
                    }
                    className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="available">Available</option>
                    <option value="on_rent">On Rent</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Engine CC</label>
                  <input
                    type="text"
                    value={newVehicleData.engineCC}
                    onChange={(e) =>
                      setNewVehicleData((prev) => ({ ...prev, engineCC: e.target.value }))
                    }
                    placeholder="e.g. 110cc, 150cc"
                    className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Current Odometer (km)</label>
                  <input
                    type="number"
                    value={newVehicleData.odometer}
                    onChange={(e) =>
                      setNewVehicleData((prev) => ({
                        ...prev,
                        odometer: Number(e.target.value),
                      }))
                    }
                    className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Insurance Expiry</label>
                  <input
                    type="date"
                    value={newVehicleData.insuranceExpiry}
                    onChange={(e) =>
                      setNewVehicleData((prev) => ({
                        ...prev,
                        insuranceExpiry: e.target.value,
                      }))
                    }
                    className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Revenue Licence Expiry
                  </label>
                  <input
                    type="date"
                    value={newVehicleData.revenueLicenseExpiry}
                    onChange={(e) =>
                      setNewVehicleData((prev) => ({
                        ...prev,
                        revenueLicenseExpiry: e.target.value,
                      }))
                    }
                    className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Vehicle Photo</label>
                  <div className="flex items-center gap-3">
                    <img
                      src={newVehicleData.image}
                      alt="Preview"
                      className="w-12 h-10 rounded-lg object-cover bg-slate-900 border border-[#243753] shrink-0"
                    />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  if (ev.target?.result) {
                                    setNewVehicleData((prev) => ({
                                      ...prev,
                                      image: ev.target!.result as string,
                                    }));
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[10px] text-slate-400">or paste URL:</span>
                      </div>
                      <input
                        type="text"
                        value={newVehicleData.image}
                        onChange={(e) =>
                          setNewVehicleData((prev) => ({ ...prev, image: e.target.value }))
                        }
                        placeholder="https://... or choose file above"
                        className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-3 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Vehicle Notes / Specs</label>
                <textarea
                  value={newVehicleData.notes}
                  onChange={(e) =>
                    setNewVehicleData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Service history, helmet details, spare key location..."
                  rows={2}
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b283d]">
                <button
                  type="button"
                  onClick={() => setIsAddVehicleOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#1f2e46] text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-950/40"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {vehicleToDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setVehicleToDelete(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-vehicle-title"
            className="bg-[#0e1726] border border-rose-900/60 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 id="delete-vehicle-title" className="font-bold text-lg text-white">
                Delete vehicle?
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                Delete <strong>{vehicleToDelete.name}</strong> ({vehicleToDelete.plateNumber}) from your fleet?
                Existing bookings will remain in your records.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setVehicleToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-[#1f2e46] text-xs font-bold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const deleted = await deleteVehicle(vehicleToDelete.id);
                  if (deleted) setVehicleToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Delete Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
