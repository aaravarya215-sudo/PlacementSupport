import React from 'react';
import { 
  Briefcase, 
  ShieldCheck, 
  Bell, 
  GraduationCap, 
  UserCheck, 
  BarChart3, 
  FileText, 
  Users, 
  Layers, 
  AlertTriangle 
} from 'lucide-react';

export default function Header({
  currentUser,
  allStudents,
  onSelectUser,
  currentTab,
  onSelectTab,
  unreadAnnouncementsCount,
  onOpenNotifications,
  onOpenNewDrive
}) {
  const isTpo = currentUser.role === 'TPO';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      {/* Top Banner: Institutional identity & Persona Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-400 bg-clip-text text-transparent">
                PlacePulse
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full">
                Placement OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Apex Institute of Technology • Training & Placement Cell
            </p>
          </div>
        </div>

        {/* Persona Switcher Dropdown */}
        <div className="flex items-center gap-2.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-1.5 pl-2 text-xs text-slate-400">
            <UserCheck className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline font-medium">Switch Persona:</span>
          </div>

          <select
            value={isTpo ? 'tpo' : currentUser.id}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'tpo') {
                onSelectUser({ role: 'TPO', name: 'Dr. Rajesh Sharma (Head TPO)' });
              } else {
                const found = allStudents.find(s => s.id === val);
                if (found) onSelectUser({ role: 'STUDENT', ...found });
              }
            }}
            className="bg-slate-900 text-xs font-semibold text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <optgroup label="TPO Administration">
              <option value="tpo">🎓 Dr. Rajesh Sharma (Head TPO Admin)</option>
            </optgroup>
            <optgroup label="Sample Students (Test Eligibility & Safeguards)">
              {allStudents.map(std => (
                <option key={std.id} value={std.id}>
                  👤 {std.name} ({std.department.split(' ')[0]} • CGPA {std.cgpa} • {std.placementStatus?.isPlaced ? `Placed @ ${std.placementStatus.company}` : 'Unplaced'})
                </option>
              ))}
            </optgroup>
          </select>

          {/* Quick status pill */}
          {!isTpo && (
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-slate-900 border border-slate-700">
              <span className={`w-2 h-2 rounded-full ${currentUser.placementStatus?.isPlaced ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-slate-300">
                {currentUser.placementStatus?.isPlaced 
                  ? `Placed: ${currentUser.placementStatus.company} (${currentUser.placementStatus.ctcLpa} LPA)` 
                  : 'Unplaced (Eligible for all tiers)'}
              </span>
            </div>
          )}

          {/* WhatsApp Replacement Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition"
            title="Official Broadcasts & Alerts (Replaces WhatsApp)"
          >
            <Bell className="w-4 h-4 text-sky-400" />
            {unreadAnnouncementsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadAnnouncementsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto py-2 gap-4">
          <nav className="flex space-x-1 sm:space-x-2">
            {isTpo ? (
              // TPO Tabs
              <>
                <button
                  onClick={() => onSelectTab('drives')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'drives'
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Drives Hub
                </button>
                <button
                  onClick={() => onSelectTab('batch-audit')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'batch-audit'
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Batch Eligibility Auditor
                </button>
                <button
                  onClick={() => onSelectTab('applications')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'applications'
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Applicant Pipeline
                </button>
                <button
                  onClick={() => onSelectTab('analytics')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'analytics'
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Placement Analytics
                </button>
                <button
                  onClick={() => onSelectTab('audit-logs')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'audit-logs'
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Misplacement Audit Log
                </button>
              </>
            ) : (
              // Student Tabs
              <>
                <button
                  onClick={() => onSelectTab('drives')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'drives'
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Placement Drives
                </button>
                <button
                  onClick={() => onSelectTab('my-applications')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'my-applications'
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  My Applications & Rounds
                </button>
                <button
                  onClick={() => onSelectTab('profile')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'profile'
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Academic Profile & Resume
                </button>
                <button
                  onClick={() => onSelectTab('policy-guide')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentTab === 'policy-guide'
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Placement Policy
                </button>
              </>
            )}
          </nav>

          {/* Action button if TPO: Post Drive */}
          {isTpo && (
            <button
              onClick={onOpenNewDrive}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg shadow-sm transition whitespace-nowrap"
            >
              <span>+ Post New Drive</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
