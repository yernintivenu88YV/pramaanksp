import type { EntityType } from "../components/primitives";

export const WHITEFIELD: [number, number] = [12.9698, 77.75];

/* Timestamped movement points (minutes since midnight) per tracked entity. */
export type TrailPoint = { lat: number; lng: number; minute: number };
export const trails: { id: string; label: string; type: EntityType; points: TrailPoint[] }[] = [
  {
    id: "veh",
    label: "KA-05-MN-4812",
    type: "vehicle",
    points: [
      { lat: 12.9625, lng: 77.7412, minute: 8 * 60 + 40 },
      { lat: 12.9668, lng: 77.7458, minute: 9 * 60 + 30 },
      { lat: 12.9702, lng: 77.7503, minute: 10 * 60 + 37 },
      { lat: 12.9748, lng: 77.7561, minute: 12 * 60 + 10 },
      { lat: 12.9791, lng: 77.7629, minute: 15 * 60 + 18 },
    ],
  },
  {
    id: "phone",
    label: "+91 98452 11876",
    type: "person",
    points: [
      { lat: 12.9601, lng: 77.7451, minute: 8 * 60 + 14 },
      { lat: 12.9689, lng: 77.7491, minute: 10 * 60 + 20 },
      { lat: 12.9705, lng: 77.7509, minute: 10 * 60 + 40 },
      { lat: 12.9773, lng: 77.7602, minute: 15 * 60 + 14 },
    ],
  },
];

export type EvidencePoint = { id: string; lat: number; lng: number; minute: number; type: EntityType; kind: "video" | "doc" | "image"; label: string };
export const evidencePoints: EvidencePoint[] = [
  { id: "EV-00841", lat: 12.9702, lng: 77.7503, minute: 10 * 60 + 37, type: "location", kind: "video", label: "CCTV extraction · Whitefield Toll" },
  { id: "EV-00798", lat: 12.9748, lng: 77.7561, minute: 13 * 60 + 3, type: "vehicle", kind: "image", label: "Vehicle plate frame sequence" },
  { id: "EV-00836", lat: 12.9689, lng: 77.7491, minute: 10 * 60 + 42, type: "organisation", kind: "doc", label: "UPI transaction statement" },
];

export const cctv: { id: string; lat: number; lng: number; radius: number; label: string }[] = [
  { id: "CCTV-42", lat: 12.9702, lng: 77.7503, radius: 180, label: "Whitefield Toll" },
  { id: "CCTV-17", lat: 12.9755, lng: 77.7575, radius: 140, label: "Mahadevapura junction" },
  { id: "CCTV-08", lat: 12.9648, lng: 77.7443, radius: 160, label: "ITPL service road" },
];

/* Jurisdiction boundary polygon (Whitefield division, simplified). */
export const jurisdiction: [number, number][] = [
  [12.9820, 77.7360],
  [12.9835, 77.7660],
  [12.9600, 77.7700],
  [12.9560, 77.7420],
];

/* Crime-density heat points [lat, lng, intensity]. */
export const densityPoints: [number, number, number][] = [
  [12.9702, 77.7503, 0.9], [12.9710, 77.7510, 0.7], [12.9695, 77.7498, 0.6],
  [12.9748, 77.7561, 0.8], [12.9755, 77.7570, 0.5], [12.9689, 77.7491, 0.6],
  [12.9668, 77.7458, 0.4], [12.9773, 77.7602, 0.5], [12.9625, 77.7412, 0.35],
];
