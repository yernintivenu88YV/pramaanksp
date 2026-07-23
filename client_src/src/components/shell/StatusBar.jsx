import { useEffect, useState } from 'react';
import { Wifi, RefreshCw, Globe, ShieldCheck } from 'lucide-react';

export function StatusBar({ syncing, activeRole }) {
  const [clock, setClock] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = clock.toLocaleTimeString('en-GB', { hour12: false });

  return (
    <footer className="tnum flex h-8 shrink-0 items-center gap-4 border-t border-pramaan-border bg-pramaan-bg px-4 font-mono text-[9px] uppercase tracking-[0.08em] text-pramaan-text-secondary">
      <span className="flex items-center gap-1.5">
        <ShieldCheck size={11} className="text-pramaan-success" /> Secure session - KSP-DATATHON
      </span>
      <span className="hidden h-3 border-l border-pramaan-border sm:block" />
      <span className="hidden items-center gap-1.5 sm:flex">
        <Wifi size={11} className="text-pramaan-success" /> Online
      </span>
      <span className="flex items-center gap-1.5">
        <RefreshCw size={11} className={syncing ? 'animate-spin text-pramaan-primary' : ''} style={syncing ? { animationDuration: '0.9s' } : undefined} />
        {syncing ? 'Syncing' : 'Synced'}
      </span>
      <span className="ml-auto flex items-center gap-3">
        <span className="hidden items-center gap-1.5 sm:flex"><Globe size={11} />Role: {activeRole || 'SI'}</span>
        <span className="h-3 border-l border-pramaan-border" />
        <span className="text-pramaan-text">{time} IST</span>
      </span>
    </footer>
  );
}
