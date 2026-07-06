import React, { useState } from 'react';
import { 
  Shield, Lock, User, Building, CheckCircle2, ArrowRight, 
  Eye, EyeOff
} from 'lucide-react';

/**
 * SilverStar: Renders semi-transparent rank stars matching the UI theme color scheme.
 */
function SilverStar({ cx, cy, r = 2.5, isSelected }) {
  const activeColor = isSelected ? '#3AAFA9' : '#8A97AD';
  const points = [];
  for (let i = 0; i < 5; i++) {
    const outerAngle = (i * 72 - 90) * (Math.PI / 180);
    const innerAngle = ((i + 0.5) * 72 - 90) * (Math.PI / 180);
    points.push(`${cx + r * Math.cos(outerAngle)},${cy + r * Math.sin(outerAngle)}`);
    points.push(`${cx + (r * 0.42) * Math.cos(innerAngle)},${cy + (r * 0.42) * Math.sin(innerAngle)}`);
  }
  return (
    <polygon 
      points={points.join(' ')} 
      fill={activeColor} 
      fillOpacity={isSelected ? '0.95' : '0.75'} 
      stroke={activeColor} 
      strokeWidth="0.3" 
    />
  );
}

/**
 * AshokaEmblem: Renders semi-transparent Ashoka Lions emblem matching the UI theme.
 */
function AshokaEmblem({ cx = 12, cy = 11, scale = 0.9, isSelected }) {
  const activeColor = isSelected ? '#3AAFA9' : '#8A97AD';
  return (
    <g transform={`translate(${cx - 6}, ${cy - 6}) scale(${scale})`}>
      <rect x="3" y="10" width="6" height="1.2" rx="0.3" fill={activeColor} fillOpacity="0.8" />
      <path d="M 4.5 10 C 4 7 4.5 4.5 6 2.5 C 7.5 4.5 8 7 7.5 10 Z" fill={activeColor} fillOpacity="0.9" />
      <path d="M 2.5 10 C 2 8 3 6 4.5 5 C 5 7 4.5 9 4 10 Z" fill={activeColor} fillOpacity="0.7" />
      <path d="M 9.5 10 C 10 8 9 6 7.5 5 C 7 7 7.5 9 8 10 Z" fill={activeColor} fillOpacity="0.7" />
      <circle cx="6" cy="10.6" r="0.6" fill="none" stroke="#17252A" strokeWidth="0.3" />
    </g>
  );
}

/**
 * RealPoliceRankInsignia: Renders small, semi-transparent rank badges
 * seamlessly blended into the dark teal UI design (#17252A, #2B7A78, #3AAFA9).
 */
function RealPoliceRankInsignia({ role, isSelected }) {
  const activeColor = isSelected ? '#3AAFA9' : '#8A97AD';

  return (
    <div 
      className={`relative w-8 h-10 rounded-t-md rounded-b-xs overflow-hidden transition-all flex flex-col items-center justify-center shrink-0 ${
        isSelected
          ? 'bg-[#2B7A78]/35 border border-[#3AAFA9] shadow-[0_0_10px_rgba(58,175,169,0.35)] opacity-100'
          : 'bg-[#17252A]/90 border border-[#2B7A78]/40 opacity-70 hover:opacity-100 hover:border-[#3AAFA9]/40'
      }`}
    >
      <svg className="w-full h-full p-0.5" viewBox="0 0 24 32">
        {/* Semi-Transparent Epaulette Board Outline */}
        <path d="M 3 3.5 Q 12 0.8 21 3.5 L 21 31.5 L 3 31.5 Z" fill={isSelected ? '#3AAFA9' : '#2B7A78'} fillOpacity={isSelected ? '0.15' : '0.08'} stroke={activeColor} strokeWidth="0.8" />
        
        {/* Top Button */}
        <circle cx="12" cy="3" r="1.2" fill={activeColor} fillOpacity="0.8" />

        {role === 'SI' && (
          <>
            {/* Sub-Inspector (SI): 2 Semi-Transparent Stars */}
            <SilverStar cx={12} cy={9.5} r={2.5} isSelected={isSelected} />
            <SilverStar cx={12} cy={16.5} r={2.5} isSelected={isSelected} />
            {/* Red & Blue Ribbon Stripe */}
            <rect x="3" y="25" width="18" height="2.5" fill="#EF4444" fillOpacity="0.85" />
            <rect x="3" y="27.5" width="18" height="2.5" fill="#3B82F6" fillOpacity="0.85" />
          </>
        )}

        {role === 'IO' && (
          <>
            {/* Inspector / IO: 3 Semi-Transparent Stars */}
            <SilverStar cx={12} cy={7.5} r={2.2} isSelected={isSelected} />
            <SilverStar cx={12} cy={13} r={2.2} isSelected={isSelected} />
            <SilverStar cx={12} cy={18.5} r={2.2} isSelected={isSelected} />
            {/* Red & Blue Ribbon Stripe */}
            <rect x="3" y="25" width="18" height="2.5" fill="#EF4444" fillOpacity="0.85" />
            <rect x="3" y="27.5" width="18" height="2.5" fill="#3B82F6" fillOpacity="0.85" />
          </>
        )}

        {role === 'ACP' && (
          <>
            {/* ACP / DSP: 3 Semi-Transparent Stars */}
            <SilverStar cx={12} cy={7.5} r={2.5} isSelected={isSelected} />
            <SilverStar cx={12} cy={14} r={2.5} isSelected={isSelected} />
            <SilverStar cx={12} cy={20.5} r={2.5} isSelected={isSelected} />
          </>
        )}

        {role === 'Analyst' && (
          <>
            {/* Analyst: National Emblem + Star */}
            <AshokaEmblem cx={12} cy={9.5} scale={0.8} isSelected={isSelected} />
            <SilverStar cx={12} cy={20} r={2.5} isSelected={isSelected} />
          </>
        )}

        {role === 'Policy' && (
          <>
            {/* Policy: National Emblem */}
            <AshokaEmblem cx={12} cy={14.5} scale={1.0} isSelected={isSelected} />
          </>
        )}
      </svg>
    </div>
  );
}

const ROLES_CONFIG = [
  {
    role: 'SI',
    title: 'SUB-INSPECTOR (SI)',
    email: 'si.bengaluru@ksp.gov.in',
    clearance: 'Level 2 - Field Ops',
    station: 'Bengaluru Central PS',
    desc: 'Local station case registration, suspect priority scoring, and modus operandi case twins.'
  },
  {
    role: 'IO',
    title: 'INVESTIGATING OFFICER (IO)',
    email: 'io.crime@ksp.gov.in',
    clearance: 'Level 3 - Tactical',
    station: 'Bengaluru Crime Branch',
    desc: 'Accused record management, identity resolution, and active warrant verification.'
  },
  {
    role: 'ACP',
    title: 'ASSISTANT COMMISSIONER (ACP)',
    email: 'acp.central@ksp.gov.in',
    clearance: 'Level 5 - Full Command',
    station: 'KSP Command HQ',
    desc: 'Full command floor access, dossier PDF exports, threat priority overrides, and cross-district analytics.'
  },
  {
    role: 'Analyst',
    title: 'CRIME INTELLIGENCE ANALYST',
    email: 'analyst.geoint@ksp.gov.in',
    clearance: 'Level 4 - Geoint & Graph',
    station: 'Intelligence Division',
    desc: 'Spatial hotspot density maps, cell tower signal triangulation, and graph community detection.'
  },
  {
    role: 'Policy',
    title: 'POLICY AUDITOR',
    email: 'auditor.policy@ksp.gov.in',
    clearance: 'Level 1 - Compliance',
    station: 'State Security Council',
    desc: 'Tamper-evident audit compliance ledgers, system logs, and aggregate crime trend statistics.'
  }
];

export default function LoginView({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState('ACP');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const activeConfig = ROLES_CONFIG.find((r) => r.role === selectedRole) || ROLES_CONFIG[2];
  const [customEmail, setCustomEmail] = useState(activeConfig.email);
  const [customStation, setCustomStation] = useState(activeConfig.station);

  const handleSelectRole = (roleKey) => {
    setSelectedRole(roleKey);
    const cfg = ROLES_CONFIG.find((r) => r.role === roleKey) || ROLES_CONFIG[0];
    setCustomEmail(cfg.email);
    setCustomStation(cfg.station);
  };

  function handleSubmitSignIn(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({
        role: activeConfig.role,
        title: activeConfig.title,
        email: customEmail || activeConfig.email,
        station: customStation || activeConfig.station,
        clearance: activeConfig.clearance
      });
    }, 400);
  }

  return (
    <div className="fixed inset-0 z-[1000] w-screen h-screen bg-[#DEF2F1] overflow-hidden flex flex-col lg:flex-row font-sans select-none">
      
      {/* LEFT PANEL: Deep Dark Slate (#17252A) Section */}
      <div 
        className="relative w-full lg:w-[44%] h-full bg-[#17252A] text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between z-20 shadow-2xl overflow-y-auto"
        style={{
          clipPath: 'polygon(0% 0%, 93% 0%, 93% 32%, 100% 42%, 100% 58%, 93% 68%, 93% 100%, 0% 100%)'
        }}
      >
        {/* Subtle Background Glows */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#3AAFA9]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#2B7A78]/20 rounded-full blur-3xl pointer-events-none" />

        {/* SVG Teal Accent Line along the polygon cut */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-30 hidden lg:block" 
          preserveAspectRatio="none" 
          viewBox="0 0 100 100"
        >
          <path 
            d="M 93 0 L 93 32 L 100 42 L 100 58 L 93 68 L 93 100" 
            fill="none" 
            stroke="#3AAFA9" 
            strokeWidth="0.7" 
            vectorEffect="non-scaling-stroke" 
          />
        </svg>

        <div className="relative z-10 space-y-5 max-w-lg mx-auto lg:mx-0 w-full pt-1 sm:pt-2">
          
          {/* Header Branding */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#3AAFA9]/40 bg-[#2B7A78]/20 text-[#3AAFA9] shadow-md shrink-0">
              <Shield size={26} className="text-[#3AAFA9]" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider text-white font-mono leading-none">PRAMAAN</h1>
              <p className="text-xs text-[#DEF2F1] font-medium mt-1">Karnataka State Police</p>
              <p className="text-[11px] text-[#3AAFA9]">Intelligence Platform</p>
            </div>
          </div>

          {/* Security Clearance Levels List */}
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#DEF2F1]/80 mb-3.5">
              SECURITY CLEARANCE LEVELS
            </h2>

            <div className="space-y-2.5">
              {ROLES_CONFIG.map((config) => {
                const isSelected = config.role === selectedRole;
                return (
                  <div
                    key={config.role}
                    onClick={() => handleSelectRole(config.role)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 relative ${
                      isSelected
                        ? 'border-[#3AAFA9] bg-[#2B7A78]/40 shadow-lg ring-1 ring-[#3AAFA9]/60'
                        : 'border-[#2B7A78]/40 bg-[#17252A]/80 hover:border-[#3AAFA9]/40 hover:bg-[#2B7A78]/20'
                    }`}
                  >
                    {/* Seamless Blended Police Rank Insignia Badge */}
                    <RealPoliceRankInsignia role={config.role} isSelected={isSelected} />

                    {/* Role Details */}
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs tracking-tight text-[#FEFFFF]">{config.title}</div>
                      <div
                        className={`text-[11px] font-medium transition-colors mt-0.5 ${
                          isSelected ? 'text-[#3AAFA9] font-bold' : 'text-[#DEF2F1]/70'
                        }`}
                      >
                        {config.clearance}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 mt-4 pt-3 border-t border-[#2B7A78]/40 text-[11px] text-[#DEF2F1]/70 flex items-center justify-between">
          <span>KSP Encryption Layer v2.4</span>
          <span className="text-[#3AAFA9] font-mono flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#3AAFA9] animate-pulse" /> Live System
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: Soft Ice Mint (#DEF2F1) Section */}
      <div className="relative w-full lg:w-[56%] h-full bg-[#DEF2F1] p-6 sm:p-10 lg:p-12 flex flex-col justify-between overflow-y-auto z-10">
        
        {/* Background Watermark Graphic: Letter 'P' shifted slightly left to x=54 */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
          <svg width="370" height="370" viewBox="0 0 100 100" fill="none">
            {/* Outer Shield Outline (faint stroke opacity 0.12) */}
            <path 
              d="M 50 4 L 1 18 V 50 C 1 75 25 93 50 98 C 75 93 99 75 99 50 V 18 L 50 4 Z" 
              stroke="#17252A" 
              strokeWidth="1.2" 
              strokeOpacity="0.12" 
              fill="none" 
            />
            {/* Inner Shield Accent Dotted Line (faint stroke opacity 0.10) */}
            <path 
              d="M 50 10 L 8 22 V 50 C 8 71 28 87 50 91 C 72 87 92 71 92 50 V 22 L 50 10 Z" 
              stroke="#2B7A78" 
              strokeWidth="1.0" 
              strokeDasharray="3 2" 
              strokeOpacity="0.10" 
              fill="none" 
            />
            {/* Soft Watermark Letter 'P' (shifted slightly left to x=54) */}
            <text 
              x="54" 
              y="64" 
              fontSize="48" 
              fontWeight="900" 
              fontFamily="sans-serif" 
              textAnchor="middle" 
              fill="#17252A" 
              fillOpacity="0.10"
            >
              P
            </text>
          </svg>
        </div>

        {/* Main Form Content Container */}
        <div className="relative z-10 max-w-md w-full ml-0 sm:ml-4 lg:ml-6 mr-auto my-auto py-4">
          
          {/* Header */}
          <div className="mb-6">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#2B7A78] block mb-1">
              SECURITY PORTAL
            </span>
            <h3 className="text-3xl font-extrabold text-[#17252A] tracking-tight">
              Officer Authentication
            </h3>
            <p className="text-xs text-[#2B7A78] mt-1 font-medium">
              Secure access to Karnataka State Police network
            </p>
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleSubmitSignIn} className="space-y-4">
            
            {/* Field 1: Official Email / KGID */}
            <div>
              <label className="text-xs font-semibold text-[#17252A] mb-1.5 flex items-center gap-1.5">
                <User size={14} className="text-[#2B7A78]" />
                Official Email / KGID
              </label>
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full rounded-xl border border-[#B3E3DE] bg-[#FEFFFF] px-4 py-3 text-xs text-[#17252A] placeholder-slate-400 outline-none focus:border-[#3AAFA9] focus:ring-1 focus:ring-[#3AAFA9] transition-all shadow-xs font-mono"
                placeholder="officer@ksp.gov.in"
              />
            </div>

            {/* Field 2: Assigned Police Station */}
            <div>
              <label className="text-xs font-semibold text-[#17252A] mb-1.5 flex items-center gap-1.5">
                <Building size={14} className="text-[#2B7A78]" />
                Assigned Police Station
              </label>
              <input
                type="text"
                required
                value={customStation}
                onChange={(e) => setCustomStation(e.target.value)}
                className="w-full rounded-xl border border-[#B3E3DE] bg-[#FEFFFF] px-4 py-3 text-xs text-[#17252A] placeholder-slate-400 outline-none focus:border-[#3AAFA9] focus:ring-1 focus:ring-[#3AAFA9] transition-all shadow-xs"
                placeholder="Police Station Name"
              />
            </div>

            {/* Field 3: Security Password */}
            <div>
              <label className="text-xs font-semibold text-[#17252A] mb-1.5 flex items-center gap-1.5">
                <Lock size={14} className="text-[#2B7A78]" />
                Security Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#B3E3DE] bg-[#FEFFFF] px-4 py-3 pr-11 text-xs text-[#17252A] placeholder-slate-400 outline-none focus:border-[#3AAFA9] focus:ring-1 focus:ring-[#3AAFA9] transition-all shadow-xs font-mono"
                  placeholder="Enter Security Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[#2B7A78] hover:text-[#17252A] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Checkbox & Forgot Password Link */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#17252A] select-none font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#B3E3DE] text-[#17252A] focus:ring-[#3AAFA9] cursor-pointer"
                />
                <span>Remember Me</span>
              </label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-xs text-[#2B7A78] hover:underline font-bold">
                Forgot Password?
              </a>
            </div>

            {/* Role Confirmation Card */}
            <div className="rounded-xl border border-[#B3E3DE] bg-[#FEFFFF] p-4 shadow-xs flex items-start gap-3.5 mt-5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF7F6] text-[#2B7A78] mt-0.5 border border-[#3AAFA9]/30">
                <CheckCircle2 size={16} className="text-[#3AAFA9]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-[#17252A]">
                  Authenticated Role: {activeConfig.role}
                </div>
                <div className="text-[11px] text-[#2B7A78] leading-tight mt-0.5">
                  Access granted according to KSP clearance boundaries.
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full justify-center py-3.5 px-6 rounded-xl bg-[#17252A] hover:bg-[#2B7A78] text-[#FEFFFF] font-bold text-xs tracking-wide shadow-md transition-all flex items-center gap-2.5 cursor-pointer mt-6 active:scale-[0.99]"
            >
              {loading ? 'Authenticating...' : 'Authenticate & Enter Command Floor'}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Footer branding */}
        <div className="relative z-10 mt-6 pt-4 border-t border-[#B3E3DE] text-center text-[10px] text-[#2B7A78] font-mono">
          KSP Command Floor Access Control v1.0.0
        </div>
      </div>

    </div>
  );
}
