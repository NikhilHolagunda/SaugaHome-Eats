// auth.js — localStorage helpers
// Sprint 1: seller sessions. Sprint 2: adds buyer sessions.

const TOKEN_KEY = 'saugahomeeats_token';
const SELLER_KEY = 'saugahomeeats_seller';
const BUYER_KEY = 'saugahomeeats_buyer';

// ── Token ──────────────────────────────────────────────────────────────────
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SELLER_KEY);
  localStorage.removeItem(BUYER_KEY);
}

export function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY);
}

// ── Seller (Sprint 1) ──────────────────────────────────────────────────────
export function saveSeller(seller) {
  localStorage.setItem(SELLER_KEY, JSON.stringify(seller));
}

export function getSeller() {
  const s = localStorage.getItem(SELLER_KEY);
  return s ? JSON.parse(s) : null;
}

export function isSeller() {
  return !!localStorage.getItem(SELLER_KEY);
}

// ── Buyer (Sprint 2) ───────────────────────────────────────────────────────
export function saveBuyer(buyer) {
  localStorage.setItem(BUYER_KEY, JSON.stringify(buyer));
}

export function getBuyer() {
  const b = localStorage.getItem(BUYER_KEY);
  return b ? JSON.parse(b) : null;
}

export function isBuyer() {
  return !!localStorage.getItem(BUYER_KEY);
}