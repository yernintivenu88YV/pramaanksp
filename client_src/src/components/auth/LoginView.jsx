import React, { useState } from 'react';
import { Shield, Lock, User, Building, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Controls.jsx';

const ROLES_CONFIG = [
  {
    role: 'SI',
    title: 'Sub-Inspector (SI)',
    email: 'si.bengaluru@ksp.gov.in',
    clearance: 'Level 2 - Field Ops',
    station: 'Bengaluru Central PS',
    badgeTone: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    desc: 'Local station case registration, suspect priority scoring, and modus operandi case twins.'
  },
  {
    role: 'IO',
    title: 'Investigating Officer (IO)',
    email: 'io.crime@ksp.gov.in',
    clearance: 'Level 3 - Tactical',
    station: 'Bengaluru Crime Branch',
    badgeTone: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    desc: 'Accused record management, identity resolution, and active warrant verification.'
  },
  {
    role: 'ACP',
    title: 'Assistant Commissioner (ACP)',
    email: 'acp.central@ksp.gov.in',
    clearance: 'Level 5 - Full Command',
    station: 'KSP Command HQ',
    badgeTone: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    desc: 'Full command floor access, dossier PDF exports, threat priority overrides, and cross-district analytics.'
  },
  {
    role: 'Analyst',
    title: 'Crime Intelligence Analyst',
    email: 'analyst.geoint@ksp.gov.in',
    clearance: 'Level 4 - GEOINT & Graph',
    station: 'Intelligence Division',
    badgeTone: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    desc: 'Spatial hotspot density maps, cell tower signal triangulation, and graph community detection.'
  },
  {
    role: 'Policy',
    title: 'Policy Auditor',
    email: 'auditor.policy@ksp.gov.in',
    clearance: 'Level 1 - Compliance',
    station: 'State Security Council',
    badgeTone: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    desc: 'Tamper-evident audit compliance ledgers, system logs, and aggregate crime trend statistics.'
  }
];

export default function LoginView({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState('ACP');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const activeConfig = ROLES_CONFIG.find((r) => r.role === selectedRole) || ROLES_CONFIG[0];

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({
        role: activeConfig.role,
        title: activeConfig.title,
        email: activeConfig.email,
        station: activeConfig.station,
        clearance: activeConfig.clearance
      });
    }, 600);
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#07090c]/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-xl border border-pramaan-border bg-pramaan-surface shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_380px]">
        {/* Left Panel: Role Level Selector */}
        <div className="p-6 border-b border-pramaan-border md:border-b-0 md:border-r bg-pramaan-bg/40">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pramaan-primary/40 bg-pramaan-primary/10 text-pramaan-primary">
              <Shield size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-pramaan-text">PRAMAAN</h1>
              <p className="text-xs text-pramaan-text-secondary">Karnataka State Police Intelligence Platform</p>
            </div>
          </div>

          <h2 className="text-xs font-semibold uppercase tracking-wider text-pramaan-text-secondary mb-3">
            Select Security Clearance Level
          </h2>

          <div className="space-y-2.5">
            {ROLES_CONFIG.map((config) => {
              const isSelected = config.role === selectedRole;
              return (
                <div
                  key={config.role}
                  onClick={() => setSelectedRole(config.role)}
                  className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
                    isSelected
                      ? 'border-pramaan-primary bg-pramaan-primary/10 shadow-sm'
                      : 'border-pramaan-border bg-pramaan-elevated/40 hover:border-pramaan-border-strong hover:bg-pramaan-elevated'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-pramaan-text">{config.title}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${config.badgeTone}`}>
                      {config.clearance}
                    </span>
                  </div>
                  <p className="text-xs text-pramaan-text-secondary line-clamp-2">{config.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Authentication Credentials */}
        <div className="p-6 flex flex-col justify-between bg-pramaan-surface">
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-pramaan-primary">Security Portal</span>
              <h3 className="text-lg font-bold text-pramaan-text mt-1">Officer Authentication</h3>
              <p className="text-xs text-pramaan-text-secondary mt-1">Sign in with government KGID / KSP credentials.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-pramaan-text-secondary mb-1.5 flex items-center gap-1.5">
                  <User size={14} /> Official Email / KGID
                </label>
                <input
                  type="email"
                  readOnly
                  value={activeConfig.email}
                  className="w-full rounded-md border border-pramaan-border bg-pramaan-elevated px-3 py-2 text-sm text-pramaan-text outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-pramaan-text-secondary mb-1.5 flex items-center gap-1.5">
                  <Building size={14} /> Assigned Police Station
                </label>
                <input
                  type="text"
                  readOnly
                  value={activeConfig.station}
                  className="w-full rounded-md border border-pramaan-border bg-pramaan-elevated px-3 py-2 text-sm text-pramaan-text outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-pramaan-text-secondary mb-1.5 flex items-center gap-1.5">
                  <Lock size={14} /> Security Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-pramaan-border bg-pramaan-elevated px-3 py-2 text-sm text-pramaan-text outline-none font-mono"
                />
              </div>

              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 flex items-start gap-2">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                <div>
                  <span className="font-semibold block">Authenticated Role: {activeConfig.role}</span>
                  Access granted according to KSP security clearance boundaries.
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full py-2.5 text-sm font-semibold justify-center">
                {loading ? 'Authenticating Credentials...' : 'Authenticate & Enter Command Floor'}
                {!loading && <ArrowRight size={16} className="ml-1" />}
              </Button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-pramaan-border text-center text-[11px] text-pramaan-text-secondary">
            Karnataka State Police · Confidential Security Clearance
          </div>
        </div>
      </div>
    </div>
  );
}
