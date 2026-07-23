export const searchTypes = ['Person', 'Phone', 'Vehicle', 'Address', 'Case', 'Warrant'];

export const sampleRecordA = {
  source_id: 'P-001',
  source_table: 'fir',
  name: 'Mohammed Rafi',
  age: 45,
  gender: 'Male',
  address: 'No 12, 5th Cross, Malleshwaram, Bengaluru',
  phone: '9845012345',
  vehicle_reg: 'KA-02-MB-1234',
};

export const sampleRecordB = {
  source_id: 'P-002',
  source_table: 'registry',
  name: 'Mohammad Rafi',
  age: 45,
  gender: 'Male',
  address: 'No 12, 5th Cross, Malleshwaram, Bengaluru',
  phone: '9845012345',
  vehicle_reg: '',
};

export const profiles = [
  {
    id: 'CANON-0042',
    name: 'Mohammed Rafi',
    aliases: ['Mohammad Rafi', 'M. Rafi'],
    confidence: 96,
    primaryId: 'CANON-0042',
    location: 'Malleshwaram, Bengaluru',
    status: 'Active suspect',
    matchedVia: [
      { id: 'm1', label: 'Exact phone match', method: 'deterministic', strength: 'strong', detail: '9845012345 appears on FIR and registry records.' },
      { id: 'm2', label: 'Exact vehicle registration', method: 'deterministic', strength: 'strong', detail: 'KA-02-MB-1234 links the FIR person record to vehicle evidence.' },
      { id: 'm3', label: 'Address token overlap', method: 'probabilistic', score: 91, strength: 'strong', detail: 'Malleshwaram address matches after normalization.' },
    ],
    phones: [{ number: '+91 98450 12345', carrier: 'Unknown', lastSeen: '11 Jul 2026', verified: true }],
    vehicles: [{ plate: 'KA-02-MB-1234', model: 'Motorcycle', color: 'Unknown' }],
    addresses: [{ line: 'No 12, 5th Cross, Malleshwaram, Bengaluru', type: 'Residence', since: '2026' }],
    firs: [
      { id: 'CASE-001', title: 'Rear window burglary using crowbar', station: 'Bengaluru Central', date: '11 Jul 2026', status: 'Open' },
      { id: 'CASE-005', title: 'Motorcycle theft outside shopping complex', station: 'Bengaluru North', date: '01 Jun 2026', status: 'Open' },
    ],
    associates: [
      { name: 'Suresh Kumar', relation: 'Similar burglary cluster', risk: 'moderate' },
      { name: 'KA-02-MB-1234', relation: 'Vehicle evidence', risk: 'strong' },
    ],
    evidence: [
      { id: 'EV-001', title: 'FIR person record P-001', kind: 'FIR', date: '11 Jul' },
      { id: 'EV-002', title: 'Registry person record P-002', kind: 'Registry', date: '06 Jan' },
    ],
  },
  {
    id: 'CANON-0044',
    name: 'Suresh Kumar',
    aliases: ['S. Kumar'],
    confidence: 84,
    primaryId: 'CANON-0044',
    location: 'Bengaluru',
    status: 'Person of interest',
    matchedVia: [
      { id: 'm4', label: 'Probabilistic name/address match', method: 'probabilistic', score: 84, strength: 'moderate', detail: 'Name and locality overlap with CASE-002 suspect notes.' },
    ],
    phones: [{ number: '+91 98120 33445', carrier: 'Unknown', lastSeen: '04 Jul 2026', verified: false }],
    vehicles: [],
    addresses: [{ line: '221, 2nd Main, Jayanagar, Bengaluru', type: 'Residence', since: '2026' }],
    firs: [{ id: 'CASE-002', title: 'Late night house burglary with similar MO', station: 'Bengaluru Central', date: '04 Jul 2026', status: 'Open' }],
    associates: [{ name: 'CANON-0042', relation: 'Same signature cluster', risk: 'moderate' }],
    evidence: [{ id: 'EV-003', title: 'FIR person record P-003', kind: 'FIR', date: '07 Jan' }],
  },
];
