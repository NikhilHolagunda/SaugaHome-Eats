// geocode.js — Nominatim (OpenStreetMap) geocoding helper for Sprint 3 (US-12).
//
// Rules followed per Nominatim's usage policy:
//  - A descriptive User-Agent identifying the app (required — anonymous/browser
//    User-Agents get blocked).
//  - At most 1 request/second — enforced here with a simple queue/delay so callers
//    never need to think about it.
//  - Results are only fetched once per order and stored on the order row by the
//    caller (see server.js) — this module does not do its own caching, since the
//    order table itself is the cache.

const NOMINATIM_BASE_URL = process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'SaugaHomeEats-Capstone/1.0 (student project, MGMT8155)';
const MIN_INTERVAL_MS = 1000; // Nominatim's rate limit: max 1 request/second

let lastRequestAt = 0;

async function throttle() {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise(resolve => setTimeout(resolve, MIN_INTERVAL_MS - elapsed));
  }
  lastRequestAt = Date.now();
}

/**
 * Geocode a free-text address/place name to { lat, lng }.
 * Returns null (does not throw) if nothing is found, so a bad address doesn't
 * crash order placement — the caller decides how to handle a null result.
 *
 * @param {string} query - e.g. "Streetsville, Mississauga, ON" or a full street address
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
async function geocode(query) {
  if (!query || !query.trim()) return null;

  await throttle();

  // Anchor every query to Mississauga/Ontario/Canada so short neighbourhood
  // names ("Streetsville") don't resolve to a same-named place elsewhere.
  const anchored = /mississauga|ontario|canada/i.test(query)
    ? query
    : `${query}, Mississauga, ON, Canada`;

  const url = `${NOMINATIM_BASE_URL}/search?format=json&limit=1&q=${encodeURIComponent(anchored)}`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!res.ok) {
      console.error(`Geocode: Nominatim returned HTTP ${res.status} for "${anchored}"`);
      return null;
    }
    const results = await res.json();
    if (!Array.isArray(results) || results.length === 0) {
      console.error(`Geocode: no results for "${anchored}"`);
      return null;
    }
    return {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon),
    };
  } catch (err) {
    console.error(`Geocode: request failed for "${anchored}":`, err.message);
    return null;
  }
}

module.exports = { geocode };