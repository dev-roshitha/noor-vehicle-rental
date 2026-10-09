import React, { useState, useRef, useEffect } from 'react';
import {
  Bike,
  CarFront,
  Compass,
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
  FileCheck,
  Printer,
  Sparkles,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  VehicleCategory,
  PaymentMethod,
  PaymentStatus,
  VehicleInspection,
  CustomerDocument,
} from '../types';
import { formatCurrency } from '../utils/formatters';

export const NewBookingView: React.FC = () => {
  const {
    vehicles,
    tours,
    createBooking,
    setCurrentTab,
    setActiveAgreementModal,
    setActiveReceiptModal,
    selectedDayFolder,
  } = useApp();

  // Booking mode: Bike Rental | Car Rental | Tour Booking
  const [activeCategory, setActiveCategory] = useState<VehicleCategory>('bikes');

  // Filter vehicles by category
  const availableVehicles = vehicles.filter((v) => v.category === activeCategory);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    availableVehicles[0]?.id || ''
  );

  // When activeCategory changes, switch default selection
  useEffect(() => {
    if (activeCategory === 'tours') {
      if (tours.length > 0) setSelectedVehicleId(tours[0].id);
    } else {
      const match = vehicles.find((v) => v.category === activeCategory);
      if (match) setSelectedVehicleId(match.id);
    }
  }, [activeCategory, vehicles, tours]);

  // Selected item
  const selectedVehicle =
    activeCategory === 'tours'
      ? tours.find((t) => t.id === selectedVehicleId)
      : vehicles.find((v) => v.id === selectedVehicleId);

  // Dates & Times
  const [pickupDate, setPickupDate] = useState<string>('2026-10-03');
  const [pickupTime, setPickupTime] = useState<string>('10:00');
  const [returnDate, setReturnDate] = useState<string>('2026-10-05');
  const [returnTime, setReturnTime] = useState<string>('17:00');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Partial');
  const [depositHeldType, setDepositHeldType] = useState<'Cash' | 'Passport' | 'ID Card' | 'None'>('Passport');

  // Customer Information
  const [customerName, setCustomerName] = useState<string>('Anna Müller');
  const [phoneNumber, setPhoneNumber] = useState<string>('+49 170 555 0192');
  const [country, setCountry] = useState<string>('Germany');
  const [idType, setIdType] = useState<'Passport' | 'Driving License' | 'National ID / NIC'>('Passport');
  const [idNumber, setIdNumber] = useState<string>('C4X79K220');

  // Documents
  const [documents, setDocuments] = useState<CustomerDocument>({
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    idFront: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
    idBack: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    driverLicense: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
  });

  // Inspection Photos (Front, Back, Left, Right)
  const [inspection, setInspection] = useState<VehicleInspection>({
    front: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80',
    back: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=400&q=80',
    left: 'https://images.unsplash.com/photo-1571188654248-7a89213915f7?auto=format&fit=crop&w=400&q=80',
    right: 'https://images.unsplash.com/photo-1558981420-87aa92103444?auto=format&fit=crop&w=400&q=80',
  });

  // Calculate rental duration in days
  const calculateDays = () => {
    try {
      const start = new Date(`${pickupDate}T${pickupTime}:00`);
      const end = new Date(`${returnDate}T${returnTime}:00`);
      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      if (diffHours <= 0) return 1;
      return Math.max(1, Math.ceil(diffHours / 24));
    } catch {
      return 1;
    }
  };

  const rentalDays = calculateDays();
  const dailyRate = selectedVehicle
    ? 'dailyRate' in selectedVehicle
      ? selectedVehicle.dailyRate
      : selectedVehicle.price
    : 4500;

  const totalFee = rentalDays * dailyRate;
  const [advanceAmount, setAdvanceAmount] = useState<number>(5000);
  const [securityDeposit, setSecurityDeposit] = useState<number>(15000);

  // Sync advance with payment status
  useEffect(() => {
    if (paymentStatus === 'Full') {
      setAdvanceAmount(totalFee);
    } else if (paymentStatus === 'Pending') {
      setAdvanceAmount(0);
    }
  }, [paymentStatus, totalFee]);

  const balanceDue = Math.max(0, totalFee - advanceAmount);

  // Interactive Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw initial aesthetic script signature matching screenshot
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Render nice sample signature
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '32px "Caveat", "Dancing Script", cursive, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('Anna Müller', 30, 48);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // File upload simulation with real preview
  const handleFileUpload = (
    field: keyof CustomerDocument | keyof VehicleInspection,
    target: 'doc' | 'inspection'
  ) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const result = uploadEvent.target?.result as string;
          if (target === 'doc') {
            setDocuments((prev) => ({ ...prev, [field]: result }));
          } else {
            setInspection((prev) => ({ ...prev, [field]: result }));
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Submit Booking
  const handleConfirmBooking = async () => {
    if (!selectedVehicle) {
      alert('Please select a vehicle or tour.');
      return;
    }

    const signatureData = canvasRef.current?.toDataURL() || '';

    const newBooking = await createBooking({
      customer: {
        id: `CUST-${Date.now().toString().slice(-4)}`,
        fullName: customerName,
        phoneNumber,
        country,
        idType,
        idNumber,
        documents,
        signature: signatureData,
        dayFolder: pickupDate,
        createdAt: new Date().toISOString(),
      },
      vehicleId: selectedVehicle.id,
      vehicleName: 'name' in selectedVehicle ? selectedVehicle.name : selectedVehicle.title,
      vehicleCategory: activeCategory,
      vehiclePlate: 'plateNumber' in selectedVehicle ? selectedVehicle.plateNumber : 'TOUR',
      vehicleImage: selectedVehicle.image,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      days: rentalDays,
      ratePerDay: dailyRate,
      totalRentalFee: totalFee,
      advanceAmount: Number(advanceAmount),
      balanceDue,
      securityDeposit: Number(securityDeposit),
      depositHeldType,
      paymentMethod,
      paymentStatus,
      status: 'On Rent',
      inspectionPhotos: inspection,
      odometerStart: 'odometer' in selectedVehicle ? selectedVehicle.odometer : 0,
      fuelStart: 'fuelLevel' in selectedVehicle ? selectedVehicle.fuelLevel : 1.0,
      dayFolder: pickupDate,
    });

    if (!newBooking) return;

    // Open booking confirmation details receipt modal immediately with PDF download option & rules
    setActiveReceiptModal(newBooking);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Category Switcher Tabs (matches Screenshot 3) */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveCategory('bikes')}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeCategory === 'bikes'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30 ring-1 ring-cyan-400'
              : 'bg-[#0e1726] text-slate-400 border border-[#1b283d] hover:text-white'
          }`}
        >
          <Bike className="w-5 h-5" />
          <span>Bike / Scooty Rental</span>
        </button>

        <button
          onClick={() => setActiveCategory('cars')}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeCategory === 'cars'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30 ring-1 ring-cyan-400'
              : 'bg-[#0e1726] text-slate-400 border border-[#1b283d] hover:text-white'
          }`}
        >
          <CarFront className="w-5 h-5" />
          <span>Car Rental</span>
        </button>

        <button
          onClick={() => setActiveCategory('tours')}
          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeCategory === 'tours'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30 ring-1 ring-cyan-400'
              : 'bg-[#0e1726] text-slate-400 border border-[#1b283d] hover:text-white'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Tour Booking</span>
        </button>
      </div>

      {/* Main Grid: Left Column (Rental Details & Live Rate Calculator) vs Right Column (Customer & Verification) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: Rental Details */}
          <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-6 space-y-5 shadow-sm">
            <div>
              <h3 className="font-bold text-base text-white">Rental Details</h3>
              <p className="text-xs text-slate-400">Select a vehicle, dates and payment details.</p>
            </div>

            {/* Vehicle Selection Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {activeCategory === 'tours' ? 'Tour Experience' : 'Vehicle'}
              </label>
              <div className="relative">
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-3 text-xs text-white appearance-none focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {activeCategory === 'tours'
                    ? tours.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} - {formatCurrency(t.price)}
                        </option>
                      ))
                    : vehicles
                        .filter((v) => v.category === activeCategory)
                        .map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} ({v.plateNumber}) - {v.status === 'available' ? '🟢 Available' : '🔴 On Rent'} - {formatCurrency(v.dailyRate)}/day
                          </option>
                        ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  ▼
                </div>
              </div>

              {/* Selected Vehicle Quick Preview */}
              {selectedVehicle && (
                <div className="p-3 bg-[#131d2e] rounded-xl border border-[#1e2f49] flex items-center gap-3 mt-2">
                  <img
                    src={selectedVehicle.image}
                    alt=""
                    className="w-16 h-12 rounded-lg object-cover bg-slate-900 border border-[#233552]"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-white">
                      {'name' in selectedVehicle ? selectedVehicle.name : selectedVehicle.title}
                    </p>
                    <p className="text-emerald-400 font-mono font-semibold">
                      {formatCurrency(dailyRate)}/day
                    </p>
                    {'plateNumber' in selectedVehicle && (
                      <p className="text-[10px] text-slate-400 font-mono">
                        Plate: {selectedVehicle.plateNumber} · Odometer: {selectedVehicle.odometer} km
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pickup & Return Dates & Times */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Pickup Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '16:00', '18:00'].map(
                    (t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Return Date</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <select
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {['09:00', '10:00', '12:00', '15:00', '17:00', '18:00', '19:00', '20:00'].map(
                    (t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* Payment Method & Payment Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card / POS</option>
                  <option value="Koko Pay">Koko Pay (BNPL)</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                >
                  <option value="Full">Full Paid</option>
                  <option value="Partial">Partial Advance</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Security Deposit Held Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Security Document Held</label>
              <div className="grid grid-cols-4 gap-2">
                {(['Passport', 'ID Card', 'Cash', 'None'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDepositHeldType(type)}
                    className={`py-2 px-1 text-center text-xs font-semibold rounded-xl border transition-all ${
                      depositHeldType === type
                        ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500'
                        : 'bg-[#121c2d] text-slate-400 border-[#1f2e46] hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Live Rate Calculator (matches Screenshot 3) */}
          <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="font-bold text-base text-white">Live Rate Calculator</h3>
              <p className="text-xs text-slate-400">
                Automatically calculated based on your selection.
              </p>
            </div>

            <div className="space-y-3 divide-y divide-[#182438] text-xs">
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400">
                  Rental ({rentalDays} {rentalDays === 1 ? 'day' : 'days'} × {formatCurrency(dailyRate)})
                </span>
                <span className="font-bold text-white font-mono">{formatCurrency(totalFee)}</span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-300 font-semibold">Total Fee</span>
                <span className="font-extrabold text-base text-white font-mono">
                  {formatCurrency(totalFee)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <label className="text-slate-400">Advance Received</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-xs">Rs.</span>
                  <input
                    type="number"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                    className="w-28 bg-[#121c2d] border border-[#1f2e46] rounded-lg px-2.5 py-1 text-right text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-400">Balance Due</span>
                <span className="font-bold text-amber-400 font-mono">
                  {formatCurrency(balanceDue)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="text-slate-400 block">Security Deposit Held</span>
                  <span className="text-[10px] text-slate-500">Held as {depositHeldType}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-xs">Rs.</span>
                  <input
                    type="number"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                    className="w-28 bg-[#121c2d] border border-[#1f2e46] rounded-lg px-2.5 py-1 text-right text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info, Document Photos, Vehicle Inspection, Signature (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Customer Information */}
          <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="font-bold text-base text-white">Customer Information</h3>
              <p className="text-xs text-slate-400">Enter customer details and verify identity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Anna Müller"
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Phone Number (WhatsApp)</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Country / Nationality</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Germany"
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">ID Proof Type</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value as any)}
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="National ID / NIC">Sri Lankan NIC</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">ID / Passport Number</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g. C4X79K220"
                  className="w-full bg-[#121c2d] border border-[#1f2e46] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* Document Photos Upload Box (matches Screenshot 3) */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Document Photos
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                Upload customer profile photo and ID / driving license proofs (saved automatically to today's folder: {pickupDate}).
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Profile Photo */}
                <div
                  onClick={() => handleFileUpload('profilePhoto', 'doc')}
                  className="cursor-pointer group relative border-2 border-dashed border-[#20324d] hover:border-cyan-500/60 rounded-xl p-3 flex flex-col items-center justify-center text-center bg-[#111a28] transition-all overflow-hidden h-28"
                >
                  {documents.profilePhoto ? (
                    <>
                      <img
                        src={documents.profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-lg absolute inset-0"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity">
                        Change
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-cyan-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-200">Profile photo</span>
                      <span className="text-[10px] text-slate-400">Take photo</span>
                    </>
                  )}
                </div>

                {/* ID Front */}
                <div
                  onClick={() => handleFileUpload('idFront', 'doc')}
                  className="cursor-pointer group relative border-2 border-dashed border-[#20324d] hover:border-cyan-500/60 rounded-xl p-3 flex flex-col items-center justify-center text-center bg-[#111a28] transition-all overflow-hidden h-28"
                >
                  {documents.idFront ? (
                    <>
                      <img
                        src={documents.idFront}
                        alt="ID Front"
                        className="w-full h-full object-cover rounded-lg absolute inset-0"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity">
                        Change ID Front
                      </div>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-5 h-5 text-cyan-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-200">ID Front</span>
                      <span className="text-[10px] text-slate-400">Take photo</span>
                    </>
                  )}
                </div>

                {/* ID Back / Driving License */}
                <div
                  onClick={() => handleFileUpload('idBack', 'doc')}
                  className="cursor-pointer group relative border-2 border-dashed border-[#20324d] hover:border-cyan-500/60 rounded-xl p-3 flex flex-col items-center justify-center text-center bg-[#111a28] transition-all overflow-hidden h-28"
                >
                  {documents.idBack ? (
                    <>
                      <img
                        src={documents.idBack}
                        alt="ID Back"
                        className="w-full h-full object-cover rounded-lg absolute inset-0"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity">
                        Change License
                      </div>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-5 h-5 text-cyan-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-200">License / ID Back</span>
                      <span className="text-[10px] text-slate-400">Take photo</span>
                    </>
                  )}
                </div>

                {/* From Gallery */}
                <div
                  onClick={() => handleFileUpload('additionalDoc', 'doc')}
                  className="cursor-pointer group border-2 border-dashed border-[#20324d] hover:border-cyan-500/60 rounded-xl p-3 flex flex-col items-center justify-center text-center bg-[#111a28] transition-all h-28"
                >
                  <Upload className="w-5 h-5 text-cyan-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-200">From gallery</span>
                  <span className="text-[10px] text-slate-400">Choose files</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Vehicle Inspection Photos (Front, Back, Left, Right) */}
          <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="font-bold text-base text-white">Vehicle Inspection Photos</h3>
              <p className="text-xs text-slate-400">
                Add photos of the vehicle condition at pickup (avoids disputes on return).
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['front', 'back', 'left', 'right'] as const).map((angle) => (
                <div key={angle} className="relative group rounded-xl overflow-hidden bg-[#111b2b] border border-[#1f2d44]">
                  {inspection[angle] ? (
                    <div className="relative h-24">
                      <img
                        src={inspection[angle]}
                        alt={angle}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setInspection((prev) => ({ ...prev, [angle]: '' }))}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-slate-300 hover:text-rose-400"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-2 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded capitalize">
                        {angle}
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleFileUpload(angle, 'inspection')}
                      className="w-full h-24 flex flex-col items-center justify-center text-center p-2 text-slate-400 hover:text-white hover:bg-[#152338] transition-colors"
                    >
                      <Camera className="w-4 h-4 mb-1 text-slate-500" />
                      <span className="text-xs font-semibold capitalize">{angle}</span>
                      <span className="text-[9px] text-slate-500">+ Upload photo</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Customer Signature Pad (Interactive Canvas) */}
          <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Customer Signature</h3>
                <p className="text-xs text-slate-400">
                  Have the customer sign on screen to confirm the rental agreement.
                </p>
              </div>
              <button
                type="button"
                onClick={clearSignature}
                className="px-3 py-1.5 rounded-lg bg-[#142136] hover:bg-[#1a2d4a] border border-[#203450] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>

            <div className="relative bg-[#090e18] border border-[#1b283d] rounded-xl overflow-hidden">
              <canvas
                ref={canvasRef}
                width={500}
                height={120}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-28 cursor-crosshair touch-none"
              />
              <div className="absolute bottom-2 left-4 text-[10px] text-slate-500 font-mono pointer-events-none">
                Customer Signature Line — Noor Bike Rentals Agreement
              </div>
            </div>
          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCurrentTab('dashboard')}
              className="px-6 py-3 rounded-xl border border-[#1e2f49] text-xs font-bold text-slate-300 hover:bg-[#121c2d] transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmBooking}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Booking & Generate Agreement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
