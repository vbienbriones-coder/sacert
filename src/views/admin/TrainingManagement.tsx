import React, { useState, useEffect } from 'react';
import { Training, TrainingStatus, Member, MemberTrainingSubmission } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  CheckCircle,
  X,
  FileCheck2,
  Award,
  Users,
  Image as ImageIcon,
  Check,
  XCircle,
  ShieldAlert,
  AlertCircle,
  Building,
  FileText,
  Trash2,
} from 'lucide-react';

export const TrainingManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'PROGRAMS' | 'SUBMISSIONS'>('PROGRAMS');
  const [trainings, setTrainings] = useState<Training[]>(db.getTrainings());
  const [submissions, setSubmissions] = useState<MemberTrainingSubmission[]>(db.getTrainingSubmissions());
  const members = db.getMembers();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [subStatusFilter, setSubStatusFilter] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [selectedProofPreview, setSelectedProofPreview] = useState<string | null>(null);

  // Review Submission Modal
  const [reviewingSubmission, setReviewingSubmission] = useState<MemberTrainingSubmission | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [adminReviewNotes, setAdminReviewNotes] = useState('');

  const [msgSuccess, setMsgSuccess] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    trainingId: '',
    title: '',
    type: 'Emergency Medical Response & Basic Life Support (BLS)',
    provider: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
    date: new Date().toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    venue: 'San Andres Municipal Gymnasium, Wagdas',
    instructor: 'Engr. Ronald Alcantara, MDRRM Officer',
    facilitator: 'Beatriz N. Ramos, Training Lead',
    hours: 24,
    description: '',
    status: 'UPCOMING' as TrainingStatus,
    selectedMemberIds: [] as string[],
  });

  const reloadData = () => {
    setTrainings(db.getTrainings());
    setSubmissions(db.getTrainingSubmissions());
  };

  useEffect(() => {
    const unsub = db.subscribe(() => {
      reloadData();
    });
    return () => unsub();
  }, []);

  const openAddModal = () => {
    const nextId = db.getNextTrainingId();
    setFormData({
      trainingId: nextId,
      title: '',
      type: 'Disaster Preparedness & Response',
      provider: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
      date: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      venue: 'San Andres Municipal Gymnasium',
      instructor: 'Engr. Ronald Alcantara',
      facilitator: 'Beatriz N. Ramos',
      hours: 16,
      description: 'Hands-on practical training and theoretical emergency protocols.',
      status: 'UPCOMING',
      selectedMemberIds: members.map((m) => m.memberId).slice(0, 3),
    });
    setIsAddModalOpen(true);
  };

  const handleSaveTraining = (e: React.FormEvent) => {
    e.preventDefault();
    const adminName = currentUser?.fullName || 'Administrator';

    const participants = formData.selectedMemberIds.map((memId) => {
      const mem = members.find((m) => m.memberId === memId);
      return {
        memberId: memId,
        memberName: mem?.fullName || memId,
        status: formData.status === 'COMPLETED' ? ('COMPLETED' as const) : ('REGISTERED' as const),
        completedDate: formData.status === 'COMPLETED' ? formData.endDate : undefined,
      };
    });

    db.createTraining(
      {
        trainingId: formData.trainingId,
        title: formData.title,
        type: formData.type,
        provider: formData.provider,
        date: formData.date,
        startDate: formData.startDate,
        endDate: formData.endDate,
        venue: formData.venue,
        instructor: formData.instructor,
        facilitator: formData.facilitator,
        hours: Number(formData.hours),
        description: formData.description,
        status: formData.status,
        participants,
      },
      adminName
    );

    reloadData();
    setIsAddModalOpen(false);
    setMsgSuccess(`Training "${formData.title}" (${formData.trainingId}) created successfully.`);
    setTimeout(() => setMsgSuccess(''), 4000);
  };

  const handleMarkCompleted = (training: Training) => {
    const adminName = currentUser?.fullName || 'Administrator';
    const updatedParticipants = training.participants.map((p) => ({
      ...p,
      status: 'COMPLETED' as const,
      completedDate: new Date().toISOString().split('T')[0],
    }));

    db.updateTraining(
      training.id,
      {
        status: 'COMPLETED',
        participants: updatedParticipants,
      },
      adminName
    );

    reloadData();
    setMsgSuccess(`Training "${training.title}" marked as COMPLETED.`);
    setTimeout(() => setMsgSuccess(''), 4000);
  };

  const handleToggleParticipant = (memberId: string) => {
    setFormData((prev) => {
      const exists = prev.selectedMemberIds.includes(memberId);
      return {
        ...prev,
        selectedMemberIds: exists
          ? prev.selectedMemberIds.filter((id) => id !== memberId)
          : [...prev.selectedMemberIds, memberId],
      };
    });
  };

  // --- SUBMISSION APPROVAL / REJECTION HANDLERS ---
  const handleOpenReview = (sub: MemberTrainingSubmission, action: 'APPROVE' | 'REJECT') => {
    setReviewingSubmission(sub);
    setReviewAction(action);
    setAdminReviewNotes(
      action === 'APPROVE'
        ? 'Verified and accredited into official SACERT responder competency profile.'
        : 'Please provide clearer documentation or valid issuing authority certificate.'
    );
  };

  const handleConfirmReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSubmission || !reviewAction) return;

    const adminName = currentUser?.fullName || 'Administrator';

    if (reviewAction === 'APPROVE') {
      const res = db.approveTrainingSubmission(reviewingSubmission.id, adminReviewNotes, adminName);
      if (res.success) {
        setMsgSuccess(
          `Approved! "${reviewingSubmission.title}" accredited to ${reviewingSubmission.memberName}. Created Training Record & Certificate.`
        );
      }
    } else {
      db.rejectTrainingSubmission(reviewingSubmission.id, adminReviewNotes, adminName);
      setMsgSuccess(`Training submission "${reviewingSubmission.title}" declined.`);
    }

    reloadData();
    setReviewingSubmission(null);
    setReviewAction(null);
    setTimeout(() => setMsgSuccess(''), 5000);
  };

  const handleDeleteSubmission = (sub: MemberTrainingSubmission) => {
    if (!window.confirm(`Delete submission "${sub.title}" by ${sub.memberName}?`)) return;
    const adminName = currentUser?.fullName || 'Administrator';
    db.deleteTrainingSubmission(sub.id, adminName);
    reloadData();
    setMsgSuccess('Submission removed.');
    setTimeout(() => setMsgSuccess(''), 3000);
  };

  // Filters
  const filteredTrainings = trainings.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQ =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.trainingId.toLowerCase().includes(q) ||
      t.provider.toLowerCase().includes(q) ||
      t.instructor.toLowerCase().includes(q);

    const matchS = statusFilter === 'ALL' || t.status === statusFilter;
    return matchQ && matchS;
  });

  const filteredSubmissions = submissions.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQ =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.submissionNumber.toLowerCase().includes(q) ||
      s.memberName.toLowerCase().includes(q) ||
      s.memberId.toLowerCase().includes(q) ||
      s.provider.toLowerCase().includes(q);

    const matchS = subStatusFilter === 'ALL' || s.status === subStatusFilter;
    return matchQ && matchS;
  });

  const pendingSubmissionsCount = submissions.filter((s) => s.status === 'PENDING').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              Competency & Training Directorate
            </span>
            <span className="text-xs text-slate-500">· {trainings.length} Modules</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1">
            SACERT TRAINING MANAGEMENT
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Schedule official CERT drills, assign responder participants, and review member training submissions
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Create Training Record
        </button>
      </div>

      {msgSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            {msgSuccess}
          </span>
          <button onClick={() => setMsgSuccess('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('PROGRAMS')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'PROGRAMS'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Official Training Programs ({trainings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SUBMISSIONS')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'SUBMISSIONS'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Member Training Submissions ({submissions.length})</span>
          {pendingSubmissionsCount > 0 && (
            <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-mono font-bold animate-pulse">
              {pendingSubmissionsCount} Pending Review
            </span>
          )}
        </button>
      </div>

      {/* --- TAB 1: OFFICIAL TRAINING PROGRAMS --- */}
      {activeTab === 'PROGRAMS' && (
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, ID, provider, instructor..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="UPCOMING">UPCOMING</option>
              <option value="ONGOING">ONGOING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Training Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTrainings.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {t.trainingId}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        t.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'UPCOMING'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">{t.title}</h3>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mt-0.5">
                      {t.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{t.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.startDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.hours} Total Hours</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{t.venue}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500">
                    <p>
                      <strong>Instructor:</strong> {t.instructor}
                    </p>
                    <p>
                      <strong>Provider:</strong> {t.provider}
                    </p>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    {t.participants.length} Responders Enrolled
                  </span>
                  <div className="flex items-center gap-2">
                    {t.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleMarkCompleted(t)}
                        className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded transition-colors"
                      >
                        Mark Completed
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedTraining(t);
                        setIsParticipantsModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded transition-colors"
                    >
                      View Roster ({t.participants.length})
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: MEMBER TRAINING SUBMISSIONS FOR APPROVAL --- */}
      {activeTab === 'SUBMISSIONS' && (
        <div className="space-y-6">
          {/* Submissions Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by member name, member ID, course title, provider..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <select
              value={subStatusFilter}
              onChange={(e) => setSubStatusFilter(e.target.value)}
              className="py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="ALL">All Submissions</option>
              <option value="PENDING">Pending Review ({pendingSubmissionsCount})</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Declined / Needs Review</option>
            </select>
          </div>

          {/* Submissions List */}
          <div className="space-y-4">
            {filteredSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      {sub.submissionNumber}
                    </span>
                    <span className="font-extrabold text-sm text-slate-900">{sub.memberName}</span>
                    <span className="font-mono text-xs text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                      {sub.memberId}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      · Submitted {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    {sub.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        Pending Approval
                      </span>
                    )}
                    {sub.status === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                        Approved & Accredited
                      </span>
                    )}
                    {sub.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                        <XCircle className="w-3.5 h-3.5 text-rose-700" />
                        Declined
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 space-y-2">
                    <h3 className="text-base font-extrabold text-slate-900">{sub.title}</h3>
                    <div className="text-xs text-slate-600 flex flex-wrap gap-2">
                      <span className="font-semibold text-blue-700">{sub.type}</span>
                      <span>·</span>
                      <span>
                        Issuing Provider: <strong className="text-slate-800">{sub.provider}</strong>
                      </span>
                      {sub.certificateNumber && (
                        <>
                          <span>·</span>
                          <span className="font-mono text-slate-700">Cert #: {sub.certificateNumber}</span>
                        </>
                      )}
                    </div>

                    {sub.description && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                        {sub.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 font-mono pt-1">
                      <div>Date: {sub.dateCompleted}</div>
                      <div>Hours: {sub.hours} hrs</div>
                      {sub.venue && <div className="truncate">Venue: {sub.venue}</div>}
                    </div>

                    {sub.adminNotes && (
                      <div
                        className={`p-3 rounded-lg text-xs border mt-2 ${
                          sub.status === 'APPROVED'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}
                      >
                        <strong className="block font-bold">
                          Admin Review Notes {sub.reviewedBy ? `(by ${sub.reviewedBy})` : ''}:
                        </strong>
                        <p>{sub.adminNotes}</p>
                        {sub.approvedTrainingId && (
                          <span className="font-mono text-[11px] block mt-1">
                            Accredited Training ID: {sub.approvedTrainingId}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Certificate Proof Photo */}
                  <div className="space-y-2 border-l border-slate-100 pl-0 lg:pl-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">
                        Certificate Document Proof:
                      </span>
                      {sub.certificateProofPhoto ? (
                        <div
                          onClick={() => setSelectedProofPreview(sub.certificateProofPhoto || null)}
                          className="cursor-pointer border border-slate-300 rounded-lg p-1 bg-slate-50 h-32 flex items-center justify-center overflow-hidden hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={sub.certificateProofPhoto}
                            alt="Certificate Document Proof"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="border border-dashed border-slate-200 rounded-lg p-3 text-center text-slate-400 text-xs h-28 flex flex-col items-center justify-center">
                          <FileText className="w-6 h-6 mb-1 text-slate-300" />
                          <span>No certificate photo attached</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex flex-wrap gap-2 justify-end">
                      {sub.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleOpenReview(sub, 'APPROVE')}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Accredit</span>
                          </button>
                          <button
                            onClick={() => handleOpenReview(sub, 'REJECT')}
                            className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDeleteSubmission(sub)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                        title="Delete Submission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredSubmissions.length === 0 && (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                No member training submissions match your filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= REVIEW & APPROVAL MODAL ================= */}
      {reviewingSubmission && reviewAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300">
            <div
              className={`p-4 text-white flex items-center justify-between ${
                reviewAction === 'APPROVE' ? 'bg-emerald-900 border-b border-emerald-700' : 'bg-rose-900 border-b border-rose-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {reviewAction === 'APPROVE' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <h3 className="font-bold text-sm text-white">
                  {reviewAction === 'APPROVE'
                    ? 'APPROVE & ACCREDIT TRAINING'
                    : 'DECLINE TRAINING SUBMISSION'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setReviewingSubmission(null);
                  setReviewAction(null);
                }}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReview} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 text-sm">{reviewingSubmission.title}</p>
                <p className="text-slate-600">
                  Member: <strong>{reviewingSubmission.memberName}</strong> ({reviewingSubmission.memberId})
                </p>
                <p className="text-slate-600">
                  Provider: <strong>{reviewingSubmission.provider}</strong> · Hours: {reviewingSubmission.hours} hrs
                </p>
              </div>

              {reviewAction === 'APPROVE' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] space-y-1">
                  <strong>Accreditation Result:</strong>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Creates official verified Training Record with COMPLETED status</li>
                    <li>Accredits official Certificate entry registered under this member</li>
                    <li>Adds competency qualification to member's public responder record</li>
                    <li>Dispatches notification alert to {reviewingSubmission.memberName}</li>
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {reviewAction === 'APPROVE' ? 'Approval Remarks / Verification Notes' : 'Reason for Decline *'}
                </label>
                <textarea
                  rows={3}
                  required={reviewAction === 'REJECT'}
                  value={adminReviewNotes}
                  onChange={(e) => setAdminReviewNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setReviewingSubmission(null);
                    setReviewAction(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded font-bold text-white transition-colors ${
                    reviewAction === 'APPROVE'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  {reviewAction === 'APPROVE' ? 'Confirm & Accredit' : 'Confirm Decline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= PROOF PREVIEW MODAL ================= */}
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

      {/* ================= CREATE TRAINING MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="bg-slate-900 text-white p-4 border-b border-blue-600 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Create New Training Record
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTraining} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Training ID *</label>
                  <input
                    type="text"
                    required
                    disabled
                    value={formData.trainingId}
                    className="w-full p-2 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-blue-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WASAR & Water Safety Refresher"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Training Category *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  >
                    <option value="Emergency Medical Response & Basic Life Support (BLS)">
                      Medical / BLS-CPR
                    </option>
                    <option value="Community Emergency Response Team (CERT) Basic">CERT Standard Course</option>
                    <option value="Search and Rescue (SAR) - Urban & Mountain">Search and Rescue</option>
                    <option value="Water Rescue & Life Saving">Water Rescue / WASAR</option>
                    <option value="Fire Safety & Suppression">Fire Auxiliary</option>
                    <option value="Disaster Risk Reduction and Management (DRRM)">DRRM Training</option>
                    <option value="Emergency Telecommunications & Incident Command">
                      Radio Comms & Incident Command
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Training Provider *</label>
                  <input
                    type="text"
                    required
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Accredited Hours</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Venue</label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Lead Instructor</label>
                  <input
                    type="text"
                    required
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TrainingStatus })}
                    className="w-full p-2 border border-slate-300 rounded font-bold"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Course Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>

              {/* Responder Participant Selector */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Enrolled Responder Participants ({formData.selectedMemberIds.length} Selected)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded">
                  {members.map((m) => (
                    <label
                      key={m.memberId}
                      className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedMemberIds.includes(m.memberId)}
                        onChange={() => handleToggleParticipant(m.memberId)}
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold text-slate-800">{m.fullName}</span>
                      <span className="font-mono text-[10px] text-slate-400">({m.memberId})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold"
                >
                  Save Training Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants Detail Roster Modal */}
      {selectedTraining && isParticipantsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-400 block">
                  {selectedTraining.trainingId}
                </span>
                <h3 className="font-bold text-sm text-white">{selectedTraining.title}</h3>
              </div>
              <button
                onClick={() => setIsParticipantsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-700">Enrolled Responders Roster</span>
                <span className="font-mono text-slate-500">{selectedTraining.participants.length} Total</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {selectedTraining.participants.map((p) => (
                  <div key={p.memberId} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{p.memberName}</p>
                      <span className="text-[10px] font-mono text-slate-500">{p.memberId}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        p.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 text-right">
                <button
                  onClick={() => setIsParticipantsModalOpen(false)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-bold text-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
