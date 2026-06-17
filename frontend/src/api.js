// api.js — Centralized fetch helpers for all backend calls

const BASE_URL = 'http://localhost:3000';

// Generic fetch wrapper — throws on non-2xx
async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// Auth header helper
function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

// ── Auth endpoints ─────────────────────────────────────────────────────────────

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

// ── Seller endpoints ───────────────────────────────────────────────────────────

export function getSellersApi() {
  return apiFetch('/api/sellers');
}

export function getSellerByIdApi(id) {
  return apiFetch(`/api/sellers/${id}`);
}

export function createListingApi(token, formData) {
  return apiFetch('/api/sellers', {
    method: 'POST',
    headers: authHeaders(token),
    body: formData, // FormData — browser sets Content-Type automatically
  });
}

// Helper to prefix photo URLs
export function photoUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path}`;
}
