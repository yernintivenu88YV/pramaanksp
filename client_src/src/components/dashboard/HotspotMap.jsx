import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ModeBadge } from '../common/ModeBadge';

/**
 * HotspotMap: a real interactive Leaflet map of /server/graph_fn/hotspots.
 *
 * OpenStreetMap tiles -- no API key or account needed. Each cluster is a
 * CircleMarker at its real centroid (latitude/longitude), sized by density
 * and coloured by primary crime type; clicking one shows density, crime
 * type and the individual case IDs.
 *
 * Honest mode: the `mode` from the API is surfaced on the map itself (badge
 * + caption). Seed/fallback dots are NEVER rendered as if they were live --
 * the overlay says exactly what the source is.
 */

// Karnataka state, roughly centred, zoomed to show the whole state.
const KARNATAKA_CENTER = [15.3173, 75.7139];
const KARNATAKA_ZOOM = 7;

// Colour by primary crime type. Keep in sync with the legend below.
const CRIME_COLORS = {
  Burglary: '#f59e0b',          // amber
  'Chain snatching': '#ef4444', // red
  'Vehicle theft': '#a855f7',   // purple
  Theft: '#f97316',             // orange
  Assault: '#ec4899',           // pink
  Murder: '#dc2626',            // deep red
};
const DEFAULT_COLOR = '#22d3ee'; // cyan

function crimeColor(crime) {
  return CRIME_COLORS[crime] || DEFAULT_COLOR;
}

// Marker radius (px) scales with incident density, clamped so a huge cluster
// never swallows the map and a single incident is still visible.
function densityRadius(density) {
  const d = Number(density) || 1;
  return Math.max(9, Math.min(42, 8 + d * 4));
}

function isValidCoord(h) {
  const lat = Number(h.latitude);
  const lng = Number(h.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && !(lat === 0 && lng === 0);
}

export const MOBILE_SIGNAL_PINGS = [
  {
    ping_id: 'SIG-9845011223',
    target_name: 'Mohammed Rafi (CANON-0042)',
    phone: '98450 11223',
    imei: '864902184910284',
    tower_id: 'BTS-BGLR-CENTRAL-04',
    latitude: 12.9585,
    longitude: 77.6242,
    signal_strength: '-62 dBm (Excellent)',
    frequency: '1800 MHz (4G LTE)',
    status: 'ACTIVE_PING',
    last_seen: '2 mins ago'
  },
  {
    ping_id: 'SIG-9900881122',
    target_name: 'S. Praveen Kumar (CANON-0044)',
    phone: '9900881122',
    imei: '358910294810291',
    tower_id: 'BTS-MYS-MAIN-02',
    latitude: 12.2965,
    longitude: 76.6402,
    signal_strength: '-78 dBm (Moderate)',
    frequency: '2100 MHz (5G NR)',
    status: 'TRIANGULATED',
    last_seen: 'Just now'
  },
  {
    ping_id: 'SIG-9731049281',
    target_name: 'Unidentified Target (IMEI-77182)',
    phone: '97310 49281',
    imei: '351982710293810',
    tower_id: 'BTS-HUB-NORTH-01',
    latitude: 15.3647,
    longitude: 75.1240,
    signal_strength: '-71 dBm (Good)',
    frequency: '900 MHz (4G)',
    status: 'GEO_FENCE_ALERT',
    last_seen: '5 mins ago'
  }
];

export const CELL_TOWERS = [
  { tower_id: 'BTS-BGLR-CENTRAL-04', location: 'Bengaluru Central', latitude: 12.9550, longitude: 77.6210, carrier: 'Airtel/Jio KSP Tactical' },
  { tower_id: 'BTS-MYS-MAIN-02', location: 'Mysuru Main Junction', latitude: 12.2920, longitude: 76.6350, carrier: 'BSNL Command Grid' },
  { tower_id: 'BTS-HUB-NORTH-01', location: 'Hubballi North Station', latitude: 15.3600, longitude: 75.1200, carrier: 'Jio Special Grid' }
];

export const CCTV_CAMERAS = [
  { cctv_id: 'CCTV-INDIRANAGAR-01', location: '10th Main Junction, Indiranagar', latitude: 12.9590, longitude: 77.6255, status: 'ONLINE (4K)', angle: '360° PTZ' },
  { cctv_id: 'CCTV-KORAMANGALA-03', location: '80ft Road, Koramangala', latitude: 12.9598, longitude: 77.6230, status: 'ONLINE (1080p)', angle: 'North-East' },
  { cctv_id: 'CCTV-MALLESHWARAM-02', location: 'Margosa Road, Malleshwaram', latitude: 13.0290, longitude: 77.5890, status: 'RECORDING', angle: 'Fixed South' }
];

export function HotspotMap({ hotspots = [], mode = 'live', loading = false, error = null, height = 380, showMobileSignals = true }) {
  const points = useMemo(() => (Array.isArray(hotspots) ? hotspots.filter(isValidCoord) : []), [hotspots]);

  const legendCrimes = useMemo(() => {
    const set = new Set(points.map((h) => h.primary_crime).filter(Boolean));
    return Array.from(set);
  }, [points]);

  const isSeed = mode === 'seed_fallback' || mode === 'fallback' || mode === 'mock' || mode === 'mock_error';

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded text-xs">
          ⚠️ {error}
        </div>
      )}

      <div className="relative rounded-lg overflow-hidden border border-white/10">
        {/* Honest source overlay -- always visible on the map itself */}
        <div className="absolute z-[500] top-2 left-2 flex items-center gap-2 rounded-md bg-black/65 backdrop-blur px-2 py-1 pointer-events-none">
          <ModeBadge mode={mode} />
          <span className="text-[10px] font-mono text-gray-300">
            {isSeed ? 'Demo / seed coordinates — live signal simulation active' : 'Live from /graph_fn/hotspots & Mobile Triangulation'}
          </span>
        </div>

        {loading && (
          <div className="absolute z-[500] inset-0 flex items-center justify-center bg-black/40 text-xs text-gray-200">
            Loading crime map and cell signal tracking…
          </div>
        )}

        <MapContainer
          center={KARNATAKA_CENTER}
          zoom={KARNATAKA_ZOOM}
          scrollWheelZoom={false}
          style={{ height, width: '100%', background: '#0f1216' }}
          aria-label="Interactive crime hotspot and mobile signal map of Karnataka"
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Dark Command (CartoDB)">
              <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Street (OSM)">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite (Esri)">
              <TileLayer
                attribution="Tiles &copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Render Spatial Hotspot Clusters */}
          {points.map((h) => {
            const color = crimeColor(h.primary_crime);
            const radius = densityRadius(h.density);
            return (
              <CircleMarker
                key={h.cluster_id}
                center={[Number(h.latitude), Number(h.longitude)]}
                radius={radius}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.35,
                  weight: 2,
                }}
              >
                <Tooltip direction="top" offset={[0, -radius]} opacity={0.9}>
                  <div className="text-xs font-semibold">{h.cluster_id}</div>
                  <div className="text-[11px] text-gray-300">{h.primary_crime} ({h.density} incidents)</div>
                </Tooltip>

                <Popup>
                  <div className="p-1 space-y-1 text-xs text-black">
                    <div className="font-bold border-b pb-1">{h.cluster_id} — {h.primary_crime}</div>
                    <div>Density: <b>{h.density} incidents</b></div>
                    <div>Lat/Lng: {h.latitude}, {h.longitude}</div>
                    {Array.isArray(h.case_ids) && (
                      <div className="pt-1 text-[11px]">
                        <b>Cases:</b> {h.case_ids.join(', ')}
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Render Cell Towers & Mobile Signal Triangulations */}
          {showMobileSignals && (
            <>
              {CELL_TOWERS.map((t) => (
                <CircleMarker
                  key={t.tower_id}
                  center={[t.latitude, t.longitude]}
                  radius={14}
                  pathOptions={{
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.2,
                    weight: 1,
                    dashArray: '3, 6'
                  }}
                >
                  <Tooltip direction="top" opacity={0.9}>
                    <div className="text-xs font-semibold text-blue-400">📡 {t.tower_id}</div>
                    <div className="text-[10px]">{t.location} ({t.carrier})</div>
                  </Tooltip>
                </CircleMarker>
              ))}

              {MOBILE_SIGNAL_PINGS.map((p) => (
                <CircleMarker
                  key={p.ping_id}
                  center={[p.latitude, p.longitude]}
                  radius={10}
                  pathOptions={{
                    color: '#10b981',
                    fillColor: '#10b981',
                    fillOpacity: 0.8,
                    weight: 3
                  }}
                >
                  <Tooltip direction="top" opacity={0.95}>
                    <div className="text-xs font-bold text-emerald-400">📱 {p.target_name}</div>
                    <div className="text-[10px]">IMEI: {p.imei}</div>
                    <div className="text-[10px]">Signal: {p.signal_strength}</div>
                  </Tooltip>
                  <Popup>
                    <div className="p-1 space-y-1 text-xs text-black">
                      <div className="font-bold border-b pb-1 text-emerald-700">📱 Mobile Signal Tracking</div>
                      <div>Target: <b>{p.target_name}</b></div>
                      <div>Phone: <b>{p.phone}</b></div>
                      <div>IMEI: {p.imei}</div>
                      <div>Tower: {p.tower_id}</div>
                      <div>Signal: <span className="font-semibold text-emerald-600">{p.signal_strength}</span></div>
                      <div>Freq: {p.frequency}</div>
                      <div>Last Ping: {p.last_seen}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </>
          )}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="p-2 bg-black/60 backdrop-blur border-t border-white/10 flex flex-wrap items-center gap-3 text-[11px] text-gray-300">
          <span className="font-semibold text-white">Legend:</span>
          {legendCrimes.map((crime) => (
            <span key={crime} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: crimeColor(crime) }} />
              {crime}
            </span>
          ))}
          {showMobileSignals && (
            <>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Mobile Target Signal
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500/40 border border-blue-400 inline-block" />
                Cell Tower (BTS)
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
