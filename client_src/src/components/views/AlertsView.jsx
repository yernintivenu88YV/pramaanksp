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
    <div className="space-y-5 font-sans select-none relative">
      <WorkPanel
        eyebrow="Real-Time Signal Detection"
        title="Alert Stream & Priority Notifications"
        actions={
          <div className="flex items-center gap-3">
            <ModeBadge mode="live" />
            <span className="text-xs font-mono font-bold text-[#2B7A78]">
              {filteredAlerts.length} active alerts
            </span>
          </div>
        }
      >
        {/* Stat Filter Header with Sidebar Active Animations */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-5">
          {[
            { key: 'all', label: 'Total Alerts', count: totals.all, style: 'text-[#17252A]' },
            { key: 'critical', label: 'Critical Severity', count: totals.critical, style: 'text-red-600' },
            { key: 'warning', label: 'Review Queue', count: totals.warning, style: 'text-amber-700' },
            { key: 'info', label: 'Informational', count: totals.info, style: 'text-[#2B7A78]' },
          ].map((item) => {
            const isSelected = severityFilter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSeverityFilter(item.key)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-[#2B7A78] text-white border-[#3AAFA9] shadow-md ring-1 ring-[#3AAFA9]/50 scale-[1.02]'
                    : 'bg-[#FEFFFF] text-[#17252A] border-[#B3E3DE] hover:bg-[#DEF2F1]'
                }`}
              >
                <div className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isSelected ? 'text-[#3AAFA9]' : 'text-[#2B7A78]'}`}>{item.label}</div>
                <div className={`text-2xl font-mono font-bold mt-1 ${isSelected ? 'text-white' : item.style}`}>{item.count}</div>
              </button>
            );
          })}
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#DEF2F1] border border-[#B3E3DE] mb-5">
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-[#2B7A78]" />
            <span className="text-xs font-bold text-[#17252A]">Filter Streams:</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#FEFFFF] text-[#17252A] border border-[#B3E3DE] px-3 py-1.5 rounded-xl text-xs font-mono font-bold outline-none cursor-pointer"
            >
              <option value="all">Severity: All</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>

            <select
              value={crimeTypeFilter}
              onChange={(e) => setCrimeTypeFilter(e.target.value)}
              className="bg-[#FEFFFF] text-[#17252A] border border-[#B3E3DE] px-3 py-1.5 rounded-xl text-xs font-mono font-bold outline-none cursor-pointer"
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
            <div className="py-12 text-center text-xs text-[#2B7A78]">
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
                  className={`p-4 rounded-2xl border bg-[#FEFFFF] transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#3AAFA9] shadow-xs ${
                    alert.acknowledged ? 'opacity-70 border-[#B3E3DE]' : isCritical ? 'border-red-300 bg-red-50/50' : 'border-[#B3E3DE]'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${
                        isCritical
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : isWarning
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-[#DEF2F1] text-[#2B7A78] border-[#3AAFA9]/30'
                      }`}
                    >
                      <ShieldAlert size={20} />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${
                            isCritical
                              ? 'bg-red-50 text-red-700 border-red-300'
                              : isWarning
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-[#DEF2F1] text-[#2B7A78] border-[#3AAFA9]/40'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        {alert.caseId && <Cite id={alert.caseId} />}
                        <span className="text-[11px] font-mono text-[#2B7A78] flex items-center gap-1">
                          <Clock size={12} /> {alert.time}
                        </span>
                        {alert.acknowledged && (
                          <span className="text-[10px] font-mono text-[#2B7A78] bg-[#DEF2F1] px-2 py-0.5 rounded-md border border-[#3AAFA9]/40 flex items-center gap-1 font-bold">
                            <CheckCircle2 size={11} className="text-[#3AAFA9]" /> Acked by {alert.acknowledgedBy}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-extrabold text-[#17252A] truncate">{alert.title}</h4>
                      <p className="text-xs text-[#2B7A78] line-clamp-1">{alert.detail}</p>
                    </div>
                  </div>

                  <ChevronRight size={16} className="text-[#2B7A78] shrink-0 hidden sm:block" />
                </div>
              );
            })
          )}
        </div>
      </WorkPanel>

      {/* Slide-over Detail Drawer */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#17252A]/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FEFFFF] border-l border-[#B3E3DE] h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#B3E3DE]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2B7A78]">
                  Alert Details & Context
                </span>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="p-1 rounded-lg text-[#2B7A78] hover:text-[#17252A] hover:bg-[#DEF2F1] cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                      selectedAlert.severity === 'critical'
                        ? 'bg-red-50 text-red-700 border border-red-300'
                        : 'bg-amber-50 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {selectedAlert.severity}
                  </span>
                  <span className="text-xs font-mono text-[#2B7A78]">{selectedAlert.time}</span>
                </div>

                <h3 className="text-base font-extrabold text-[#17252A]">{selectedAlert.title}</h3>
                <p className="text-xs text-[#2B7A78] leading-relaxed font-medium">{selectedAlert.detail}</p>
              </div>

              {/* Context Box */}
              <div className="p-4 rounded-xl bg-[#DEF2F1] border border-[#B3E3DE] space-y-2">
                <div className="text-[10px] font-mono font-bold uppercase text-[#2B7A78]">
                  Triggering Evidence Context
                </div>
                <div className="text-xs text-[#17252A] font-mono flex items-center justify-between">
                  <span>Case Reference:</span>
                  <Cite id={selectedAlert.caseId || 'FIR-2024-8841'} />
                </div>
                <div className="text-xs text-[#17252A] font-mono flex items-center justify-between">
                  <span>Station Jurisdiction:</span>
                  <span className="text-[#2B7A78] font-bold">Bengaluru Central</span>
                </div>
              </div>
            </div>

            {/* Actions Footer with Active Button Style */}
            <div className="pt-4 border-t border-[#B3E3DE] space-y-2">
              {!selectedAlert.acknowledged ? (
                <button
                  onClick={() => handleAcknowledge(selectedAlert.id)}
                  className="w-full py-3 rounded-xl bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <CheckCircle2 size={16} className="text-[#3AAFA9]" /> Acknowledge Alert ({activeRole})
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-[#DEF2F1] border border-[#3AAFA9]/40 text-center text-xs font-bold text-[#17252A]">
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
