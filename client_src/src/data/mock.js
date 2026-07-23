// Demo intelligence data aligned to the AppSail seed records.

export const cases = [
  { id: 'CASE-001', fir: 'FIR-2026-0001', title: 'Rear window burglary using crowbar', status: 'active', priority: 'critical', lead: 'SI Kavya Rao', entities: 6, updated: '12m ago', progress: 68, region: 'Bengaluru Central', station: 'STATION-BGLR-CENTRAL' },
  { id: 'CASE-002', fir: 'FIR-2026-0002', title: 'Late night house burglary with similar MO', status: 'active', priority: 'warning', lead: 'PSI Arjun Hegde', entities: 4, updated: '38m ago', progress: 54, region: 'Bengaluru Central', station: 'STATION-BGLR-CENTRAL' },
  { id: 'CASE-003', fir: 'FIR-2026-0003', title: 'Front door lock picked during daytime', status: 'review', priority: 'info', lead: 'SI Meera Patil', entities: 3, updated: '1h ago', progress: 41, region: 'Bengaluru South', station: 'STATION-BGLR-SOUTH' },
  { id: 'CASE-004', fir: 'FIR-2026-0004', title: 'Motorbike chain snatching near market road', status: 'active', priority: 'warning', lead: 'PSI Nikhil Gowda', entities: 5, updated: '3h ago', progress: 57, region: 'Mysuru Central', station: 'STATION-MYS-CENTRAL' },
  { id: 'CASE-005', fir: 'FIR-2026-0005', title: 'Motorcycle theft outside shopping complex', status: 'escalated', priority: 'critical', lead: 'ACP Ramesh Bhat', entities: 7, updated: '5h ago', progress: 73, region: 'Bengaluru North', station: 'STATION-BGLR-NORTH' },
  { id: 'CASE-K01', fir: 'FIR-2026-0011', title: 'Kannada narrative burglary report', status: 'review', priority: 'info', lead: 'SI Kavya Rao', entities: 2, updated: '8h ago', progress: 35, region: 'Bengaluru Central', station: 'STATION-BGLR-CENTRAL' },
];

export const alerts = [
  { id: 'AL-1042', title: 'Shared suspect appears in burglary and vehicle theft', detail: 'CANON-0042 is linked to CASE-001 and CASE-005. Active warrant present.', severity: 'critical', source: 'Link Engine', time: '2m ago', caseId: 'CASE-001' },
  { id: 'AL-1038', title: 'Similar burglary signature detected', detail: 'CASE-002 matches CASE-001 on rear-window entry, crowbar use, night timing, and nearby location.', severity: 'warning', source: 'Case Twin', time: '9m ago', caseId: 'CASE-002' },
  { id: 'AL-1034', title: 'Identity resolution confidence high', detail: 'Mohammed Rafi and Mohammad Rafi share phone, vehicle registration, and address tokens.', severity: 'success', source: 'Entity Resolution', time: '24m ago', caseId: 'CANON-0042' },
  { id: 'AL-1026', title: 'Hotspot cluster forming in Bengaluru Central', detail: 'Three recent property crimes fall inside the configured density radius.', severity: 'info', source: 'Hotspots', time: '1h ago', caseId: 'HOTSPOT-1' },
  { id: 'AL-1019', title: 'Dossier export requested', detail: 'Court-ready dossier generation is available once SmartBrowz is enabled.', severity: 'info', source: 'Audit', time: '2h ago', caseId: 'CASE-001' },
];

export const activitySeries = [
  { time: 'Mon', value: 12, alerts: 12, resolved: 8 },
  { time: 'Tue', value: 19, alerts: 19, resolved: 11 },
  { time: 'Wed', value: 15, alerts: 15, resolved: 14 },
  { time: 'Thu', value: 27, alerts: 27, resolved: 18 },
  { time: 'Fri', value: 22, alerts: 22, resolved: 20 },
  { time: 'Sat', value: 9, alerts: 9, resolved: 7 },
  { time: 'Sun', value: 14, alerts: 14, resolved: 10 },
];

export const graphNodes = [
  { id: 'CANON-0042', label: 'Mohammed Rafi', type: 'person', x: 300, y: 220, risk: 'critical' },
  { id: 'CASE-001', label: 'CASE-001', type: 'case', x: 130, y: 150, risk: 'critical' },
  { id: 'CASE-002', label: 'CASE-002', type: 'case', x: 500, y: 140, risk: 'warning' },
  { id: 'CASE-005', label: 'CASE-005', type: 'case', x: 510, y: 330, risk: 'warning' },
  { id: 'KA-02-MB-1234', label: 'KA-02-MB-1234', type: 'vehicle', x: 150, y: 340, risk: 'info' },
  { id: 'CANON-0044', label: 'Suresh Kumar', type: 'person', x: 680, y: 230, risk: 'warning' },
];

export const graphEdges = [
  { from: 'CANON-0042', to: 'CASE-001', label: 'accused in' },
  { from: 'CANON-0042', to: 'CASE-005', label: 'accused in' },
  { from: 'CANON-0042', to: 'KA-02-MB-1234', label: 'uses vehicle' },
  { from: 'CANON-0044', to: 'CASE-002', label: 'accused in' },
  { from: 'CASE-001', to: 'CASE-002', label: 'similar MO' },
];

export const caseTypeBreakdown = [
  { type: 'Burglary', count: 4 },
  { type: 'Vehicle theft', count: 1 },
  { type: 'Chain snatching', count: 1 },
];
