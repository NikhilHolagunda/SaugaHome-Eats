// NeighbourhoodMap.jsx — Homepage discovery map (US-18).
//
// Plots one pin per Mississauga neighbourhood that has at least one listed
// cook, sized by how many. Clicking a pin filters the grid below; clicking the
// active pin again clears the filter. This is the Product Vision statement made
// literal — "make Mississauga's hidden home-food economy visible."
//
// No backend work required: we already store seller.neighbourhood as one of a
// fixed list, so the centroids below are hardcoded rather than geocoded. That
// also means the map renders instantly with no Nominatim rate limiting.
import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Approximate centroids for the 12 neighbourhoods offered in CreateListingPage.
// Close enough to read correctly at city zoom; not survey-accurate.
const NEIGHBOURHOOD_COORDS = {
  'Square One': [43.5934, -79.6425],
  'Streetsville': [43.5825, -79.7100],
  'Port Credit': [43.5528, -79.5861],
  'Erin Mills': [43.5500, -79.7150],
  'Meadowvale': [43.5900, -79.7500],
  'Cooksville': [43.5780, -79.6180],
  'Mississauga Valley': [43.5850, -79.6250],
  'Clarkson': [43.5150, -79.6300],
  'Lakeview': [43.5700, -79.5650],
  'Malton': [43.7100, -79.6400],
  'Dixie': [43.6100, -79.5800],
  'Hurontario': [43.6100, -79.6500],
};

const MISSISSAUGA_CENTER = [43.5890, -79.6441];

// Pin grows with the number of cooks, so density reads at a glance.
function pin({ count, label, active }) {
  const size = Math.min(34 + count * 5, 58);
  const bg = active ? '#1E2761' : '#F96167';
  const ring = active ? '#F4A261' : '#FFFFFF';

  return L.divIcon({
    className: 'shme-pin',
    html: `
      <div style="
        width:${size}px; height:${size}px; border-radius:9999px;
        background:${bg}; border:3px solid ${ring};
        box-shadow:0 4px 14px rgba(30,39,97,0.35);
        display:flex; align-items:center; justify-content:center;
        color:#fff; font-weight:700; font-size:${size > 46 ? 16 : 13}px;
        font-family:Inter, system-ui, sans-serif;
        transition:transform .2s ease;
      ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    // Tooltip reads the neighbourhood name; the number is inside the pin.
    tooltipAnchor: [0, -(size / 2)],
    alt: label,
  });
}

// Fits the viewport to whichever pins are present.
function FitToPins({ points }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      if (points.length === 1) {
        map.setView(points[0], 13);
      } else if (points.length > 1) {
        map.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
      }
    }, 150);
    return () => clearTimeout(t);
  }, [map, points]);
  return null;
}

export default function NeighbourhoodMap({ sellers, activeNeighbourhood, onSelect }) {
  // Tally cooks per neighbourhood, skipping any we don't have coordinates for.
  const areas = useMemo(() => {
    const counts = {};
    for (const s of sellers) {
      const n = (s.neighbourhood || '').trim();
      if (!n || !NEIGHBOURHOOD_COORDS[n]) continue;
      counts[n] = (counts[n] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count, pos: NEIGHBOURHOOD_COORDS[name] }))
      .sort((a, b) => b.count - a.count);
  }, [sellers]);

  if (areas.length === 0) return null;

  const points = areas.map(a => a.pos);

  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-card bg-white">
      <div className="relative">
        <MapContainer
          center={MISSISSAUGA_CENTER}
          zoom={11}
          scrollWheelZoom={false}
          style={{ height: 420, width: '100%' }}
          attributionControl={false}
        >
          {/* Muted basemap so the coral pins carry the colour */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          />
          <FitToPins points={points} />

          {areas.map(area => (
            <Marker
              key={area.name}
              position={area.pos}
              icon={pin({
                count: area.count,
                label: area.name,
                active: activeNeighbourhood === area.name,
              })}
              eventHandlers={{
                click: () =>
                  onSelect(activeNeighbourhood === area.name ? '' : area.name),
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                <span className="font-semibold">{area.name}</span>
                <br />
                {area.count} home cook{area.count === 1 ? '' : 's'}
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>

        {/* Active-filter chip floating over the map */}
        {activeNeighbourhood && (
          <button
            type="button"
            onClick={() => onSelect('')}
            className="absolute top-4 right-4 z-[1000] bg-navy text-white text-sm font-semibold rounded-full pl-4 pr-3 py-2 shadow-card-hover flex items-center gap-2 hover:bg-navy/90 transition"
          >
            📍 {activeNeighbourhood}
            <span className="text-gold text-base leading-none">×</span>
          </button>
        )}
      </div>

      <div className="px-5 py-3 bg-cream/60 border-t border-border flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-text-muted">
          {areas.length} neighbourhood{areas.length === 1 ? '' : 's'} · tap a pin to filter
        </p>
        <p className="text-xs text-text-muted">© OpenStreetMap contributors, © CARTO</p>
      </div>
    </div>
  );
}