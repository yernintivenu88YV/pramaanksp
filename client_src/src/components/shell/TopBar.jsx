import { useState } from 'react';
import { Search, Sparkles, Command, Bell, SlidersHorizontal, Plus, ChevronRight, CircleDot } from 'lucide-react';
import { type } from '../../design/scale';

const titles = {
  overview: { title: 'Command Overview', sub: 'Watch floor' },
  cases: { title: 'Case Register', sub: 'Investigate' },
  alerts: { title: 'Alert Stream', sub: 'Watch floor' },
  map: { title: 'Live Crime Map', sub: 'Analyze' },
  graph: { title: 'Entity Graph', sub: 'Analyze' },
  similar: { title: 'Case Twin Intelligence', sub: 'Investigate' },
  resolution: { title: 'Identity Resolution', sub: 'Investigate' },
  assistant: { title: 'AI Investigation Assistant', sub: 'Analyze' },
  audit: { title: 'Audit & Compliance', sub: 'Govern' },
};

const roles = ['SI', 'ACP', 'Analyst', 'Policy'];

export function TopBar({ view, activeRole, onRoleChange }) {
  const meta = titles[view] || titles.overview;
  const [mode, setMode] = useState('search');

  return (
    <header className="flex min-h-12 shrink-0 flex-wrap items-center gap-3 border-b border-pramaan-border bg-pramaan-bg px-3 py-2 lg:h-12 lg:flex-nowrap lg:px-4 lg:py-0">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="text-pramaan-text-secondary/70" style={type.eyebrow}>{meta.sub.toUpperCase()}</span>
        <ChevronRight size={13} className="text-pramaan-text-secondary/40" />
        <span className="truncate text-pramaan-text" style={type.subheading}>{meta.title}</span>
        <span className="ml-2 hidden items-center gap-1 text-pramaan-success md:flex" style={type.micro}><CircleDot size={10} strokeWidth={2.5} className="animate-pulse" /> APP SAIL READY</span>
      </div>

      <div className="order-3 flex w-full items-center gap-1 rounded-md border border-pramaan-border bg-pramaan-surface px-1 py-1 md:order-none md:mx-auto md:max-w-xl">
        <div className="flex overflow-hidden rounded bg-pramaan-elevated">
          <ModeBtn on={mode === 'search'} onClick={() => setMode('search')} icon={Search} label="Find" />
          <ModeBtn on={mode === 'ask'} onClick={() => setMode('ask')} icon={Sparkles} label="Ask AI" />
        </div>
        <input placeholder={mode === 'search' ? 'Search cases, suspects, phones, vehicles...' : 'Ask: Find similar burglary cases to CASE-001'} className="min-w-0 flex-1 bg-transparent px-2 text-pramaan-text outline-none placeholder:text-pramaan-text-secondary/50" style={type.body} />
        <span className="mr-1 hidden items-center gap-0.5 rounded border border-pramaan-border px-1 text-pramaan-text-secondary/60 sm:flex" style={type.micro}><Command size={10} /> K</span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <select value={activeRole} onChange={(e) => onRoleChange(e.target.value)} className="h-8 rounded-md border border-pramaan-border bg-pramaan-surface px-2 text-xs font-semibold text-pramaan-text outline-none focus:border-pramaan-primary" title="Demo RBAC role">
          {roles.map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
        <IconBtn icon={SlidersHorizontal} />
        <IconBtn icon={Bell} dot />
        <button className="hidden items-center gap-1.5 rounded-md bg-pramaan-primary px-3 py-1.5 text-pramaan-bg transition-colors hover:bg-pramaan-secondary sm:flex" style={type.label}><Plus size={15} strokeWidth={2.25} /> New Case</button>
      </div>
    </header>
  );
}

function ModeBtn({ on, onClick, icon: Icon, label }) {
  return <button onClick={onClick} className={`flex items-center gap-1.5 px-2.5 py-1 transition-colors ${on ? 'bg-pramaan-primary/20 text-pramaan-secondary' : 'text-pramaan-text-secondary hover:text-pramaan-text'}`} style={type.label}><Icon size={13} strokeWidth={2} /> {label}</button>;
}

function IconBtn({ icon: Icon, dot }) {
  return <button className="relative flex h-8 w-8 items-center justify-center rounded-md border border-pramaan-border bg-pramaan-surface text-pramaan-text-secondary transition-colors hover:border-pramaan-border-strong hover:text-pramaan-text"><Icon size={15} strokeWidth={1.75} />{dot && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-pramaan-critical" />}</button>;
}
