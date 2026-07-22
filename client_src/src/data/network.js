export const entityTypeMeta = {
  person: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  org: { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  account: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
  location: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  phone: { color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/30' },
  vehicle: { color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30' },
  fir: { color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/30' },
};

export const relationTypes = [
  'owns', 'controls', 'uses', 'co-signer', 'registered_at', 'director',
  'frequent_contact', 'transferred_to', 'spotted_at', 'named_in'
];

export const riskHex = {
  critical: '#e53e3e',
  warning: '#dd6b20',
  info: '#3182ce',
  none: '#718096'
};

export const nodes = [
  { id: 'p1', label: 'V. Marchetti', type: 'person', x: 400, y: 300, risk: 'critical' },
  { id: 'p2', label: 'R. Sable', type: 'person', x: 250, y: 350, risk: 'warning' },
  { id: 'p3', label: 'L. Fenwick', type: 'person', x: 550, y: 250, risk: 'info' },
  { id: 'a1', label: 'Acct •••4821', type: 'account', x: 300, y: 150, risk: 'critical' },
  { id: 'o1', label: 'Aurora Holdings', type: 'org', x: 450, y: 150, risk: 'warning' },
  { id: 'ph1', label: '+91 98••• 210', type: 'phone', x: 450, y: 450, risk: 'warning' },
  { id: 'ph2', label: '+91 99••• 001', type: 'phone', x: 150, y: 450, risk: 'none' },
  { id: 'v1', label: 'KJ-44-71 (Innova)', type: 'vehicle', x: 250, y: 550, risk: 'none' },
  { id: 'l1', label: 'Aurora Court, Sec 4', type: 'location', x: 600, y: 400, risk: 'info' },
  { id: 'l2', label: 'Port District Whse 12', type: 'location', x: 650, y: 150, risk: 'warning' },
  { id: 'f1', label: 'FIR-2291', type: 'fir', x: 150, y: 200, risk: 'critical' },
  { id: 'f2', label: 'FIR-1884', type: 'fir', x: 750, y: 300, risk: 'warning' },
];

export const edges = [
  { id: 'e1', from: 'p1', to: 'o1', label: 'controls', strength: 0.94 },
  { id: 'e2', from: 'p1', to: 'a1', label: 'owns', strength: 1.0 },
  { id: 'e3', from: 'p2', to: 'a1', label: 'co-signer', strength: 1.0 },
  { id: 'e4', from: 'p1', to: 'p2', label: 'frequent_contact', strength: 0.8 },
  { id: 'e5', from: 'p3', to: 'p1', label: 'advisor', strength: 0.6 },
  { id: 'e6', from: 'o1', to: 'l2', label: 'registered_at', strength: 0.9 },
  { id: 'e7', from: 'p1', to: 'ph1', label: 'uses', strength: 1.0 },
  { id: 'e8', from: 'p2', to: 'ph2', label: 'uses', strength: 1.0 },
  { id: 'e9', from: 'ph1', to: 'ph2', label: 'frequent_contact', strength: 0.7 },
  { id: 'e10', from: 'p1', to: 'v1', label: 'owns', strength: 1.0 },
  { id: 'e11', from: 'v1', to: 'l2', label: 'spotted_at', strength: 0.5 },
  { id: 'e12', from: 'p1', to: 'l1', label: 'registered_at', strength: 0.8 },
  { id: 'e13', from: 'p3', to: 'l2', label: 'spotted_at', strength: 0.6 },
  { id: 'e14', from: 'f1', to: 'p1', label: 'named_in', strength: 1.0 },
  { id: 'e15', from: 'f1', to: 'p2', label: 'named_in', strength: 1.0 },
  { id: 'e16', from: 'f2', to: 'p1', label: 'named_in', strength: 1.0 },
];

export const timelineSteps = [
  { step: 1, label: 'Initial Flag', activeNodes: ['a1', 'f1'] },
  { step: 2, label: 'Identified Actors', activeNodes: ['a1', 'f1', 'p1', 'p2'] },
  { step: 3, label: 'Corporate Layer', activeNodes: ['a1', 'f1', 'p1', 'p2', 'o1', 'l2'] },
  { step: 4, label: 'Full Network', activeNodes: ['p1', 'p2', 'p3', 'a1', 'o1', 'ph1', 'ph2', 'v1', 'l1', 'l2', 'f1', 'f2'] },
];
