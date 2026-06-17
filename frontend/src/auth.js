// auth.js — localStorage token helpers

const TOKEN_KEY = 'saugahomeeats_token';
const SELLER_KEY = 'saugahomeeats_seller';

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SELLER_KEY);
}

export function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function saveSeller(seller) {
  localStorage.setItem(SELLER_KEY, JSON.stringify(seller));
}

export function getSeller() {
  const s = localStorage.getItem(SELLER_KEY);
  return s ? JSON.parse(s) : null;
}
