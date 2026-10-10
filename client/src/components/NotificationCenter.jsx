import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  Briefcase, 
  FileText, 
  Sparkles, 
  Send, 
  Trash2,
  ExternalLink 
} from 'lucide-react';

export default function NotificationCenter({
  announcements,
  currentUser,
  onClose,
  onPostAnnouncement,
  onDeleteAnnouncement,
  onSelectDrive
}) {
  const isTpo = currentUser.role === 'TPO';
  const [showNewForm, setShowNewForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('URGENT_DEADLINE');
  const [priority, setPriority] = useState('HIGH');

  function handleCreate(e) {
    e.preventDefault();
    if (!title || !message) return;
    onPostAnnouncement({
      title,
      message,
      category,
      priority,
      postedBy: isTpo ? currentUser.name : 'Placement Cell'
    });
    setTitle('');
    setMessage('');
    setShowNewForm(false);
  }

  const categoryStyles = {
    URGENT_DEADLINE: {
      badge: 'bg-rose-950/80 text-rose-300 border-rose-800',
      label: 'URGENT DEADLINE'
    },
    NEW_DRIVE: {
      badge: 'bg-sky-950/80 text-sky-300 border-sky-800',
      label: 'NEW DRIVE'
    },
    SHORTLIST_RELEASED: {
      badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-800',
      label: 'SHORTLIST'
    },
    POLICY_UPDATE: {
      badge: 'bg-purple-950/80 text-purple-300 border-purple-800',
      label: 'POLICY UPDATE'
    },
    GENERAL: {
      badge: 'bg-slate-800 text-slate-300 border-slate-700',
      label: 'NOTICE'
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl relative">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Central Placement Broadcasts</h3>
              <p className="text-[11px] text-slate-400">Replaces scattered WhatsApp & email noise</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action button if TPO: Compose broadcast */}
        {isTpo && (
          <div className="p-3 border-b border-slate-800 bg-slate-900/60">
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{showNewForm ? 'Cancel Compose' : '+ Broadcast Official Announcement'}</span>
            </button>
          </div>
        )}

        {/* Compose Form */}
        {showNewForm && (
          <form onSubmit={handleCreate} className="p-4 bg-slate-850 border-b border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">New TPO Broadcast</h4>
            <div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notice title..."
                className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <textarea
                required
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Important instructions (replaces WhatsApp spam)..."
                className="w-full bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-1.5 focus:outline-none"
              >
                <option value="URGENT_DEADLINE">Urgent Deadline</option>
                <option value="NEW_DRIVE">New Drive</option>
                <option value="SHORTLIST_RELEASED">Shortlist</option>
                <option value="POLICY_UPDATE">Policy Notice</option>
              </select>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg p-1.5 focus:outline-none"
              >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="NORMAL">Normal</option>
              </select>
              <button
                type="submit"
                className="ml-auto px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition"
              >
                Send
              </button>
            </div>
          </form>
        )}

        {/* Broadcasts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {announcements.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No announcements posted.
            </div>
          ) : (
            announcements.map((ann) => {
              const meta = categoryStyles[ann.category] || categoryStyles.GENERAL;

              return (
                <div
                  key={ann.id}
                  className="bg-slate-800/80 rounded-xl border border-slate-700 p-4 space-y-2 relative group transition hover:border-slate-600"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badge}`}>
                      {meta.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">
                    {ann.title}
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {ann.message}
                  </p>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{ann.postedBy}</span>

                    {/* Delete button if TPO */}
                    {isTpo && (
                      <button
                        onClick={() => onDeleteAnnouncement(ann.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
