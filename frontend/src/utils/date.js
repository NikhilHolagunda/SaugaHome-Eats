// date.js — shared date/time formatting for SaugaHomeEats.
//
// SQLite's CURRENT_TIMESTAMP writes UTC as a bare string ("2026-08-05 21:07:11")
// with no timezone marker. JavaScript's Date constructor treats a string like
// that as LOCAL time, so every timestamp came out shifted by the viewer's
// offset — an order placed at 5:07 p.m. Eastern displayed as 9:07 p.m.
//
// We normalize to ISO-with-Z first so it parses as UTC, then format in
// America/Toronto so the app always shows Mississauga time regardless of
// where it's being viewed.
//
// America/Toronto rather than a fixed EST offset, because it handles daylight
// saving automatically — EDT (UTC−4) in summer, EST (UTC−5) in winter.

const TIMEZONE = 'America/Toronto';

// Turns SQLite's "YYYY-MM-DD HH:MM:SS" into a Date parsed as UTC.
function parseUtc(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const normalized = value.includes('T') ? value : value.replace(' ', 'T') + 'Z';
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
}

// "Aug 5, 5:07 p.m." — for order timestamps and status updates.
export function formatDateTime(value) {
  const d = parseUtc(value);
  if (!d) return '';
  return d.toLocaleString('en-CA', {
    timeZone: TIMEZONE,
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

// "Aug 5, 2026" — for order history dates.
export function formatDate(value) {
  const d = parseUtc(value);
  if (!d) return '';
  return d.toLocaleDateString('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

// "Today" / "3 days ago" — for reviews.
export function relativeTime(value) {
  const then = parseUtc(value);
  if (!then) return '';
  const days = Math.floor((Date.now() - then.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}