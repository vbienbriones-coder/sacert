import React, { useState } from 'react';
import { Certificate, CertificateStatus, Member, Training } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { CertificateView } from '../../components/CertificateView';
import {
  Award,
  Plus,
  Search,
  Printer,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Eye,
  X,
  FileCheck2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface CertificateManagementProps {
  onOpenVerify: (certNo?: string) => void;
}

export const CertificateManagement: React.FC<CertificateManagementProps> = ({
  onOpenVerify,
}) => {
  const { currentUser } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>(db.getCertificates());
  const members = db.getMembers();
  const trainings = db.getTrainings();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedCertForView, setSelectedCertForView] = useState<Certificate | null>(null);
  const [revokingCert, setRevokingCert] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [msgSuccess, setMsgSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    certificateNumber: '',
    title: 'Certificate of Competency in Community Emergency Response (CERT)',
    recipientName: '',
    memberId: '',
    trainingId: '',
    trainingTitle: 'Community Emergency Response Team (CERT) Standard Course',
    dateIssued: new Date().toISOString().split('T')[0],
    dateCompleted: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 1000 * 3600 * 24 * 365 * 3).toISOString().split('T')[0], // 3 years default
    issuedBy: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
    organization: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
    status: 'VALID' as CertificateStatus,
    signatory1Name: 'VINCENT B. BRIONES',
    signatory1Title: 'PRESIDENT (SACERT)',
    signatory2Name: 'NICHOLSON J. DASALLA',
    signatory2Title: 'VICE PRESIDENT (SACERT)',
  });

  const reloadCertificates = () => {
    setCertificates(db.getCertificates());
  };

  const openIssueModal = () => {
    const nextNumber = db.getNextCertificateNumber();
    const firstMember = members[0];
    const settings = db.getSettings();
    setFormData({
      certificateNumber: nextNumber,
      title: 'Certificate of Competency in Community Emergency Response (CERT)',
      recipientName: firstMember ? firstMember.fullName : '',
      memberId: firstMember ? firstMember.memberId : '',
      trainingId: trainings[0]?.id || '',
      trainingTitle: trainings[0]?.title || 'Community Emergency Response Team Course',
      dateIssued: new Date().toISOString().split('T')[0],
      dateCompleted: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 1000 * 3600 * 24 * 365 * 3).toISOString().split('T')[0],
      issuedBy: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
      organization: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
      status: 'VALID',
      signatory1Name: settings.defaultSignatory1Name || 'VINCENT B. BRIONES',
      signatory1Title: settings.defaultSignatory1Title || 'PRESIDENT (SACERT)',
      signatory2Name: settings.defaultSignatory2Name || 'NICHOLSON J. DASALLA',
      signatory2Title: settings.defaultSignatory2Title || 'VICE PRESIDENT (SACERT)',
    });
    setIsIssueModalOpen(true);
  };

  const handleMemberChange = (memberId: string) => {
    const mem = members.find((m) => m.memberId === memberId);
    if (mem) {
      setFormData((prev) => ({
        ...prev,
        memberId: mem.memberId,
        recipientName: mem.fullName,
      }));
    }
  };

  const handleTrainingChange = (tId: string) => {
    const trn = trainings.find((t) => t.id === tId || t.trainingId === tId);
    if (trn) {
      setFormData((prev) => ({
        ...prev,
        trainingId: trn.id,
        trainingTitle: trn.title,
        dateCompleted: trn.endDate || prev.dateCompleted,
      }));
    }
  };

  const handleSaveCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    const adminName = currentUser?.fullName || 'Administrator';

    try {
      const newCert = db.issueCertificate(
        {
          certificateNumber: formData.certificateNumber,
          title: formData.title,
          recipientName: formData.recipientName,
          memberId: formData.memberId,
          trainingId: formData.trainingId,
          trainingTitle: formData.trainingTitle,
          dateIssued: formData.dateIssued,
          dateCompleted: formData.dateCompleted,
          expiryDate: formData.expiryDate || undefined,
          issuedBy: formData.issuedBy,
          organization: formData.organization,
          status: 'VALID',
          signatories: [
            { name: formData.signatory1Name, title: formData.signatory1Title },
            { name: formData.signatory2Name, title: formData.signatory2Title },
          ],
        },
        adminName
      );

      reloadCertificates();
      setIsIssueModalOpen(false);
      setMsgSuccess(`Certificate ${newCert.certificateNumber} issued to ${newCert.recipientName}.`);
    } catch (err: any) {
      alert(err.message || 'Error issuing certificate');
    }
  };

  const handleRevoke = () => {
    if (!revokingCert) return;
    if (!revokeReason.trim()) {
      alert('A valid reason for certificate revocation is required.');
      return;
    }
    const adminName = currentUser?.fullName || 'Administrator';
    db.revokeCertificate(revokingCert.id, revokeReason, adminName);
    reloadCertificates();
    setRevokingCert(null);
    setRevokeReason('');
    setMsgSuccess(`Certificate ${revokingCert.certificateNumber} successfully revoked.`);
  };

  const handleReissue = (cert: Certificate) => {
    if (window.confirm(`Reissue certificate for ${cert.recipientName}? A new certificate number will be generated.`)) {
      const adminName = currentUser?.fullName || 'Administrator';
      const reissued = db.reissueCertificate(cert.id, adminName);
      reloadCertificates();
      setMsgSuccess(`Certificate reissued as ${reissued.certificateNumber}.`);
    }
  };

  const filtered = certificates.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQ =
      !q ||
      c.certificateNumber.toLowerCase().includes(q) ||
      c.recipientName.toLowerCase().includes(q) ||
      c.memberId.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q);

    const matchS = statusFilter === 'ALL' || c.status === statusFilter;
    return matchQ && matchS;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              Credentials Registry
            </span>
            <span className="text-xs text-slate-500">· {certificates.length} Total Certificates</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1">
            SACERT CERTIFICATE MANAGEMENT
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Issue, modify, revoke, reissue, print, and publicly verify responder qualifications
          </p>
        </div>

        <button
          onClick={openIssueModal}
          className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Issue Official Certificate
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

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by certificate number, recipient name, member ID..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white"
        >
          <option value="ALL">All Statuses</option>
          <option value="VALID">VALID</option>
          <option value="REISSUED">REISSUED</option>
          <option value="EXPIRED">EXPIRED</option>
          <option value="REVOKED">REVOKED</option>
        </select>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Certificate #</th>
                <th className="py-3 px-4">Recipient & ID</th>
                <th className="py-3 px-4">Training / Program</th>
                <th className="py-3 px-4">Date Issued</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-red-900 whitespace-nowrap">
                    {cert.certificateNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-extrabold text-slate-900">{cert.recipientName}</p>
                    <span className="text-[10px] font-mono text-slate-500">{cert.memberId}</span>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-medium text-slate-800 line-clamp-1">{cert.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{cert.trainingTitle}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono whitespace-nowrap text-slate-600">
                    <div>{cert.dateIssued}</div>
                    <div className="text-[10px] text-slate-400">
                      Exp: {cert.expiryDate || 'Permanent'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        cert.status === 'VALID'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : cert.status === 'REISSUED'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {cert.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View & Print */}
                      <button
                        onClick={() => setSelectedCertForView(cert)}
                        className="p-1.5 text-slate-700 hover:text-red-700 hover:bg-slate-100 rounded transition-colors"
                        title="View & Print Official Certificate"
                      >
                        <Printer className="w-4 h-4 text-slate-700" />
                      </button>

                      {/* Verify */}
                      <button
                        onClick={() => onOpenVerify(cert.certificateNumber)}
                        className="p-1.5 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors"
                        title="Verify In Public Portal"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </button>

                      {/* Reissue */}
                      <button
                        onClick={() => handleReissue(cert)}
                        className="p-1.5 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors"
                        title="Reissue Certificate"
                      >
                        <RotateCcw className="w-4 h-4 text-blue-600" />
                      </button>

                      {/* Revoke */}
                      {cert.status !== 'REVOKED' && (
                        <button
                          onClick={() => setRevokingCert(cert)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Revoke Certificate"
                        >
                          <ShieldAlert className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= ISSUE CERTIFICATE MODAL ================= */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="bg-slate-900 text-white p-4 border-b border-amber-600 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Issue Official Certificate of Competency
              </h2>
              <button onClick={() => setIsIssueModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCertificate} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Certificate Number</label>
                  <input
                    type="text"
                    required
                    value={formData.certificateNumber}
                    onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Select Member / Recipient</label>
                  <select
                    value={formData.memberId}
                    onChange={(e) => handleMemberChange(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white font-semibold"
                  >
                    {members.map((m) => (
                      <option key={m.memberId} value={m.memberId}>
                        {m.fullName} ({m.memberId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Certificate Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Associated Training Course</label>
                  <select
                    value={formData.trainingId}
                    onChange={(e) => handleTrainingChange(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  >
                    {trainings.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.trainingId})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Issuing Authority</label>
                  <input
                    type="text"
                    value={formData.issuedBy}
                    onChange={(e) => setFormData({ ...formData, issuedBy: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Date Completed</label>
                  <input
                    type="date"
                    value={formData.dateCompleted}
                    onChange={(e) => setFormData({ ...formData, dateCompleted: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Date Issued</label>
                  <input
                    type="date"
                    value={formData.dateIssued}
                    onChange={(e) => setFormData({ ...formData, dateIssued: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Signatory 1 (Director)</label>
                  <input
                    type="text"
                    value={formData.signatory1Name}
                    onChange={(e) => setFormData({ ...formData, signatory1Name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Signatory 2 (Mayor)</label>
                  <input
                    type="text"
                    value={formData.signatory2Name}
                    onChange={(e) => setFormData({ ...formData, signatory2Name: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold"
                >
                  Issue Certificate & Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revocation Modal */}
      {revokingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-300">
            <div className="bg-red-700 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">REVOKE OFFICIAL CERTIFICATE</h3>
              <button onClick={() => setRevokingCert(null)} className="text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-700">
                You are about to revoke certificate{' '}
                <strong className="text-red-900 font-mono">{revokingCert.certificateNumber}</strong>{' '}
                issued to <strong>{revokingCert.recipientName}</strong>.
              </p>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Reason for Revocation *</label>
                <textarea
                  rows={3}
                  required
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Failure to comply with recurring competency re-evaluation standards."
                  className="w-full p-2 border border-slate-300 rounded"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setRevokingCert(null)}
                  className="px-3 py-1.5 bg-slate-100 rounded font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevoke}
                  className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded font-bold"
                >
                  Confirm Revocation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Print / View Modal */}
      {selectedCertForView && (
        <CertificateView
          certificate={selectedCertForView}
          isOpen={true}
          onClose={() => setSelectedCertForView(null)}
          onVerify={() => {
            const num = selectedCertForView.certificateNumber;
            setSelectedCertForView(null);
            onOpenVerify(num);
          }}
        />
      )}
    </div>
  );
};
