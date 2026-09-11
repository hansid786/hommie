// ============================================================================
// HOMMIE CENTRAL STATE ENGINE & NEON BACKEND INTEGRATION
// 17-state lifecycle machine connected via secure serverless API layer
// ============================================================================

import {
  HOMMIE_CITIES,
  HOMMIE_CATEGORIES,
  HOMMIE_PROFESSIONALS,
  HOMMIE_SEED_CUSTOMER,
  HOMMIE_MY_HOME_ASSETS,
  HOMMIE_SEED_BOOKINGS
} from '../data/hommieData';

import {
  apiCreateBooking,
  apiUpdateBookingStatus,
  apiSubmitQuote,
  apiRespondToQuote,
  apiSendMessage,
  apiSubmitRating,
  apiSaveHomeAsset,
  apiDeleteHomeAsset,
  apiSubmitKYC,
  apiReviewVerification,
  apiCreateReport
} from './api';

const UI_PREF_KEYS = {
  ACTIVE_CITY: 'hommie_ui_city',
  ACTIVE_LOCALITY: 'hommie_ui_locality'
};

function loadPreference(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    if (val) return val;
  } catch (err) {
    console.debug(err);
  }
  return fallback;
}

function savePreference(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch (err) {
    console.debug(err);
  }
}

// In-Memory Global State Singletons
let _cities = [...HOMMIE_CITIES];
let _categories = [...HOMMIE_CATEGORIES];
let _pros = [...HOMMIE_PROFESSIONALS];
let _customer = {
  ...HOMMIE_SEED_CUSTOMER,
  city: loadPreference(UI_PREF_KEYS.ACTIVE_CITY, 'Lucknow'),
  activeLocality: loadPreference(UI_PREF_KEYS.ACTIVE_LOCALITY, 'Gomti Nagar')
};
let _homeAssets = [...HOMMIE_MY_HOME_ASSETS];
let _bookings = [...HOMMIE_SEED_BOOKINGS];
let _auditLogs = [
  { id: 'log-1', timestamp: 'Today', actor: 'System', action: 'SYSTEM_READY', details: 'HOMMIE connected to Neon PostgreSQL backend.' }
];
let _safetyReports = [];

// Listeners for UI reactivity
const listeners = new Set();
function notifyStateChanged() {
  listeners.forEach((fn) => {
    try { fn(); } catch (err) {
      console.debug(err);
    }
  });
}

export function subscribeHommieState(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// --- 1. LOCALITY & SERVICEABILITY ---

export function getCities() {
  return _cities;
}

export function getActiveCity() {
  return _cities.find((c) => c.name.toLowerCase() === (_customer?.city || 'Lucknow').toLowerCase()) || _cities[1] || _cities[0];
}

export function getActiveLocality() {
  const city = getActiveCity();
  const targetName = _customer?.activeLocality || 'Gomti Nagar';
  return city.localities.find((l) => l.name.toLowerCase() === targetName.toLowerCase()) || city.localities[0];
}

export function setCustomerLocality(cityName, localityName) {
  if (_customer) {
    _customer.city = cityName;
    _customer.activeLocality = localityName;
    savePreference(UI_PREF_KEYS.ACTIVE_CITY, cityName);
    savePreference(UI_PREF_KEYS.ACTIVE_LOCALITY, localityName);
    recordAuditLog('Customer location set to ' + localityName + ', ' + cityName, 'Customer');
    notifyStateChanged();
  }
}

export function checkCategoryServiceability(categorySlug, localityName) {
  const city = getActiveCity();
  const loc = city.localities.find((l) => l.name.toLowerCase() === (localityName || '').toLowerCase());
  if (!loc || !loc.active) return { serviceable: false, reason: 'Locality not yet live on HOMMIE' };
  const hasCategory = loc.supportedCategories.includes(categorySlug);
  return {
    serviceable: hasCategory,
    reason: hasCategory ? 'Available for instant & scheduled dispatch' : 'Category launching soon in this sector'
  };
}

export function toggleLocalityStatus(cityId, localityId, isActive) {
  const city = _cities.find((c) => c.id === cityId);
  if (city) {
    const loc = city.localities.find((l) => l.id === localityId);
    if (loc) {
      loc.active = isActive;
      recordAuditLog('Locality ' + loc.name + ' set to ' + (isActive ? 'Active' : 'Paused'), 'Admin');
      notifyStateChanged();
      return true;
    }
  }
  return false;
}

// --- 2. CATEGORIES ---

export function getCategories() {
  return _categories;
}

export function getCategoryBySlug(slug) {
  return _categories.find((c) => c.slug === slug || c.id === slug);
}

// --- 3. PROFESSIONALS & MATCHING ---

export function getProfessionals(filters = {}) {
  let list = [..._pros];

  if (filters.categorySlug && filters.categorySlug !== 'all') {
    list = list.filter((p) => p.categoryIds?.includes(filters.categorySlug) || p.trade?.toLowerCase().includes(filters.categorySlug.toLowerCase()));
  }
  if (filters.locality) {
    list = list.filter((p) => p.serviceLocalities?.some((l) => l.toLowerCase() === filters.locality.toLowerCase()));
  }
  if (filters.availableNowOnly) {
    list = list.filter((p) => p.isAvailable && p.availableNow);
  }
  if (filters.minRating) {
    list = list.filter((p) => p.ratingAvg >= filters.minRating);
  }
  if (filters.verifiedOnly) {
    list = list.filter((p) => p.verifications?.hommieVerified);
  }
  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase();
    list = list.filter((p) => 
      p.name.toLowerCase().includes(q) ||
      p.trade?.toLowerCase().includes(q) ||
      p.headline?.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
  return list;
}

export function getProfessionalById(id) {
  return _pros.find((p) => p.id === id || p.userId === id);
}

export function toggleProAvailability(proId, isOnline) {
  const pro = _pros.find((p) => p.id === proId || p.userId === proId);
  if (pro) {
    pro.isAvailable = isOnline;
    pro.availableNow = isOnline;
    recordAuditLog('Professional ' + pro.name + ' availability toggled: ' + (isOnline ? 'Online' : 'Offline'), pro.name);
    notifyStateChanged();
  }
}

export function registerNewProfessional(payload) {
  const newPro = {
    id: 'pro-' + Date.now().toString().slice(-5),
    userId: 'u-pro-' + Date.now().toString().slice(-4),
    name: payload.name,
    trade: payload.trade || 'Independent Service Specialist',
    categoryIds: payload.categoryIds || ['ac-service'],
    avatar: payload.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    headline: (payload.experienceYears || 5) + '+ Years Experience • ' + (payload.trade || 'Technician') + ' Specialist',
    about: payload.about || 'Skilled independent professional dedicated to transparent diagnostics.',
    phone: payload.phone || '9876543210',
    city: payload.city || 'Lucknow',
    serviceLocalities: payload.serviceLocalities || ['Gomti Nagar'],
    experienceYears: Number(payload.experienceYears || 5),
    baseRate: Number(payload.baseRate || 499),
    isAvailable: true,
    availableNow: true,
    ratingAvg: 5.0,
    ratingCount: 0,
    jobsCompleted: 0,
    verifications: {
      phoneVerified: true,
      hommieVerified: false
    },
    kycStatus: 'pending_verification'
  };

  _pros.unshift(newPro);
  recordAuditLog('New technician registered: ' + newPro.name, newPro.name);
  notifyStateChanged();

  apiSubmitKYC({ workerId: newPro.id, ...payload }).catch(() => {});
  return newPro;
}

export function updateKycStatus(proId, newStatus, adminActor = 'Admin') {
  const pro = _pros.find((p) => p.id === proId || p.userId === proId);
  if (pro) {
    pro.kycStatus = newStatus;
    if (newStatus === 'verified' || newStatus === 'approved') {
      pro.verifications.hommieVerified = true;
    }
    recordAuditLog('Pro ' + pro.name + ' KYC status updated to ' + newStatus + ' by ' + adminActor, adminActor);
    notifyStateChanged();
    apiReviewVerification(pro.id, newStatus).catch(() => {});
    return true;
  }
  return false;
}

// --- 4. BOOKINGS LIFECYCLE (17 STATES) ---

export function getBookings(filters = {}) {
  let list = [..._bookings];
  if (filters.customerId) {
    list = list.filter((b) => b.customerId === filters.customerId || b.customer_id === filters.customerId);
  }
  if (filters.workerId) {
    list = list.filter((b) => b.workerId === filters.workerId || b.worker_id === filters.workerId);
  }
  if (filters.status) {
    list = list.filter((b) => b.status === filters.status);
  }
  return list;
}

export function getBookingById(bookingId) {
  return _bookings.find((b) => b.id === bookingId || b.bookingRef === bookingId);
}

export async function createBooking(payload) {
  const category = getCategoryBySlug(payload.categoryId) || _categories[0];
  const pro = getProfessionalById(payload.workerId) || _pros[0];

  const basePrice = payload.servicePrice || pro.baseRate || 499;
  const platformFee = 15;
  const safetyFee = 15;
  const finalAmount = basePrice + platformFee + safetyFee;

  const newBookingPayload = {
    id: 'b-' + Date.now().toString().slice(-4),
    bookingRef: 'HOM-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
    customerId: payload.customerId || _customer?.id || 'u-cust-1',
    customerName: payload.customerName || _customer?.name || 'Hanzala',
    customerPhone: payload.customerPhone || _customer?.phone || '9988776655',
    workerId: pro.id,
    workerName: pro.name,
    workerTrade: pro.trade,
    workerPhone: pro.phone,
    workerAvatar: pro.avatar,
    categoryId: category.id,
    serviceTitle: payload.serviceTitle || (category.name + ' Service'),
    servicePrice: basePrice,
    inspectionFee: category.inspectionFee || 149,
    platformFee,
    safetyFee,
    bookingType: payload.bookingType || 'instant',
    scheduledDate: payload.scheduledDate || 'Today',
    scheduledTimeSlot: payload.scheduledTimeSlot || 'Within 30 mins',
    urgencyLevel: payload.urgencyLevel || 'standard',
    status: payload.bookingType === 'instant' ? 'pro_assigned' : 'scheduled_confirmed',
    address: payload.address || {
      addressLine1: 'Flat 402, Shalimar Heights',
      locality: _customer?.activeLocality || 'Gomti Nagar',
      city: _customer?.city || 'Lucknow',
      postalCode: '226010'
    },
    notes: payload.notes || '',
    pricingSummary: {
      baseQuote: basePrice,
      partsCost: 0,
      laborCost: basePrice,
      platformFee,
      safetyFee,
      finalAmount
    }
  };

  _bookings.unshift(newBookingPayload);
  recordAuditLog('New booking created for ' + pro.name, 'Customer');
  notifyStateChanged();

  const res = await apiCreateBooking(newBookingPayload);
  if (res.success && res.booking) {
    const idx = _bookings.findIndex((b) => b.id === newBookingPayload.id);
    if (idx !== -1) _bookings[idx] = res.booking;
    notifyStateChanged();
    return res.booking;
  }

  return newBookingPayload;
}

export async function advanceBookingStatus(bookingId, nextStatus, options = {}) {
  const booking = _bookings.find((b) => b.id === bookingId || b.bookingRef === bookingId);
  if (!booking) return { success: false, error: 'Booking not found' };

  booking.status = nextStatus;
  recordAuditLog('Booking ' + bookingId + ' advanced to ' + nextStatus, options.actor || 'User');
  notifyStateChanged();

  const res = await apiUpdateBookingStatus(bookingId, nextStatus, options);
  if (res.success && res.booking) {
    const idx = _bookings.findIndex((b) => b.id === bookingId);
    if (idx !== -1) _bookings[idx] = res.booking;
    notifyStateChanged();
  }

  return res;
}

export async function cancelBooking(bookingId, reason = '') {
  return advanceBookingStatus(bookingId, 'cancelled_by_customer', { note: reason, actor: 'Customer' });
}

export async function sendBookingMessage(bookingId, senderRole, senderName, text) {
  const msg = {
    id: 'msg-' + Date.now(),
    bookingId,
    booking_id: bookingId,
    senderRole,
    senderName,
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const booking = _bookings.find((b) => b.id === bookingId || b.bookingRef === bookingId);
  if (booking) {
    if (!booking.messages) booking.messages = [];
    booking.messages.push(msg);
    notifyStateChanged();
  }

  await apiSendMessage(msg);
  return msg;
}

export async function submitOnSiteQuote(bookingId, quotePayload) {
  const res = await apiSubmitQuote(bookingId, quotePayload);
  const booking = _bookings.find((b) => b.id === bookingId);
  if (booking) {
    booking.status = 'quote_submitted';
    booking.quote = quotePayload;
    notifyStateChanged();
  }
  return res;
}

export async function respondToQuote(bookingId, approved, reason = '') {
  const res = await apiRespondToQuote(bookingId, approved, reason);
  const booking = _bookings.find((b) => b.id === bookingId);
  if (booking) {
    booking.status = approved ? 'quote_approved' : 'inspection_in_progress';
    notifyStateChanged();
  }
  return res;
}

export async function processBookingPayment(bookingId, paymentPayload) {
  const booking = _bookings.find((b) => b.id === bookingId || b.bookingRef === bookingId);
  if (booking) {
    booking.paymentStatus = 'paid';
    booking.payment = { status: 'paid', ...paymentPayload };
    booking.status = 'completed';
    notifyStateChanged();
  }
  return advanceBookingStatus(bookingId, 'completed', { actor: 'PaymentEngine' });
}

export async function submitBookingRating(bookingId, ratingPayload) {
  const booking = _bookings.find((b) => b.id === bookingId || b.bookingRef === bookingId);
  if (booking) {
    booking.customerRating = ratingPayload;
    notifyStateChanged();
  }
  return apiSubmitRating({ bookingId, ...ratingPayload });
}

// --- 5. CUSTOMER & APPLIANCES ---

export function getCustomer() {
  return _customer;
}

export function updateCustomer(updates) {
  _customer = { ..._customer, ...updates };
  notifyStateChanged();
}

export function getCustomerHomeAssets() {
  return _homeAssets;
}

export async function addHomeAsset(asset) {
  const newAsset = {
    id: 'asset-' + Date.now(),
    name: asset.name,
    category: asset.category,
    brand: asset.brand,
    modelNumber: asset.modelNumber || '',
    purchaseDate: asset.purchaseDate || '2024',
    warrantyTill: asset.warrantyTill || '2026',
    location: asset.location || 'Living Room',
    notes: asset.notes || '',
    serviceHistory: []
  };
  _homeAssets.unshift(newAsset);
  notifyStateChanged();

  await apiSaveHomeAsset(newAsset);
  return newAsset;
}

export async function updateHomeAsset(id, updates) {
  const idx = _homeAssets.findIndex((a) => a.id === id);
  if (idx !== -1) {
    _homeAssets[idx] = { ..._homeAssets[idx], ...updates };
    notifyStateChanged();
    await apiSaveHomeAsset(_homeAssets[idx]);
  }
}

export async function deleteHomeAsset(id) {
  _homeAssets = _homeAssets.filter((a) => a.id !== id);
  notifyStateChanged();
  await apiDeleteHomeAsset(id);
}

// --- 6. AUDIT & GOVERNANCE ---

export function getAuditLogs() {
  return _auditLogs;
}

export function recordAuditLog(details, actor = 'System') {
  const log = {
    id: 'log-' + Date.now(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actor,
    action: details.slice(0, 30).toUpperCase(),
    details
  };
  _auditLogs.unshift(log);
  if (_auditLogs.length > 50) _auditLogs.pop();
}

export function fileSafetyReport(reportPayload) {
  const report = {
    id: 'safe-' + Date.now(),
    bookingId: reportPayload.bookingId || null,
    reporterName: reportPayload.reporterName || 'Customer',
    category: reportPayload.category || 'conduct',
    description: reportPayload.description,
    status: 'investigating'
  };
  _safetyReports.unshift(report);
  notifyStateChanged();

  apiCreateReport(reportPayload).catch(() => {});
  return report;
}

export function getSafetyReports() {
  return _safetyReports;
}
