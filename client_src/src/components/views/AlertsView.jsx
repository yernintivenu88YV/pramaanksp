import React, { useState } from 'react';
import { alerts as mockAlerts } from '../../data/mock.js';
import { WorkPanel } from '../common/WorkPanel.jsx';
import { Cite } from '../common/Cite.jsx';
import { ModeBadge } from '../common/ModeBadge.jsx';
import { AlertTriangle, ShieldAlert, Filter, CheckCircle2, UserCheck, X, Clock, MapPin, ChevronRight } from 'lucide-react';

export default function AlertsView({ activeRole = 'ACP' }) {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [crimeTypeFilter, setCrimeTypeFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertList, setAlertList] = useState(mockAlerts);

  const filteredAlerts = alertList.filter((a) => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (crimeTypeFilter !== 'all' && a.crimeType && a.crimeType !== crimeTypeFilter) return false;
    return true;
  });

  const handleAcknowledge = (id) => {
    setAlertList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true, acknowledgedBy: activeRole } : a))
    );
    if (selectedAlert && selectedAlert.id === id) {
      setSelectedAlert((prev) => ({ ...prev, acknowledged: true, acknowledgedBy: activeRole }));
    }
  };

  const totals = {
    all: alertList.length,
    critical: alertList.filter((a) => a.severity === 'critical').length,
    warning: alertList.filter((a) => a.severity === 'warning').length,
    info: alertList.filter((a) => a.severity === 'info').length,
  };

  return (
    <div className="space-y-5 anim-content relative">
      <WorkPanel
        eyebrow="Real-Time Signal Detection"
        title="Alert Stream & Priority Notifications"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode="live" />
            <span className="text-xs font-mono text-pramaan-text-secondary">
              {filteredAlerts.length} active alerts
            </span>
          </div>
        }
      >
        {/* Stat Filter Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { key: 'all', label: 'Total Alerts', count: totals.all, style: 'text-pramaan-text border-pramaan-border' },
            { key: 'critical', label: 'Critical Severity', count: totals.critical, style: 'text-pramaan-critical border-pramaan-critical/30' },
            { key: 'warning', label: 'Review Queue', count: totals.warning, style: 'text-pramaan-warning border-pramaan-warning/30' },
            { key: 'info', label: 'Informational', count: totals.info, style: 'text-pramaan-info border-pramaan-info/30' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setSeverityFilter(item.key)}
              className={`p-3 rounded-lg border bg-pramaan-elevated text-left transition-all cursor-pointer ${
                severityFilter === item.key ? 'border-pramaan-secondary ring-1 ring-pramaan-secondary/40' : 'hover:border-pramaan-border-strong'
              }`}
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-pramaan-text-secondary">{item.label}</div>
              <div className={`text-xl font-mono font-bold mt-1 ${item.style}`}>{item.count}</div>
            </button>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-pramaan-elevated border border-pramaan-border mb-4">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-pramaan-secondary" />
            <span className="text-xs font-semibold text-pramaan-text">Filters:</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-pramaan-surface text-pramaan-text border border-pramaan-border px-2.5 py-1 rounded-md text-xs font-mono outline-none cursor-pointer"
            >
              <option value="all">Severity: All</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>

            <select
              value={crimeTypeFilter}
              onChange={(e) => setCrimeTypeFilter(e.target.value)}
              className="bg-pramaan-surface text-pramaan-text border border-pramaan-border px-2.5 py-1 rounded-md text-xs font-mono outline-none cursor-pointer"
            >
              <option value="all">Crime Type: All</option>
              <option value="Burglary">Burglary</option>
              <option value="Chain snatching">Chain snatching</option>
              <option value="Vehicle theft">Vehicle theft</option>
              <option value="Theft">Theft</option>
            </select>
          </div>
        </div>

        {/* Alert Stream List */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-xs text-pramaan-text-secondary">
              No alerts match the selected severity and type filter.
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCritical = alert.severity === 'critical';
              const isWarning = alert.severity === 'warning';

              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-4 rounded-lg border bg-pramaan-elevated transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-pramaan-secondary/40 ${
                    alert.acknowledged ? 'opacity-70 border-pramaan-border' : isCritical ? 'border-pramaan-critical/40 bg-pramaan-critical/5' : 'border-pramaan-border'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isCritical
                          ? 'bg-pramaan-critical/15 text-pramaan-critical'
                          : isWarning
                          ? 'bg-pramaan-warning/15 text-pramaan-warning'
                          : 'bg-pramaan-info/15 text-pramaan-info'
                      }`}
                    >
                      <ShieldAlert size={18} />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            isCritical
                              ? 'bg-pramaan-critical/20 text-pramaan-critical border border-pramaan-critical/30'
                              : isWarning
                              ? 'bg-pramaan-warning/20 text-pramaan-warning border border-pramaan-warning/30'
                              : 'bg-pramaan-info/20 text-pramaan-info border border-pramaan-info/30'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        {alert.caseId && <Cite id={alert.caseId} />}
                        <span className="text-[11px] font-mono text-pramaan-text-secondary flex items-center gap-1">
                          <Clock size={11} /> {alert.time}
                        </span>
                        {alert.acknowledged && (
                          <span className="text-[10px] font-mono text-pramaan-success bg-pramaan-success/15 px-1.5 py-0.5 rounded border border-pramaan-success/30 flex items-center gap-1">
                            <CheckCircle2 size={10} /> Acked by {alert.acknowledgedBy}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-pramaan-text truncate">{alert.title}</h4>
                      <p className="text-xs text-pramaan-text-secondary line-clamp-1">{alert.detail}</p>
                    </div>
                  </div>

                  <ChevronRight size={16} className="text-pramaan-text-secondary opacity-60 shrink-0 hidden sm:block" />
                </div>
              );
            })
          )}
        </div>
      </WorkPanel>

      {/* Slide-over Detail Drawer */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs anim-content">
          <div className="w-full max-w-md bg-pramaan-surface border-l border-pramaan-border h-full p-6 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-pramaan-border">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-pramaan-secondary">
                  Alert Details & Context
                </span>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-1 text-pramaan-text-secondary hover:text-pramaan-text cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      selectedAlert.severity === 'critical'
                        ? 'bg-pramaan-critical/20 text-pramaan-critical border border-pramaan-critical/30'
                        : 'bg-pramaan-warning/20 text-pramaan-warning border border-pramaan-warning/30'
                    }`}
                  >
                    {selectedAlert.severity}
                  </span>
                  <span className="text-xs font-mono text-pramaan-text-secondary">{selectedAlert.time}</span>
                </div>

                <h3 className="text-base font-bold text-pramaan-text">{selectedAlert.title}</h3>
                <p className="text-xs text-pramaan-text-secondary leading-relaxed">{selectedAlert.detail}</p>
              </div>

              {/* Context Box */}
              <div className="p-4 rounded-lg bg-pramaan-elevated border border-pramaan-border space-y-2">
                <div className="text-[10px] font-mono font-semibold uppercase text-pramaan-secondary">
                  Triggering Evidence Context
                </div>
                <div className="text-xs text-pramaan-text font-mono flex items-center justify-between">
                  <span>Case Reference:</span>
                  <Cite id={selectedAlert.caseId || 'FIR-2024-8841'} />
                </div>
                <div className="text-xs text-pramaan-text font-mono flex items-center justify-between">
                  <span>Station Jurisdiction:</span>
                  <span className="text-pramaan-text-secondary">Bengaluru Central</span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-pramaan-border space-y-2">
              {!selectedAlert.acknowledged ? (
                <button
                  onClick={() => handleAcknowledge(selectedAlert.id)}
                  className="w-full py-2.5 rounded-lg bg-pramaan-primary text-xs font-bold text-pramaan-bg hover:bg-pramaan-primary-cyan transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={15} /> Acknowledge Alert ({activeRole})
                </button>
              ) : (
                <div className="p-2.5 rounded-lg bg-pramaan-success/15 border border-pramaan-success/30 text-center text-xs font-bold text-pramaan-success">
                  ✓ Acknowledged by {selectedAlert.acknowledgedBy}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
