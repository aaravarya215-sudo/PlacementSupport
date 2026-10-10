import React from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  DollarSign, 
  Calendar,
  Send,
  HelpCircle
} from 'lucide-react';

export default function EligibilityModal({
  drive,
  currentUser,
  onClose,
  onApply
}) {
  if (!drive) return null;

  const isTpo = currentUser.role === 'TPO';
  const eligibility = drive.eligibility;
  const isEligible = eligibility?.isEligible;
  const checks = eligibility?.checks || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sky-400">
              {drive.companyName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{drive.companyName}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  ₹{drive.ctcLpa} LPA
                </span>
              </div>
              <p className="text-xs text-slate-400">{drive.role} • Automated Eligibility Audit</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Evaluation Summary Banner */}
        <div className="p-5 border-b border-slate-800">
          {isTpo ? (
            <div className="p-3 rounded-xl bg-sky-950/50 border border-sky-800 text-sky-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>You are viewing institutional criteria parameters in Administrator Mode.</span>
            </div>
          ) : isEligible ? (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-emerald-300">You are Fully Eligible to Apply!</h4>
                <p className="text-xs text-emerald-400/90 mt-0.5">
                  All academic criteria, backlog policies, branch requirements, and placement tier rules have been successfully verified.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-rose-300">Application Restricted - Eligibility Criteria Not Met</h4>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  The automated eligibility engine prevented registration to avoid misplacement and rule violations. Review the checklist below:
                </p>
                {eligibility?.blockingReasons && eligibility.blockingReasons.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-rose-300 font-medium list-disc list-inside">
                    {eligibility.blockingReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Granular Checklist Table */}
        <div className="p-5 max-h-[50vh] overflow-y-auto space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            Verification Parameter Matrix
          </h3>

          <div className="space-y-2">
            {checks.map((c) => (
              <div
                key={c.id}
                className={`p-3 rounded-xl border transition ${
                  c.passed 
                    ? 'bg-slate-850/80 border-slate-800' 
                    : 'bg-rose-950/20 border-rose-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {c.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">{c.label}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${c.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {c.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{c.message}</p>
                    </div>
                  </div>

                  <div className="text-right text-[11px] shrink-0 font-mono">
                    <span className="text-slate-500 block">Required: {c.required}</span>
                    <span className={`font-semibold ${c.passed ? 'text-slate-300' : 'text-rose-400'}`}>
                      Your Record: {c.actual}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hiring Workflow / Rounds */}
          {drive.rounds && drive.rounds.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Scheduled Selection Rounds
              </h4>
              <div className="space-y-2">
                {drive.rounds.map((rnd, idx) => (
                  <div key={rnd.id || idx} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white mr-2">Round {idx + 1}: {rnd.name}</span>
                      <span className="text-slate-400 text-[11px] block sm:inline">({rnd.mode})</span>
                    </div>
                    <span className="text-[11px] text-sky-400 font-mono shrink-0">{rnd.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Criteria synchronized with official TPO database</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              Close
            </button>
            {!isTpo && !drive.hasApplied && isEligible && (
              <button
                onClick={() => {
                  onClose();
                  onApply(drive);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Apply for this Drive</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
