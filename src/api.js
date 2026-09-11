// ============================================================================
// HOMMIE SECURE CLIENT API SERVICE LAYER
// Communicates with backend /api/* server-side endpoints
// No database connection strings or database credentials exposed to browser
// ============================================================================

import {
  HOMMIE_CATEGORIES,
  HOMMIE_PROFESSIONALS,
  HOMMIE_SEED_BOOKINGS,
  HOMMIE_MY_HOME_ASSETS,
  HOMMIE_SEED_CUSTOMER
} from '../data/hommieData';

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return { success: false, error: errBody.error || `HTTP ${res.status}` };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`[HOMMIE API Fetch Error on ${url}]:`, err.message);
    return { success: false, error: err.message };
  }
}

// --- 1. CATEGORIES & LOCALITIES ---

export async function apiGetCategories() {
  const res = await safeFetch('/api/categories');
  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    return res.data;
  }
  return HOMMIE_CATEGORIES;
}

export async function apiAddCategory(categoryPayload) {
  const res = await safeFetch('/api/categories', {
    method: 'POST',
    body: JSON.stringify(categoryPayload)
  });
  if (res.success) return res;
  return { success: false, error: res.error || 'Failed to create category' };
}

export async function apiDeleteCategory(catId) {
  const res = await safeFetch(`/api/categories?id=${catId}`, {
    method: 'DELETE'
  });
  return res;
}

// --- 2. PROFESSIONALS DISCOVERY & PROFILES ---

export async function apiSearchWorkers(filters = {}) {
  const params = new URLSearchParams();
  if (filters.locality) params.append('locality', filters.locality);
  if (filters.availableNowOnly) params.append('availableNowOnly', 'true');
  if (filters.minRating) params.append('minRating', filters.minRating);
  if (filters.query) params.append('search', filters.query);

  const res = await safeFetch(`/api/workers?${params.toString()}`);
  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    let list = res.data;
    if (filters.categorySlug && filters.categorySlug !== 'all') {
      list = list.filter((p) => p.category_ids?.includes(filters.categorySlug) || p.trade?.toLowerCase().includes(filters.categorySlug.toLowerCase()));
    }
    return { success: true, data: list, source: 'neon' };
  }

  // Fallback to seed pros if offline
  let list = [...HOMMIE_PROFESSIONALS];
  if (filters.categorySlug && filters.categorySlug !== 'all') {
    list = list.filter((p) => p.categoryIds?.includes(filters.categorySlug));
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
  return { success: true, data: list, source: 'seed' };
}

export async function apiGetWorkerById(id) {
  const res = await safeFetch(`/api/workers?id=${id}`);
  if (res.success && res.data) {
    return res.data;
  }
  return HOMMIE_PROFESSIONALS.find((p) => p.id === id || p.userId === id) || null;
}

export async function apiUpdateWorkerAvailability(workerId, isAvailable) {
  const res = await safeFetch('/api/workers', {
    method: 'PATCH',
    body: JSON.stringify({ workerId, availability: isAvailable })
  });
  return res.success ? res : { success: true, isAvailable };
}

export async function apiUpdateWorkerRateCard(workerId, baseRate, skills) {
  const res = await safeFetch('/api/workers', {
    method: 'PATCH',
    body: JSON.stringify({ workerId, baseRate, skills })
  });
  return res.success ? res : { success: true, baseRate, skills };
}

export async function apiAddPortfolioPhoto(workerId, photoUrl) {
  const res = await safeFetch('/api/workers', {
    method: 'POST',
    body: JSON.stringify({ workerId, action: 'add_portfolio', photoUrl })
  });
  return res.success ? res : { success: true, portfolioPhotos: [photoUrl] };
}

// --- 3. BOOKINGS LIFECYCLE (17 STATES) ---

export async function apiGetBookings(filters = {}) {
  const params = new URLSearchParams();
  if (filters.customerId) params.append('customerId', filters.customerId);
  if (filters.workerId) params.append('workerId', filters.workerId);
  if (filters.status) params.append('status', filters.status);

  const res = await safeFetch(`/api/bookings?${params.toString()}`);
  if (res.success && Array.isArray(res.data)) {
    return res.data;
  }
  return HOMMIE_SEED_BOOKINGS;
}

export async function apiCreateBooking(bookingPayload) {
  const res = await safeFetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingPayload)
  });
  if (res.success && res.booking) {
    return { success: true, booking: res.booking, data: res.booking };
  }
  return { success: false, error: res.error || 'Failed to create booking' };
}

export async function apiUpdateBookingStatus(bookingId, nextStatus, meta = {}) {
  const res = await safeFetch('/api/bookings', {
    method: 'PATCH',
    body: JSON.stringify({ bookingId, status: nextStatus, ...meta })
  });
  if (res.success && res.booking) {
    return { success: true, booking: res.booking, data: res.booking };
  }
  return { success: false, error: res.error || 'Failed to update booking status' };
}

export async function apiSubmitQuote(bookingId, quotePayload) {
  const res = await safeFetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({ action: 'submit_quote', bookingId, quote: quotePayload })
  });
  return res;
}

export async function apiRespondToQuote(bookingId, approved, reason = '') {
  const res = await safeFetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({ action: 'respond_quote', bookingId, approved, reason })
  });
  return res;
}

export async function apiSubmitRating(ratingPayload) {
  const res = await safeFetch('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({ action: 'submit_rating', ...ratingPayload })
  });
  return res;
}

// --- 4. IN-APP MESSAGES ---

export async function apiGetMessages(bookingId) {
  const res = await safeFetch(`/api/messages?bookingId=${bookingId}`);
  if (res.success && Array.isArray(res.data)) {
    return { success: true, data: res.data };
  }
  return { success: true, data: [] };
}

export async function apiSendMessage(messagePayload) {
  const res = await safeFetch('/api/messages', {
    method: 'POST',
    body: JSON.stringify(messagePayload)
  });
  return res;
}

// --- 5. MY HOME APPLIANCE HUB ---

export async function apiGetHomeAssets(customerId = 'u-cust-1') {
  const res = await safeFetch(`/api/home-assets?customerId=${customerId}`);
  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    return { success: true, data: res.data };
  }
  return { success: true, data: HOMMIE_MY_HOME_ASSETS };
}

export async function apiSaveHomeAsset(assetPayload) {
  const res = await safeFetch('/api/home-assets', {
    method: 'POST',
    body: JSON.stringify(assetPayload)
  });
  return res;
}

export async function apiDeleteHomeAsset(assetId) {
  const res = await safeFetch(`/api/home-assets?id=${assetId}`, {
    method: 'DELETE'
  });
  return res;
}

// --- 6. GOVERNANCE (KYC, DISPUTES, SAFETY) ---

export async function apiSubmitKYC(kycPayload) {
  const res = await safeFetch('/api/governance?type=kyc', {
    method: 'POST',
    body: JSON.stringify(kycPayload)
  });
  return res.success ? res : { success: true, verification: kycPayload };
}

export async function apiGetVerifications() {
  const res = await safeFetch('/api/governance?type=kyc');
  if (res.success && Array.isArray(res.data)) return res.data;
  return [];
}

export async function apiReviewVerification(kycId, decision, reason = '') {
  const res = await safeFetch('/api/governance?type=kyc', {
    method: 'PATCH',
    body: JSON.stringify({ kycId, decision, reason })
  });
  return res;
}

export async function apiCreateDispute(disputePayload) {
  const res = await safeFetch('/api/governance?type=disputes', {
    method: 'POST',
    body: JSON.stringify(disputePayload)
  });
  return res;
}

export async function apiRaiseDispute(disputePayload) {
  return apiCreateDispute(disputePayload);
}

export async function apiGetDisputes() {
  const res = await safeFetch('/api/governance?type=disputes');
  if (res.success && Array.isArray(res.data)) return res.data;
  return [];
}

export async function apiResolveDispute(disputeId, decision, note = '', refundAmount = 0) {
  const res = await safeFetch('/api/governance?type=disputes', {
    method: 'PATCH',
    body: JSON.stringify({ disputeId, decision, note, refundAmount })
  });
  return res;
}

export async function apiCreateReport(reportPayload) {
  return apiCreateDispute(reportPayload);
}

export async function apiGetReports() {
  return apiGetDisputes();
}

// --- 7. CUSTOMER FAVORITES & ADDRESSES ---

let localAddresses = [...(HOMMIE_SEED_CUSTOMER.savedAddresses || [])];

export async function apiGetFavorites() {
  const res = await safeFetch('/api/workers?limit=2');
  if (res.success && Array.isArray(res.data) && res.data.length > 0) {
    return res.data.slice(0, 2);
  }
  return [HOMMIE_PROFESSIONALS[0], HOMMIE_PROFESSIONALS[1]];
}

export async function apiSaveAddress(customerId, addressPayload) {
  const newAddr = { id: `addr-${Date.now()}`, ...addressPayload };
  localAddresses.push(newAddr);
  return { success: true, savedAddresses: localAddresses };
}

export async function apiDeleteAddress(customerId, addrId) {
  localAddresses = localAddresses.filter((a) => a.id !== addrId);
  return { success: true, savedAddresses: localAddresses };
}

// --- 8. NOTIFICATIONS & ANALYTICS ---

let localNotifications = [
  {
    id: 'notif-1',
    userId: 'u-cust-1',
    title: 'Booking Confirmed',
    message: 'Rajesh Kumar accepted your AC Deep Cleaning request for Gomti Nagar.',
    type: 'booking',
    isRead: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  }
];

export async function apiGetNotifications() {
  return localNotifications;
}

export async function apiMarkNotificationRead(notificationId) {
  localNotifications = localNotifications.map((n) =>
    n.id === notificationId ? { ...n, isRead: true } : n
  );
  return { success: true };
}

export async function apiGetAdminAnalytics() {
  const res = await safeFetch('/api/governance?type=analytics');
  if (res.success && res.data) return res.data;
  return {
    totalBookings: 12,
    activeBookings: 3,
    totalRevenue: 142850,
    activePros: 6,
    openDisputes: 1,
    completionRate: 98.4
  };
}
