import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DriveCard from './components/DriveCard';
import EligibilityModal from './components/EligibilityModal';
import ApplyModal from './components/ApplyModal';
import BatchAuditor from './components/BatchAuditor';
import ApplicationsManager from './components/ApplicationsManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import NotificationCenter from './components/NotificationCenter';
import PlacementPolicyGuide from './components/PlacementPolicyGuide';
import StudentProfile from './components/StudentProfile';
import AuditLogView from './components/AuditLogView';
import NewDriveModal from './components/NewDriveModal';
import { api } from './services/api';
import { 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function App() {
  const [allStudents, setAllStudents] = useState([]);
  const [currentUser, setCurrentUser] = useState({ role: 'TPO', name: 'Dr. Rajesh Sharma' });
  const [currentTab, setCurrentTab] = useState('drives'); // 'drives', 'batch-audit', 'applications', 'analytics', 'audit-logs', 'my-applications', 'profile', 'policy-guide'
  
  const [drives, setDrives] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters on Drives Hub
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL'); // 'ALL', 'ELIGIBLE', 'TIER_1_SUPER_DREAM', 'TIER_2_DREAM', 'TIER_3_REGULAR'

  // Modals & Drawers
  const [selectedEligibilityDrive, setSelectedEligibilityDrive] = useState(null);
  const [selectedApplyDrive, setSelectedApplyDrive] = useState(null);
  const [showNewDriveModal, setShowNewDriveModal] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [selectedAuditDriveId, setSelectedAuditDriveId] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState(null);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  // Load initial dataset
  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    try {
      const [studentsRes, annRes] = await Promise.all([
        api.getStudents(),
        api.getAnnouncements()
      ]);

      if (studentsRes.success && studentsRes.data.length > 0) {
        setAllStudents(studentsRes.data);
        // Default to student 1 (Aarav Sharma) for immediate demonstration of eligibility engine
        const aarav = studentsRes.data[0];
        setCurrentUser({ role: 'STUDENT', ...aarav });
      }

      if (annRes.success) {
        setAnnouncements(annRes.data);
      }
    } catch (err) {
      console.error('Initial data load error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Refresh drives whenever currentUser changes (to re-evaluate eligibility)
  useEffect(() => {
    if (!currentUser) return;
    refreshDrives();
  }, [currentUser?.id, currentUser?.role]);

  async function refreshDrives() {
    try {
      if (currentUser.role === 'STUDENT' && currentUser.id) {
        const res = await api.getStudentEligibleDrives(currentUser.id);
        if (res.success) {
          setDrives(res.data);
          if (!selectedAuditDriveId && res.data.length > 0) {
            setSelectedAuditDriveId(res.data[0].id);
          }
        }
      } else {
        const res = await api.getDrives();
        if (res.success) {
          setDrives(res.data);
          if (!selectedAuditDriveId && res.data.length > 0) {
            setSelectedAuditDriveId(res.data[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to refresh drives:', err);
    }
  }

  // Handle persona selection
  function handleSelectUser(user) {
    setCurrentUser(user);
    if (user.role === 'TPO') {
      if (['my-applications', 'profile'].includes(currentTab)) {
        setCurrentTab('drives');
      }
    } else {
      if (['batch-audit', 'audit-logs'].includes(currentTab)) {
        setCurrentTab('drives');
      }
    }
    showToast(`Switched persona to ${user.name}`);
  }

  // Handle application success
  function handleApplicationSuccess(app, drive) {
    showToast(`Application to ${drive.companyName} submitted successfully! Verified by Eligibility Engine.`);
    refreshDrives();
  }

  // Handle TPO Broadcast reminder to unapplied eligible students
  async function handleBroadcastReminder(drive, unappliedCount) {
    try {
      await api.createAnnouncement({
        title: `URGENT: ${drive.companyName} Registration Closing Soon`,
        message: `Attention! ${unappliedCount} eligible students have not registered yet for ${drive.role} (₹${drive.ctcLpa} LPA). Don't miss this opportunity - verify and apply via PlacePulse portal today!`,
        category: 'URGENT_DEADLINE',
        priority: 'HIGH',
        driveId: drive.id,
        companyName: drive.companyName
      });

      const annRes = await api.getAnnouncements();
      if (annRes.success) setAnnouncements(annRes.data);

      showToast(`Targeted reminder broadcast posted to portal for ${unappliedCount} eligible students!`);
    } catch (err) {
      alert('Failed to send reminder: ' + err.message);
    }
  }

  // Filter drives
  const filteredDrives = drives.filter(drive => {
    const matchesSearch = 
      drive.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drive.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (drive.description && drive.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (tierFilter === 'ELIGIBLE') {
      return drive.eligibility && drive.eligibility.isEligible;
    }
    if (tierFilter !== 'ALL') {
      return drive.tier === tierFilter;
    }
    return true;
  });

  const isTpo = currentUser.role === 'TPO';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Toast popup */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className={`p-4 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border ${
            toast.type === 'success' 
              ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
              : 'bg-rose-950 text-rose-300 border-rose-800'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        currentUser={currentUser}
        allStudents={allStudents}
        onSelectUser={handleSelectUser}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unreadAnnouncementsCount={announcements.length}
        onOpenNotifications={() => setShowNotificationDrawer(true)}
        onOpenNewDrive={() => setShowNewDriveModal(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* DRIVES HUB VIEW */}
        {currentTab === 'drives' && (
          <div className="space-y-6">
            {/* Hero / Filter Bar */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>Centralized Campus Placement Drives</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      Live Portal
                    </span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    All company drives, salary structures, deadlines, and automated eligibility criteria verified in one central hub.
                  </p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search company, role, skill..."
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-700/60 pb-1">
                <button
                  onClick={() => setTierFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    tierFilter === 'ALL'
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  All Active Drives ({drives.length})
                </button>

                {!isTpo && (
                  <button
                    onClick={() => setTierFilter('ELIGIBLE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                      tierFilter === 'ELIGIBLE'
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-800/60'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Eligible for Me ({drives.filter(d => d.eligibility?.isEligible).length})</span>
                  </button>
                )}

                <button
                  onClick={() => setTierFilter('TIER_1_SUPER_DREAM')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    tierFilter === 'TIER_1_SUPER_DREAM'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-900 text-purple-300 hover:bg-slate-800'
                  }`}
                >
                  Super Dream (&gt;12 LPA)
                </button>

                <button
                  onClick={() => setTierFilter('TIER_2_DREAM')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    tierFilter === 'TIER_2_DREAM'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-blue-300 hover:bg-slate-800'
                  }`}
                >
                  Dream (6-12 LPA)
                </button>

                <button
                  onClick={() => setTierFilter('TIER_3_REGULAR')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    tierFilter === 'TIER_3_REGULAR'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Regular / Mass (&lt;6 LPA)
                </button>
              </div>
            </div>

            {/* Drives Grid */}
            {filteredDrives.length === 0 ? (
              <div className="p-12 text-center bg-slate-850 rounded-2xl border border-slate-800 text-slate-400">
                <p className="font-semibold text-sm">No placement drives found matching your filter.</p>
                <button
                  onClick={() => { setTierFilter('ALL'); setSearchQuery(''); }}
                  className="mt-3 text-xs text-sky-400 hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredDrives.map(drive => (
                  <DriveCard
                    key={drive.id}
                    drive={drive}
                    currentUser={currentUser}
                    onOpenEligibility={(d) => setSelectedEligibilityDrive(d)}
                    onApply={(d) => setSelectedApplyDrive(d)}
                    onAuditBatch={(d) => {
                      setSelectedAuditDriveId(d.id);
                      setCurrentTab('batch-audit');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TPO: BATCH ELIGIBILITY AUDITOR VIEW */}
        {currentTab === 'batch-audit' && (
          <BatchAuditor
            drives={drives}
            selectedDriveId={selectedAuditDriveId}
            onSelectDriveId={setSelectedAuditDriveId}
            onBroadcastReminder={handleBroadcastReminder}
          />
        )}

        {/* APPLICATIONS PIPELINE (TPO or Student) */}
        {(currentTab === 'applications' || currentTab === 'my-applications') && (
          <ApplicationsManager
            currentUser={currentUser}
            drives={drives}
            onRefreshData={refreshDrives}
          />
        )}

        {/* PLACEMENT ANALYTICS DASHBOARD */}
        {currentTab === 'analytics' && (
          <AnalyticsDashboard />
        )}

        {/* AUDIT LOG TRAIL */}
        {currentTab === 'audit-logs' && (
          <AuditLogView />
        )}

        {/* STUDENT PROFILE & VERIFIED ACADEMIC CREDENTIALS */}
        {currentTab === 'profile' && (
          <StudentProfile
            currentUser={currentUser}
            onUpdateStudent={(updated) => {
              setCurrentUser({ role: 'STUDENT', ...updated });
              setAllStudents(allStudents.map(s => s.id === updated.id ? updated : s));
              refreshDrives();
              showToast('Student credentials updated');
            }}
          />
        )}

        {/* PLACEMENT POLICY GUIDE */}
        {currentTab === 'policy-guide' && (
          <PlacementPolicyGuide currentUser={currentUser} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-5 text-center text-xs text-slate-500">
        <p>PlacePulse &copy; 2026 • Automated Campus Placement & Dynamic Eligibility Verification System</p>
        <p className="text-[11px] text-slate-600 mt-1">
          Eliminating WhatsApp noise, missed deadlines, and student misplacement through algorithmic policy enforcement.
        </p>
      </footer>

      {/* MODALS */}
      {selectedEligibilityDrive && (
        <EligibilityModal
          drive={selectedEligibilityDrive}
          currentUser={currentUser}
          onClose={() => setSelectedEligibilityDrive(null)}
          onApply={(d) => setSelectedApplyDrive(d)}
        />
      )}

      {selectedApplyDrive && (
        <ApplyModal
          drive={selectedApplyDrive}
          currentUser={currentUser}
          onClose={() => setSelectedApplyDrive(null)}
          onSubmitSuccess={handleApplicationSuccess}
        />
      )}

      {showNewDriveModal && (
        <NewDriveModal
          onClose={() => setShowNewDriveModal(false)}
          onDriveCreated={(newDrive) => {
            refreshDrives();
            showToast(`Drive for ${newDrive.companyName} published and broadcasted!`);
          }}
        />
      )}

      {showNotificationDrawer && (
        <NotificationCenter
          announcements={announcements}
          currentUser={currentUser}
          onClose={() => setShowNotificationDrawer(false)}
          onPostAnnouncement={async (data) => {
            const res = await api.createAnnouncement(data);
            if (res.success) {
              const annRes = await api.getAnnouncements();
              if (annRes.success) setAnnouncements(annRes.data);
              showToast('Broadcast published to all students!');
            }
          }}
          onDeleteAnnouncement={async (id) => {
            await api.deleteAnnouncement(id);
            setAnnouncements(announcements.filter(a => a.id !== id));
            showToast('Announcement deleted');
          }}
          onSelectDrive={(driveId) => {
            setShowNotificationDrawer(false);
            setCurrentTab('drives');
          }}
        />
      )}
    </div>
  );
}
