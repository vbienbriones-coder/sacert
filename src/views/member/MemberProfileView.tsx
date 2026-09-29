import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Member } from '../../types';
import { MemberRecordPrintView } from '../../components/MemberRecordPrintView';
import { CertificateView } from '../../components/CertificateView';
import { compressAndReadFile } from '../../utils/image';
import { CATANDUANES_MUNICIPALITIES, getBarangaysByMunicipality } from '../../data/catanduanes';
import {
  UserCheck,
  GraduationCap,
  Award,
  Medal,
  Activity,
  Printer,
  Edit2,
  Save,
  ShieldCheck,
  Phone,
  Mail,
  Home,
  AlertCircle,
  CheckCircle,
  Camera,
  Upload,
} from 'lucide-react';

export const MemberProfileView: React.FC = () => {
  const { currentMember, currentUser, isAdmin, updateMemberProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'trainings' | 'certificates' | 'qualifications' | 'activity'>('profile');

  const member: Member = currentMember || db.getMembers()[0];
  const certificates = db.getCertificatesByMemberId(member.memberId);
  const trainings = db.getTrainings().filter((t) =>
    t.participants.some((p) => p.memberId === member.memberId)
  );

  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  // Permitted edit form
  const [isEditingPermitted, setIsEditingPermitted] = useState(false);
  const [permittedForm, setPermittedForm] = useState({
    contactNumber: member.contactNumber,
    email: member.email,
    emergencyContact: member.emergencyContact,
    emergencyContactNumber: member.emergencyContactNumber,
    emergencyContactRelation: member.emergencyContactRelation || '',
    address: member.address,
    municipality: member.municipality || 'San Andres',
    barangay: member.barangay || 'Wagdas',
    profilePhoto: member.profilePhoto || '',
  });
  const [msgSuccess, setMsgSuccess] = useState('');
  const [msgError, setMsgError] = useState('');

  const handleSavePermitted = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgSuccess('');
    setMsgError('');

    const res = await updateMemberProfile(permittedForm);
    if (res.success) {
      setMsgSuccess('Your personal contact and emergency information has been updated successfully.');
      setIsEditingPermitted(false);
    } else {
      setMsgError(res.error || 'Failed to update personal details.');
    }
  };

  const handleQuickPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }
    try {
      const dataUrl = await compressAndReadFile(file, { maxWidth: 600, maxHeight: 600, quality: 0.88 });
      setPermittedForm((prev) => ({ ...prev, profilePhoto: dataUrl }));
      const res = await updateMemberProfile({ profilePhoto: dataUrl });
      if (res.success) {
        setMsgSuccess('Official responder photograph updated successfully.');
      } else {
        setMsgError(res.error || 'Failed to update photo.');
      }
    } catch (err) {
      alert('Error reading image file.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-24 rounded-xl bg-slate-100 border-2 border-slate-800 flex items-center justify-center font-bold text-slate-700 text-xl overflow-hidden shrink-0 shadow-xs">
              {member.profilePhoto ? (
                <img src={member.profilePhoto} alt={member.fullName} className="w-full h-full object-cover" />
              ) : (
                member.firstName.charAt(0)
              )}
            </div>
            <label
              className="absolute inset-0 bg-slate-950/70 text-white rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
              title="Click to update photo"
            >
              <Camera className="w-5 h-5 mb-0.5 text-red-400" />
              <span>Change Photo</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleQuickPhotoUpload}
                className="hidden"
              />
            </label>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-red-100 text-red-900 border border-red-200 px-2 py-0.5 rounded">
                {member.memberId}
              </span>
              <span className="font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                {member.membershipStatus}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
              {member.fullName}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-red-700">
              {member.designation} · {member.responderLevel}
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Brgy. {member.barangay}, San Andres · Onboarded: {member.dateOnboarded}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDossierOpen(true)}
          className="px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-red-700" />
          PRINT 201 RECORD FILE
        </button>
      </div>

      {msgSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-lg flex items-center justify-between">
          <span>✓ {msgSuccess}</span>
          <button onClick={() => setMsgSuccess('')}>✕</button>
        </div>
      )}

      {/* Tabs Menu (Requirement 4: 5 tabs) */}
      <div className="flex border-b border-slate-200 space-x-1 sm:space-x-4 bg-white px-4 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-red-700 text-red-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          1. PROFILE
        </button>
        <button
          onClick={() => setActiveTab('trainings')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'trainings'
              ? 'border-red-700 text-red-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          2. TRAININGS ({trainings.length})
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'certificates'
              ? 'border-red-700 text-red-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          3. CERTIFICATES ({certificates.length})
        </button>
        <button
          onClick={() => setActiveTab('qualifications')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'qualifications'
              ? 'border-red-700 text-red-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Medal className="w-4 h-4" />
          4. QUALIFICATIONS
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`py-3 px-3 sm:px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'activity'
              ? 'border-red-700 text-red-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          5. ACTIVITY
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-sm font-extrabold uppercase text-slate-900">
              Personal & Emergency Contact Details
            </h2>
            {!isEditingPermitted ? (
              <button
                onClick={() => setIsEditingPermitted(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Update Permitted Contact Info
              </button>
            ) : (
              <button
                onClick={() => setIsEditingPermitted(false)}
                className="text-slate-500 hover:text-slate-800 font-bold"
              >
                Cancel
              </button>
            )}
          </div>

          {!isEditingPermitted ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="font-mono text-slate-800">{member.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-800">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-800">
                      {member.address}, Brgy. {member.barangay}, {member.municipality}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                  Emergency Contact (ICE)
                </h3>
                <div className="p-3 bg-red-50/60 border border-red-200 rounded-lg space-y-1">
                  <p className="font-bold text-slate-900 text-xs">{member.emergencyContact}</p>
                  <p className="font-mono font-bold text-red-900 text-xs">
                    {member.emergencyContactNumber}
                  </p>
                  {member.emergencyContactRelation && (
                    <p className="text-[11px] text-slate-500">
                      Relation: {member.emergencyContactRelation}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 sm:col-span-2 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                  Protected Administrative Records (Read-Only for Member)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Official Status:</span>
                    <strong className="text-slate-900">{member.membershipStatus}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Designation:</span>
                    <strong className="text-slate-900">{member.designation}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Blood Type:</span>
                    <strong className="text-red-700">{member.bloodType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date Joined:</span>
                    <strong className="text-slate-900">{member.dateJoined}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSavePermitted} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Mobile Contact Number</label>
                  <input
                    type="text"
                    required
                    value={permittedForm.contactNumber}
                    onChange={(e) => setPermittedForm({ ...permittedForm, contactNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={permittedForm.email}
                    onChange={(e) => setPermittedForm({ ...permittedForm, email: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Emergency Contact Person</label>
                  <input
                    type="text"
                    required
                    value={permittedForm.emergencyContact}
                    onChange={(e) => setPermittedForm({ ...permittedForm, emergencyContact: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Emergency Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={permittedForm.emergencyContactNumber}
                    onChange={(e) => setPermittedForm({ ...permittedForm, emergencyContactNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono font-bold text-red-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Municipality (11 Municipalities) *
                  </label>
                  <select
                    value={permittedForm.municipality}
                    onChange={(e) => {
                      const newMun = e.target.value;
                      const brgys = getBarangaysByMunicipality(newMun);
                      setPermittedForm({
                        ...permittedForm,
                        municipality: newMun,
                        barangay: brgys[0] || '',
                      });
                    }}
                    className="w-full p-2 border border-slate-300 rounded font-bold bg-white"
                  >
                    {CATANDUANES_MUNICIPALITIES.map((mun) => (
                      <option key={mun} value={mun}>
                        {mun}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Barangay ({permittedForm.municipality}) *
                  </label>
                  <select
                    value={permittedForm.barangay}
                    onChange={(e) => setPermittedForm({ ...permittedForm, barangay: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-medium bg-white"
                  >
                    {getBarangaysByMunicipality(permittedForm.municipality).map((b) => (
                      <option key={b} value={b}>
                        Brgy. {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-semibold mb-1">Residential Street Address</label>
                  <input
                    type="text"
                    required
                    value={permittedForm.address}
                    onChange={(e) => setPermittedForm({ ...permittedForm, address: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded"
                  />
                </div>

                <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <label className="block text-slate-700 font-bold mb-1">Update Profile Photograph</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-white border border-slate-300 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                      {permittedForm.profilePhoto ? (
                        <img src={permittedForm.profilePhoto} alt="Photo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">No Photo</span>
                      )}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <label className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold cursor-pointer inline-flex items-center gap-1.5 text-xs">
                        <Upload className="w-3.5 h-3.5 text-red-400" />
                        <span>Upload New Image...</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/jpg"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (!file.type.startsWith('image/')) {
                              alert('Please upload an image file (PNG, JPG, WEBP).');
                              return;
                            }
                            try {
                              const dataUrl = await compressAndReadFile(file, { maxWidth: 600, maxHeight: 600, quality: 0.88 });
                              setPermittedForm((prev) => ({ ...prev, profilePhoto: dataUrl }));
                            } catch (err) {
                              alert('Error processing image.');
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {permittedForm.profilePhoto && (
                        <button
                          type="button"
                          onClick={() => setPermittedForm((prev) => ({ ...prev, profilePhoto: '' }))}
                          className="ml-2 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded font-bold text-xs"
                        >
                          Remove
                        </button>
                      )}
                      <p className="text-[11px] text-slate-500">Max size 3MB. High-contrast portrait recommended.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingPermitted(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded font-bold"
                >
                  Save Permitted Details
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: TRAININGS */}
      {activeTab === 'trainings' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs">
          <h2 className="text-sm font-extrabold uppercase text-slate-900 border-b border-slate-200 pb-2">
            Completed & Enrolled Training Records
          </h2>
          <div className="space-y-3">
            {trainings.map((t) => (
              <div key={t.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-900">{t.trainingId}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                    {t.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{t.title}</h3>
                <p className="text-slate-600">{t.description}</p>
                <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-2 border-t border-slate-200">
                  <span>Instructor: {t.instructor}</span>
                  <span>{t.hours} Accredited Hours</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs">
          <h2 className="text-sm font-extrabold uppercase text-slate-900 border-b border-slate-200 pb-2">
            Official Issued Credentials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certificates.map((c) => (
              <div
                key={c.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-red-900">{c.certificateNumber}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                      {c.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mt-2">{c.title}</h3>
                  <p className="text-slate-500 text-[11px] mt-1 font-mono">Issued: {c.dateIssued}</p>
                </div>
                <button
                  onClick={() => setSelectedCert(c)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-center"
                >
                  View & Print Official Certificate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: QUALIFICATIONS */}
      {activeTab === 'qualifications' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs">
          <h2 className="text-sm font-extrabold uppercase text-slate-900 border-b border-slate-200 pb-2">
            Skills, Accreditations & Honors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-slate-700 uppercase mb-2">Technical Skills</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {member.skills?.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-700 uppercase mb-2">Accreditations & Honors</h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {member.qualifications?.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
                {member.awards?.map((a, i) => (
                  <li key={`a-${i}`}>🎖 {a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs">
          <h2 className="text-sm font-extrabold uppercase text-slate-900 border-b border-slate-200 pb-2">
            Deployment & Participation Records
          </h2>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
            <span className="font-bold text-blue-900">Total Missions Deployed:</span>
            <p className="text-2xl font-black font-mono text-blue-950">
              {member.deploymentsCount} Completed Deployments
            </p>
          </div>
          <p className="text-slate-500 text-[11px] font-mono">
            Deployment logs maintained by San Andres Municipal Disaster Operations Center.
          </p>
        </div>
      )}

      {/* 201 Dossier Modal */}
      {isDossierOpen && (
        <MemberRecordPrintView
          member={member}
          isOpen={true}
          onClose={() => setIsDossierOpen(false)}
        />
      )}

      {/* Certificate Viewer */}
      {selectedCert && (
        <CertificateView
          certificate={selectedCert}
          isOpen={true}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  );
};
