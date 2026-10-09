import React, { useRef } from 'react';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Phone,
  Bike,
  ShieldCheck,
  FileText,
  DollarSign,
  AlertTriangle,
  HelpCircle,
  Share2,
} from 'lucide-react';
import { Booking, BusinessProfile } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { NoorLogo } from './NoorLogo';

interface Props {
  booking: Booking;
  businessProfile: BusinessProfile;
  onClose: () => void;
  onOpenAgreement?: () => void;
}

export const BookingConfirmationReceiptModal: React.FC<Props> = ({
  booking,
  businessProfile,
  onClose,
  onOpenAgreement,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const receiptNumber = `REC-${booking.id}`;
  const issueDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const issueTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0b101b] border border-[#1b283d] rounded-2xl w-full max-w-3xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="p-4 px-6 border-b border-[#1b283d] flex items-center justify-between bg-[#080d16] no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-white">
                  Booking Confirmed Successfully!
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                  {booking.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Customer receipt & rental rules summary ready to print or save as PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-md shadow-cyan-950/40"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>

            {onOpenAgreement && (
              <button
                type="button"
                onClick={onOpenAgreement}
                className="px-3.5 py-2 rounded-xl bg-[#142136] hover:bg-[#1a2d48] border border-[#203450] text-cyan-300 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Full Agreement</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 text-base ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 overflow-y-auto bg-slate-950 print:bg-white print:text-black print:p-8 print:m-0">
          <div
            ref={receiptRef}
            className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl max-w-2xl mx-auto space-y-6 print:shadow-none print:border-none print:p-0"
          >
            {/* 1. Official Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <NoorLogo size="md" showText={false} />
                <div>
                  <h1 className="text-xl font-black text-slate-950 tracking-tight uppercase">
                    {businessProfile.businessName || 'NOOR BIKE RENTALS KANDY'}
                  </h1>
                  <p className="text-xs font-semibold text-slate-600">
                    Scooty, Motorbike & Vehicle Rentals · Kandy, Central Province
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    {businessProfile.address || '48/90 Yasarthna Thenakoon Mawatha, Kandy'}
                  </p>
                  <p className="text-[11px] font-mono text-slate-600 mt-0.5">
                    Hotline / WhatsApp: <strong className="text-slate-900">{businessProfile.phone || '+94 77 0121234'}</strong> · Email: {businessProfile.email || 'noorbikerentalskandy@gmail.com'}
                  </p>
                </div>
              </div>

              {/* Receipt Reference Box */}
              <div className="text-right">
                <span className="px-2.5 py-1 rounded bg-slate-900 text-white text-[10px] font-mono font-black uppercase tracking-wider block">
                  CUSTOMER RECEIPT
                </span>
                <p className="font-mono text-xs font-extrabold text-slate-900 mt-1">
                  {receiptNumber}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Booking Ref: <strong className="font-mono text-slate-800">{booking.id}</strong>
                </p>
                <p className="text-[10px] text-slate-500">
                  Issued: {issueDate} at {issueTime}
                </p>
              </div>
            </div>

            {/* 2. Customer & Vehicle Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Customer Box */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Customer Information
                </span>
                <p className="font-bold text-slate-900 text-sm">{booking.customer.fullName}</p>
                <p className="text-slate-600 font-mono">
                  Phone / WhatsApp: <strong className="text-slate-900">{booking.customer.phoneNumber}</strong>
                </p>
                <p className="text-slate-600">
                  Nationality: <strong className="text-slate-900">{booking.customer.country}</strong>
                </p>
                <p className="text-slate-600 font-mono">
                  {booking.customer.idType}: <strong className="text-slate-900">{booking.customer.idNumber}</strong>
                </p>
              </div>

              {/* Vehicle Box */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Vehicle Specifications
                </span>
                <p className="font-bold text-slate-900 text-sm">{booking.vehicleName}</p>
                <p className="text-slate-600">
                  Registration Plate: <strong className="font-mono text-slate-900 px-1.5 py-0.5 bg-amber-100 rounded border border-amber-300">{booking.vehiclePlate}</strong>
                </p>
                <p className="text-slate-600 font-mono">
                  Starting Odometer: <strong className="text-slate-900">{booking.odometerStart || 0} km</strong>
                </p>
                <p className="text-slate-600">
                  Fuel Gauge on Pickup:{' '}
                  <strong className="text-slate-900">
                    {Math.round((booking.fuelStart ?? 1.0) * 100)}% (Full)
                  </strong>
                </p>
              </div>
            </div>

            {/* 3. Rental Period Box */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-cyan-50/50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-cyan-800 uppercase block">Pickup Date & Time</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {formatDate(booking.pickupDate)} · <span className="font-mono">{booking.pickupTime}</span>
                </p>
              </div>

              <div className="text-center px-3 py-1 bg-white rounded-lg border border-cyan-200">
                <span className="text-[10px] text-slate-500 uppercase block">Duration</span>
                <span className="font-black text-cyan-900 font-mono text-sm">{booking.days} Day(s)</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-cyan-800 uppercase block">Expected Return</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {formatDate(booking.returnDate)} · <span className="font-mono">{booking.returnTime}</span>
                </p>
              </div>
            </div>

            {/* 4. Itemized Financial Breakdown & Payment Slip */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between font-bold text-slate-700">
                <span>Description / Rental Charges</span>
                <span>Amount (LKR)</span>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Daily Rental Rate ({booking.days} days @ {formatCurrency(booking.ratePerDay)}/day)</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(booking.totalRentalFee)}</span>
                </div>

                <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-dashed border-slate-200">
                  <span>Advance Amount Paid ({booking.paymentMethod})</span>
                  <span className="font-mono font-bold">(-) {formatCurrency(booking.advanceAmount)}</span>
                </div>

                <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t-2 border-slate-300">
                  <span>Outstanding Balance Due at Return</span>
                  <span className="font-mono text-amber-700">{formatCurrency(booking.balanceDue)}</span>
                </div>

                <div className="flex justify-between text-slate-500 text-[11px] pt-1">
                  <span>Security Deposit Held:</span>
                  <span className="font-mono font-bold text-slate-700">
                    {booking.securityDeposit > 0 ? formatCurrency(booking.securityDeposit) : 'Original Passport / NIC'} ({booking.depositHeldType})
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Complete Rental Rules & Regulations (Mandatory on Receipt) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-[11px] space-y-2 leading-relaxed">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                <span>Customer Rental Rules & Terms of Use</span>
              </h4>

              <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                <li>
                  <strong className="text-slate-900">Mandatory Helmet Law:</strong> Rider and pillion passenger must wear government-approved safety helmets securely buckled at all times.
                </li>
                <li>
                  <strong className="text-slate-900">Speed Limits & Prohibited Zones:</strong> Strictly adhere to 40 km/h in urban areas and 60 km/h on open roads. Riding on sand beaches or saltwater is forbidden.
                </li>
                <li>
                  <strong className="text-slate-900">Fuel Level Return:</strong> The vehicle was provided with {Math.round((booking.fuelStart ?? 1.0) * 100)}% fuel and must be returned with the equivalent fuel level.
                </li>
                <li>
                  <strong className="text-slate-900">Zero Substance Tolerance:</strong> Operating any vehicle under the influence of alcohol, drugs, or intoxicating substances is illegal in Sri Lanka and renders all insurance void.
                </li>
                <li>
                  <strong className="text-slate-900">Accident & Police Report:</strong> In case of an accident or collision, contact Noor Rentals immediately and file a report with local police. Do not leave the scene.
                </li>
                <li>
                  <strong className="text-slate-900">Extension Notice:</strong> Extensions require at least 6 hours advance notice via WhatsApp ({businessProfile.phone || '+94 77 0121234'}). Unnotified late returns are billed at standard hourly rates.
                </li>
                <li>
                  <strong className="text-slate-900">Deposit & Document Refund:</strong> Your security deposit and held documents are returned immediately upon vehicle inspection at drop-off.
                </li>
              </ol>
            </div>

            {/* 6. Emergency Contacts Callout */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2 text-amber-900">
              <div>
                <span className="font-bold block">24/7 Roadside Assistance & Breakdown Helpline:</span>
                <span className="font-mono text-sm font-black text-amber-950">{businessProfile.phone}</span>
              </div>
              <div className="text-right text-[11px] text-amber-800">
                <span>Police: <strong>119</strong> · Tourist Police: <strong>1912</strong> · Ambulance: <strong>1990</strong></span>
              </div>
            </div>

            {/* 7. Signatures Row */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Customer Signature:</span>
                {booking.customer.signature ? (
                  <img
                    src={booking.customer.signature}
                    alt="Customer Signature"
                    className="h-10 object-contain"
                  />
                ) : (
                  <div className="h-10 border-b border-dashed border-slate-400" />
                )}
                <span className="text-[10px] font-bold text-slate-800 block">
                  {booking.customer.fullName}
                </span>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[10px] text-slate-500 uppercase block">Authorized Signatory & Stamp:</span>
                <div className="h-10 flex items-center justify-end">
                  <span className="font-serif italic font-bold text-slate-700 text-sm border border-cyan-800/40 px-3 py-1 rounded bg-cyan-50">
                    Noor Rentals Auth. Stamp
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-800 block">
                  {businessProfile.businessName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden in Print) */}
        <div className="p-4 px-6 border-t border-[#1b283d] flex items-center justify-between bg-[#080d16] no-print">
          <span className="text-xs text-slate-400 font-mono">
            Booking Reference: <strong className="text-cyan-400">{booking.id}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-md shadow-cyan-950/40"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#142136] hover:bg-[#1a2d48] border border-[#203450] text-xs font-bold text-slate-300 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
