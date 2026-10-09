import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  BusinessProfile,
  Booking,
  DailyFinanceRecord,
  ExpenseItem,
  TourPackage,
  Vehicle,
} from '../types';
import {
  initialBusinessProfile,
  initialDailyFinances,
  initialTours,
  initialVehicles,
} from '../data/seedData';
import { isSupabaseConfigured, requireSupabase, supabase } from '../lib/supabase';
import {
  DataTable,
  deleteAllRecords,
  deleteRecord,
  readRecords,
  replaceRecords,
  saveRecord,
  saveRecords,
} from '../lib/supabaseData';

export type NavTab = 'dashboard' | 'new-booking' | 'fleet' | 'day-folders' | 'reports' | 'settings';

export interface BackupData {
  profile?: BusinessProfile;
  vehicles?: Vehicle[];
  bookings?: Booking[];
  tours?: TourPackage[];
  dailyFinances?: DailyFinanceRecord[];
}

interface AppContextType {
  authReady: boolean;
  dataReady: boolean;
  isSupabaseConfigured: boolean;
  user: User | null;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  supabaseConnected: boolean;
  dataError: string | null;
  clearDataError: () => void;
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  vehicles: Vehicle[];
  bookings: Booking[];
  tours: TourPackage[];
  dailyFinances: DailyFinanceRecord[];
  businessProfile: BusinessProfile;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDayFolder: string;
  setSelectedDayFolder: (folder: string) => void;
  activeBookingModal: Booking | null;
  setActiveBookingModal: (booking: Booking | null) => void;
  activeAgreementModal: Booking | null;
  setActiveAgreementModal: (booking: Booking | null) => void;
  activeReceiptModal: Booking | null;
  setActiveReceiptModal: (booking: Booking | null) => void;
  activeVehicleModal: Vehicle | null;
  setActiveVehicleModal: (vehicle: Vehicle | null) => void;
  isLogReturnOpen: boolean;
  setIsLogReturnOpen: (open: boolean) => void;
  selectedVehicleForReturn: Vehicle | null;
  setSelectedVehicleForReturn: (vehicle: Vehicle | null) => void;
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Promise<Booking | null>;
  deleteBooking: (bookingId: string) => Promise<boolean>;
  clearAllBookings: () => Promise<boolean>;
  logVehicleReturn: (
    bookingId: string,
    returnOdometer: number,
    returnFuel: number,
    notes?: string,
    extraCharge?: number
  ) => Promise<boolean>;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => Promise<boolean>;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => Promise<Vehicle | null>;
  deleteVehicle: (id: string) => Promise<boolean>;
  addDailyExpense: (date: string, expense: Omit<ExpenseItem, 'id'>) => Promise<boolean>;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => Promise<boolean>;
  syncAllToSupabase: () => Promise<boolean>;
  restoreBackup: (backup: BackupData) => Promise<boolean>;
  resetAllData: () => Promise<boolean>;
  resetAllDataToZero: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const LEGACY_STORAGE_PREFIX = 'noor_kandy_clean_start_v5_';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function newRecordId(prefix: string): string {
  return `${prefix}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

function readLegacyArray<T>(key: string): T[] | null {
  const stored = localStorage.getItem(`${LEGACY_STORAGE_PREFIX}${key}`);
  if (!stored) return null;
  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed)) throw new Error(`Legacy ${key} data is not an array.`);
  return parsed as T[];
}

function readLegacyProfile(): BusinessProfile | null {
  const stored = localStorage.getItem(`${LEGACY_STORAGE_PREFIX}profile`);
  if (!stored) return null;
  const parsed: unknown = JSON.parse(stored);
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !('businessName' in parsed) ||
    typeof parsed.businessName !== 'string'
  ) {
    throw new Error('Legacy business profile is invalid.');
  }
  return parsed as BusinessProfile;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [dataReady, setDataReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDayFolder, setSelectedDayFolder] = useState('2026-10-03');
  const [activeBookingModal, setActiveBookingModal] = useState<Booking | null>(null);
  const [activeAgreementModal, setActiveAgreementModal] = useState<Booking | null>(null);
  const [activeReceiptModal, setActiveReceiptModal] = useState<Booking | null>(null);
  const [activeVehicleModal, setActiveVehicleModal] = useState<Vehicle | null>(null);
  const [isLogReturnOpen, setIsLogReturnOpen] = useState(false);
  const [selectedVehicleForReturn, setSelectedVehicleForReturn] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [dailyFinances, setDailyFinances] = useState<DailyFinanceRecord[]>(initialDailyFinances);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(initialBusinessProfile);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    let active = true;
    const initializeAuth = async () => {
      const { data, error } = await client.auth.getSession();
      if (!active) return;
      if (error) setAuthError(error.message);
      setUser(data.session?.user ?? null);
      setAuthReady(true);
    };

    void initializeAuth();
    const { data: authSubscription } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
      setAuthError(null);
    });

    return () => {
      active = false;
      authSubscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user || !supabase) {
      setVehicles([]);
      setBookings([]);
      setTours([]);
      setDailyFinances(initialDailyFinances);
      setBusinessProfile(initialBusinessProfile);
      setSupabaseConnected(false);
      setDataReady(true);
      return;
    }

    let active = true;
    const seedIfEmpty = async () => {
      const existingProfile = await readRecords<BusinessProfile>('business_profile');
      if (!existingProfile.length) {
        const legacyVehicles = readLegacyArray<Vehicle>('vehicles');
        const legacyBookings = readLegacyArray<Booking>('bookings');
        const legacyTours = readLegacyArray<TourPackage>('tours');
        const legacyFinances = readLegacyArray<DailyFinanceRecord>('finances');
        const legacyProfile = readLegacyProfile();

        await Promise.all([
          saveRecords(
            'vehicles',
            (legacyVehicles ?? initialVehicles).map((data) => ({ id: data.id, data })),
            true
          ),
          saveRecords(
            'bookings',
            (legacyBookings ?? []).map((data) => ({ id: data.id, data })),
            true
          ),
          saveRecords(
            'tours',
            (legacyTours ?? initialTours).map((data) => ({ id: data.id, data })),
            true
          ),
          saveRecords(
            'daily_finances',
            (legacyFinances ?? []).map((data) => ({ id: data.date, data })),
            true
          ),
        ]);
        await saveRecords('business_profile', [
          { id: 'default', data: legacyProfile ?? initialBusinessProfile },
        ], true);

        for (const key of ['vehicles', 'bookings', 'tours', 'finances', 'profile']) {
          localStorage.removeItem(`${LEGACY_STORAGE_PREFIX}${key}`);
        }
        if (legacyVehicles || legacyBookings || legacyTours || legacyFinances || legacyProfile) {
          console.info('Legacy local rental data was migrated to Supabase.');
        }
      }
      const [loadedVehicles, loadedBookings, loadedTours, loadedFinances, loadedProfile] =
        await Promise.all([
          readRecords<Vehicle>('vehicles'),
          readRecords<Booking>('bookings'),
          readRecords<TourPackage>('tours'),
          readRecords<DailyFinanceRecord>('daily_finances'),
          readRecords<BusinessProfile>('business_profile'),
        ]);
      return {
        loadedVehicles,
        loadedBookings,
        loadedTours,
        loadedFinances,
        loadedProfile: loadedProfile[0] ?? initialBusinessProfile,
      };
    };

    const refreshTable = async (table: DataTable) => {
      const records = await readRecords<Vehicle | Booking | TourPackage | DailyFinanceRecord | BusinessProfile>(table);
      if (!active) return;
      switch (table) {
        case 'vehicles':
          setVehicles(records as Vehicle[]);
          break;
        case 'bookings':
          setBookings(records as Booking[]);
          break;
        case 'tours':
          setTours(records as TourPackage[]);
          break;
        case 'daily_finances':
          setDailyFinances(records as DailyFinanceRecord[]);
          break;
        case 'business_profile':
          setBusinessProfile((records[0] as BusinessProfile | undefined) ?? initialBusinessProfile);
          break;
      }
    };

    const loadData = async () => {
      setDataReady(false);
      setDataError(null);
      try {
        const data = await seedIfEmpty();
        if (!active) return;
        setVehicles(data.loadedVehicles);
        setBookings(data.loadedBookings);
        setTours(data.loadedTours);
        setDailyFinances(data.loadedFinances);
        setBusinessProfile(data.loadedProfile);

        const channel = requireSupabase()
          .channel('rental-app-data')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
            void refreshTable('vehicles').catch((error: unknown) => {
              if (active) setDataError(`Unable to refresh vehicles: ${getErrorMessage(error)}`);
            });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
            void refreshTable('bookings').catch((error: unknown) => {
              if (active) setDataError(`Unable to refresh bookings: ${getErrorMessage(error)}`);
            });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'tours' }, () => {
            void refreshTable('tours').catch((error: unknown) => {
              if (active) setDataError(`Unable to refresh tours: ${getErrorMessage(error)}`);
            });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_finances' }, () => {
            void refreshTable('daily_finances').catch((error: unknown) => {
              if (active) setDataError(`Unable to refresh finances: ${getErrorMessage(error)}`);
            });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'business_profile' }, () => {
            void refreshTable('business_profile').catch((error: unknown) => {
              if (active) setDataError(`Unable to refresh business profile: ${getErrorMessage(error)}`);
            });
          })
          .subscribe((status, error) => {
            if (!active) return;
            setSupabaseConnected(status === 'SUBSCRIBED');
            if (error) setDataError(`Supabase realtime connection failed: ${error.message}`);
          });

        setDataReady(true);
        return () => {
          active = false;
          void requireSupabase().removeChannel(channel);
        };
      } catch (error) {
        if (active) {
          setDataError(`Unable to load application data from Supabase: ${getErrorMessage(error)}`);
          setDataReady(true);
        }
      }
    };

    let unsubscribe: (() => void) | undefined;
    void loadData().then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [user?.id]);

  const runOperation = async <T,>(label: string, action: () => Promise<T>): Promise<T | null> => {
    setDataError(null);
    try {
      return await action();
    } catch (error) {
      const message = getErrorMessage(error);
      console.error(`${label} failed:`, error);
      setDataError(`${label} failed: ${message}`);
      return null;
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    if (!supabase) {
      setAuthError('Supabase is not configured. Set the required environment variables and restart the app.');
      return false;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      setDataError(`Unable to sign out: ${error.message}`);
      return false;
    }
    return true;
  };

  const signOut = async (): Promise<boolean> => {
    if (!supabase) return false;
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
      return false;
    }
    setAuthError(null);
    return true;
  };

  const createBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>) =>
    runOperation('Creating booking', async () => {
      const id = newRecordId('BK');
      const created: Booking = { ...bookingData, id, createdAt: new Date().toISOString() };
      const financeDate = created.dayFolder;
      const existingFinance = dailyFinances.find((record) => record.date === financeDate);
      const collected = created.paymentStatus === 'Full' ? created.totalRentalFee : created.advanceAmount;
      const updatedFinance: DailyFinanceRecord = existingFinance
        ? {
            ...existingFinance,
            revenue: existingFinance.revenue + collected,
            netBalance: existingFinance.revenue + collected - existingFinance.expenses,
          }
        : {
            date: financeDate,
            revenue: collected,
            expenses: 0,
            netBalance: collected,
            expenseItems: [],
          };
      const vehicle = vehicles.find((item) => item.id === created.vehicleId);
      const updatedVehicle = vehicle
        ? {
            ...vehicle,
            status: 'on_rent' as const,
            totalTrips: vehicle.totalTrips + 1,
            revenueGenerated: vehicle.revenueGenerated + created.totalRentalFee,
          }
        : null;
      const [savedBooking] = await Promise.all([
        saveRecord('bookings', created.id, created),
        saveRecord('daily_finances', financeDate, updatedFinance),
        updatedVehicle ? saveRecord('vehicles', updatedVehicle.id, updatedVehicle) : Promise.resolve(null),
      ]);
      setBookings((previous) => [savedBooking, ...previous.filter((item) => item.id !== savedBooking.id)]);
      setDailyFinances((previous) => [
        updatedFinance,
        ...previous.filter((item) => item.date !== financeDate),
      ]);
      if (updatedVehicle) {
        setVehicles((previous) => previous.map((item) => item.id === updatedVehicle.id ? updatedVehicle : item));
      }
      setActiveReceiptModal(savedBooking);
      return savedBooking;
    });

  const deleteBooking = async (bookingId: string): Promise<boolean> => {
    const result = await runOperation('Deleting booking', async () => {
      const booking = bookings.find((item) => item.id === bookingId);
      await deleteRecord('bookings', bookingId);
      if (booking) {
        const vehicle = vehicles.find((item) => item.id === booking.vehicleId);
        const updates: Promise<unknown>[] = [];
        if (vehicle) {
          const updatedVehicle = {
            ...vehicle,
            status: 'available' as const,
            totalTrips: Math.max(0, vehicle.totalTrips - 1),
            revenueGenerated: Math.max(0, vehicle.revenueGenerated - booking.totalRentalFee),
          };
          updates.push(saveRecord('vehicles', vehicle.id, updatedVehicle));
          setVehicles((previous) => previous.map((item) => item.id === vehicle.id ? updatedVehicle : item));
        }
        const finance = dailyFinances.find((item) => item.date === booking.dayFolder);
        if (finance) {
          const paid = booking.paymentStatus === 'Full' ? booking.totalRentalFee : booking.advanceAmount;
          const revenue = Math.max(0, finance.revenue - paid);
          const updatedFinance = { ...finance, revenue, netBalance: revenue - finance.expenses };
          updates.push(saveRecord('daily_finances', finance.date, updatedFinance));
          setDailyFinances((previous) => previous.map((item) => item.date === finance.date ? updatedFinance : item));
        }
        await Promise.all(updates);
      }
      setBookings((previous) => previous.filter((item) => item.id !== bookingId));
      return true;
    });
    return result === true;
  };

  const clearAllBookings = async (): Promise<boolean> => {
    const result = await runOperation('Clearing bookings', async () => {
      const resetVehicles = vehicles.map((vehicle) => ({
        ...vehicle,
        status: 'available' as const,
        totalTrips: 0,
        revenueGenerated: 0,
      }));
      await Promise.all([
        deleteAllRecords('bookings'),
        deleteAllRecords('daily_finances'),
        saveRecords('vehicles', resetVehicles.map((data) => ({ id: data.id, data }))),
      ]);
      setBookings([]);
      setDailyFinances([]);
      setVehicles(resetVehicles);
      return true;
    });
    return result === true;
  };

  const logVehicleReturn = (
    bookingId: string,
    returnOdometer: number,
    returnFuel: number,
    notes?: string,
    extraCharge = 0
  ): Promise<boolean> => {
    return runOperation('Recording vehicle return', async () => {
      const booking = bookings.find((item) => item.id === bookingId);
      if (!booking) throw new Error(`Booking ${bookingId} was not found.`);
      const balanceDue = Math.max(0, booking.balanceDue + extraCharge);
      const updatedBooking: Booking = {
        ...booking,
        status: 'Returned',
        odometerEnd: returnOdometer,
        fuelEnd: returnFuel,
        returnNotes: notes,
        balanceDue,
        paymentStatus: balanceDue === 0 ? 'Full' : 'Partial',
      };
      const vehicle = vehicles.find((item) => item.id === booking.vehicleId);
      const updatedVehicle = vehicle
        ? { ...vehicle, status: 'available' as const, odometer: returnOdometer, fuelLevel: returnFuel }
        : null;
      await Promise.all([
        saveRecord('bookings', bookingId, updatedBooking),
        updatedVehicle ? saveRecord('vehicles', updatedVehicle.id, updatedVehicle) : Promise.resolve(null),
      ]);
      setBookings((previous) => previous.map((item) => item.id === bookingId ? updatedBooking : item));
      if (updatedVehicle) {
        setVehicles((previous) => previous.map((item) => item.id === updatedVehicle.id ? updatedVehicle : item));
      }
      return true;
    }).then((result) => result === true);
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>): Promise<boolean> => {
    const result = await runOperation('Updating vehicle', async () => {
      const vehicle = vehicles.find((item) => item.id === id);
      if (!vehicle) throw new Error(`Vehicle ${id} was not found.`);
      const updated = await saveRecord('vehicles', id, { ...vehicle, ...updates });
      setVehicles((previous) => previous.map((item) => item.id === id ? updated : item));
      return true;
    });
    return result === true;
  };

  const addVehicle = (data: Omit<Vehicle, 'id' | 'createdAt'>) =>
    runOperation('Adding vehicle', async () => {
      const id = newRecordId('V');
      const vehicle: Vehicle = {
        ...data,
        id,
        createdAt: new Date().toISOString().slice(0, 10),
        revenueGenerated: 0,
        totalTrips: 0,
      };
      const saved = await saveRecord('vehicles', id, vehicle);
      setVehicles((previous) => [saved, ...previous]);
      return saved;
    });

  const deleteVehicle = async (id: string): Promise<boolean> => {
    const result = await runOperation('Deleting vehicle', async () => {
      await deleteRecord('vehicles', id);
      setVehicles((previous) => previous.filter((item) => item.id !== id));
      return true;
    });
    return result === true;
  };

  const addDailyExpense = async (
    date: string,
    expense: Omit<ExpenseItem, 'id'>
  ): Promise<boolean> => {
    const result = await runOperation('Saving daily expense', async () => {
      const existing = dailyFinances.find((item) => item.date === date);
      const expenseWithId: ExpenseItem = { ...expense, id: newRecordId('EXP') };
      const expenses = (existing?.expenses ?? 0) + expense.amount;
      const updated: DailyFinanceRecord = {
        date,
        revenue: existing?.revenue ?? 0,
        expenses,
        netBalance: (existing?.revenue ?? 0) - expenses,
        expenseItems: [expenseWithId, ...(existing?.expenseItems ?? [])],
      };
      await saveRecord('daily_finances', date, updated);
      setDailyFinances((previous) => [updated, ...previous.filter((item) => item.date !== date)]);
      return true;
    });
    return result === true;
  };

  const updateBusinessProfile = async (updates: Partial<BusinessProfile>): Promise<boolean> => {
    const result = await runOperation('Saving business profile', async () => {
      const updated = await saveRecord('business_profile', 'default', { ...businessProfile, ...updates });
      setBusinessProfile(updated);
      return true;
    });
    return result === true;
  };

  const syncAllToSupabase = async (): Promise<boolean> => {
    const result = await runOperation('Syncing data to Supabase', async () => {
      await Promise.all([
        saveRecords('vehicles', vehicles.map((data) => ({ id: data.id, data }))),
        saveRecords('bookings', bookings.map((data) => ({ id: data.id, data }))),
        saveRecords('tours', tours.map((data) => ({ id: data.id, data }))),
        saveRecords('daily_finances', dailyFinances.map((data) => ({ id: data.date, data }))),
        saveRecord('business_profile', 'default', businessProfile),
      ]);
      return true;
    });
    return result === true;
  };

  const restoreBackup = async (backup: BackupData): Promise<boolean> => {
    const result = await runOperation('Restoring backup', async () => {
      if (!Array.isArray(backup.vehicles) || !Array.isArray(backup.bookings)) {
        throw new Error('Backup must contain vehicle and booking arrays.');
      }
      const restoredVehicles = backup.vehicles;
      const restoredBookings = backup.bookings;
      const restoredTours = backup.tours ?? [];
      const restoredFinances = backup.dailyFinances ?? [];
      const restoredProfile = backup.profile ?? initialBusinessProfile;
      await Promise.all([
        replaceRecords('vehicles', restoredVehicles.map((data) => ({ id: data.id, data }))),
        replaceRecords('bookings', restoredBookings.map((data) => ({ id: data.id, data }))),
        replaceRecords('tours', restoredTours.map((data) => ({ id: data.id, data }))),
        replaceRecords('daily_finances', restoredFinances.map((data) => ({ id: data.date, data }))),
        saveRecord('business_profile', 'default', restoredProfile),
      ]);
      setVehicles(restoredVehicles);
      setBookings(restoredBookings);
      setTours(restoredTours);
      setDailyFinances(restoredFinances);
      setBusinessProfile(restoredProfile);
      return true;
    });
    return result === true;
  };

  const resetAllDataToZero = async (): Promise<boolean> => {
    const result = await runOperation('Resetting operational data', async () => {
      await Promise.all([
        deleteAllRecords('bookings'),
        deleteAllRecords('daily_finances'),
        replaceRecords('vehicles', initialVehicles.map((data) => ({ id: data.id, data }))),
        saveRecord('business_profile', 'default', initialBusinessProfile),
      ]);
      setBookings([]);
      setDailyFinances([]);
      setVehicles(initialVehicles);
      setBusinessProfile(initialBusinessProfile);
      return true;
    });
    return result === true;
  };

  return (
    <AppContext.Provider
      value={{
        authReady,
        dataReady,
        isSupabaseConfigured,
        user,
        authError,
        signIn,
        signOut,
        supabaseConnected,
        dataError,
        clearDataError: () => setDataError(null),
        currentTab,
        setCurrentTab,
        vehicles,
        bookings,
        tours,
        dailyFinances,
        businessProfile,
        searchQuery,
        setSearchQuery,
        selectedDayFolder,
        setSelectedDayFolder,
        activeBookingModal,
        setActiveBookingModal,
        activeAgreementModal,
        setActiveAgreementModal,
        activeReceiptModal,
        setActiveReceiptModal,
        activeVehicleModal,
        setActiveVehicleModal,
        isLogReturnOpen,
        setIsLogReturnOpen,
        selectedVehicleForReturn,
        setSelectedVehicleForReturn,
        createBooking,
        deleteBooking,
        clearAllBookings,
        logVehicleReturn,
        updateVehicle,
        addVehicle,
        deleteVehicle,
        addDailyExpense,
        updateBusinessProfile,
        syncAllToSupabase,
        restoreBackup,
        resetAllData: resetAllDataToZero,
        resetAllDataToZero,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
