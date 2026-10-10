import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  FileText, 
  Clock, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';

export default function AuditLogView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await api.getAuditLogs();
      if (res.success) setLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }

  const actionStyles = {
    APPLICATION_BLOCKED_POLICY: {
      badge: 'bg-rose-950 text-rose-300 border-rose-800',
      label: 'POLICY BLOCK',
      icon: Lock
    },
    APPLICATION_BLOCKED_CRITERIA: {
      badge: 'bg-amber-950 text-amber-300 border-amber-800',
      label: 'CRITERIA REJECT',
      icon: AlertTriangle
    },
    ELIGIBILITY_PASSED_APPLICATION: {
      badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      label: 'VERIFIED REGISTRATION',
      icon: CheckCircle2
    },
    CANDIDATE_OFFERED: {
      badge: 'bg-purple-950 text-purple-300 border-purple-800',
      label: 'PLACEMENT & TIER LOCK',
      icon: ShieldCheck
    },
    DRIVE_PUBLISHED: {
      badge: 'bg-sky-950 text-sky-300 border-sky-800',
      label: 'DRIVE CREATED',
      icon: FileText
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Eligibility & Misplacement Audit Trail</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete compliance ledger tracking prevented violations, offer hoarding locks, and verified candidate submissions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
          title="Refresh Log"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Log Entries */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl space-y-3">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No audit logs recorded yet.</div>
        ) : (
          logs.map((log) => {
            const meta = actionStyles[log.action] || {
              badge: 'bg-slate-800 text-slate-300 border-slate-700',
              label: log.action,
              icon: FileText
            };
            const Icon = meta.icon;

            return (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/70 space-y-2 hover:border-slate-600 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.badge}`}>
                      <Icon className="w-3 h-3" />
                      {meta.label}
                    </span>
                    {log.companyName && (
                      <span className="text-xs font-semibold text-white">
                        {log.companyName}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {log.reason}
                </p>

                {log.studentName && (
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                    <span>Student: <strong className="text-slate-300">{log.studentName}</strong> ({log.rollNo || log.studentId})</span>
                    {log.tier && <span className="text-purple-400 font-semibold">{log.tier}</span>}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
