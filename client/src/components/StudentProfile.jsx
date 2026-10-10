import React, { useState } from 'react';
import { 
  User, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Mail, 
  Phone, 
  Award, 
  CheckCircle2, 
  Edit3, 
  Save, 
  ExternalLink 
} from 'lucide-react';
import { api } from '../services/api';

export default function StudentProfile({ currentUser, onUpdateStudent }) {
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [resumeUrl, setResumeUrl] = useState(currentUser.resumeUrl || '');
  const [skills, setSkills] = useState(currentUser.skills ? currentUser.skills.join(', ') : '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.updateStudent(currentUser.id, {
        phone,
        resumeUrl,
        skills: skillsArray
      });

      if (res.success) {
        onUpdateStudent(res.data);
        setIsEditing(false);
        setSuccessMsg('Profile credentials updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  const status = currentUser.placementStatus || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-2xl text-sky-400 overflow-hidden shadow-inner">
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              currentUser.name.charAt(0)
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-sky-400 font-mono font-bold">
                {currentUser.rollNo}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser.department} • Batch {currentUser.batch}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Contact & Resume</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Verified Academic Matrix (Read-only verified from college records) */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-sky-400" />
            Verified Academic Records (Official Registrar Data)
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase tracking-wider">
            LOCKED & VERIFIED
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 block">Cumulative CGPA</span>
            <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
              {currentUser.cgpa}
            </div>
            <span className="text-[10px] text-slate-500">Up to 6th Semester</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 block">Active Backlogs</span>
            <div className={`text-2xl font-black mt-1 font-mono ${currentUser.activeBacklogs > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {currentUser.activeBacklogs}
            </div>
            <span className="text-[10px] text-slate-500">
              {currentUser.activeBacklogs === 0 ? 'Clear record' : 'Subject backlogs pending'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 block">Class 10th %</span>
            <div className="text-2xl font-black text-sky-400 mt-1 font-mono">
              {currentUser.tenthPercentage}%
            </div>
            <span className="text-[10px] text-slate-500">Board exam score</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 block">Class 12th / Diploma %</span>
            <div className="text-2xl font-black text-sky-400 mt-1 font-mono">
              {currentUser.twelfthPercentage}%
            </div>
            <span className="text-[10px] text-slate-500">Higher secondary score</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic">
          * Note: Academic scores are synchronized directly with the University Examination Cell to prevent fraudulent applications.
        </p>
      </div>

      {/* Editable Contact, Resume, and Skills form */}
      <form onSubmit={handleSave} className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-700/60 pb-3">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          Candidate Contact & Resume Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Institutional Email
            </label>
            <input
              type="text"
              disabled
              value={currentUser.email}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-400 cursor-not-allowed font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Contact Phone
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 disabled:border-slate-800 disabled:text-slate-400 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Live Resume URL (Google Drive / GitHub / PDF)
            </span>
            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline flex items-center gap-1 text-[11px]">
                <ExternalLink className="w-3 h-3" /> Test Link
              </a>
            )}
          </label>
          <input
            type="url"
            disabled={!isEditing}
            value={resumeUrl}
            onChange={e => setResumeUrl(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 disabled:border-slate-800 disabled:text-slate-400 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Technical Skills (comma separated)
          </label>
          <input
            type="text"
            disabled={!isEditing}
            value={skills}
            onChange={e => setSkills(e.target.value)}
            placeholder="e.g. React, Node.js, Python, SQL"
            className="w-full bg-slate-900 border border-slate-700 disabled:border-slate-800 disabled:text-slate-400 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        {isEditing && (
          <div className="pt-3 border-t border-slate-700 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-md transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
