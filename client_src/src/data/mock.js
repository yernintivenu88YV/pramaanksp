// Demo intelligence dataset for Pramaan Crime Command Center.
// Aligned to KSP CrimeNo standards, Catalyst Data Store, and AppSail seed microservices.

export const cases = [
  { id: 'CASE-001', fir: 'FIR-2026-0001', crimeNo: '104430006202600001', title: 'Rear window burglary using crowbar', status: 'active', priority: 'critical', lead: 'SI Kavya Rao', entities: 6, updated: '12m ago', progress: 68, region: 'Bengaluru Central', station: 'STATION-BGLR-CENTRAL', stolenValue: '₹4,50,000 Gold & Cash' },
  { id: 'CASE-002', fir: 'FIR-2026-0002', crimeNo: '104430006202600002', title: 'Late night house burglary with similar MO', status: 'active', priority: 'warning', lead: 'PSI Arjun Hegde', entities: 4, updated: '38m ago', progress: 54, region: 'Bengaluru Central', station: 'STATION-BGLR-CENTRAL', stolenValue: '₹2,20,000 Jewelry' },
  { id: 'CASE-003', fir: 'FIR-2026-0003', title: 'Front door lock picked during daytime', status: 'review', priority: 'info', lead: 'SI Meera Patil', entities: 3, updated: '1h ago', progress: 41, region: 'Bengaluru South', station: 'STATION-BGLR-SOUTH', stolenValue: '₹85,000 Electronics' },
  { id: 'CASE-004', fir: 'FIR-2026-0004', title: 'Motorbike chain snatching near market road', status: 'active', priority: 'warning', lead: 'PSI Nikhil Gowda', entities: 5, updated: '3h ago', progress: 57, region: 'Mysuru Central', station: 'STATION-MYS-CENTRAL', stolenValue: '22g Gold Chain' },
  { id: 'CASE-005', fir: 'FIR-2026-0005', crimeNo: '104440008202600005', title: 'Motorcycle theft outside shopping complex', status: 'escalated', priority: 'critical', lead: 'ACP Ramesh Bhat', entities: 7, updated: '5h ago', progress: 73, region: 'Bengaluru North', station: 'STATION-BGLR-NORTH', stolenValue: 'KA-02-MB-1234 Motorcycle' },
  { id: 'CASE-006', fir: 'FIR-2026-0006', crimeNo: '104450010202600006', title: 'Phishing & ATM card cloning scam cluster', status: 'active', priority: 'critical', lead: 'SI Inspector V. Kumar', entities: 8, updated: '6h ago', progress: 82, region: 'Bengaluru East', station: 'STATION-JAYANAGAR-CYBER', stolenValue: '₹14,20,000 Bank Theft' },
  { id: 'CASE-007', fir: 'FIR-2026-0007', crimeNo: '104460012202600007', title: 'Contraband & illegal narcotics smuggling', status: 'escalated', priority: 'critical', lead: 'ACP Ramesh Bhat', entities: 9, updated: '7h ago', progress: 91, region: 'Mangaluru Port', station: 'STATION-MANGALURU-PORT', stolenValue: '45kg Narcotics Seized' },
  { id: 'CASE-008', fir: 'FIR-2026-0008', title: 'Highway container truck hijacking on NH-44', status: 'active', priority: 'warning', lead: 'PSI Arjun Hegde', entities: 6, updated: '9h ago', progress: 61, region: 'Tumakuru Highway', station: 'STATION-TUMAKURU-HWY', stolenValue: 'KA-06-TR-8899 Cargo' },
  { id: 'CASE-K01', fir: 'FIR-2026-0011', title: 'ಮನೆಗಳ್ಳತನ ಪ್ರಕರಣ (Kannada Burglary Report)', status: 'review', priority: 'info', lead: 'SI Kavya Rao', entities: 2, updated: '8h ago', progress: 35, region: 'Bengaluru Central', station: 'STATION-BGLR-CENTRAL', stolenValue: '₹1,50,000 Cash' },
];

export const alerts = [
  { id: 'AL-1042', title: 'Shared suspect appears in burglary and vehicle theft', detail: 'CANON-0042 (Mohammed Rafi) linked to CASE-001 and CASE-005. Active warrant WAR-2026-001 present.', severity: 'critical', source: 'Link Engine', time: '2m ago', caseId: 'CASE-001' },
  { id: 'AL-1038', title: 'Similar burglary signature detected (82.1% Match)', detail: 'CASE-002 matches CASE-001 on rear-window entry, crowbar use, night timing, and nearby Indiranagar location.', severity: 'warning', source: 'Case Twin', time: '9m ago', caseId: 'CASE-002' },
  { id: 'AL-1034', title: 'Fellegi-Sunter Identity resolution confidence high (0.94)', detail: 'Mohammed Rafi and Mohammad Rafi share phone 9845012345, vehicle registration KA-02-MB-1234, and Indiranagar address.', severity: 'success', source: 'Entity Resolution', time: '24m ago', caseId: 'CANON-0042' },
  { id: 'AL-1030', title: 'Cyber ATM Card Cloning Syndicate Detected', detail: 'Jayanagar 4th Block ATM reported 5 card cloning instances within 2 hours. Suspect V. Kumar flagged.', severity: 'critical', source: 'Cyber RAG', time: '45m ago', caseId: 'CASE-006' },
  { id: 'AL-1026', title: 'Hotspot cluster forming in Bengaluru Central', detail: 'Four recent property crimes fall inside the configured 500m density radius.', severity: 'info', source: 'Hotspots', time: '1h ago', caseId: 'HOTSPOT-1' },
  { id: 'AL-1022', title: 'Geofence Breach Signal Alert', detail: 'Target IMEI 864902184910284 pinged near BTS-MYS-MAIN-02 tower.', severity: 'warning', source: 'Signal Triangulation', time: '1h 30m ago', caseId: 'CASE-004' },
  { id: 'AL-1019', title: 'Court-Ready Dossier export completed', detail: 'Pramaan Official Dossier CASE-001 export generated for 1st ACMM Court.', severity: 'info', source: 'Audit', time: '2h ago', caseId: 'CASE-001' },
];

export const activitySeries = [
  { time: 'Mon', value: 12, alerts: 12, resolved: 8 },
  { time: 'Tue', value: 19, alerts: 19, resolved: 11 },
  { time: 'Wed', value: 15, alerts: 15, resolved: 14 },
  { time: 'Thu', value: 27, alerts: 27, resolved: 18 },
  { time: 'Fri', value: 22, alerts: 22, resolved: 20 },
  { time: 'Sat', value: 18, alerts: 16, resolved: 14 },
  { time: 'Sun', value: 24, alerts: 21, resolved: 19 },
];

export const graphNodes = [
  { id: 'CANON-0042', label: 'Mohammed Rafi', type: 'person', x: 300, y: 220, risk: 'critical', phone: '98450 12345', cases: 3 },
  { id: 'CANON-0044', label: 'S. Praveen Kumar', type: 'person', x: 680, y: 230, risk: 'warning', phone: '99008 81122', cases: 2 },
  { id: 'CANON-0048', label: 'V. Kumar (Cyber)', type: 'person', x: 450, y: 410, risk: 'critical', phone: '97310 49281', cases: 2 },
  { id: 'CANON-0050', label: 'Rashid Khan', type: 'person', x: 220, y: 420, risk: 'critical', phone: '98800 77112', cases: 1 },
  { id: 'CASE-001', label: 'CASE-001', type: 'case', x: 130, y: 150, risk: 'critical' },
  { id: 'CASE-002', label: 'CASE-002', type: 'case', x: 500, y: 140, risk: 'warning' },
  { id: 'CASE-005', label: 'CASE-005', type: 'case', x: 510, y: 330, risk: 'warning' },
  { id: 'CASE-006', label: 'CASE-006', type: 'case', x: 320, y: 350, risk: 'critical' },
  { id: 'CASE-007', label: 'CASE-007', type: 'case', x: 110, y: 320, risk: 'critical' },
  { id: 'KA-02-MB-1234', label: 'KA-02-MB-1234', type: 'vehicle', x: 150, y: 340, risk: 'info' },
  { id: 'KA-06-TR-8899', label: 'KA-06-TR-8899', type: 'vehicle', x: 580, y: 440, risk: 'warning' },
  { id: 'ACC-8819201', label: 'ICICI-Hawala-8819', type: 'account', x: 380, y: 480, risk: 'critical' }
];

export const graphEdges = [
  { from: 'CANON-0042', to: 'CASE-001', label: 'accused in' },
  { from: 'CANON-0042', to: 'CASE-005', label: 'accused in' },
  { from: 'CANON-0042', to: 'KA-02-MB-1234', label: 'uses vehicle' },
  { from: 'CANON-0044', to: 'CASE-002', label: 'accused in' },
  { from: 'CANON-0048', to: 'CASE-006', label: 'operates' },
  { from: 'CANON-0048', to: 'ACC-8819201', label: 'transfers to' },
  { from: 'CANON-0050', to: 'CASE-007', label: 'smuggles' },
  { from: 'CASE-001', to: 'CASE-002', label: '82% MO Match' },
  { from: 'CASE-006', to: 'ACC-8819201', label: 'linked transaction' }
];

export const caseTypeBreakdown = [
  { type: 'Burglary', count: 4 },
  { type: 'Vehicle theft', count: 2 },
  { type: 'Cyber ATM Theft', count: 1 },
  { type: 'Narcotics Smuggling', count: 1 },
  { type: 'Chain snatching', count: 1 },
];
