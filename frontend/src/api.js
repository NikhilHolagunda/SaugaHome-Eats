// api.js — Centralized fetch helpers for all backend calls
// Sprint 1 endpoints preserved exactly. Sprint 2 endpoints added below.

const BASE_URL = 'http://localhost:3000';

// Generic fetch wrapper — throws on non-2xx
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { error: text }; }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

// Auth header helper
function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

// ═══════════════════════════════════════════════════════════════════════════
// SPRINT 1 — kept exactly as-is (do not rename)
// ═══════════════════════════════════════════════════════════════════════════

export function signupApi({ email, password }) {
  return apiFetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function loginApi({ email, password }) {
  return apiFetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function logoutApi(token) {
  return apiFetch('/api/logout', {
    method: 'POST',
    headers: authHeaders(token),
  });
}

export function getMeApi(token) {
  return apiFetch('/api/me', {
    headers: authHeaders(token),
  });
}

export function getSellersApi(params = {}) {
  // Sprint 1 called this with no args. Sprint 2 can pass { search, cuisine, neighbourhood, dietary }.
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.cuisine) qs.set('cuisine', params.cuisine);
  if (params.neighbourhood) qs.set('neighbourhood', params.neighbourhood);
  if (params.dietary) qs.set('dietary', Array.isArray(params.dietary) ? params.dietary.join(',') : params.dietary);
  const q = qs.toString();
  return apiFetch(`/api/sellers${q ? `?${q}` : ''}`);
}

export function getSellerByIdApi(id) {
  return apiFetch(`/api/sellers/${id}`);
}

export function createListingApi(token, formData) {
  return apiFetch('/api/sellers', {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  });
}

// Helper to prefix photo URLs — Sprint 1 uses this as a function
export function photoUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// SPRINT 2 — new endpoints
// ═══════════════════════════════════════════════════════════════════════════

// ── Buyer auth ─────────────────────────────────────────────────────────────
export function signupBuyerApi({ email, password, name }) {
  return apiFetch('/api/buyer/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
}

export function loginBuyerApi({ email, password }) {
  return apiFetch('/api/buyer/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function getBuyerMeApi(token) {
  return apiFetch('/api/buyer/me', { headers: authHeaders(token) });
}

// ── Filters ────────────────────────────────────────────────────────────────
export function getFiltersApi() {
  return apiFetch('/api/filters');
}

// ── Menu ───────────────────────────────────────────────────────────────────
export function getMenuApi(sellerId) {
  return apiFetch(`/api/sellers/${sellerId}/menu`);
}

export function addMenuItemApi(token, { name, description, price }) {
  return apiFetch('/api/menu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ name, description, price }),
  });
}

export function updateMenuItemApi(token, id, fields) {
  return apiFetch(`/api/menu/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(fields),
  });
}

export function deleteMenuItemApi(token, id) {
  return apiFetch(`/api/menu/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

// ── Orders ─────────────────────────────────────────────────────────────────
export function placeOrderApi(token, { seller_id, items, notes, delivery_address }) {
  return apiFetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ seller_id, items, notes, delivery_address }),
  });
}

export function getSellerOrdersApi(token) {
  return apiFetch('/api/orders/seller', { headers: authHeaders(token) });
}

export function getBuyerOrdersApi(token) {
  return apiFetch('/api/orders/buyer', { headers: authHeaders(token) });
}

export function updateOrderStatusApi(token, orderId, status) {
  return apiFetch(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ status }),
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SPRINT 3 — new endpoints
// ═══════════════════════════════════════════════════════════════════════════

// Get a single order's full detail — used by the tracking page (US-11).
// Works for either the buyer or seller who owns the order.
export function getOrderByIdApi(token, orderId) {
  return apiFetch(`/api/orders/${orderId}`, {
    headers: authHeaders(token),
  });
}

// ── Reviews & Ratings (US-15, US-16) ──────────────────────────────────────────
export function submitReviewApi(token, { order_id, rating, review_text }) {
  return apiFetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ order_id, rating, review_text }),
  });
}

export function getSellerReviewsApi(sellerId) {
  return apiFetch(`/api/sellers/${sellerId}/reviews`);
}