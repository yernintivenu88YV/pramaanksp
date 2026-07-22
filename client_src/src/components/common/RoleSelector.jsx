import React from 'react';
import { setApiRole } from '../../api/client';

export const ROLES = [
  { id: 'SI', name: 'Sub-Inspector (SI)', badge: 'SI', desc: 'Case details, ER, & Dossier exports' },
  { id: 'ACP', name: 'Assistant Commissioner (ACP)', badge: 'ACP', desc: 'Full access + Case Reassignments' },
  { id: 'Analyst', name: 'Data Analyst', badge: 'ANALYST', desc: 'Aggregate Analytics only (No case details)' },
  { id: 'Policy', name: 'Policy Officer', badge: 'POLICY', desc: 'State & District Rollup analytics' }
];

export function RoleBadge({ currentRole, onRoleChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 font-medium">Active Security Role:</span>
      <select
        value={currentRole}
        onChange={(e) => {
          const newRole = e.target.value;
          setApiRole(newRole);
          onRoleChange(newRole);
        }}
        className="bg-[#1b1f26] text-[#e8eaed] text-xs font-bold border border-white/10 rounded px-2 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
      >
        {ROLES.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </div>
  );
}
