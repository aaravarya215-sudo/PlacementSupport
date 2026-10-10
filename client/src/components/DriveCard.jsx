import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  AlertCircle, 
  Send, 
  FileCheck, 
  Users, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function DriveCard({
  drive,
  currentUser,
  onOpenEligibility,
  onApply,
  onAuditBatch
}) {
  const isTpo = currentUser.role === 'TPO';
  const eligibility = drive.eligibility;
  const hasApplied = drive.hasApplied;

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    function calculateTime() {
      const diff = new Date(drive.registrationDeadline) - new Date();
      if (diff <= 0) {
        setTimeLeft('Registration Closed');
        setIsUrgent(false);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);

      if (days === 0 && hours < 24) {
        setIsUrgent(true);
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setIsUrgent(false);
        setTimeLeft(`${days}d ${hours}h left`);
      }
    }

    calculateTime();
    const interval = setInterval(calculateTime, 60000);
    return () => clearInterval(interval);
  }, [drive.registrationDeadline]);

  // Tier color styling
  const tierBadges = {
    TIER_1_SUPER_DREAM: {
      label: 'Super Dream (>12 LPA)',
      bg: 'bg-purple-950/60 text-purple-300 border-purple-800/80',
      tag: 'from-purple-500 to-indigo-500'
    },
    TIER_2_DREAM: {
      label: 'Dream (6-12 LPA)',
      bg: 'bg-blue-950/60 text-blue-300 border-blue-800/80',
      tag: 'from-blue-500 to-sky-500'
    },
    TIER_3_REGULAR: {
      label: 'Regular / Mass (<6 LPA)',
      bg: 'bg-slate-800 text-slate-300 border-slate-700',
      tag: 'from-slate-500 to-slate-600'
    }
  };

  const tierInfo = tierBadges[drive.tier] || tierBadges.TIER_3_REGULAR;

  return (
    <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 hover:border-slate-600 transition-all shadow-xl shadow-slate-950/40 flex flex-col justify-between overflow-hidden group">
      {/* Card Header */}
      <div>
        {/* Tier top accent bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${tierInfo.tag}`} />

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center p-2 text-white font-bold text-lg overflow-hidden shadow-inner">
                {drive.companyLogo && drive.companyLogo.startsWith('http') ? (
                  <img 
                    src={drive.companyLogo} 
                    alt={drive.companyName} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentElement.innerHTML = drive.companyName.charAt(0);
                    }}
                  />
                ) : (
                  drive.companyName.charAt(0)
                )}
              </div>
              <div>
                <h3 className="font-bold text-base text-white group-hover:text-sky-300 transition flex items-center gap-1.5">
                  {drive.companyName}
                  {drive.ctcLpa >= 20 && (
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  )}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {drive.role}
                </p>
              </div>
            </div>

            {/* CTC Pill */}
            <div className="text-right">
              <div className="text-lg font-extrabold text-emerald-400">
                ₹{drive.ctcLpa} <span className="text-xs font-semibold text-emerald-500/90">LPA</span>
              </div>
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tierInfo.bg}`}>
                {tierInfo.label}
              </span>
            </div>
          </div>

          {/* Quick Meta tags: Location, Deadline, Industry */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 my-3 pb-3 border-b border-slate-700/60">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{drive.jobLocation}</span>
            </div>
            <div className={`flex items-center gap-1.5 font-medium ${isUrgent ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-400'}`}>
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{timeLeft}</span>
            </div>
          </div>

          {/* Eligibility Criteria Highlights */}
          <div className="space-y-2 mb-4">
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700 font-mono">
                Min CGPA: {drive.eligibilityCriteria?.minCgpa || 'No bar'}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-700 font-mono">
                Max Backlogs: {drive.eligibilityCriteria?.maxActiveBacklogs ?? 0}
              </span>
              {drive.eligibilityCriteria?.genderRestriction === 'FEMALE_ONLY' && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-pink-950/60 text-pink-300 border border-pink-800 font-semibold">
                  Women in Tech
                </span>
              )}
            </div>

            {/* Branch tags */}
            <div className="text-[11px] text-slate-400">
              <span className="text-slate-500">Allowed: </span>
              {drive.eligibilityCriteria?.eligibleBranches?.map(b => b.split(' ')[0]).join(', ') || 'All Branches'}
            </div>
          </div>

          {/* STUDENT-SPECIFIC ELIGIBILITY BANNER */}
          {!isTpo && eligibility && (
            <div className="mb-4">
              {hasApplied ? (
                <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-800 text-sky-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <span className="font-semibold block">Application Submitted</span>
                      <span className="text-[10px] text-sky-400/80">Stage: {drive.application?.status || 'In Review'}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-sky-800/80 text-[10px] font-bold">
                    ACTIVE
                  </span>
                </div>
              ) : eligibility.isEligible ? (
                <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold">You are 100% Eligible to apply</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    VERIFIED
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="font-semibold">Ineligible to Register</span>
                  </div>
                  <p className="text-[11px] text-rose-200/80 truncate">
                    {eligibility.blockingReasons[0] || 'Criteria mismatch'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 bg-slate-900/60 border-t border-slate-700/60 flex items-center justify-between gap-2">
        {/* Breakdown Button */}
        <button
          onClick={() => onOpenEligibility(drive)}
          className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition py-1 px-2 rounded-lg hover:bg-slate-800"
        >
          <span>Eligibility Breakdown</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Action Button */}
        {isTpo ? (
          <button
            onClick={() => onAuditBatch(drive)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Audit Batch ({drive.totalApplicants || 0} applied)</span>
          </button>
        ) : hasApplied ? (
          <button
            disabled
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Applied</span>
          </button>
        ) : eligibility && eligibility.isEligible ? (
          <button
            onClick={() => onApply(drive)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Apply Now</span>
          </button>
        ) : (
          <button
            onClick={() => onOpenEligibility(drive)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 hover:border-rose-800 transition"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>Ineligible</span>
          </button>
        )}
      </div>
    </div>
  );
}
