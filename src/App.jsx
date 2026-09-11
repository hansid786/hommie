import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import AuthView from './components/views/AuthView';

// HOMMIE Layout Components
import HommieNavbar from './components/HommieNavbar';
import HommieFooter from './components/HommieFooter';
import HommieMobileNav from './components/HommieMobileNav';
import ChatDrawer from './components/ChatDrawer';

// HOMMIE Views
import CustomerHomeView from './components/views/CustomerHomeView';
import CustomerDashboardView from './components/views/CustomerDashboardView';
import DiscoveryView from './components/views/DiscoveryView';
import ProfessionalPublicProfileView from './components/views/ProfessionalPublicProfileView';
import MyHomeView from './components/views/MyHomeView';
import CustomerBookingsView from './components/views/CustomerBookingsView';
import ProfessionalDashboardView from './components/views/ProfessionalDashboardView';
import ProfessionalOnboardingView from './components/views/ProfessionalOnboardingView';
import AdminConsoleView from './components/views/AdminConsoleView';

// HOMMIE Modals
import LocationSelectorModal from './components/Modals/LocationSelectorModal';
import HommieBookingModal from './components/Modals/HommieBookingModal';
import QuoteApprovalModal from './components/Modals/QuoteApprovalModal';
import HommiePaymentModal from './components/Modals/HommiePaymentModal';
import HommieRatingModal from './components/Modals/HommieRatingModal';
import SafetyReportModal from './components/Modals/SafetyReportModal';
import AppErrorBoundary from './components/AppErrorBoundary';

import { getActiveLocality, getActiveCity, subscribeHommieState } from './services/hommieState';

function HommieMainApp() {
  const { currentUser, role, isLoading } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState(() => {
    if (role === 'worker' || role === 'professional') return 'pro-dashboard';
    if (role === 'admin') return 'admin';
    return 'home';
  }); // home, customer-dashboard, discovery, pro-profile, my-home, bookings, pro-dashboard, pro-onboarding, admin
  const [viewParams, setViewParams] = useState({});

  // Active locality state
  const [activeLocality, setActiveLocality] = useState(getActiveLocality());
  const [activeCity, setActiveCity] = useState(getActiveCity());

  // Modal States
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [targetProForBooking, setTargetProForBooking] = useState(null);
  const [bookingModalInitialUrgent, setBookingModalInitialUrgent] = useState(false);

  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [targetBookingForQuote, setTargetBookingForQuote] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [targetBookingForPayment, setTargetBookingForPayment] = useState(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [targetBookingForRating, setTargetBookingForRating] = useState(null);

  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [safetyTarget, setSafetyTarget] = useState(null);

  // Active Chat State
  const [activeChatBooking, setActiveChatBooking] = useState(null);

  const [selectedProId, setSelectedProId] = useState('pro-arjun');

  // Sync state subscriptions
  useEffect(() => {
    const unsub = subscribeHommieState(() => {
      setActiveLocality(getActiveLocality());
      setActiveCity(getActiveCity());
    });
    return unsub;
  }, []);

  // Sync role view changes
  useEffect(() => {
    if (role === 'worker' || role === 'professional') {
      setCurrentView('pro-dashboard');
    } else if (role === 'admin') {
      setCurrentView('admin');
    } else if (role === 'customer' && (currentView === 'pro-dashboard' || currentView === 'admin')) {
      setCurrentView('home');
    }
  }, [role]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8f7] px-6 text-[#132238]">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#132238] text-xl font-black text-white">H</div>
          <p className="mt-4 text-sm font-bold text-slate-600">Securing your HOMMIE session...</p>
        </div>
      </main>
    );
  }

  if (!currentUser) {
    return <AuthView onSuccess={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />;
  }

  // Navigation Helper
  const navigateTo = (view, params = {}) => {
    const customerOnlyViews = ['home', 'customer-dashboard', 'discovery', 'pro-profile', 'my-home', 'bookings'];
    const roleViews = {
      customer: customerOnlyViews,
      worker: ['pro-dashboard', 'pro-onboarding'],
      professional: ['pro-dashboard', 'pro-onboarding'],
      admin: ['admin']
    };
    const allowedViews = roleViews[role] || customerOnlyViews;
    if (!allowedViews.includes(view)) {
      const defaultView = role === 'admin'
        ? 'admin'
        : role === 'worker' || role === 'professional'
          ? 'pro-dashboard'
          : 'customer-dashboard';
      setCurrentView(defaultView);
      return;
    }

    setViewParams(params);
    if (view === 'pro-profile' && params.proId) {
      setSelectedProId(params.proId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Booking Flow Triggers
  const handleOpenBooking = (pro, opts = {}) => {
    setTargetProForBooking(pro);
    setBookingModalInitialUrgent(!!opts.urgent);
    setShowBookingModal(true);
  };

  const handleBookingConfirmed = () => {
    setShowBookingModal(false);
    navigateTo('bookings');
  };

  const handleOpenQuoteApproval = (booking) => {
    setTargetBookingForQuote(booking);
    setShowQuoteModal(true);
  };

  const handleOpenPayment = (booking) => {
    setTargetBookingForPayment(booking);
    setShowPaymentModal(true);
  };

  const handleOpenRating = (booking) => {
    setTargetBookingForRating(booking);
    setShowRatingModal(true);
  };

  const handleOpenSafety = (target) => {
    setSafetyTarget(target);
    setShowSafetyModal(true);
  };

  const handleOpenChat = (booking) => {
    setActiveChatBooking(booking);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8f7] text-[#132238] font-sans selection:bg-amber-200 selection:text-[#132238]">
      {/* 1. TOP NAVBAR */}
      <HommieNavbar
        activeLocality={activeLocality}
        activeCity={activeCity}
        onOpenLocationModal={() => setShowLocationModal(true)}
        onNavigate={navigateTo}
        currentView={currentView}
      />

      {/* 2. MAIN VIEW SWITCHER */}
      <main className="flex-1">
        {currentView === 'customer-dashboard' && (
          <CustomerDashboardView
            onBookNewService={() => navigateTo('home')}
            onSelectWorker={(worker) => navigateTo('pro-profile', { proId: worker.id })}
            onRateWorker={handleOpenRating}
            onDisputeBooking={handleOpenSafety}
            onReportSafety={handleOpenSafety}
            onPayBooking={handleOpenPayment}
            onViewInvoice={(booking) => navigateTo('bookings', { booking })}
          />
        )}

        {currentView === 'home' && (
          <CustomerHomeView
            onSelectCategory={(slug) => navigateTo('discovery', { category: slug })}
            onOpenBookingModal={handleOpenBooking}
            onViewProProfile={(proId) => navigateTo('pro-profile', { proId })}
            onOpenLocationModal={() => setShowLocationModal(true)}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'discovery' && (
          <DiscoveryView
            initialCategory={viewParams.category}
            initialQuery={viewParams.query}
            initialUrgent={viewParams.urgent}
            onViewProProfile={(proId) => navigateTo('pro-profile', { proId })}
            onOpenBookingModal={handleOpenBooking}
            onOpenLocationModal={() => setShowLocationModal(true)}
          />
        )}

        {currentView === 'pro-profile' && (
          <ProfessionalPublicProfileView
            proId={selectedProId}
            onBack={() => navigateTo('discovery')}
            onOpenBookingModal={handleOpenBooking}
            onOpenSafetyReport={handleOpenSafety}
          />
        )}

        {currentView === 'my-home' && (
          <MyHomeView
            onOpenBookingModal={handleOpenBooking}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'bookings' && (
          <CustomerBookingsView
            onOpenQuoteModal={handleOpenQuoteApproval}
            onOpenPaymentModal={handleOpenPayment}
            onOpenRatingModal={handleOpenRating}
            onOpenChatModal={handleOpenChat}
            onOpenSafetyModal={handleOpenSafety}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'pro-dashboard' && (
          <ProfessionalDashboardView
            proId={currentUser?.proId || currentUser?.workerId || 'pro-arjun'}
            onOpenChatModal={handleOpenChat}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'pro-onboarding' && (
          <ProfessionalOnboardingView
            onCompleted={() => {
              navigateTo('pro-dashboard');
            }}
            onBack={() => navigateTo('home')}
          />
        )}

        {currentView === 'admin' && (
          <AdminConsoleView />
        )}
      </main>

      {/* 3. FOOTER */}
      {currentView !== 'admin' && (
        <HommieFooter
          onNavigate={navigateTo}
          onOpenLocationModal={() => setShowLocationModal(true)}
        />
      )}

      {/* 4. MOBILE BOTTOM NAVIGATION */}
      <HommieMobileNav
        currentView={currentView}
        onNavigate={navigateTo}
      />

      {/* 5. MODAL DIALOGS */}
      <LocationSelectorModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        activeLocality={activeLocality}
        activeCity={activeCity}
      />

      <HommieBookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        pro={targetProForBooking}
        initialUrgent={bookingModalInitialUrgent}
        onBookingSuccess={handleBookingConfirmed}
      />

      <QuoteApprovalModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        booking={targetBookingForQuote}
        onApproved={() => {
          setShowQuoteModal(false);
          navigateTo('bookings');
        }}
        onRejected={() => {
          setShowQuoteModal(false);
          navigateTo('bookings');
        }}
      />

      <HommiePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        booking={targetBookingForPayment}
        onPaymentSuccess={() => {
          setShowPaymentModal(false);
          navigateTo('bookings');
        }}
      />

      <HommieRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        booking={targetBookingForRating}
        onSubmitSuccess={() => {
          setShowRatingModal(false);
          navigateTo('bookings');
        }}
      />

      <SafetyReportModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        target={safetyTarget}
      />

      {/* 6. REALTIME CHAT DRAWER */}
      {activeChatBooking && (
        <ChatDrawer
          booking={activeChatBooking}
          onClose={() => setActiveChatBooking(null)}
          userRole={role}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <HommieMainApp />
        </NotificationProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}
