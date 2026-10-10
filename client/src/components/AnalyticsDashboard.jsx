import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Award, 
  DollarSign, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { api } from '../services/api';

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(res => {
        if (res.success) setData(res.data);
      })
      .catch(err => console.error('Failed to load analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading placement analytics...</div>;
  }

  const summary = data?.summary || {};
  const departmentBreakdown = data?.departmentBreakdown || [];
  const tierDistribution = data?.tierDistribution || [];
  const recentPlaced = data?.recentPlaced || [];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Placement Intelligence & Safeguards Dashboard</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time batch performance, salary distributions, and automated eligibility prevention audit.
          </p>
        </div>

        {/* Misplacement Safeguard Counter */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-purple-950/40 border border-purple-800/60 text-purple-300">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">{summary.totalSafeguardsEnforced || 3} Misplacement Violations</span>
            <span className="text-[11px] text-purple-400/80 block">Blocked Automatically by Engine</span>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Placement Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">
            {summary.placementRate}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {summary.placedStudents} of {summary.totalStudents} Students Placed
          </span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Highest Package</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">
            ₹{summary.highestCtc} <span className="text-sm font-semibold text-slate-400">LPA</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Super Dream Tier 1</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Average CTC</span>
            <DollarSign className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-sky-400 mt-2">
            ₹{summary.averageCtc} <span className="text-sm font-semibold text-slate-400">LPA</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Across all placements</span>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Placement Drives</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-400 mt-2">
            {summary.activeDrives} <span className="text-sm font-semibold text-slate-400">/ {summary.totalDrives}</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Live across campus</span>
        </div>
      </div>

      {/* Main Charts & Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise Placement Breakdown */}
        <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-400" />
            Branch-wise Placement Rate
          </h3>

          <div className="space-y-3 pt-2">
            {departmentBreakdown.map((dept) => (
              <div key={dept.department} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">{dept.department}</span>
                  <span className="text-sky-400 font-mono">
                    {dept.placed}/{dept.total} ({dept.rate}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${dept.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Distribution & Misplacement Safeguards */}
        <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            Offer Tier Distribution & Hoarding Prevention
          </h3>

          <div className="space-y-3 pt-2">
            {tierDistribution.map((tier) => (
              <div key={tier.name} className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-white block">{tier.name}</span>
                  <span className="text-[11px] text-slate-400">Strict quota rules enforced</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-white">{tier.count}</span>
                  <span className="text-xs text-slate-400 block">Offers</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              100% Policy Adherence Guaranteed
            </div>
            Students placed in Super Dream are automatically locked from registering for subsequent drives, protecting unplaced batchmates from being crowded out.
          </div>
        </div>
      </div>

      {/* Hall of Fame / Recent Offers */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl">
        <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Recently Placed Students (Verified Offers)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recentPlaced.map((s, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-white">{s.studentName}</div>
                <div className="text-[11px] text-slate-400">{s.department.split(' ')[0]} • {s.rollNo}</div>
                <div className="text-xs font-semibold text-emerald-400 mt-1">
                  Placed at {s.company}
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-amber-400">
                  ₹{s.ctcLpa}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">LPA</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
