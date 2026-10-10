import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  Lock, 
  Unlock, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp 
} from 'lucide-react';

export default function PlacementPolicyGuide({ currentUser }) {
  const currentStatus = currentUser.placementStatus || {};

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 shadow-xl">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-bold text-white">Institutional Placement Policy & Anti-Misplacement Rules</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Designed to ensure fair distribution of job offers across the batch, prevent offer-hoarding by top candidates, and maximize overall university placement rate.
        </p>
      </div>

      {/* Student's Current Policy Standing */}
      {currentUser.role === 'STUDENT' && (
        <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Your Current Policy Standing
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              currentStatus.isPlaced 
                ? 'bg-purple-950 text-purple-300 border border-purple-800' 
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}>
              {currentStatus.isPlaced ? `Placed @ ${currentStatus.company}` : 'Unplaced Candidate'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 space-y-2">
            {currentStatus.isPlaced ? (
              <>
                <p>
                  You are currently placed in <strong>{currentStatus.company}</strong> at <strong>₹{currentStatus.ctcLpa} LPA</strong> ({currentStatus.tier === 'TIER_1_SUPER_DREAM' ? 'Super Dream Tier 1' : 'Dream Tier 2'}).
                </p>
                <div className="p-3 rounded-lg bg-slate-850 border border-slate-700 text-[11px] text-sky-300">
                  {currentStatus.tier === 'TIER_1_SUPER_DREAM' ? (
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-purple-400 shrink-0" />
                      <strong>Tier 1 Lock Active:</strong> You hold the premier institutional tier offer. Additional campus applications are locked to preserve opportunities for unplaced batchmates.
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-sky-400 shrink-0" />
                      <strong>Upgrade Permitted:</strong> You are eligible to apply <em>only</em> for Super Dream drives offering CTC &ge; ₹{(currentStatus.ctcLpa * 1.4).toFixed(1)} LPA (1.4x current CTC).
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>You hold full application clearance across all Tier 1, Tier 2, and Tier 3 placement drives as long as you satisfy company-specific academic criteria.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3 Tier Structure Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1 */}
        <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-800/80 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Tier 1</span>
            <Award className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="font-extrabold text-lg text-white">Super Dream</h3>
          <div className="text-xl font-black text-purple-300">&gt; ₹12.0 LPA</div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Premier tech giants, quantitative finance firms, and global R&D centers (e.g. Google, Microsoft, Adobe, Cisco).
          </p>
          <div className="pt-2 border-t border-purple-900/60 text-[11px] text-purple-300/80 font-medium">
            &bull; Students placed here are locked from future campus drives to eliminate offer hoarding.
          </div>
        </div>

        {/* Tier 2 */}
        <div className="p-5 rounded-2xl bg-blue-950/30 border border-blue-800/80 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Tier 2</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="font-extrabold text-lg text-white">Dream</h3>
          <div className="text-xl font-black text-blue-300">₹6.0 – ₹12.0 LPA</div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Product engineering, high-growth startups, and specialized tech consulting (e.g. Deloitte, L&T Core, TCS Digital).
          </p>
          <div className="pt-2 border-t border-blue-900/60 text-[11px] text-blue-300/80 font-medium">
            &bull; Students can upgrade only to Tier 1 Super Dream if the offer is at least 1.4x of current CTC.
          </div>
        </div>

        {/* Tier 3 */}
        <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tier 3</span>
            <ShieldCheck className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="font-extrabold text-lg text-white">Regular / Mass</h3>
          <div className="text-xl font-black text-slate-300">&lt; ₹6.0 LPA</div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Mass recruiters, foundational IT service providers, and operational analyst positions (e.g. TCS Ninja, Infosys, Wipro).
          </p>
          <div className="pt-2 border-t border-slate-700 text-[11px] text-slate-400 font-medium">
            &bull; Students can freely upgrade to Dream or Super Dream tiers upon qualifying.
          </div>
        </div>
      </div>

      {/* Why PlacePulse Solves Misplacement */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-5 shadow-xl space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Why Traditional WhatsApp & Email Drives Cause Misplacement
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-rose-900/40 space-y-1">
            <span className="font-bold text-rose-400 block">The WhatsApp / Google Form Breakdown</span>
            <p className="text-slate-400 leading-relaxed">
              In WhatsApp groups, PDF notices get lost under casual chat. Ineligible students unknowingly submit Google forms, while truly eligible students miss registration deadlines. TPOs spend weeks manually sanity-checking spreadsheets.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-900/40 space-y-1">
            <span className="font-bold text-emerald-400 block">The PlacePulse Automated Engine</span>
            <p className="text-slate-400 leading-relaxed">
              Every student is authenticated with their verified university records. The dynamic eligibility engine mathematically evaluates CGPA, backlogs, branch, and tier policies before allowing application submission, preventing 100% of invalid applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
