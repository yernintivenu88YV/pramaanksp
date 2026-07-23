import { useEffect, useState } from 'react';
import { getApiRole, setApiRole } from './api/client';
import { Sidebar } from './components/shell/Sidebar';
import { TopBar } from './components/shell/TopBar';
import { StatusBar } from './components/shell/StatusBar';
import OverviewView from './components/views/OverviewView';
import CasesView from './components/views/CasesView';
import AlertsView from './components/views/AlertsView';
import LiveMapView from './components/views/LiveMapView';
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

  useEffect(() => {
    const t = setInterval(() => {
      setSyncing(true);
      setTimeout(() => setSyncing(false), 1000);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-pramaan-bg font-sans text-pramaan-text">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar active={view} onChange={setView} />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar view={view} activeRole={activeRole} onRoleChange={handleRoleChange} />
          <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-4 lg:p-5">
            {view === 'overview' && <OverviewView onOpenCase={() => setView('cases')} />}
            {view === 'cases' && <CasesView />}
            {view === 'alerts' && <AlertsView />}
            {view === 'map' && <LiveMapView />}
            {view === 'graph' && <EntityGraphView />}
            {view === 'similar' && <SimilarCasesView />}
            {view === 'resolution' && <ResolutionView />}
            {view === 'assistant' && <AssistantView />}
            {view === 'audit' && <AuditView />}
          </div>
        </main>
      </div>
      <StatusBar syncing={syncing} activeRole={activeRole} />
    </div>
  );
}
