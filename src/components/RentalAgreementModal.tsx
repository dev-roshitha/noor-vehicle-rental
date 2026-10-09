import React from 'react';
import { Printer, X, Download, ShieldCheck, Bike, Check, Phone, MapPin } from 'lucide-react';
import { Booking } from '../types';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { NoorLogo } from './NoorLogo';

interface Props {
  booking: Booking;
  onClose: () => void;
}

export const RentalAgreementModal: React.FC<Props> = ({ booking, onClose }) => {
  const { businessProfile, setActiveReceiptModal } = useApp();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0e1726] border border-[#1b283d] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 px-6 border-b border-[#1b283d] flex items-center justify-between no-print bg-[#0a0f18]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-sm text-white">
              Official Rental Agreement & ID Dossier — {booking.id}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveReceiptModal(booking);
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-[#142136] hover:bg-[#1a2d48] border border-[#203450] text-cyan-300 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Customer Receipt (PDF)</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-950/40"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Agreement</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 text-base ml-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Contract Document */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-200 print:text-black print:bg-white print:p-0">
          {/* Agreement Header */}
          <div className="border-b-2 border-slate-700 print:border-black pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <NoorLogo size="lg" showText={false} />
                <div>
                  <h1 className="text-xl font-extrabold text-white print:text-black tracking-tight uppercase">
                    {businessProfile.businessName}
                  </h1>
                  <p className="text-xs text-slate-400 print:text-slate-600">
                    Vehicle & Scooty Rentals · Kandy, Central Province, Sri Lanka
                  </p>
                  <p className="text-[11px] text-slate-400 print:text-slate-600 mt-0.5">
                    {businessProfile.address}
                  </p>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-600 mt-2 flex flex-wrap gap-4">
                <span>Hotline/WhatsApp: <strong className="text-slate-200 print:text-black">{businessProfile.phone}</strong></span>
                <span>Email: {businessProfile.email}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-black block">
                Booking Agreement
              </span>
              <p className="text-lg font-mono font-extrabold text-white print:text-black">
                {booking.id}
              </p>
              <p className="text-[11px] text-slate-400 print:text-slate-600">
                Date: {formatDate(booking.pickupDate)}
              </p>
              <p className="text-[10px] text-emerald-400 font-semibold print:text-black font-mono">
                Day Folder: {booking.dayFolder}
              </p>
            </div>
          </div>

          {/* Customer & Vehicle 2-Column Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Box */}
            <div className="bg-[#121c2d] print:bg-slate-50 border border-[#1f2f48] print:border-slate-300 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-black border-b border-[#1b283d] pb-1">
                Renter (Customer) Information
              </h4>
              <div className="flex items-center gap-4 pt-1">
                {booking.customer.documents.profilePhoto ? (
                  <img
                    src={booking.customer.documents.profilePhoto}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover border border-[#233754] print:border-slate-400"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-xs">
                    No Photo
                  </div>
                )}
                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-sm text-white print:text-black">
                    {booking.customer.fullName}
                  </p>
                  <p className="text-slate-400 print:text-slate-700">
                    Phone: <strong className="text-slate-200 print:text-black font-mono">{booking.customer.phoneNumber}</strong>
                  </p>
                  <p className="text-slate-400 print:text-slate-700">
                    Country: <span className="font-semibold text-white print:text-black">{booking.customer.country}</span>
                  </p>
                  <p className="text-slate-400 print:text-slate-700 font-mono">
                    {booking.customer.idType}: {booking.customer.idNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle Box */}
            <div className="bg-[#121c2d] print:bg-slate-50 border border-[#1f2f48] print:border-slate-300 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 print:text-black border-b border-[#1b283d] pb-1">
                Vehicle Assignment
              </h4>
              <div className="flex items-center gap-4 pt-1">
                <img
                  src={booking.vehicleImage}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover border border-[#233754] print:border-slate-400"
                />
                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-sm text-white print:text-black">
                    {booking.vehicleName}
                  </p>
                  <p className="text-slate-400 print:text-slate-700">
                    Plate No:{' '}
                    <strong className="text-slate-200 print:text-black font-mono bg-slate-900 print:bg-slate-200 px-1.5 py-0.5 rounded">
                      {booking.vehiclePlate}
                    </strong>
                  </p>
                  <p className="text-slate-400 print:text-slate-700">
                    Rate: <strong className="text-white print:text-black font-mono">{formatCurrency(booking.ratePerDay)} / day</strong>
                  </p>
                  <p className="text-slate-400 print:text-slate-700 font-mono text-[11px]">
                    Pickup Odometer: {booking.odometerStart} km
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule & Financial Breakdown Table */}
          <div className="border border-[#1f2f48] print:border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-[#121c2d] print:bg-slate-100 p-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-300 print:text-black">
              Rental Schedule & Financial Settlement (Sri Lankan Rupees)
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Pickup Date & Time</span>
                <span className="font-bold font-mono text-white print:text-black">
                  {booking.pickupDate} at {booking.pickupTime}
                </span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Return Due Date & Time</span>
                <span className="font-bold font-mono text-white print:text-black">
                  {booking.returnDate} at {booking.returnTime}
                </span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Rental Duration</span>
                <span className="font-bold font-mono text-white print:text-black">
                  {booking.days} {booking.days === 1 ? 'Day' : 'Days'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Payment Method</span>
                <span className="font-bold text-white print:text-black">
                  {booking.paymentMethod} ({booking.paymentStatus})
                </span>
              </div>
            </div>

            <div className="border-t border-[#1f2f48] print:border-slate-300 p-4 bg-[#0a101b] print:bg-white flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 print:text-slate-600">Total Rental Fee: </span>
                <strong className="text-white print:text-black text-sm">
                  {formatCurrency(booking.totalRentalFee)}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600">Advance Paid: </span>
                <strong className="text-emerald-400 print:text-black text-sm">
                  {formatCurrency(booking.advanceAmount)}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600">Balance Due: </span>
                <strong className="text-amber-400 print:text-black text-sm">
                  {formatCurrency(booking.balanceDue)}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600">Security Deposit: </span>
                <strong className="text-cyan-400 print:text-black text-sm">
                  {booking.depositHeldType}: {formatCurrency(booking.securityDeposit)}
                </strong>
              </div>
            </div>
          </div>

          {/* Attached Document Proofs & Inspection Photos */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black">
              Attached Identity Proofs & Vehicle Inspection Photos (At Pickup)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {booking.customer.documents.idFront && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 print:text-slate-600">ID / Passport Front</span>
                  <img
                    src={booking.customer.documents.idFront}
                    alt="ID Front"
                    className="w-full h-24 object-cover rounded-lg border border-[#1f2f48] print:border-slate-300"
                  />
                </div>
              )}
              {booking.customer.documents.idBack && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 print:text-slate-600">Driver License / ID Back</span>
                  <img
                    src={booking.customer.documents.idBack}
                    alt="License"
                    className="w-full h-24 object-cover rounded-lg border border-[#1f2f48] print:border-slate-300"
                  />
                </div>
              )}
              {booking.inspectionPhotos.front && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 print:text-slate-600">Inspection: Front</span>
                  <img
                    src={booking.inspectionPhotos.front}
                    alt="Front"
                    className="w-full h-24 object-cover rounded-lg border border-[#1f2f48] print:border-slate-300"
                  />
                </div>
              )}
              {booking.inspectionPhotos.back && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 print:text-slate-600">Inspection: Rear</span>
                  <img
                    src={booking.inspectionPhotos.back}
                    alt="Back"
                    className="w-full h-24 object-cover rounded-lg border border-[#1f2f48] print:border-slate-300"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Terms & Signatures */}
          <div className="pt-4 border-t border-[#1f2f48] print:border-black grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="text-[10px] text-slate-400 print:text-slate-600 space-y-1">
              <p className="font-bold text-slate-300 print:text-black">Standard Agreement Terms:</p>
              <p>1. The renter acknowledges receiving the vehicle in sound operational condition.</p>
              <p>2. Helmets provided must be worn at all times per Sri Lanka traffic regulations.</p>
              <p>3. Fuel to be returned at identical level. Accidental damage charged per official repair bill.</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 print:text-black block">
                Renter Signature & Acknowledgement:
              </span>
              <div className="h-20 bg-[#090e18] print:bg-white border border-[#1f2f48] print:border-slate-400 rounded-xl p-2 flex items-center justify-center">
                {booking.customer.signature ? (
                  <img
                    src={booking.customer.signature}
                    alt="Customer Signature"
                    className="max-h-full max-w-full print:filter-none filter invert"
                  />
                ) : (
                  <span className="font-serif italic text-lg text-slate-400 print:text-black">
                    {booking.customer.fullName}
                  </span>
                )}
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 print:text-slate-600">
                <span>Customer: {booking.customer.fullName}</span>
                <span>Verified: Noor Bike Rentals</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
