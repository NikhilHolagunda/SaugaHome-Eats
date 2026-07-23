// DeliveryMap.jsx — US-12 (map view with seller/buyer pins + route) and
// US-13 (animated delivery icon while status is "Out for Delivery").
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom divIcons instead of Leaflet's default marker images — avoids the
// classic Vite/Leaflet bundling issue where the default marker PNGs 404.
function pinIcon(emoji, bg) {
  return L.divIcon({
    html: `<div style="
      width: 36px; height: 36px; border-radius: 50% 50% 50% 0;
      background: ${bg}; transform: rotate(-45deg);
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid white;
    "><span style="transform: rotate(45deg); font-size: 16px;">${emoji}</span></div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}

const sellerIcon = pinIcon('🍳', '#1E2761'); // navy
const buyerIcon = pinIcon('🏠', '#F96167'); // coral
const deliveryIcon = L.divIcon({
  html: `<div style="
    width: 30px; height: 30px; border-radius: 50%;
    background: #F4A261; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.35); border: 2px solid white;
  "><span style="font-size: 15px;">🛵</span></div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Auto-fits the map bounds to show both pins whenever they change.
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, points]);
  return null;
}

const ANIMATION_DURATION_MS = 40000; // 40 seconds seller -> buyer
const ANIMATION_STEP_MS = 300;

export default function DeliveryMap({ sellerLat, sellerLng, buyerLat, buyerLng, status }) {
  const [deliveryPos, setDeliveryPos] = useState(null);
  const intervalRef = useRef(null);
  const startRef = useRef(null);

  const hasCoords = sellerLat != null && sellerLng != null && buyerLat != null && buyerLng != null;
  const sellerPos = [sellerLat, sellerLng];
  const buyerPos = [buyerLat, buyerLng];

  // Drive the animated delivery marker (US-13) based on status.
  useEffect(() => {
    if (!hasCoords) return;

    if (status === 'Out for Delivery') {
      startRef.current = Date.now();
      setDeliveryPos(sellerPos);
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startRef.current;
        const t = Math.min(elapsed / ANIMATION_DURATION_MS, 1); // 0 -> 1 progress
        const lat = sellerLat + (buyerLat - sellerLat) * t;
        const lng = sellerLng + (buyerLng - sellerLng) * t;
        setDeliveryPos([lat, lng]);
        if (t >= 1) clearInterval(intervalRef.current);
      }, ANIMATION_STEP_MS);
    } else if (status === 'Delivered') {
      setDeliveryPos(buyerPos);
    } else {
      setDeliveryPos(null);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, hasCoords, sellerLat, sellerLng, buyerLat, buyerLng]);

  if (!hasCoords) {
    return (
      <div className="bg-cream border border-border rounded-xl p-6 text-center text-text-muted text-sm">
        Map isn't available for this order yet — we couldn't determine one of the locations.
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-md border border-border" style={{ height: 320 }}>
      <MapContainer center={sellerPos} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={[sellerPos, buyerPos]} />
        <Polyline positions={[sellerPos, buyerPos]} pathOptions={{ color: '#F96167', weight: 3, dashArray: '6 8' }} />
        <Marker position={sellerPos} icon={sellerIcon} />
        <Marker position={buyerPos} icon={buyerIcon} />
        {deliveryPos && <Marker position={deliveryPos} icon={deliveryIcon} />}
      </MapContainer>
    </div>
  );
}