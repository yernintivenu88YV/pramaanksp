export const targetCase = {
  case_id: 'CASE-001',
  crime_type: 'Burglary',
  modus_operandi: 'Rear window forced entry using crowbar, night time',
  narrative_text: 'Complainant reported burglary at residence. Entry made through rear window using a crowbar. Occurred between 1 AM and 3 AM. Jewelry and cash stolen.',
  latitude: 12.9352,
  longitude: 77.6245,
  date_time: '2026-07-11T02:00:00',
  weapon: 'crowbar',
  canonical_suspect_ids: ['CANON-0042'],
};

export const candidateCases = [
  { case_id: 'CASE-002', crime_type: 'Burglary', modus_operandi: 'Rear window entry with crowbar, late night', narrative_text: 'Victim reported house burglary. Entry via rear window using a crowbar, between midnight and 2 AM. Cash and gold ornaments stolen.', latitude: 12.9784, longitude: 77.6408, date_time: '2026-07-04T01:30:00', weapon: 'crowbar', canonical_suspect_ids: ['CANON-0044'] },
  { case_id: 'CASE-003', crime_type: 'Burglary', modus_operandi: 'Front door lock picked during daytime while owners away', narrative_text: 'Complainant returned home to find front door lock picked and valuables missing during daytime hours.', latitude: 12.96, longitude: 77.61, date_time: '2026-07-07T14:00:00', weapon: null, canonical_suspect_ids: [] },
  { case_id: 'CASE-004', crime_type: 'Chain snatching', modus_operandi: 'Snatched gold chain from pedestrian on motorbike', narrative_text: 'Victim was walking on the street when two men on a motorbike snatched her gold chain and fled.', latitude: 12.2958, longitude: 76.6394, date_time: '2026-07-08T11:00:00', weapon: null, canonical_suspect_ids: [] },
  { case_id: 'CASE-005', crime_type: 'Vehicle theft', modus_operandi: 'Motorcycle stolen from parking area', narrative_text: "Complainant's motorcycle was stolen from outside a shopping complex.", latitude: 13.0827, longitude: 77.5877, date_time: '2026-06-01T16:00:00', weapon: null, canonical_suspect_ids: ['CANON-0042'] },
];

export const fallbackMatches = [
  { case_id: 'CASE-002', crime_type: 'Burglary', modus_operandi: 'Rear window entry with crowbar, late night', total_score: 0.82, shared_confirmed_suspect: false, breakdown: { location: 0.42, time: 0.78, mo: 0.91, weapon: 1, narrative: 0.84 } },
  { case_id: 'CASE-003', crime_type: 'Burglary', modus_operandi: 'Front door lock picked during daytime while owners away', total_score: 0.43, shared_confirmed_suspect: false, breakdown: { location: 0.56, time: 0.22, mo: 0.48, weapon: 0.5, narrative: 0.31 } },
  { case_id: 'CASE-005', crime_type: 'Vehicle theft', modus_operandi: 'Motorcycle stolen from parking area', total_score: 0.29, shared_confirmed_suspect: true, breakdown: { location: 0.08, time: 0.34, mo: 0.19, weapon: 0.5, narrative: 0.2 } },
];
