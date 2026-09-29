/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { EmergencyAlertModal } from './components/EmergencyAlertModal';
import { PublicVerificationModal } from './components/PublicVerificationModal';

// Views
import { LoginView } from './views/auth/LoginView';
import { AdminDashboard } from './views/admin/AdminDashboard';
import { MemberManagement } from './views/admin/MemberManagement';
import { TrainingManagement } from './views/admin/TrainingManagement';
import { CertificateManagement } from './views/admin/CertificateManagement';
import { IdManagement } from './views/admin/IdManagement';
import { AnnouncementCenter } from './views/admin/AnnouncementCenter';
import { EmergencyAlertCenter } from './views/admin/EmergencyAlertCenter';
import { AuditLogView } from './views/admin/AuditLogView';
import { ReportsView } from './views/admin/ReportsView';
import { AdminManagement } from './views/admin/AdminManagement';
import { SettingsView } from './views/admin/SettingsView';
import { RegistrationRequestsView } from './views/admin/RegistrationRequestsView';

import { MemberDashboard } from './views/member/MemberDashboard';
import { MemberProfileView } from './views/member/MemberProfileView';
import { MemberTrainingsView } from './views/member/MemberTrainingsView';
import { MemberCertificatesView } from './views/member/MemberCertificatesView';
import { MemberIdView } from './views/member/MemberIdView';
import { EmergencyContactsView } from './views/common/EmergencyContactsView';
import { NotificationsView } from './views/common/NotificationsView';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Verification modal state (supports QR scans from URL)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyType, setVerifyType] = useState<'cert' | 'member'>('cert');
  const [verifyCode, setVerifyCode] = useState('');

  // Handle URL query parameters for public QR code scans
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyParam = params.get('verify');
    const codeParam = params.get('code');

    if (verifyParam && codeParam) {
      setVerifyType(verifyParam === 'member' ? 'member' : 'cert');
      setVerifyCode(codeParam);
      setVerifyModalOpen(true);
    }
  }, []);

  // Sync default view on role switch
  useEffect(() => {
    setActiveView('dashboard');
  }, [isAdmin]);

  const handleOpenVerify = (code?: string, type: 'cert' | 'member' = 'cert') => {
    setVerifyType(type);
    setVerifyCode(code || '');
    setVerifyModalOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginView onOpenVerify={() => handleOpenVerify()} />
        <PublicVerificationModal
          isOpen={verifyModalOpen}
          onClose={() => setVerifyModalOpen(false)}
          initialType={verifyType}
          initialCode={verifyCode}
        />
      </>
    );
  }

  // Active View Renderer with Role Guards
  const renderView = () => {
    if (isAdmin) {
      switch (activeView) {
        case 'dashboard':
          return (
            <AdminDashboard
              onNavigate={(v) => setActiveView(v)}
              onOpenVerify={() => handleOpenVerify()}
            />
          );
        case 'members':
          return <MemberManagement onNavigate={setActiveView} />;
        case 'registrations':
          return <RegistrationRequestsView />;
        case 'trainings':
          return <TrainingManagement />;
        case 'certificates':
          return (
            <CertificateManagement
              onOpenVerify={(certNo) => handleOpenVerify(certNo, 'cert')}
            />
          );
        case 'id-management':
          return (
            <IdManagement
              onOpenVerify={(mId) => handleOpenVerify(mId, 'member')}
            />
          );
        case 'announcements':
          return <AnnouncementCenter />;
        case 'emergency-alerts':
          return <EmergencyAlertCenter />;
        case 'notifications':
          return <NotificationsView />;
        case 'reports':
          return <ReportsView />;
        case 'audit-log':
          return <AuditLogView />;
        case 'administrators':
          return isSuperAdmin ? <AdminManagement /> : <AdminDashboard onNavigate={setActiveView} onOpenVerify={handleOpenVerify} />;
        case 'settings':
          return <SettingsView />;
        case 'contacts':
          return <EmergencyContactsView />;
        default:
          return (
            <AdminDashboard
              onNavigate={(v) => setActiveView(v)}
              onOpenVerify={() => handleOpenVerify()}
            />
          );
      }
    } else {
      // Member Views
      switch (activeView) {
        case 'dashboard':
          return (
            <MemberDashboard
              onNavigate={(v) => setActiveView(v)}
              onOpenVerify={() => handleOpenVerify()}
            />
          );
        case 'profile':
        case 'account-settings':
          return <MemberProfileView />;
        case 'my-trainings':
          return <MemberTrainingsView />;
        case 'my-certificates':
          return (
            <MemberCertificatesView
              onOpenVerify={(certNo) => handleOpenVerify(certNo, 'cert')}
            />
          );
        case 'my-id':
          return (
            <MemberIdView
              onOpenVerify={(mId) => handleOpenVerify(mId, 'member')}
            />
          );
        case 'announcements':
          return <AnnouncementCenter />;
        case 'notifications':
          return <NotificationsView />;
        case 'contacts':
          return <EmergencyContactsView />;
        default:
          return (
            <MemberDashboard
              onNavigate={(v) => setActiveView(v)}
              onOpenVerify={() => handleOpenVerify()}
            />
          );
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Top Bar */}
      <Navbar
        onOpenVerify={() => handleOpenVerify()}
        onNavigate={(v) => setActiveView(v)}
        activeView={activeView}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={(v) => setActiveView(v)}
          className="hidden md:flex"
        />

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-100 pb-16">
          {renderView()}
        </main>
      </div>

      {/* Real-time Emergency Alert Modal Popup */}
      <EmergencyAlertModal />

      {/* Public Credential Verification Modal */}
      <PublicVerificationModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        initialType={verifyType}
        initialCode={verifyCode}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
