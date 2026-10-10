import React, { useState, useRef } from 'react';
import {
  Bike,
  Gauge,
  Fuel,
  Wrench,
  Calendar,
  DollarSign,
  Edit2,
  Save,
  CheckCircle2,
  Clock,
  User,
  History,
  AlertTriangle,
  Camera,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { Vehicle, VehicleCategory, VehicleStatus } from '../types';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate, getDocumentExpiryStatus } from '../utils/formatters';

interface Props {
  vehicle: Vehicle;
  onClose: () => void;
}

export const VehicleProfileModal: React.FC<Props> = ({ vehicle, onClose }) => {
  const { updateVehicle, bookings, setSelectedVehicleForReturn, setIsLogReturnOpen } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: vehicle.name,
    category: vehicle.category,
    plateNumber: vehicle.plateNumber,
    dailyRate: vehicle.dailyRate,
    status: vehicle.status,
    odometer: vehicle.odometer,
    fuelLevel: vehicle.fuelLevel,
    engineCC: vehicle.engineCC,
    insuranceExpiry: vehicle.insuranceExpiry || '2027-05-30',
    revenueLicenseExpiry: vehicle.revenueLicenseExpiry || '2027-04-15',
    nextServiceKm: vehicle.nextServiceKm,
    image: vehicle.image,
    notes: vehicle.notes || '',
  });

  // Expiry checks for 30-day reminders
  const insStatus = getDocumentExpiryStatus(vehicle.insuranceExpiry, '2026-10-03');
  const revStatus = getDocumentExpiryStatus(vehicle.revenueLicenseExpiry, '2026-10-03');

  // Filter bookings for this vehicle
  const vehicleBookings = bookings.filter((b) => b.vehicleId === vehicle.id);

  // Handle image upload from computer / phone / camera
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        if (dataUrl) {
          const saved = await updateVehicle(vehicle.id, { image: dataUrl });
          if (!saved) return;
          setFormData((prev) => ({ ...prev, image: dataUrl }));
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await updateVehicle(vehicle.id, {
      name: formData.name,
      category: formData.category,
      plateNumber: formData.plateNumber,
      dailyRate: Number(formData.dailyRate),
      status: formData.status as VehicleStatus,
      odometer: Number(formData.odometer),
      fuelLevel: Number(formData.fuelLevel),
      engineCC: formData.engineCC,
      insuranceExpiry: formData.insuranceExpiry,
      revenueLicenseExpiry: formData.revenueLicenseExpiry,
      nextServiceKm: Number(formData.nextServiceKm),
      image: formData.image,
      notes: formData.notes,
    });
    if (!saved) return;
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
      <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#1b283d] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">{vehicle.name}</h3>
                <span className="font-mono text-xs text-slate-300 bg-[#142136] px-2 py-0.5 rounded border border-[#1f2f48]">
                  {vehicle.plateNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Individual Vehicle Dossier & Fleet Profile · Noor Bike Rentals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 rounded-xl bg-[#142136] hover:bg-[#1b2d48] border border-[#203450] text-xs font-bold text-cyan-300 transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl border border-[#203450] text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 text-lg ml-2">
              ✕
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Vehicle profile updated successfully!</span>
          </div>
        )}

        {/* View Mode vs Edit Mode */}
        {!isEditing ? (
          <div className="space-y-6">
            {/* Image & Status Hero */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              <div className="md:col-span-5 space-y-2">
                <div className="relative group h-48 rounded-xl overflow-hidden bg-slate-900 border border-[#1f2f48] shadow-md">
                  <img
                    src={formData.image || vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {/* Click to upload overlay */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white gap-1.5 p-3 text-center"
                  >
                    <Camera className="w-6 h-6 text-cyan-400" />
                    <span className="text-xs font-bold">Upload New Picture</span>
                    <span className="text-[10px] text-slate-300">Click to choose from your device</span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 rounded-xl bg-[#142136] hover:bg-cyan-600/20 text-cyan-300 border border-[#203554] text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload & Save Profile Picture</span>
                </button>
              </div>

              <div className="md:col-span-7 grid grid-cols-2 gap-3">
                {/* Metric 1: Daily Rate */}
                <div className="bg-[#121c2d] p-3.5 rounded-xl border border-[#1f2f48]">
                  <span className="text-[11px] text-slate-400 block">Daily Rental Rate</span>
                  <span className="text-lg font-mono font-extrabold text-emerald-400">
                    {formatCurrency(vehicle.dailyRate)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">per 24h</span>
                </div>

                {/* Metric 2: Status */}
                <div className="bg-[#121c2d] p-3.5 rounded-xl border border-[#1f2f48]">
                  <span className="text-[11px] text-slate-400 block">Fleet Status</span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold mt-1 capitalize ${
                      vehicle.status === 'available'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : vehicle.status === 'on_rent'
                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {vehicle.status === 'on_rent' ? 'On Rent' : vehicle.status}
                  </span>
                </div>

                {/* Metric 3: Total Revenue */}
                <div className="bg-[#121c2d] p-3.5 rounded-xl border border-[#1f2f48]">
                  <span className="text-[11px] text-slate-400 block">Total Lifetime Earnings</span>
                  <span className="text-lg font-mono font-extrabold text-white">
                    {formatCurrency(vehicle.revenueGenerated)}
                  </span>
                  <span className="text-[10px] text-emerald-400 block">{vehicle.totalTrips} total trips</span>
                </div>

                {/* Metric 4: Odometer */}
                <div className="bg-[#121c2d] p-3.5 rounded-xl border border-[#1f2f48]">
                  <span className="text-[11px] text-slate-400 block">Current Odometer</span>
                  <span className="text-lg font-mono font-extrabold text-cyan-300">
                    {vehicle.odometer} km
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Next service: {vehicle.nextServiceKm} km
                  </span>
                </div>
              </div>
            </div>

            {/* Specifications & Maintenance */}
            <div className="bg-[#121c2d] p-4 rounded-xl border border-[#1f2f48] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Engine Capacity:</span>
                <span className="font-bold text-white font-mono">{vehicle.engineCC}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Transmission:</span>
                <span className="font-bold text-white">{vehicle.transmission}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Current Fuel Level:</span>
                <span className="font-bold text-cyan-300 font-mono">
                  {Math.round(vehicle.fuelLevel * 100)}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Insurance Validity:</span>
                <span className="font-bold text-white font-mono block">
                  {vehicle.insuranceExpiry}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                    insStatus.isWarning
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                      : 'text-emerald-400'
                  }`}
                >
                  {insStatus.isWarning ? `⚠️ ${insStatus.statusText}` : 'Valid'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Revenue Licence:</span>
                <span className="font-bold text-white font-mono block">
                  {vehicle.revenueLicenseExpiry || 'Not set'}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                    revStatus.isWarning
                      ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                      : 'text-emerald-400'
                  }`}
                >
                  {revStatus.isWarning ? `⚠️ ${revStatus.statusText}` : 'Valid'}
                </span>
              </div>
            </div>

            {vehicle.notes && (
              <div className="p-3 bg-[#0a101b] rounded-xl border border-[#1b283d] text-xs text-slate-300">
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-0.5">
                  Vehicle Service / Condition Notes:
                </span>
                <p>{vehicle.notes}</p>
              </div>
            )}

            {/* Past & Active Bookings for this Vehicle */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Booking History ({vehicleBookings.length})</span>
              </h4>

              {vehicleBookings.length === 0 ? (
                <p className="text-xs text-slate-500">No rental records yet for this vehicle.</p>
              ) : (
                <div className="divide-y divide-[#18253a] border border-[#1f2f48] rounded-xl overflow-hidden text-xs">
                  {vehicleBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 bg-[#111a28] hover:bg-[#142136] transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-white">
                          {b.id} · {b.customer.fullName}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {b.pickupDate} to {b.returnDate} ({b.days} days)
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold font-mono text-emerald-400 block">
                          {formatCurrency(b.totalRentalFee)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            b.status === 'On Rent'
                              ? 'bg-blue-950 text-blue-300'
                              : 'bg-emerald-950 text-emerald-300'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Vehicle Name & Model</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">License Plate Number</label>
                <input
                  type="text"
                  required
                  value={formData.plateNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, plateNumber: e.target.value }))
                  }
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Vehicle Type</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
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
                <label className="text-xs font-semibold text-slate-300">Daily Rate (LKR)</label>
                <input
                  type="number"
                  required
                  value={formData.dailyRate}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, dailyRate: Number(e.target.value) }))
                  }
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value as VehicleStatus }))
                  }
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="available">Available</option>
                  <option value="on_rent">On Rent</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Odometer (km)</label>
                <input
                  type="number"
                  value={formData.odometer}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, odometer: Number(e.target.value) }))
                  }
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Insurance Expiry Date</label>
                <input
                  type="date"
                  value={formData.insuranceExpiry}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, insuranceExpiry: e.target.value }))
                  }
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Vehicle Revenue Licence Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.revenueLicenseExpiry}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, revenueLicenseExpiry: e.target.value }))
                  }
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Engine CC</label>
                <input
                  type="text"
                  value={formData.engineCC}
                  onChange={(e) => setFormData((prev) => ({ ...prev, engineCC: e.target.value }))}
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Next Service (km)</label>
                <input
                  type="number"
                  value={formData.nextServiceKm}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nextServiceKm: Number(e.target.value) }))
                  }
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* Vehicle Profile Picture Upload in Edit Mode */}
            <div className="space-y-2 p-3.5 bg-[#111a28] rounded-xl border border-[#1f2e46]">
              <label className="text-xs font-semibold text-slate-300 block">
                Vehicle Profile Picture
              </label>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
                <div className="w-24 h-18 rounded-lg overflow-hidden bg-slate-900 border border-[#243753] shrink-0">
                  <img
                    src={formData.image || vehicle.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Picture from Device</span>
                    </button>
                    <span className="text-[11px] text-slate-400">or paste image link</span>
                  </div>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="https://... or choose file from device"
                    className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Notes & Condition</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1b283d]">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl border border-[#1f2e46] text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
