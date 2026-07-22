export const sourceCase = {
  id: 'FIR-2291',
  title: 'Financial fraud — wire structuring',
  station: 'Central PS',
  date: '02 Jul 2026',
  status: 'Under investigation',
  summary: 'Investigation into a cross-border wire structuring ring utilizing shell entities and smurfing techniques.',
};

export const sourceTimeline = [
  { id: 'st1', date: '02 Jul', event: 'FIR registered based on FIU intelligence report.' },
  { id: 'st2', date: '12 Jul', event: 'Aurora Holdings identified as key layering node.' },
  { id: 'st3', date: '17 Jul', event: 'Freeze warrants executed on primary accounts.' },
  { id: 'st4', date: '19 Jul', event: 'Key suspects connected via signals intelligence.' },
];

export const similarCases = [
  {
    id: 'FIR-1990',
    title: 'Trade-based money laundering network',
    station: 'Metro East PS',
    date: '15 Sep 2025',
    status: 'Closed - Convictions secured',
    similarityScore: 91,
    dimensions: {
      entities: 94,
      methods: 88,
      locations: 85,
    },
    commonEntities: [
      { name: 'Aurora Holdings', type: 'Organization', relation: 'Used for layering' },
      { name: 'V. Marchetti', type: 'Person', relation: 'Advisory role' },
    ],
    reasoning: [
      'High overlap in corporate vehicles used (Aurora Holdings).',
      'Similar structuring patterns (transactions < €15k).',
      'Geographic overlap in the Port District.',
    ],
    timeline: [
      { id: 'tc1_1', date: '15 Sep 2025', event: 'Case initiated from customs red flags.' },
      { id: 'tc1_2', date: '22 Oct 2025', event: 'Aurora accounts frozen.' },
      { id: 'tc1_3', date: '10 Jan 2026', event: '3 convictions for money laundering.' },
    ],
  },
  {
    id: 'FIR-2044',
    title: 'Real estate shell company fraud',
    station: 'North PS',
    date: '03 Nov 2025',
    status: 'Active',
    similarityScore: 78,
    dimensions: {
      entities: 65,
      methods: 92,
      locations: 70,
    },
    commonEntities: [
      { name: 'R. Sable', type: 'Person', relation: 'Nominee director' },
    ],
    reasoning: [
      'Identical use of discretionary trusts for ultimate beneficial ownership concealment.',
      'R. Sable acting as a nominee director across multiple entities.',
    ],
    timeline: [
      { id: 'tc2_1', date: '03 Nov 2025', event: 'Whistleblower report received.' },
      { id: 'tc2_2', date: '15 Dec 2025', event: 'R. Sable identified.' },
    ],
  },
  {
    id: 'FIR-1877',
    title: 'Unlicensed remittance operation',
    station: 'Central PS',
    date: '20 Jan 2025',
    status: 'Chargesheet filed',
    similarityScore: 66,
    dimensions: {
      entities: 40,
      methods: 75,
      locations: 90,
    },
    commonEntities: [
      { name: 'Port District Warehouse 12', type: 'Location', relation: 'Operational base' },
    ],
    reasoning: [
      'Geographic overlap: Port District used as an operational hub.',
      'Similar reliance on cash placement via couriers before digitization.',
    ],
    timeline: [
      { id: 'tc3_1', date: '20 Jan 2025', event: 'Raid on Port District warehouse.' },
      { id: 'tc3_2', date: '14 May 2025', event: 'Chargesheet filed against 4 couriers.' },
    ],
  },
];
