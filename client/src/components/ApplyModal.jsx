import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Building2, 
  AlertCircle,
  ExternalLink 
} from 'lucide-react';

export default function ApplyModal({
  drive,
  currentUser,
  onClose,
  onSubmitSuccess
}) {
  const [resumeUrl, setResumeUrl] = useState(currentUser.resumeUrl || '');
  const [agreement, setAgreement] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!agreement) {
      setError('You must confirm the placement policy agreement before submitting.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.id,
          driveId: drive.id,
          customResumeUrl: resumeUrl,
          notes: notes || 'Submitted directly via PlacePulse automated verification portal'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      onSubmitSuccess(data.data, drive);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sky-400">
              {drive.companyName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Apply to {drive.companyName}</h2>
              <p className="text-xs text-slate-400">{drive.role} • CTC: ₹{drive.ctcLpa} LPA</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Verified Snapshot Preview */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-semibold border-b border-slate-700 pb-1.5">
              <span className="flex items-center gap-1.5 text-sky-400">
                <ShieldCheck className="w-4 h-4" />
                Verified Academic Profile Snapshot
              </span>
              <span>Roll: {currentUser.rollNo}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
              <div>Name: <strong className="text-white">{currentUser.name}</strong></div>
              <div>Dept: <strong className="text-white">{currentUser.department.split(' ')[0]}</strong></div>
              <div>CGPA: <strong className="text-emerald-400">{currentUser.cgpa}</strong></div>
              <div>Active Backlogs: <strong className="text-emerald-400">{currentUser.activeBacklogs}</strong></div>
            </div>
          </div>

          {/* Resume link */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Resume URL for HR Submission</span>
              {resumeUrl && (
                <a 
                  href={resumeUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-sky-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <ExternalLink className="w-3 h-3" /> Preview
                </a>
              )}
            </label>
            <input
              type="url"
              required
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              placeholder="https://drive.google.com/your-resume.pdf"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Will be compiled automatically into the candidate list for {drive.companyName}.
            </p>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Candidate Notes / Special Achievements (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              placeholder="e.g. Winner of Smart India Hackathon, published paper in IEEE..."
            />
          </div>

          {/* Policy Agreement Checkbox */}
          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={agreement}
                onChange={(e) => setAgreement(e.target.checked)}
                className="mt-0.5 rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0 w-4 h-4"
              />
              <span className="leading-relaxed">
                I hereby declare that my academic details match official college records. I understand and agree that accepting an offer from this drive will bind me to the college <strong>Placement Policy Tier Guidelines</strong> to avoid offer hoarding and give fair opportunity to batchmates.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !agreement}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white shadow-md shadow-emerald-500/20 transition"
            >
              {loading ? (
                <span>Submitting Application...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm & Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
