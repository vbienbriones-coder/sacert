import React, { useState } from 'react';
import { Announcement, PriorityLevel } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { Megaphone, Plus, Trash2, Calendar, AlertCircle, X, Bell, Users } from 'lucide-react';

export const AnnouncementCenter: React.FC = () => {
  const { currentUser } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>(db.getAnnouncements());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState('');

  const settings = db.getSettings();

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'NORMAL' as PriorityLevel,
    targetAudience: 'ALL' as 'ALL' | 'ACTIVE_ONLY' | 'SPECIFIC_DESIGNATION' | 'SPECIFIC_TRAINING_GROUP',
    targetValue: '',
    expirationDate: '',
  });

  const reload = () => setAnnouncements(db.getAnnouncements());

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const adminName = currentUser?.fullName || 'Administrator';

    db.createAnnouncement(
      {
        title: formData.title,
        message: formData.message,
        date: formData.date,
        priority: formData.priority,
        targetAudience: formData.targetAudience,
        targetValue: formData.targetValue || undefined,
        expirationDate: formData.expirationDate || undefined,
        authorName: adminName,
      },
      adminName
    );

    reload();
    setIsAddModalOpen(false);
    setMsgSuccess(`Announcement "${formData.title}" published to responder network.`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this announcement?')) {
      const adminName = currentUser?.fullName || 'Administrator';
      db.deleteAnnouncement(id, adminName);
      reload();
      setMsgSuccess('Announcement deleted.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Communication Center
            </span>
            <span className="text-xs text-slate-500">· Bulletin & Field Notices</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1">
            SACERT ANNOUNCEMENT CENTER
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Publish operational advisories, muster drills, and preparedness bulletins to responder members
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: '',
              message: '',
              date: new Date().toISOString().split('T')[0],
              priority: 'NORMAL',
              targetAudience: 'ALL',
              targetValue: '',
              expirationDate: '',
            });
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create Announcement
        </button>
      </div>

      {msgSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-lg flex items-center justify-between">
          <span>✓ {msgSuccess}</span>
          <button onClick={() => setMsgSuccess('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    ann.priority === 'EMERGENCY'
                      ? 'bg-red-600 text-white'
                      : ann.priority === 'URGENT'
                      ? 'bg-amber-600 text-white'
                      : ann.priority === 'IMPORTANT'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {ann.priority}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Target: {ann.targetAudience.replace(/_/g, ' ')}
                  {ann.targetValue ? ` (${ann.targetValue})` : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">{ann.date}</span>
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-base font-extrabold text-slate-900">{ann.title}</h2>
              <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed whitespace-pre-line">
                {ann.message}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Author: {ann.authorName}</span>
              {ann.expirationDate && <span>Valid until: {ann.expirationDate}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Create Announcement Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-slate-900 text-white p-4 border-b border-red-700 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">COMPOSE NEW ANNOUNCEMENT</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Headline Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Typhoon Season Weather Advisory & Muster"
                  className="w-full p-2 border border-slate-300 rounded font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Message Body *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Type the official message instructions for responders..."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-bold"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="IMPORTANT">IMPORTANT</option>
                    <option value="URGENT">URGENT</option>
                    <option value="EMERGENCY">EMERGENCY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="ALL">All Responders</option>
                    <option value="ACTIVE_ONLY">Active Responders Only</option>
                    <option value="SPECIFIC_DESIGNATION">Specific Designation</option>
                  </select>
                </div>
              </div>

              {formData.targetAudience === 'SPECIFIC_DESIGNATION' && (
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Select Designation</label>
                  <select
                    value={formData.targetValue}
                    onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    <option value="">Choose designation...</option>
                    {settings.designations.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Broadcast Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Expiration Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
