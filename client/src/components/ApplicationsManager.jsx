import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Building2, 
  Sparkles, 
  Award,
  ChevronRight,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';

const STAGES = [
  { id: 'APPLIED', label: 'Applied', color: 'slate' },
  { id: 'SHORTLISTED_FOR_OA', label: 'Shortlisted for OA', color: 'blue' },
  { id: 'OA_CLEARED', label: 'OA Cleared', color: 'indigo' },
  { id: 'TECH_ROUND_1', label: 'Tech Round 1', color: 'purple' },
  { id: 'TECH_ROUND_2', label: 'Tech Round 2', color: 'violet' },
  { id: 'HR_ROUND', label: 'HR / Leadership', color: 'amber' },
  { id: 'OFFERED', label: 'Selected / Offered', color: 'emerald' },
  { id: 'REJECTED', label: 'Not Selected', color: 'rose' }
];

export default function ApplicationsManager({
  currentUser,
  drives,
  onRefreshData
}) {
  const isTpo = currentUser.role === 'TPO';
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriveFilter, setSelectedDriveFilter] = useState('ALL');
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  useEffect(() => {
    loadApplications();
  }, [currentUser.id, isTpo]);

  async function loadApplications() {
    setLoading(true);
    try {
      if (isTpo) {
        const res = await api.getApplications();
        if (res.success) setApplications(res.data);
      } else {
        const res = await api.getStudentApplications(currentUser.id);
        if (res.success) setApplications(res.data);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(applicationId, newStatus) {
    setStatusUpdatingId(applicationId);
    try {
      const res = await api.updateApplicationStatus(applicationId, {
        status: newStatus,
        notes: `Stage updated to ${newStatus} by TPO Admin.`
      });
      if (res.success) {
        await loadApplications();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      alert('Failed to update stage: ' + err.message);
    } finally {
      setStatusUpdatingId(null);
    }
  }

  const filteredApps = applications.filter(app => {
    if (selectedDriveFilter !== 'ALL' && app.driveId !== selectedDriveFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">
              {isTpo ? 'Applicant Hiring Pipeline & Round Manager' : 'My Placement Applications & Interview Schedule'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isTpo 
              ? 'Advance candidate stages across rounds, schedule technical panels, and finalize offers.' 
              : 'Real-time hiring status tracker with round schedules and venue/links.'}
          </p>
        </div>

        {/* Filter by Drive */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedDriveFilter}
            onChange={(e) => setSelectedDriveFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Drives ({applications.length} applications)</option>
            {drives.map(d => (
              <option key={d.id} value={d.id}>
                {d.companyName} ({d.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading candidate pipelines...</div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 text-center bg-slate-850 rounded-2xl border border-slate-800 text-slate-400">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="font-semibold text-sm">No applications found in this view.</p>
          <p className="text-xs text-slate-500 mt-1">
            {isTpo ? 'Wait for eligible students to register or broadcast a reminder.' : 'Check the Drives Hub to apply for eligible companies.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const drive = app.drive || {};
            const student = app.student || currentUser;
            const currentStageIndex = STAGES.findIndex(s => s.id === app.status);

            return (
              <div
                key={app.id}
                className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl space-y-4 transition hover:border-slate-600"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-sky-400 text-base">
                      {drive.companyName ? drive.companyName.charAt(0) : 'C'}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white flex items-center gap-2">
                        {drive.companyName || 'Placement Drive'}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-mono">
                          ₹{drive.ctcLpa} LPA
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        {drive.role} • Applied on {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Student info if TPO */}
                  {isTpo && student && (
                    <div className="text-right sm:text-right bg-slate-900/60 p-2 rounded-xl border border-slate-700/60">
                      <div className="font-bold text-xs text-white">{student.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {student.rollNo} • {student.department?.split(' ')[0]} • CGPA {student.cgpa}
                      </div>
                    </div>
                  )}
                </div>

                {/* VISUAL ROUND PROGRESSION STEPPER */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Hiring Stage Pipeline
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto pb-2">
                    {STAGES.filter(s => s.id !== 'REJECTED').map((stage, idx) => {
                      const isCompleted = currentStageIndex >= idx && app.status !== 'REJECTED';
                      const isCurrent = app.status === stage.id;

                      return (
                        <div key={stage.id} className="flex items-center gap-1 shrink-0">
                          <div
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                              isCurrent
                                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                                : isCompleted
                                ? 'bg-slate-700 text-slate-200'
                                : 'bg-slate-900 text-slate-500'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                            )}
                            <span className="whitespace-nowrap">{stage.label}</span>
                          </div>
                          {idx < STAGES.filter(s => s.id !== 'REJECTED').length - 1 && (
                            <div className={`w-3 h-0.5 ${isCompleted ? 'bg-slate-600' : 'bg-slate-800'}`} />
                          )}
                        </div>
                      );
                    })}

                    {app.status === 'REJECTED' && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        Not Selected
                      </span>
                    )}
                  </div>
                </div>

                {/* Interview Schedule or Notes banner */}
                {app.interviewSchedule && (
                  <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/80 text-indigo-200 text-xs flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-bold text-indigo-300">
                        Interview Scheduled: {app.interviewSchedule.roundName}
                      </div>
                      <div className="text-[11px] text-indigo-300/80">
                        Time: {new Date(app.interviewSchedule.date).toLocaleString()} • Venue: {app.interviewSchedule.venue}
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Update Dropdown for TPO */}
                {isTpo && (
                  <div className="pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">Change Round Stage:</span>
                      <select
                        value={app.status}
                        disabled={statusUpdatingId === app.id}
                        onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer"
                      >
                        {STAGES.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                      {app.status === 'OFFERED' && (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" /> Policy Locked
                        </span>
                      )}
                    </div>

                    {app.resumeUrl && (
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <span>View Submitted Resume</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
