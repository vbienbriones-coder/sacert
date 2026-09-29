import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { RegistrationApplication, RegistrationStatus } from '../../types';
import { CATANDUANES_MUNICIPALITIES, getBarangaysByMunicipality } from '../../data/catanduanes';
import {
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Eye,
  Edit2,
  Trash2,
  Check,
  X,
  FileText,
  User,
  Phone,
  Mail,
  Home,
  Shield,
  Award,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const RegistrationRequestsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationApplication[]>(db.getRegistrations());
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<RegistrationApplication | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isRequestInfoModalOpen, setIsRequestInfoModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [editFormData, setEditFormData] = useState<Partial<RegistrationApplication>>({});
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const reloadRegistrations = () => {
    setRegistrations(db.getRegistrations());
  };

  useEffect(() => {
    const unsub = db.subscribe(reloadRegistrations);
    return () => unsub();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotificationMsg({ text, type });
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  const handleApprove = (app: RegistrationApplication) => {
    if (
      !window.confirm(
        `Approve registration for ${app.fullName}?\n\nThis will automatically:\n1. Assign an official SACERT Member ID\n2. Create an active Member record\n3. Activate member login credentials (@${app.username})\n4. Record in system audit logs`
      )
    ) {
      return;
    }

    const res = db.approveRegistration(app.id, currentUser?.fullName || 'Administrator');
    if (res.success) {
      showNotification(`✓ Successfully approved! Member ID ${res.member?.memberId} assigned to ${app.fullName}. Login account activated.`);
      if (selectedApp?.id === app.id) {
        setIsDetailModalOpen(false);
      }
    } else {
      showNotification(res.error || 'Failed to approve registration.', 'error');
    }
  };

  const handleRejectConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !actionReason.trim()) return;

    const ok = db.rejectRegistration(selectedApp.id, actionReason.trim(), currentUser?.fullName || 'Administrator');
    if (ok) {
      showNotification(`Registration for ${selectedApp.fullName} was marked as Rejected.`);
      setIsRejectModalOpen(false);
      setIsDetailModalOpen(false);
      setActionReason('');
    } else {
      showNotification('Failed to reject registration.', 'error');
    }
  };

  const handleRequestInfoConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !actionReason.trim()) return;

    const ok = db.requestAdditionalInfoRegistration(selectedApp.id, actionReason.trim(), currentUser?.fullName || 'Administrator');
    if (ok) {
      showNotification(`Additional information requested from ${selectedApp.fullName}.`);
      setIsRequestInfoModalOpen(false);
      setIsDetailModalOpen(false);
      setActionReason('');
    } else {
      showNotification('Failed to update status.', 'error');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    const ok = db.updateRegistration(selectedApp.id, editFormData, currentUser?.fullName || 'Administrator');
    if (ok) {
      showNotification('Applicant details updated successfully.');
      setIsEditModalOpen(false);
      setSelectedApp((prev) => (prev ? { ...prev, ...editFormData } : null));
    } else {
      showNotification('Failed to update applicant information.', 'error');
    }
  };

  const handleDelete = (app: RegistrationApplication) => {
    if (!window.confirm(`Permanently delete registration application for ${app.fullName} (${app.applicationNumber})?`)) {
      return;
    }

    const ok = db.deleteRegistration(app.id, currentUser?.fullName || 'Administrator');
    if (ok) {
      showNotification(`Registration ${app.applicationNumber} deleted.`);
      if (selectedApp?.id === app.id) {
        setIsDetailModalOpen(false);
      }
    } else {
      showNotification('Failed to delete registration.', 'error');
    }
  };

  const filtered = registrations.filter((app) => {
    const matchesFilter = filterStatus === 'ALL' || app.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.fullName.toLowerCase().includes(q) ||
      app.applicationNumber.toLowerCase().includes(q) ||
      app.barangay.toLowerCase().includes(q) ||
      app.username.toLowerCase().includes(q) ||
      app.contactNumber.includes(q);
    return matchesFilter && matchesSearch;
  });

  const pendingCount = registrations.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Membership Admissions
            </span>
            {pendingCount > 0 && (
              <span className="text-xs font-mono font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                {pendingCount} PENDING
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1 flex items-center gap-2.5">
            <UserPlus className="w-8 h-8 text-red-700" />
            <span>MEMBER REGISTRATION REQUESTS</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Review prospective responder registration submissions, verify qualifications, approve active accounts, or reject applications
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-700 shadow-2xs">
            Total Applications: <strong className="text-slate-900">{registrations.length}</strong>
          </div>
        </div>
      </div>

      {notificationMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-2xs ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          {notificationMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notificationMsg.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'PENDING', label: `Pending (${pendingCount})` },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'REJECTED', label: 'Rejected' },
              { id: 'ADDITIONAL_INFO_REQUIRED', label: 'Needs Info' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search applicant name, ID, brgy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <UserPlus className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No registration applications found.</p>
            <p className="text-xs text-slate-400">Prospective members who register via the public portal will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Barangay / Address</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Date Applied</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => {
                  const isPending = app.status === 'PENDING';
                  return (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                            {app.profilePhoto ? (
                              <img src={app.profilePhoto} alt={app.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block text-sm">{app.fullName}</span>
                            <span className="text-[11px] font-mono text-slate-500">
                              @{app.username} · {app.applicationNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">Brgy. {app.barangay}</span>
                        <span className="text-[11px] text-slate-500 truncate block max-w-xs">{app.address}</span>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span className="text-slate-800 font-bold block">{app.contactNumber}</span>
                        <span className="text-slate-500 text-[11px]">{app.email}</span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">
                        {app.dateOfRegistration}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wide ${
                            app.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : app.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : app.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setIsDetailModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                            title="Inspect application details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(app)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 transition-colors shadow-2xs"
                                title="Approve and create member account"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedApp(app);
                                  setActionReason('');
                                  setIsRejectModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-colors"
                                title="Reject application"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDelete(app)}
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete registration"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {isDetailModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-300 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-start justify-between border-b-2 border-red-700">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {selectedApp.profilePhoto ? (
                    <img src={selectedApp.profilePhoto} alt={selectedApp.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-slate-500" />
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-mono text-red-400 font-bold uppercase tracking-widest">
                    {selectedApp.applicationNumber}
                  </span>
                  <h2 className="text-xl font-black uppercase text-white font-serif">{selectedApp.fullName}</h2>
                  <p className="text-xs text-slate-300 font-mono">
                    Registered: {selectedApp.dateOfRegistration} · Desired Username: @{selectedApp.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
              {/* Status bar */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">Current Application Status:</span>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-bold font-mono ${
                      selectedApp.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedApp.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-900'
                        : selectedApp.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {selectedApp.status}
                  </span>
                </div>

                {selectedApp.reviewedBy && (
                  <span className="text-[11px] text-slate-500 font-mono">
                    Reviewed by: {selectedApp.reviewedBy}
                  </span>
                )}
              </div>

              {selectedApp.adminNotes && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl">
                  <strong className="block text-[10px] font-mono uppercase text-amber-700">Administrator Notes:</strong>
                  <span>{selectedApp.adminNotes}</span>
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-2 border-b border-slate-200 pb-1">
                  1. Personal & Contact Information
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 block">Date of Birth</span>
                    <strong className="text-slate-900">{selectedApp.dateOfBirth}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Gender</span>
                    <strong className="text-slate-900">{selectedApp.gender}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Barangay</span>
                    <strong className="text-slate-900">{selectedApp.barangay}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Residential Address</span>
                    <strong className="text-slate-900">{selectedApp.address}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Contact Phone</span>
                    <strong className="text-slate-900 font-mono">{selectedApp.contactNumber}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Email Address</span>
                    <strong className="text-slate-900">{selectedApp.email}</strong>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-2 border-b border-slate-200 pb-1">
                  2. Emergency Contact Person
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 block">Contact Name</span>
                    <strong className="text-slate-900">{selectedApp.emergencyContactName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Contact Number</span>
                    <strong className="text-slate-900 font-mono">{selectedApp.emergencyContactNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Relation</span>
                    <strong className="text-slate-900">{selectedApp.emergencyContactRelation || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              {/* Qualifications, Training, Skills */}
              <div>
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-2 border-b border-slate-200 pb-1">
                  3. Emergency Training, Certifications & Skills
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-500 block">Previous Disaster / First Aid Trainings:</span>
                    <p className="p-2 bg-slate-50 rounded border border-slate-200 font-medium text-slate-800">
                      {selectedApp.previousTraining || 'None specified'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Certifications & Licenses:</span>
                    <p className="p-2 bg-slate-50 rounded border border-slate-200 font-medium text-slate-800">
                      {selectedApp.certifications || 'None specified'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Special Skills:</span>
                    <p className="p-2 bg-slate-50 rounded border border-slate-200 font-medium text-slate-800">
                      {selectedApp.skills || 'None specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Supporting Documents */}
              <div>
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-2 border-b border-slate-200 pb-1">
                  4. Supporting Documents
                </h4>
                {selectedApp.supportingDocuments && selectedApp.supportingDocuments.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedApp.supportingDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2 text-slate-800 font-semibold font-mono">
                          <FileText className="w-4 h-4 text-red-600" />
                          <span>{doc}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          ✓ Verified Attachment
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No document attachments uploaded.</p>
                )}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditFormData(selectedApp);
                    setIsEditModalOpen(true);
                  }}
                  className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-bold text-xs flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Application</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionReason('');
                    setIsRequestInfoModalOpen(true);
                  }}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg font-bold text-xs flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Request More Info</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedApp.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setActionReason('');
                        setIsRejectModalOpen(true);
                      }}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-bold text-xs"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(selectedApp)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Activate Account</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <form
            onSubmit={handleRejectConfirm}
            className="bg-white rounded-2xl max-w-md w-full border border-slate-300 shadow-2xl p-6 space-y-4 text-xs"
          >
            <div className="flex items-center gap-2 text-red-700 font-extrabold text-sm uppercase">
              <XCircle className="w-5 h-5" />
              <span>Reject Registration Application</span>
            </div>
            <p className="text-slate-600">
              Please specify the reason for rejecting <strong>{selectedApp.fullName}</strong> ({selectedApp.applicationNumber}):
            </p>
            <textarea
              required
              rows={3}
              placeholder="e.g. Incomplete qualifications, out-of-jurisdiction, or failed initial background review..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Request Info Modal */}
      {isRequestInfoModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <form
            onSubmit={handleRequestInfoConfirm}
            className="bg-white rounded-2xl max-w-md w-full border border-slate-300 shadow-2xl p-6 space-y-4 text-xs"
          >
            <div className="flex items-center gap-2 text-blue-800 font-extrabold text-sm uppercase">
              <HelpCircle className="w-5 h-5" />
              <span>Request Additional Information</span>
            </div>
            <p className="text-slate-600">
              Message or instructions for <strong>{selectedApp.fullName}</strong>:
            </p>
            <textarea
              required
              rows={3}
              placeholder="e.g. Please provide a clear copy of your Barangay Clearance or updated contact phone number..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRequestInfoModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow-xs"
              >
                Send Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Applicant Information Modal */}
      {isEditModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white rounded-2xl max-w-xl w-full border border-slate-300 shadow-2xl p-6 space-y-4 text-xs my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-red-700" />
                <span>Edit Applicant Information</span>
              </h3>
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.fullName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={editFormData.dateOfBirth || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Gender</label>
                <select
                  value={editFormData.gender || 'Male'}
                  onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Municipality (11 Municipalities) *
                </label>
                <select
                  value={editFormData.municipality || 'San Andres'}
                  onChange={(e) => {
                    const newMun = e.target.value;
                    const brgys = getBarangaysByMunicipality(newMun);
                    setEditFormData({
                      ...editFormData,
                      municipality: newMun,
                      barangay: brgys[0] || '',
                    });
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-bold"
                >
                  {CATANDUANES_MUNICIPALITIES.map((mun) => (
                    <option key={mun} value={mun}>
                      {mun}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Barangay ({editFormData.municipality || 'San Andres'}) *
                </label>
                <select
                  value={editFormData.barangay || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, barangay: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-medium"
                >
                  {getBarangaysByMunicipality(editFormData.municipality || 'San Andres').map((b) => (
                    <option key={b} value={b}>
                      Brgy. {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={editFormData.contactNumber || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, contactNumber: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Residential Street Address</label>
                <input
                  type="text"
                  value={editFormData.address || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Emergency Contact Name</label>
                <input
                  type="text"
                  value={editFormData.emergencyContactName || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, emergencyContactName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  value={editFormData.emergencyContactNumber || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, emergencyContactNumber: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
