export const geoBounds = {
  minLat: 12.88,
  maxLat: 13.08,
  minLng: 77.50,
  maxLng: 77.78,
};

export const jurisdictionPolygon = [
  { lat: 13.045, lng: 77.535 },
  { lat: 13.066, lng: 77.642 },
  { lat: 13.037, lng: 77.752 },
  { lat: 12.943, lng: 77.764 },
  { lat: 12.895, lng: 77.658 },
  { lat: 12.918, lng: 77.535 },
];

export const hotspotPoints = [
  { id: 'HS-WFD-01', name: 'Whitefield tech corridor', lat: 12.9698, lng: 77.75, score: 94, risk: 'Critical', cases: 18, signal: 'Repeated SIM + vehicle overlap' },
  { id: 'HS-MJT-02', name: 'Majestic transit hub', lat: 12.9766, lng: 77.5713, score: 81, risk: 'High', cases: 14, signal: 'Pickpocket and phone snatch cluster' },
  { id: 'HS-KRM-03', name: 'Koramangala nightlife belt', lat: 12.9352, lng: 77.6245, score: 72, risk: 'High', cases: 9, signal: 'Late-night wallet theft pattern' },
  { id: 'HS-YNK-04', name: 'Yelahanka airport road', lat: 13.0707, lng: 77.5963, score: 64, risk: 'Medium', cases: 7, signal: 'Vehicle movement trail' },
  { id: 'HS-IND-05', name: 'Indiranagar commercial zone', lat: 12.9784, lng: 77.6408, score: 58, risk: 'Medium', cases: 6, signal: 'Shared CCTV proximity' },
];

export const casePoints = [
  { id: 'CASE-001', title: 'Whitefield burglary', lat: 12.9698, lng: 77.75, severity: 'Critical', status: 'Active' },
  { id: 'CASE-002', title: 'Transit hub chain snatching', lat: 12.9766, lng: 77.5713, severity: 'High', status: 'Triaged' },
  { id: 'CASE-003', title: 'Commercial break-in', lat: 12.9352, lng: 77.6245, severity: 'Medium', status: 'Open' },
  { id: 'CASE-005', title: 'North Bengaluru vehicle theft', lat: 13.0707, lng: 77.5963, severity: 'High', status: 'Open' },
  { id: 'CASE-K01', title: 'Kannada OCR petition', lat: 12.9716, lng: 77.5946, severity: 'Low', status: 'Resolved' },
];

export const patrolTrail = [
  { lat: 12.9352, lng: 77.6245, label: '22:05 Koramangala' },
  { lat: 12.9562, lng: 77.6387, label: '22:24 Ejipura' },
  { lat: 12.9784, lng: 77.6408, label: '22:41 Indiranagar' },
  { lat: 12.9901, lng: 77.6640, label: '22:58 CV Raman Nagar' },
  { lat: 12.9698, lng: 77.7500, label: '23:22 Whitefield' },
];

export const cctvCoverage = [
  { id: 'CCTV-18', name: 'Whitefield junction camera', lat: 12.9708, lng: 77.7485, radius: 17, health: 'Online' },
  { id: 'CCTV-24', name: 'Majestic platform gate', lat: 12.976, lng: 77.572, radius: 14, health: 'Online' },
  { id: 'CCTV-31', name: 'Indiranagar 100ft road', lat: 12.978, lng: 77.641, radius: 12, health: 'Degraded' },
  { id: 'CCTV-42', name: 'Koramangala junction', lat: 12.936, lng: 77.624, radius: 15, health: 'Online' },
];
