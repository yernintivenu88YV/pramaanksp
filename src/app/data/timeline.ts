import type { EntityType } from "../components/primitives";

export type Lane = "Communications" | "Financial" | "Location" | "Documents" | "Officer Actions" | "Legal / Court";
export const LANES: Lane[] = ["Communications", "Financial", "Location", "Documents", "Officer Actions", "Legal / Court"];

export const DAY_START = 8 * 60; // 08:00 in minutes
export const DAY_END = 18 * 60; // 18:00

export type TEvent = {
  id: string;
  lane: Lane;
  minute: number; // minutes since midnight
  actor: string;
  entity: EntityType;
  title: string;
  anomaly?: { confidence: number; reason: string };
};

export const minutesToLabel = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export const events: TEvent[] = [
  { id: "e1", lane: "Communications", minute: 8 * 60 + 14, actor: "R. Kumar", entity: "person", title: "Outgoing call to +91 98452 11876" },
  { id: "e2", lane: "Location", minute: 9 * 60 + 2, actor: "KA-05-MN-4812", entity: "vehicle", title: "Vehicle observed near Whitefield Toll" },
  { id: "e3", lane: "Financial", minute: 10 * 60 + 37, actor: "Vellum Traders", entity: "organisation", title: "UPI transfer · ₹48,000", anomaly: { confidence: 87, reason: "Transaction timing and counterparty diverge from the subject's established pattern; amount is 6× the 30-day median." } },
  { id: "e4", lane: "Documents", minute: 11 * 60 + 26, actor: "CCTV-42 / Whitefield", entity: "location", title: "Footage uploaded by field unit" },
  { id: "e5", lane: "Communications", minute: 12 * 60 + 41, actor: "R. Kumar", entity: "person", title: "Device inactive for 47 minutes", anomaly: { confidence: 74, reason: "Handset dark during a window with corroborating financial activity — atypical for this subject's daytime usage." } },
  { id: "e6", lane: "Officer Actions", minute: 14 * 60 + 5, actor: "PSI Anjali R.", entity: "officer", title: "Witness statement logged" },
  { id: "e7", lane: "Location", minute: 15 * 60 + 18, actor: "+91 98452 11876", entity: "person", title: "Cell tower hand-off · Mahadevapura" },
  { id: "e8", lane: "Legal / Court", minute: 17 * 60 + 30, actor: "Magistrate Court-12", entity: "legal", title: "Production warrant issued" },
];

/* Two entities' event lines for the stacked alibi/overlap comparison. */
export type CompareEntity = { id: string; name: string; type: EntityType; events: { minute: number; lane: Lane; title: string }[] };

export const compareEntities: CompareEntity[] = [
  {
    id: "ent-kumar",
    name: "R. Kumar",
    type: "person",
    events: [
      { minute: 8 * 60 + 14, lane: "Communications", title: "Call to +91 98452 11876" },
      { minute: 10 * 60 + 37, lane: "Financial", title: "Present at UPI transfer" },
      { minute: 12 * 60 + 41, lane: "Communications", title: "Device inactive 47 min" },
      { minute: 15 * 60 + 18, lane: "Location", title: "Cell · Mahadevapura" },
    ],
  },
  {
    id: "ent-danish",
    name: "Mohd. Danish",
    type: "person",
    events: [
      { minute: 9 * 60 + 6, lane: "Location", title: "Cell registered · Whitefield" },
      { minute: 10 * 60 + 51, lane: "Financial", title: "Cash deposit · ₹45,000" },
      { minute: 12 * 60 + 38, lane: "Communications", title: "Outgoing call to R. Kumar" },
      { minute: 15 * 60 + 14, lane: "Location", title: "Cell registered · Mahadevapura" },
    ],
  },
];
