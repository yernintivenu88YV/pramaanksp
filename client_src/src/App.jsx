import { useEffect, useState } from 'react';
import { getApiRole, setApiRole } from './api/client';
import { Sidebar } from './components/shell/Sidebar';
import { TopBar } from './components/shell/TopBar';
import { StatusBar } from './components/shell/StatusBar';
import LoginView from './components/auth/LoginView';
import OverviewView from './components/views/OverviewView';
import CasesView from './components/views/CasesView';
import AlertsView from './components/views/AlertsView';
import LiveMapView from './components/views/LiveMapView';
import EntityGraphView from './components/views/EntityGraphView';
import SimilarCasesView from './components/views/SimilarCasesView';
import ResolutionView from './components/views/ResolutionView';
import FaceRecognitionView from './components/views/FaceRecognitionView';
import AssistantView from './components/views/AssistantView';
import DocumentSearchView from './components/views/DocumentSearchView';
import UploadDocumentsView from './components/views/UploadDocumentsView';
import AuditView from './components/views/AuditView';
import HelpDeskView from './components/views/HelpDeskView';
import { RestrictedView } from './components/common/RestrictedView';
import { CommandPalette } from './components/common/CommandPalette';
import { canAccessView, firstAllowedView } from './access';

export default function App() {
  const [activeRole, setActiveRole] = useState(getApiRole());
  const [view, setView] = useState('overview');
  const [syncing, setSyncing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('pramaan_authenticated') === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [userProfile, setUserProfile] = useState({
    role: 'ACP',
    title: 'Assistant Commissioner (ACP)',
    email: 'acp.central@ksp.gov.in',
    station: 'KSP Command HQ',
    clearance: 'Level 5 - Full Command'
  });

  const handleRoleChange = (newRole) => {
    setActiveRole(newRole);
    setApiRole(newRole);
    if (!canAccessView(newRole, view)) setView(firstAllowedView(newRole));
  };

  const handleLogin = (profile) => {
    setUserProfile(profile);
    handleRoleChange(profile.role);
    setIsAuthenticated(true);
    sessionStorage.setItem('pramaan_authenticated', 'true');
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('pramaan_authenticated');
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'EN' ? 'KN' : 'EN'));
  };

  const viewAllowed = canAccessView(activeRole, view);

  useEffect(() => {
    const t = setInterval(() => {
      setSyncing(true);
      setTimeout(() => setSyncing(false), 1000);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  // MANDATORY LOGIN FIRST: If unauthenticated, show full-screen Login View before accessing data
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0E14] font-sans text-pramaan-text flex items-center justify-center p-4">
        <LoginView onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-pramaan-bg font-sans text-pramaan-text relative">
      {showLoginModal && <LoginView onLogin={handleLogin} />}

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={(viewId) => {
          if (canAccessView(activeRole, viewId)) {
            setView(viewId);
          } else {
            setView(viewId);
          }
        }}
        activeRole={activeRole}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar active={view} onChange={setView} activeRole={activeRole} language={language} />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar
            view={view}
            activeRole={activeRole}
            onRoleChange={handleRoleChange}
            onOpenLoginModal={() => setShowLoginModal(true)}
            onLogout={handleLogout}
            language={language}
            onLanguageToggle={toggleLanguage}
            onOpenCommandPalette={() => setShowCommandPalette(true)}
          />
          <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-4 lg:p-5">
            {!viewAllowed && (
              <RestrictedView
                viewKey={view}
                activeRole={activeRole}
                onRoleChange={handleRoleChange}
                onOpenLoginModal={() => setShowLoginModal(true)}
              />
            )}
            {viewAllowed && (
              <>
                {view === 'overview' && <OverviewView onOpenCase={() => setView('cases')} activeRole={activeRole} />}
                {view === 'cases' && <CasesView activeRole={activeRole} />}
                {view === 'alerts' && <AlertsView activeRole={activeRole} />}
                {view === 'map' && <LiveMapView activeRole={activeRole} />}
                {view === 'graph' && <EntityGraphView activeRole={activeRole} />}
                {view === 'similar' && <SimilarCasesView activeRole={activeRole} />}
                {view === 'resolution' && <ResolutionView activeRole={activeRole} />}
                {view === 'facerec' && <FaceRecognitionView activeRole={activeRole} />}
                {view === 'assistant' && <AssistantView activeRole={activeRole} />}
                {view === 'docsearch' && <DocumentSearchView activeRole={activeRole} />}
                {view === 'docupload' && <UploadDocumentsView activeRole={activeRole} />}
                {view === 'audit' && <AuditView activeRole={activeRole} />}
                {view === 'helpdesk' && <HelpDeskView activeRole={activeRole} />}
              </>
            )}
          </div>
        </main>
      </div>
      <StatusBar syncing={syncing} activeRole={activeRole} />
    </div>
  );
}
