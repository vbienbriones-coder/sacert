import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { MemberTrainingSubmission, Training } from '../../types';
import { compressAndReadFile } from '../../utils/image';
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Award,
  Plus,
  FileCheck2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Upload,
  Image as ImageIcon,
  Building,
  User,
  ShieldCheck,
  X,
  FileText,
} from 'lucide-react';

export const MemberTrainingsView: React.FC = () => {
  const { currentMember, currentUser } = useAuth();
  const member = currentMember || db.getMembers()[0];

  const [activeTab, setActiveTab] = useState<'OFFICIAL' | 'SUBMISSIONS'>('OFFICIAL');
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [submissions, setSubmissions] = useState<MemberTrainingSubmission[]>([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedProofPreview, setSelectedProofPreview] = useState<string | null>(null);
  const [msgSuccess, setMsgSuccess] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Form State for Submitting Training
  const [formData, setFormData] = useState({
    title: '',
    type: 'Emergency Medical Response & Basic Life Support (BLS)',
    provider: 'San Andres Municipal Disaster Risk Reduction & Management Office (MDRRMO)',
    dateCompleted: new Date().toISOString().split('T')[0],
    startDate: '',
    endDate: '',
    hours: 16,
    venue: 'San Andres, Catanduanes',
    instructor: '',
    certificateNumber: '',
    certificateProofPhoto: '',
    description: '',
  });

  const reloadData = () => {
    if (!member) return;
    const allTrainings = db.getTrainings();
    setTrainings(allTrainings.filter((t) => t.participants.some((p) => p.memberId === member.memberId)));
    setSubmissions(db.getTrainingSubmissions(member.memberId));
  };

  useEffect(() => {
    reloadData();
    const unsub = db.subscribe(() => {
      reloadData();
    });
    return () => unsub();
  }, [member?.memberId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const compressed = await compressAndReadFile(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.85 });
      setFormData((prev) => ({ ...prev, certificateProofPhoto: compressed }));
    } catch (err) {
      console.error('File compression error', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmitTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    db.submitMemberTraining({
      memberId: member.memberId,
      memberName: member.fullName,
      title: formData.title,
      type: formData.type,
      provider: formData.provider,
      dateCompleted: formData.dateCompleted,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      hours: Number(formData.hours) || 8,
      venue: formData.venue || undefined,
      instructor: formData.instructor || undefined,
      certificateNumber: formData.certificateNumber || undefined,
      certificateProofPhoto: formData.certificateProofPhoto || undefined,
      description: formData.description || undefined,
    });

    reloadData();
    setIsSubmitModalOpen(false);
    setActiveTab('SUBMISSIONS');
    setMsgSuccess(`Training "${formData.title}" submitted successfully for Administrator verification.`);

    // Reset Form
    setFormData({
      title: '',
      type: 'Emergency Medical Response & Basic Life Support (BLS)',
      provider: 'San Andres Municipal Disaster Risk Reduction & Management Office (MDRRMO)',
      dateCompleted: new Date().toISOString().split('T')[0],
      startDate: '',
      endDate: '',
      hours: 16,
      venue: 'San Andres, Catanduanes',
      instructor: '',
      certificateNumber: '',
      certificateProofPhoto: '',
      description: '',
    });

    setTimeout(() => setMsgSuccess(''), 5000);
  };

  const pendingCount = submissions.filter((s) => s.status === 'PENDING').length;
  const approvedCount = submissions.filter((s) => s.status === 'APPROVED').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              Responder Training & Competency Record
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1">
            TRAININGS & ACCREDITATIONS
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Official competency drills, external courses, and disaster certifications for {member.fullName} (
            <span className="font-mono font-bold text-red-700">{member.memberId}</span>)
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="px-4 py-2.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg flex items-center gap-2 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Completed Training</span>
        </button>
      </div>

      {msgSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            {msgSuccess}
          </span>
          <button onClick={() => setMsgSuccess('')} className="text-emerald-700 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('OFFICIAL')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'OFFICIAL'
              ? 'border-red-700 text-red-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Accredited Drills & Courses ({trainings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SUBMISSIONS')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'SUBMISSIONS'
              ? 'border-red-700 text-red-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>My Training Submissions ({submissions.length})</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px] font-mono font-bold">
              {pendingCount} pending
            </span>
          )}
        </button>
      </div>

      {/* --- TAB 1: OFFICIAL ACCREDITED TRAININGS --- */}
      {activeTab === 'OFFICIAL' && (
        <div className="space-y-4">
          {trainings.map((t) => (
            <div key={t.id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs bg-blue-50 text-blue-900 px-2.5 py-0.5 rounded border border-blue-200">
                  {t.trainingId}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <div>
                <h2 className="text-base font-extrabold text-slate-900">{t.title}</h2>
                <span className="text-xs text-slate-500 font-semibold">
                  {t.type} · Provider: <strong className="text-slate-700">{t.provider}</strong>
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{t.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600 font-mono">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {t.startDate} to {t.endDate}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{t.hours} Accredited Hours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{t.venue}</span>
                </div>
              </div>
            </div>
          ))}

          {trainings.length === 0 && (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs space-y-3">
              <p>No assigned official trainings found for your member ID yet.</p>
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-4 py-2 bg-red-700 text-white rounded-lg font-bold text-xs hover:bg-red-800"
              >
                Submit Completed Training
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: MEMBER SUBMITTED TRAININGS & STATUS --- */}
      {activeTab === 'SUBMISSIONS' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-0.5">Accreditation Process:</strong>
              When you submit a training certificate from PRC, MDRRMO, OCD, BFP, or other accredited bodies, the SACERT
              Administrator reviews and verifies your documentation. Once approved, it is automatically accredited to your
              official competency profile and certificate history!
            </div>
          </div>

          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                    {sub.submissionNumber}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Submitted on {new Date(sub.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  {sub.status === 'PENDING' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      <Clock className="w-3 h-3 text-amber-700 animate-spin" />
                      Pending Admin Review
                    </span>
                  )}
                  {sub.status === 'APPROVED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                      Approved & Accredited
                    </span>
                  )}
                  {sub.status === 'REJECTED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                      <XCircle className="w-3.5 h-3.5 text-rose-700" />
                      Declined
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-base font-extrabold text-slate-900">{sub.title}</h2>
                <div className="text-xs text-slate-600 font-semibold flex flex-wrap gap-2 mt-1">
                  <span>Category: {sub.type}</span>
                  <span>·</span>
                  <span>
                    Provider: <strong className="text-slate-800">{sub.provider}</strong>
                  </span>
                  {sub.certificateNumber && (
                    <>
                      <span>·</span>
                      <span className="font-mono text-red-700">Cert #: {sub.certificateNumber}</span>
                    </>
                  )}
                </div>
              </div>

              {sub.description && (
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {sub.description}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-mono">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Completed: {sub.dateCompleted}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sub.hours} Training Hours</span>
                </div>
                {sub.venue && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{sub.venue}</span>
                  </div>
                )}
              </div>

              {/* Certificate Proof Preview */}
              {sub.certificateProofPhoto && (
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedProofPreview(sub.certificateProofPhoto || null)}
                    className="text-xs text-red-700 hover:text-red-900 font-bold flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    View Certificate Proof Attached
                  </button>
                </div>
              )}

              {/* Admin Review Feedback */}
              {sub.adminNotes && (
                <div
                  className={`p-3 rounded-lg text-xs border ${
                    sub.status === 'APPROVED'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <strong className="block font-bold mb-0.5">
                    Admin Feedback {sub.reviewedBy ? `(by ${sub.reviewedBy})` : ''}:
                  </strong>
                  <p>{sub.adminNotes}</p>
                  {sub.approvedTrainingId && (
                    <span className="font-mono text-[11px] mt-1 block">
                      Accredited Training ID: {sub.approvedTrainingId}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          {submissions.length === 0 && (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs space-y-3">
              <p>You have not submitted any external training certificates yet.</p>
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-4 py-2 bg-red-700 text-white rounded-lg font-bold text-xs hover:bg-red-800"
              >
                + Submit Completed Training Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- SUBMIT TRAINING MODAL --- */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 border-b border-red-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-sm text-white">SUBMIT COMPLETED TRAINING FOR APPROVAL</h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTraining} className="p-6 space-y-3.5 text-xs overflow-y-auto">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-slate-800 text-[11px]">
                Enter details of the emergency training, drill, or course you completed. Once verified by the SACERT
                Administrator, it will appear in your official competency records.
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Training / Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basic Life Support (BLS-CPR/AED) or WASAR Water Rescue"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Competency Category *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  >
                    <option value="Emergency Medical Response & Basic Life Support (BLS)">
                      Medical / BLS-CPR / First Aid
                    </option>
                    <option value="Community Emergency Response Team (CERT) Basic">CERT Standard Course</option>
                    <option value="Search and Rescue (SAR) - Urban & Mountain">Search & Rescue (SAR)</option>
                    <option value="Water Rescue & Life Saving">Water Rescue / WASAR</option>
                    <option value="Fire Safety & Suppression">Fire Auxiliary / Fire Fighting</option>
                    <option value="Disaster Risk Reduction and Management (DRRM)">DRRM & Evacuation Management</option>
                    <option value="Emergency Telecommunications & Incident Command">
                      Radio Comms & Incident Command (ICS)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Training Institution / Provider *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MDRRMO San Andres / Philippine Red Cross / BFP"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Date Completed *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateCompleted}
                    onChange={(e) => setFormData({ ...formData, dateCompleted: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Accredited Hours *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={200}
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Certificate Number</label>
                  <input
                    type="text"
                    placeholder="e.g. PRC-BLS-2026-99"
                    value={formData.certificateNumber}
                    onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Venue / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. San Andres RHU Training Center"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Lead Instructor / Facilitator</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Katherine Joy Soriano"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Upload Certificate Image / Proof */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Certificate Proof Photo / Scan (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg font-bold text-slate-700 flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>{isUploadingPhoto ? 'Processing...' : 'Upload Certificate Photo'}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.certificateProofPhoto && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Image Attached
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, certificateProofPhoto: '' })}
                        className="text-[11px] text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                {formData.certificateProofPhoto && (
                  <div className="mt-2 border border-slate-200 rounded-lg p-1 w-32 h-20 bg-slate-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={formData.certificateProofPhoto}
                      alt="Certificate Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Course Description / Skills Acquired</label>
                <textarea
                  rows={2}
                  placeholder="Outline key emergency skills demonstrated (e.g. CPR hands-on, tourniquet application, high-angle rescue, radio logging)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold transition-colors shadow-xs"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PROOF PREVIEW MODAL --- */}
      {selectedProofPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-xl overflow-hidden p-2 shadow-2xl">
            <button
              onClick={() => setSelectedProofPreview(null)}
              className="absolute top-4 right-4 z-10 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedProofPreview}
              alt="Certificate Proof"
              className="max-h-[85vh] max-w-full object-contain mx-auto rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};
