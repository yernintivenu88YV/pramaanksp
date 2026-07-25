import React, { useState } from 'react';
import { Shield, Lock, User, Building, CheckCircle2, ArrowRight, UserPlus, LogIn, Mail, BadgeCheck } from 'lucide-react';
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
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [selectedRole, setSelectedRole] = useState('ACP');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    name: '',
    badgeNo: '',
    station: 'Bengaluru Central PS',
    role: 'IO',
    email: '',
    password: ''
  });
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const activeConfig = ROLES_CONFIG.find((r) => r.role === selectedRole) || ROLES_CONFIG[0];

  function handleSubmitSignIn(e) {
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
    }, 500);
  }

  function handleSubmitSignUp(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSignUpSuccess(true);
      setTimeout(() => {
        const matchingConfig = ROLES_CONFIG.find((r) => r.role === signUpData.role) || ROLES_CONFIG[1];
        onLogin({
          role: matchingConfig.role,
          title: `${signUpData.name || 'Officer'} (${matchingConfig.title})`,
          email: signUpData.email || matchingConfig.email,
          station: signUpData.station || matchingConfig.station,
          clearance: matchingConfig.clearance
        });
      }, 800);
    }, 600);
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#07090c]/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-xl border border-pramaan-border bg-pramaan-surface shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_380px]">
        {/* Left Panel: Role Level Selector or Sign Up Info */}
        <div className="p-6 border-b border-pramaan-border md:border-b-0 md:border-r bg-pramaan-bg/40">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pramaan-primary/40 bg-pramaan-primary/10 text-pramaan-primary">
                <Shield size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-pramaan-text">PRAMAAN</h1>
                <p className="text-xs text-pramaan-text-secondary">Karnataka State Police Security Portal</p>
              </div>
            </div>

            {/* Auth Mode Toggle Pills */}
            <div className="flex items-center rounded-lg bg-pramaan-elevated border border-pramaan-border p-0.5">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  authMode === 'signin' ? 'bg-pramaan-primary text-pramaan-bg font-bold' : 'text-pramaan-text-secondary hover:text-pramaan-text'
                }`}
              >
                <LogIn size={12} /> Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  authMode === 'signup' ? 'bg-pramaan-primary text-pramaan-bg font-bold' : 'text-pramaan-text-secondary hover:text-pramaan-text'
                }`}
              >
                <UserPlus size={12} /> Register
              </button>
            </div>
          </div>

          {authMode === 'signin' ? (
            <>
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
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'border-pramaan-primary bg-pramaan-primary/10 shadow-sm'
                          : 'border-pramaan-border bg-pramaan-elevated/40 hover:border-pramaan-border-strong hover:bg-pramaan-elevated'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        <CheckCircle2
                          size={16}
                          className={isSelected ? 'text-pramaan-primary' : 'text-pramaan-text-secondary/30'}
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-pramaan-text">{config.title}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${config.badgeTone}`}>
                            {config.clearance}
                          </span>
                        </div>
                        <p className="text-[11px] text-pramaan-text-secondary leading-snug">{config.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-pramaan-text-secondary">
                Karnataka Officer Credential Registration
              </h2>
              <p className="text-xs text-pramaan-text-secondary leading-relaxed">
                New officers can request access clearance for their assigned police station jurisdiction. Submitted credentials are validated against the KSP Duty Roster.
              </p>

              <div className="rounded-lg border border-pramaan-primary/30 bg-pramaan-primary/10 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-pramaan-primary">
                  <BadgeCheck size={16} /> Official Authorization Requirements:
                </div>
                <ul className="text-[11px] text-pramaan-text-secondary space-y-1.5 list-disc list-inside">
                  <li>Valid KSP Officer Email Address (`@ksp.gov.in`)</li>
                  <li>Assigned Police Station Unit ID</li>
                  <li>Clearance Level Matching Duty Assignment</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Authentication Form */}
        <div className="p-6 flex flex-col justify-between bg-pramaan-surface">
          {authMode === 'signin' ? (
            <form onSubmit={handleSubmitSignIn} className="space-y-5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-pramaan-primary font-bold block mb-1">
                  Step 2 of 2
                </span>
                <h3 className="text-base font-bold text-pramaan-text">Authenticate Credentials</h3>
                <p className="text-xs text-pramaan-text-secondary mt-0.5">
                  Confirm clearance for <strong className="text-pramaan-text">{activeConfig.title}</strong>
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-pramaan-text-secondary uppercase tracking-wider block mb-1">
                    Officer Email
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-pramaan-border bg-pramaan-elevated px-3 py-2 text-xs font-mono text-pramaan-text">
                    <User size={14} className="text-pramaan-primary shrink-0" />
                    <input
                      type="email"
                      readOnly
                      value={activeConfig.email}
                      className="w-full bg-transparent outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-pramaan-text-secondary uppercase tracking-wider block mb-1">
                    Security Station
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-pramaan-border bg-pramaan-elevated px-3 py-2 text-xs font-mono text-pramaan-text">
                    <Building size={14} className="text-pramaan-secondary shrink-0" />
                    <span className="truncate">{activeConfig.station}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-pramaan-text-secondary uppercase tracking-wider block mb-1">
                    Passcode / Key
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-pramaan-border bg-pramaan-elevated px-3 py-2 text-xs font-mono text-pramaan-text">
                    <Lock size={14} className="text-pramaan-primary shrink-0" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter security key..."
                      className="w-full bg-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full justify-center py-2.5 text-xs font-bold">
                {loading ? 'Authenticating...' : 'Authenticate & Enter Floor'} <ArrowRight size={14} />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmitSignUp} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-pramaan-text">Officer Registration</h3>
                <p className="text-xs text-pramaan-text-secondary mt-0.5">Create your KSP intelligence account</p>
              </div>

              {signUpSuccess ? (
                <div className="rounded-lg border border-pramaan-success/40 bg-pramaan-success/15 p-4 text-xs text-pramaan-success space-y-1">
                  <span className="font-bold block">Registration Submitted!</span>
                  <span>Credentials verified. Redirecting to command floor...</span>
                </div>
              ) : (
                <>
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[10px] font-semibold text-pramaan-text-secondary uppercase block mb-1">
                        Full Officer Name
                      </label>
                      <input
                        required
                        type="text"
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                        placeholder="e.g. Inspector R. Patil"
                        className="w-full rounded-md border border-pramaan-border bg-pramaan-elevated px-3 py-1.5 text-xs text-pramaan-text outline-none focus:border-pramaan-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-pramaan-text-secondary uppercase block mb-1">
                        KSP Email Address
                      </label>
                      <input
                        required
                        type="email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        placeholder="officer.name@ksp.gov.in"
                        className="w-full rounded-md border border-pramaan-border bg-pramaan-elevated px-3 py-1.5 text-xs text-pramaan-text outline-none focus:border-pramaan-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-pramaan-text-secondary uppercase block mb-1">
                          Role
                        </label>
                        <select
                          value={signUpData.role}
                          onChange={(e) => setSignUpData({ ...signUpData, role: e.target.value })}
                          className="w-full rounded-md border border-pramaan-border bg-pramaan-elevated px-2 py-1.5 text-xs font-bold text-pramaan-primary outline-none"
                        >
                          <option value="SI">SI (Sub-Inspector)</option>
                          <option value="IO">IO (Investigating Officer)</option>
                          <option value="ACP">ACP (Commissioner)</option>
                          <option value="Analyst">Crime Analyst</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-pramaan-text-secondary uppercase block mb-1">
                          Station
                        </label>
                        <input
                          type="text"
                          value={signUpData.station}
                          onChange={(e) => setSignUpData({ ...signUpData, station: e.target.value })}
                          placeholder="Station name"
                          className="w-full rounded-md border border-pramaan-border bg-pramaan-elevated px-2.5 py-1.5 text-xs text-pramaan-text outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full justify-center py-2.5 text-xs font-bold mt-2">
                    {loading ? 'Submitting Request...' : 'Submit & Register Access'} <ArrowRight size={14} />
                  </Button>
                </>
              )}
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-pramaan-border text-center text-[10px] text-pramaan-text-secondary font-mono">
            KSP Command Floor Access Control v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
