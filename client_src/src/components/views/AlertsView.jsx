import React from 'react';
import { alerts } from '../../data/mock.js';
import { severityConfig } from '../ui/Severity.jsx';
import { AlertTriangle, Activity } from 'lucide-react';
import { WorkPanel } from '../ui/Layout.jsx';

export default function AlertsView() {
  const totals = {
    Critical: alerts.filter((a) => a.severity === 'critical').length,
    Warning: alerts.filter((a) => a.severity === 'warning').length,
    Info: alerts.filter((a) => a.severity === 'info').length,
    Resolved: alerts.filter((a) => a.severity === 'success').length,
  };

  return (
    <WorkPanel className="h-full bg-pramaan-bg text-pramaan-text" bodyClass="p-4 sm:p-6 overflow-auto">
      <h1 className="mb-6 text-xl font-bold">Alert Stream</h1>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Object.entries(totals).map(([label, value]) => <div key={label} className="rounded-lg border border-pramaan-border bg-pramaan-surface p-4"><div className="text-sm text-pramaan-text-secondary">{label}</div><div className="mt-1 text-2xl font-semibold text-pramaan-text">{value}</div></div>)}
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = severityConfig[alert.severity] || severityConfig.info;
          return <article key={alert.id} className="flex gap-4 rounded-lg border border-pramaan-border bg-pramaan-surface p-4 transition-colors hover:border-pramaan-border-strong"><div className={`mt-1 ${config.color}`}><AlertTriangle size={20} /></div><div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><span className={`rounded border px-2 py-0.5 text-xs ${config.bg} ${config.color} ${config.border}`}>{alert.severity.toUpperCase()}</span><span className="flex items-center gap-1 text-xs text-pramaan-text-secondary"><Activity size={14} /> {alert.source}</span><span className="ml-auto text-xs text-pramaan-text-secondary">{alert.time}</span></div><h3 className="font-medium text-pramaan-text">{alert.title}</h3><p className="mt-1 text-sm text-pramaan-text-secondary">{alert.detail}</p></div></article>;
        })}
      </div>
    </WorkPanel>
  );
}
