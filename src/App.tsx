import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { NewBookingView } from './components/NewBookingView';
import { FleetToursView } from './components/FleetToursView';
import { DayFoldersView } from './components/DayFoldersView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { BookingDetailModal } from './components/BookingDetailModal';
import { RentalAgreementModal } from './components/RentalAgreementModal';
import { VehicleProfileModal } from './components/VehicleProfileModal';
import { BookingConfirmationReceiptModal } from './components/BookingConfirmationReceiptModal';
import { AuthScreen } from './components/AuthScreen';

const AppContent: React.FC = () => {
  const {
    authReady,
    dataReady,
    isSupabaseConfigured,
    user,
    dataError,
    clearDataError,
    currentTab,
    activeBookingModal,
    setActiveBookingModal,
    activeAgreementModal,
    setActiveAgreementModal,
    activeReceiptModal,
    setActiveReceiptModal,
    activeVehicleModal,
    setActiveVehicleModal,
    businessProfile,
  } = useApp();

  if (!authReady || (user && !dataReady)) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-300 flex items-center justify-center text-sm">
        {!authReady ? 'Connecting to Supabase...' : 'Loading business data...'}
      </div>
    );
  }

  if (!isSupabaseConfigured || !user) return <AuthScreen />;

  const renderCurrentView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'new-booking':
        return <NewBookingView />;
      case 'fleet':
        return <FleetToursView />;
      case 'day-folders':
        return <DayFoldersView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100 font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Right Content Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {dataError && (
          <div role="alert" className="mx-6 mt-4 rounded-xl border border-rose-700/50 bg-rose-950/50 p-3 text-sm text-rose-200 flex items-center justify-between gap-4">
            <span>{dataError}</span>
            <button type="button" onClick={clearDataError} className="text-rose-100 underline shrink-0">
              Dismiss
            </button>
          </div>
        )}
        <Header />
        <main className="flex-1">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Modals */}
      {activeBookingModal && (
        <BookingDetailModal
          booking={activeBookingModal}
          onClose={() => setActiveBookingModal(null)}
        />
      )}

      {activeAgreementModal && (
        <RentalAgreementModal
          booking={activeAgreementModal}
          onClose={() => setActiveAgreementModal(null)}
        />
      )}

      {activeReceiptModal && (
        <BookingConfirmationReceiptModal
          booking={activeReceiptModal}
          businessProfile={businessProfile}
          onClose={() => setActiveReceiptModal(null)}
          onOpenAgreement={() => {
            const b = activeReceiptModal;
            setActiveReceiptModal(null);
            setActiveAgreementModal(b);
          }}
        />
      )}

      {activeVehicleModal && (
        <VehicleProfileModal
          vehicle={activeVehicleModal}
          onClose={() => setActiveVehicleModal(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
