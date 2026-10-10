import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Briefcase, 
  Building2, 
  DollarSign, 
  ShieldCheck, 
  Calendar,
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';

const ALL_BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Electrical Engineering'
];

export default function NewDriveModal({
  onClose,
  onDriveCreated
}) {
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [jobLocation, setJobLocation] = useState('Bangalore / Hyderabad');
  const [ctcLpa, setCtcLpa] = useState('14.0');
  const [stipendPerMonth, setStipendPerMonth] = useState('50000');
  const [industry, setIndustry] = useState('Cloud & Software Systems');
  const [registrationDeadline, setRegistrationDeadline] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  // Criteria
  const [minCgpa, setMinCgpa] = useState('7.5');
  const [maxActiveBacklogs, setMaxActiveBacklogs] = useState('0');
  const [allowHistoryBacklogs, setAllowHistoryBacklogs] = useState(true);
  const [minTenthPercentage, setMinTenthPercentage] = useState('70');
  const [minTwelfthPercentage, setMinTwelfthPercentage] = useState('70');
  const [selectedBranches, setSelectedBranches] = useState([
    'Computer Science & Engineering',
    'Information Technology'
  ]);
  const [genderRestriction, setGenderRestriction] = useState('ALL');

  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function toggleBranch(branch) {
    if (selectedBranches.includes(branch)) {
      setSelectedBranches(selectedBranches.filter(b => b !== branch));
    } else {
      setSelectedBranches([...selectedBranches, branch]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (selectedBranches.length === 0) {
      setError('Please select at least one eligible department.');
      return;
    }

    setLoading(true);
    setError(null);

    const ctc = parseFloat(ctcLpa);
    let derivedTier = 'TIER_3_REGULAR';
    if (ctc >= 12.0) derivedTier = 'TIER_1_SUPER_DREAM';
    else if (ctc >= 6.0) derivedTier = 'TIER_2_DREAM';

    const drivePayload = {
      companyName,
      companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=0284c7&color=fff`,
      role,
      jobLocation,
      employmentType: 'Full-Time + Internship',
      ctcLpa: ctc,
      stipendPerMonth: parseInt(stipendPerMonth) || 0,
      tier: derivedTier,
      industry,
      description: description || `Campus hiring drive for ${role} at ${companyName}.`,
      registrationDeadline: new Date(registrationDeadline).toISOString(),
      driveDate: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
      eligibilityCriteria: {
        minCgpa: parseFloat(minCgpa),
        maxActiveBacklogs: parseInt(maxActiveBacklogs),
        allowHistoryBacklogs,
        minTenthPercentage: parseFloat(minTenthPercentage),
        minTwelfthPercentage: parseFloat(minTwelfthPercentage),
        eligibleBranches: selectedBranches,
        eligibleBatches: [2026],
        genderRestriction
      },
      rounds: [
        { id: 1, name: 'Online Assessment', date: 'TBD', mode: 'Proctored Online', description: 'Aptitude & Coding' },
        { id: 2, name: 'Technical Interview', date: 'TBD', mode: 'Virtual Panel', description: 'System Design & Core CS' }
      ]
    };

    try {
      const res = await api.createDrive(drivePayload);
      if (!res.success) throw new Error(res.error || 'Failed to create drive');

      // Auto broadcast notice
      await api.createAnnouncement({
        title: `NEW DRIVE: ${companyName} (${role}) Live on Portal`,
        message: `Package: ₹${ctc} LPA. Eligible: ${selectedBranches.map(b => b.split(' ')[0]).join(', ')} with CGPA >= ${minCgpa}. Deadline in 5 days.`,
        category: 'NEW_DRIVE',
        priority: 'HIGH',
        driveId: res.data.id,
        companyName
      });

      onDriveCreated(res.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8">
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Publish New Placement Drive</h2>
              <p className="text-xs text-slate-400">Configure company role and enforce automated eligibility rules</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Amazon, Oracle, Deloitte"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Job Title *</label>
              <input
                type="text"
                required
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. SDE-1, Cloud Architect"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* CTC & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">CTC (in LPA) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={ctcLpa}
                onChange={e => setCtcLpa(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Monthly Stipend (₹)</label>
              <input
                type="number"
                value={stipendPerMonth}
                onChange={e => setStipendPerMonth(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Work Location</label>
              <input
                type="text"
                value={jobLocation}
                onChange={e => setJobLocation(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Registration Deadline *</label>
            <input
              type="datetime-local"
              required
              value={registrationDeadline}
              onChange={e => setRegistrationDeadline(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          {/* ELIGIBILITY ENGINE CRITERIA BUILDER */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Automated Eligibility Engine Rules
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Min CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={minCgpa}
                  onChange={e => setMinCgpa(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Max Active Backlogs</label>
                <select
                  value={maxActiveBacklogs}
                  onChange={e => setMaxActiveBacklogs(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="0">0 (Strictly No Backlogs)</option>
                  <option value="1">Max 1 Active Backlog</option>
                  <option value="2">Max 2 Active Backlogs</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Min 10th %</label>
                <input
                  type="number"
                  value={minTenthPercentage}
                  onChange={e => setMinTenthPercentage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Min 12th %</label>
                <input
                  type="number"
                  value={minTwelfthPercentage}
                  onChange={e => setMinTwelfthPercentage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Diversity and History */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Gender Restriction</label>
                <select
                  value={genderRestriction}
                  onChange={e => setGenderRestriction(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="ALL">Open to All Candidates</option>
                  <option value="FEMALE_ONLY">Women in Tech Diversity Only</option>
                </select>
              </div>
              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={allowHistoryBacklogs}
                    onChange={e => setAllowHistoryBacklogs(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-sky-500 w-4 h-4"
                  />
                  <span>Allow Cleared / Historical Backlogs</span>
                </label>
              </div>
            </div>

            {/* Allowed Branches Multi-select */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                Eligible Academic Departments *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_BRANCHES.map(branch => {
                  const isChecked = selectedBranches.includes(branch);
                  return (
                    <button
                      type="button"
                      key={branch}
                      onClick={() => toggleBranch(branch)}
                      className={`p-2 rounded-lg text-left text-xs font-semibold border transition flex items-center justify-between ${
                        isChecked 
                          ? 'bg-sky-950/60 border-sky-600 text-sky-200' 
                          : 'bg-slate-800/40 border-slate-700 text-slate-400'
                      }`}
                    >
                      <span>{branch}</span>
                      <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-sky-400' : 'bg-slate-600'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Job Description & Tech Stack</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Overview of the company, role responsibilities, tech stacks, and rounds..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
            >
              {loading ? 'Publishing Drive...' : 'Publish Drive & Broadcast'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
