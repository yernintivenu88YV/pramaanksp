import React, { useState } from 'react';
import { WorkPanel } from '../ui/Layout.jsx';
import { Button } from '../ui/Controls.jsx';
import { ShieldCheck, Download, Search } from 'lucide-react';

export default function AuditView() {
  const [view, setView] = useState('table');

  const auditLogs = [
    { seq: '1042', officer: 'J. Smith (ID: 482)', role: 'Analyst', time: '2023-10-24 09:12:44', case: 'CAS-992-A', reason: 'Routine review', ip: '10.0.4.11', device: 'Secure-Term-01', status: 'SUCCESS' },
    { seq: '1043', officer: 'M. Patel (ID: 104)', role: 'Supervisor', time: '2023-10-24 11:30:10', case: 'CAS-992-A', reason: 'Authorization grant', ip: '10.0.4.55', device: 'Mobile-Gateway', status: 'SUCCESS' },
    { seq: '1044', officer: 'S. Rao (ID: 993)', role: 'Analyst', time: '2023-10-24 14:05:02', case: 'CAS-881-B', reason: 'Evidence upload', ip: '10.0.2.88', device: 'Secure-Term-04', status: 'FAILED' }
  ];

  return (
    <WorkPanel className="flex flex-col h-full bg-pramaan-bg text-pramaan-text p-6">
      <div className="bg-pramaan-surface border border-pramaan-border p-3 rounded-lg flex items-center gap-3 mb-6">
        <ShieldCheck className="text-pramaan-success" size={20} />
        <div>
          <div className="font-semibold text-sm">System Integrity Active</div>
          <div className="text-xs text-pramaan-text-secondary">All actions are recorded in an append-only, tamper-evident ledger.</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex bg-pramaan-surface rounded p-1 border border-pramaan-border">
          <button className={`px-4 py-1 text-sm rounded ${view === 'table' ? 'bg-pramaan-elevated text-pramaan-primary' : 'text-pramaan-text-secondary'}`} onClick={() => setView('table')}>Table</button>
          <button className={`px-4 py-1 text-sm rounded ${view === 'ledger' ? 'bg-pramaan-elevated text-pramaan-primary' : 'text-pramaan-text-secondary'}`} onClick={() => setView('ledger')}>Ledger Hash Chain</button>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1.5 text-pramaan-text-secondary" size={14} />
            <input type="text" placeholder="Filter logs..." className="bg-pramaan-surface border border-pramaan-border rounded pl-8 pr-3 py-1 text-sm text-pramaan-text outline-none" />
          </div>
          <Button variant="secondary" className="flex items-center gap-2 text-xs h-[30px]">
            <Download size={14} /> CSV
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-pramaan-surface border border-pramaan-border rounded">
        {view === 'table' ? (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-pramaan-elevated sticky top-0">
              <tr>
                <th className="px-4 py-3 font-medium text-pramaan-text-secondary border-b border-pramaan-border">Seq #</th>
                <th className="px-4 py-3 font-medium text-pramaan-text-secondary border-b border-pramaan-border">Officer</th>
                <th className="px-4 py-3 font-medium text-pramaan-text-secondary border-b border-pramaan-border">Timestamp</th>
                <th className="px-4 py-3 font-medium text-pramaan-text-secondary border-b border-pramaan-border">Case ID</th>
                <th className="px-4 py-3 font-medium text-pramaan-text-secondary border-b border-pramaan-border">Action/Reason</th>
                <th className="px-4 py-3 font-medium text-pramaan-text-secondary border-b border-pramaan-border">IP/Device</th>
                <th className="px-4 py-3 font-medium text-pramaan-text-secondary border-b border-pramaan-border">Status</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.seq} className="border-b border-pramaan-border hover:bg-pramaan-elevated transition-colors">
                  <td className="px-4 py-2 font-mono text-xs">{log.seq}</td>
                  <td className="px-4 py-2">
                    <div>{log.officer}</div>
                    <div className="text-xs text-pramaan-text-secondary">{log.role}</div>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{log.time}</td>
                  <td className="px-4 py-2 text-pramaan-primary">{log.case}</td>
                  <td className="px-4 py-2">{log.reason}</td>
                  <td className="px-4 py-2 font-mono text-xs">
                    <div>{log.ip}</div>
                    <div className="text-pramaan-text-secondary">{log.device}</div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-1 rounded ${log.status === 'SUCCESS' ? 'bg-pramaan-success/10 text-pramaan-success' : 'bg-pramaan-critical/10 text-pramaan-critical'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 font-mono text-xs space-y-4">
            {auditLogs.map((log) => (
              <div key={log.seq} className="border-l-2 border-pramaan-primary pl-4 pb-4">
                <div className="text-pramaan-text-secondary mb-1">Block #{log.seq} • Prev Hash: 0x{Math.random().toString(16).substr(2, 8)}...</div>
                <div className="bg-pramaan-elevated p-3 rounded">
                  <div><span className="text-pramaan-primary">Timestamp:</span> {log.time}</div>
                  <div><span className="text-pramaan-primary">Actor:</span> {log.officer} ({log.role})</div>
                  <div><span className="text-pramaan-primary">Target:</span> {log.case}</div>
                  <div><span className="text-pramaan-primary">Payload:</span> {log.reason}</div>
                  <div className="mt-2 pt-2 border-t border-pramaan-border text-pramaan-success">Hash: 0x{Math.random().toString(16).substr(2, 16)}... Validated</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkPanel>
  );
}
