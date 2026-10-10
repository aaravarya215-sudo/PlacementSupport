import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Bell, 
  Download, 
  Search, 
  Filter, 
  Send,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';

export default function BatchAuditor({
  drives,
  selectedDriveId,
  onSelectDriveId,
  onBroadcastReminder
}) {
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('unapplied'); // 'unapplied', 'applied', 'ineligible', 'all'
  const [searchTerm, setSearchTerm] = useState('');

  const currentDrive = drives.find(d => d.id === selectedDriveId) || drives[0];

  useEffect(() => {
    if (!currentDrive) return;

    let isMounted = true;
    setLoading(true);

    api.getDriveBatchAudit(currentDrive.id)
      .then(res => {
        if (isMounted && res.success) {
          setAuditData(res.data);
        }
      })
      .catch(err => console.error('Audit fetch failed:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [currentDrive?.id]);

  if (!currentDrive) {
    return <div className="p-8 text-center text-slate-400">No active placement drives found.</div>;
  }

  const stats = auditData?.stats || {
    totalStudents: 0,
    totalEligible: 0,
    totalIneligible: 0,
    totalApplied: 0,
    eligibleNotAppliedCount: 0,
    turnoutRate: 0
  };

  const evaluations = auditData?.allEvaluations || [];

  // Filter evaluations based on active tab and search
  const filteredList = evaluations.filter(item => {
    const matchesSearch = 
      item.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student.department.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'unapplied') return item.isEligible && !item.hasApplied;
    if (activeTab === 'applied') return item.hasApplied;
    if (activeTab === 'ineligible') return !item.isEligible;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Institutional Batch Eligibility Auditor</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Replaces manual Excel filtering. Audits the entire student database against drive criteria to eliminate misplacement.
          </p>
        </div>

        {/* Drive Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-300">Selected Drive:</label>
          <select
            value={currentDrive.id}
            onChange={(e) => onSelectDriveId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            {drives.map(d => (
              <option key={d.id} value={d.id}>
                {d.companyName} ({d.role} • ₹{d.ctcLpa} LPA)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
          <span className="text-[11px] font-semibold text-slate-400 block">Total University Batch</span>
          <div className="text-2xl font-extrabold text-white mt-1">{stats.totalStudents}</div>
          <span className="text-[11px] text-slate-500">Graduation Year 2026</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-emerald-800/60 bg-emerald-950/20">
          <span className="text-[11px] font-semibold text-emerald-400 block">100% Eligible Students</span>
          <div className="text-2xl font-extrabold text-emerald-300 mt-1">{stats.totalEligible}</div>
          <span className="text-[11px] text-emerald-500">Verified via Engine</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-rose-800/60 bg-rose-950/20">
          <span className="text-[11px] font-semibold text-rose-400 block">Ineligible / Policy Locked</span>
          <div className="text-2xl font-extrabold text-rose-300 mt-1">{stats.totalIneligible}</div>
          <span className="text-[11px] text-rose-500">Protected against misplacement</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-amber-800/60 bg-amber-950/20">
          <span className="text-[11px] font-semibold text-amber-400 block">Eligible but Unapplied</span>
          <div className="text-2xl font-extrabold text-amber-300 mt-1">{stats.eligibleNotAppliedCount}</div>
          <span className="text-[11px] text-amber-500">Potential missed opportunities!</span>
        </div>
      </div>

      {/* Anti-WhatsApp Notification Callout if there are unapplied eligible students */}
      {stats.eligibleNotAppliedCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-700/80 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <h4 className="font-bold text-sm text-amber-300">
                {stats.eligibleNotAppliedCount} Eligible Students have NOT applied yet!
              </h4>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Students often miss deadlines because updates are lost in WhatsApp groups. Trigger an urgent targeted broadcast directly to their portal.
              </p>
            </div>
          </div>

          <button
            onClick={() => onBroadcastReminder(currentDrive, stats.eligibleNotAppliedCount)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition whitespace-nowrap self-start sm:self-auto"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Deadline Reminder</span>
          </button>
        </div>
      )}

      {/* Audit Breakdown Table Section */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tab Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('unapplied')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'unapplied'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Eligible & Unapplied</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px]">
                {stats.eligibleNotAppliedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('applied')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'applied'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Applied Candidates</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px]">
                {stats.totalApplied}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ineligible')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'ineligible'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Ineligible (Blocked)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px]">
                {stats.totalIneligible}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Students ({evaluations.length})
            </button>
          </div>

          {/* Search bar & CSV export */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search roll, name, dept..."
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-sky-500 w-44 sm:w-56"
              />
            </div>

            <a
              href={`/api/applications/export/csv/${currentDrive.id}`}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Download CSV formatted for company"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </a>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Active Backlogs</th>
                <th className="py-3 px-4">Placement Status</th>
                <th className="py-3 px-4">Audit Verdict</th>
                <th className="py-3 px-4">Application Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Running automated batch eligibility verification...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No students match the current filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.student.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{item.student.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.student.rollNo}</div>
                    </td>
                    <td className="py-3 px-4">{item.student.department}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{item.student.cgpa}</td>
                    <td className="py-3 px-4 font-mono">
                      <span className={item.student.activeBacklogs > 0 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {item.student.activeBacklogs}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.student.placementStatus?.isPlaced ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950/80 text-purple-300 border border-purple-800">
                          {item.student.placementStatus.company} (₹{item.student.placementStatus.ctcLpa}L)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Unplaced</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.isEligible ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Eligible
                        </span>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                            <XCircle className="w-3 h-3" />
                            Ineligible
                          </span>
                          <span className="block text-[10px] text-rose-300/80 mt-0.5 max-w-xs truncate">
                            {item.blockingReasons[0]}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.hasApplied ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-400 border border-sky-800">
                          Registered
                        </span>
                      ) : item.isEligible ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                          Not Registered
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
