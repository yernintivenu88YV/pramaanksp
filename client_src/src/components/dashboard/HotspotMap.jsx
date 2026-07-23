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

export function HotspotMap({ hotspots = [], mode = 'live', loading = false, error = null, height = 380 }) {
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
            {isSeed ? 'Demo / seed coordinates — not live data' : 'Live from /graph_fn/hotspots'}
          </span>
        </div>

        {loading && (
          <div className="absolute z-[500] inset-0 flex items-center justify-center bg-black/40 text-xs text-gray-200">
            Loading hotspots…
          </div>
        )}

        <MapContainer
          center={KARNATAKA_CENTER}
          zoom={KARNATAKA_ZOOM}
          scrollWheelZoom={false}
          style={{ height, width: '100%', background: '#0f1216' }}
          aria-label="Interactive crime hotspot map of Karnataka"
        >
          {/* Base layers: street + satellite. Both are keyless public tile
              services (OpenStreetMap, Esri World Imagery) — no account needed. */}
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Street (OSM)">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite (Esri)">
              <TileLayer
                attribution='Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {points.map((h) => {
            const color = crimeColor(h.primary_crime);
            const caseIds = Array.isArray(h.case_ids) ? h.case_ids : [];
            return (
              <CircleMarker
                key={h.cluster_id || `${h.latitude},${h.longitude}`}
                center={[Number(h.latitude), Number(h.longitude)]}
                radius={densityRadius(h.density)}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.45, weight: 2 }}
              >
                <Tooltip direction="top" offset={[0, -4]} opacity={0.9}>
                  <span style={{ fontWeight: 600 }}>{h.cluster_id}</span> · {h.density} incidents
                </Tooltip>
                <Popup>
                  <div style={{ minWidth: 180, fontSize: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>📍 {h.cluster_id}</div>
                    <div><strong>Density:</strong> {h.density} incidents</div>
                    <div><strong>Primary crime:</strong>{' '}
                      <span style={{ color, fontWeight: 600 }}>{h.primary_crime || 'Unknown'}</span>
                    </div>
                    <div><strong>Centroid:</strong> {Number(h.latitude).toFixed(4)}, {Number(h.longitude).toFixed(4)}</div>
                    <div style={{ marginTop: 4 }}>
                      <strong>Cases ({caseIds.length}):</strong>
                      <div style={{ fontFamily: 'monospace', fontSize: 11, marginTop: 2 }}>
                        {caseIds.length ? caseIds.join(', ') : '—'}
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Crime-type colour legend + empty/seed honesty */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-400">
        {legendCrimes.map((crime) => (
          <span key={crime} className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: crimeColor(crime) }} />
            {crime}
          </span>
        ))}
        <span className="ml-auto font-mono">marker size = incident density</span>
      </div>

      {!loading && points.length === 0 && (
        <div className="text-xs text-gray-400">
          No hotspot clusters returned{isSeed ? ' (seed/fallback mode)' : ''}.
        </div>
      )}
    </div>
  );
}
