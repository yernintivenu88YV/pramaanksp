import { useEffect, useState } from 'react';
import { getApiRole, setApiRole } from './api/client';
import { Sidebar } from './components/shell/Sidebar';
import { TopBar } from './components/shell/TopBar';
import { StatusBar } from './components/shell/StatusBar';
import OverviewView from './components/views/OverviewView';
import CasesView from './components/views/CasesView';
import AlertsView from './components/views/AlertsView';
import EntityGraphView from './components/views/EntityGraphView';
import SimilarCasesView from './components/views/SimilarCasesView';
import ResolutionView from './components/views/ResolutionView';
import AssistantView from './components/views/AssistantView';
import AuditView from './components/views/AuditView';

export default function App() {
  const [activeRole, setActiveRole] = useState(getApiRole());
  const [view, setView] = useState('overview');
  const [syncing, setSyncing] = useState(false);

  const handleRoleChange = (newRole) => {
    setActiveRole(newRole);
    setApiRole(newRole);
  };

  // Periodic background sync indicator
  useEffect(() => {
    const t = setInterval(() => {
      setSyncing(true);
      setTimeout(() => setSyncing(false), 1400);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex h-screen min-w-[1080px] flex-col overflow-hidden bg-pramaan-bg font-sans text-pramaan-text">
      <div className="flex min-h-0 flex-1">
        {/* Left sidebar navigation */}
        <Sidebar active={view} onChange={setView} />

        {/* Main content area */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Top bar with breadcrumb + omni search */}
          <TopBar view={view} />

          {/* Scrollable view area */}
          <div className="min-h-0 flex-1 overflow-auto p-5">
            {view === 'overview' && <OverviewView onOpenCase={() => setView('cases')} />}
            {view === 'cases' && <CasesView />}
            {view === 'alerts' && <AlertsView />}
            {view === 'graph' && <EntityGraphView />}
            {view === 'similar' && <SimilarCasesView />}
            {view === 'resolution' && <ResolutionView />}
            {view === 'assistant' && <AssistantView />}
            {view === 'audit' && <AuditView />}
          </div>
        </main>
      </div>

      {/* Bottom status bar */}
      <StatusBar syncing={syncing} />
    </div>
  );
}
