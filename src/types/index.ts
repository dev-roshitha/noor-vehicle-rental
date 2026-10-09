export type VehicleCategory = 'bikes' | 'cars' | 'tours';

export type VehicleStatus = 'available' | 'on_rent' | 'maintenance';

export interface Vehicle {
  id: string;
  name: string;
  category: VehicleCategory;
  plateNumber: string;
  dailyRate: number; // in LKR
  status: VehicleStatus;
  image: string;
  odometer: number; // in km
  fuelLevel: number; // 0.0 to 1.0 (e.g., 0.75 for 3/4)
  engineCC: string;
  transmission: 'Automatic' | 'Manual';
  year: number;
  revenueGenerated: number;
  totalTrips: number;
  insuranceExpiry: string; // YYYY-MM-DD
  revenueLicenseExpiry: string; // YYYY-MM-DD (Vehicle Revenue Licence)
  lastServiceKm: number;
  nextServiceKm: number;
  notes?: string;
  createdAt: string;
}

export interface DocumentExpiryAlert {
  vehicleId: string;
  vehicleName: string;
  plateNumber: string;
  documentType: 'Revenue Licence' | 'Insurance';
  expiryDate: string;
  daysRemaining: number;
  isExpired: boolean;
}

export interface CustomerDocument {
  profilePhoto?: string;
  idFront?: string;
  idBack?: string;
  driverLicense?: string;
  additionalDoc?: string;
}

export interface VehicleInspection {
  front: string;
  back: string;
  left: string;
  right: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  country: string;
  idType: 'Passport' | 'Driving License' | 'National ID / NIC';
  idNumber: string;
  documents: CustomerDocument;
  signature?: string;
  dayFolder: string; // e.g. "2026-10-03"
  createdAt: string;
}

export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer' | 'Koko Pay';
export type PaymentStatus = 'Full' | 'Partial' | 'Pending';
export type BookingStatus = 'On Rent' | 'Overdue' | 'Active' | 'Returned' | 'Cancelled';

export interface Booking {
  id: string; // e.g. "BK-2041"
  customer: Customer;
  vehicleId: string;
  vehicleName: string;
  vehicleCategory: VehicleCategory;
  vehiclePlate: string;
  vehicleImage: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  days: number;
  ratePerDay: number; // LKR
  totalRentalFee: number; // LKR
  advanceAmount: number; // LKR
  balanceDue: number; // LKR
  securityDeposit: number; // LKR
  depositHeldType?: 'Cash' | 'Passport' | 'ID Card' | 'None';
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  inspectionPhotos: VehicleInspection;
  odometerStart: number;
  odometerEnd?: number;
  fuelStart: number;
  fuelEnd?: number;
  returnNotes?: string;
  dayFolder: string; // e.g. "2026-10-03"
  createdAt: string;
}

export interface TourPackage {
  id: string;
  title: string;
  category: 'tours';
  price: number; // LKR
  priceUnit: 'per person' | 'per vehicle' | 'group';
  duration: string;
  capacity: string;
  image: string;
  description: string;
  highlights: string[];
}

export interface ExpenseItem {
  id: string;
  category: 'Fuel' | 'Maintenance' | 'Tires' | 'Insurance' | 'Wages' | 'Other';
  description: string;
  amount: number;
}

export interface DailyFinanceRecord {
  date: string; // YYYY-MM-DD
  revenue: number;
  expenses: number;
  netBalance: number;
  expenseItems: ExpenseItem[];
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  currency: string;
  currencySymbol: string;
  termsAndConditions: string;
  logoUrl?: string;
}
