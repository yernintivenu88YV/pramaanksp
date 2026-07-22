import React from 'react';
import { alerts } from '../../data/mock.js';
import { severityConfig } from '../ui/Severity.jsx';
import { AlertTriangle, Radio, Link2, FileText, CheckCircle2, Activity } from 'lucide-react';
import { WorkPanel } from '../ui/Layout.jsx';

export default function AlertsView() {
  const getIcon = (source) => {
    switch(source) {
      case 'SIGINT': return <Radio size={16} />;
      case 'OSINT': return <Link2 size={16} />;
      case 'HUMINT': return <FileText size={16} />;
      default: return <Activity size={16} />;
    }
  };

  return (
    <WorkPanel className="flex flex-col h-full bg-pramaan-bg text-pramaan-text p-6 gap-6">
      <h1 className="text-xl font-bold">Alert Stream</h1>
      
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Critical', value: 12, color: 'text-pramaan-critical', border: 'border-pramaan-critical/30' },
          { label: 'Warning', value: 34, color: 'text-pramaan-warning', border: 'border-pramaan-warning/30' },
          { label: 'Info', value: 89, color: 'text-pramaan-primary', border: 'border-pramaan-primary/30' },
          { label: 'Resolved', value: 245, color: 'text-pramaan-success', border: 'border-pramaan-success/30' }
        ].map(stat => (
          <div key={stat.label} className={`bg-pramaan-surface border ${stat.border} p-4 rounded`}>
            <div className="text-pramaan-text-secondary text-sm">{stat.label}</div>
            <div className={`text-2xl font-semibold mt-1 ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {alerts.map(alert => {
          const config = severityConfig[alert.severity] || severityConfig.info;
          return (
            <div key={alert.id} className="flex gap-4 p-4 bg-pramaan-surface border border-pramaan-border rounded hover:border-pramaan-text-secondary transition-colors cursor-pointer">
              <div className={`mt-1 ${config.color}`}>
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${config.bg} ${config.color} border ${config.border}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="text-xs text-pramaan-text-secondary flex items-center gap-1">
                    {getIcon(alert.source)} {alert.source}
                  </span>
                  <span className="text-xs text-pramaan-text-secondary ml-auto">{alert.timestamp}</span>
                </div>
                <h3 className="font-medium text-pramaan-text">{alert.title}</h3>
                <p className="text-sm text-pramaan-text-secondary mt-1">{alert.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </WorkPanel>
  );
}
