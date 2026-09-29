import React, { useState } from 'react';
import { db } from '../services/db';
import { SacertLogo } from './SacertLogo';
import { compressAndReadFile } from '../utils/image';
import { CATANDUANES_MUNICIPALITIES, getBarangaysByMunicipality } from '../data/catanduanes';
import {
  UserPlus,
  X,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Phone,
  Mail,
  Home,
  Shield,
  Award,
  KeyRound,
  Lock,
  ArrowRight,
  Clock,
  Check,
  Building,
} from 'lucide-react';

interface MemberRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: (username: string) => void;
}

export const MemberRegistrationModal: React.FC<MemberRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    dateOfBirth: '1998-06-15',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    address: 'Zone 1',
    barangay: 'Wagdas',
    municipality: 'San Andres',
    province: 'Catanduanes',
    contactNumber: '0917-',
    email: '',
    emergencyContactName: '',
    emergencyContactNumber: '0917-',
    emergencyContactRelation: 'Parent',
    dateOfRegistration: new Date().toISOString().split('T')[0],
    previousTraining: '',
    certifications: '',
    skills: '',
    username: '',
    password: '',
    confirmPassword: '',
    profilePhoto: '',
    supportingDocumentsNote: '',
  });

  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedApp, setSubmittedApp] = useState<{
    applicationNumber: string;
    fullName: string;
    username: string;
    profilePhoto: string;
  } | null>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setIsCompressing(true);
    setErrorMessage('');

    try {
      const dataUrl = await compressAndReadFile(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.88,
      });
      setFormData((prev) => ({ ...prev, profilePhoto: dataUrl }));
    } catch (err) {
      setErrorMessage('Error processing image. Please choose another file.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setErrorMessage('Please provide both First Name and Last Name.');
      return;
    }

    if (!formData.profilePhoto) {
      setErrorMessage('Please upload a portrait photograph of the member for the official ID.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const cleanUsername = formData.username.trim().replace(/^@/, '').toLowerCase();
    if (!cleanUsername) {
      setErrorMessage('Please enter a username.');
      return;
    }

    // Check username collision with existing users
    if (db.getUserByUsername(cleanUsername)) {
      setErrorMessage(`Username @${cleanUsername} is already registered. Please choose another.`);
      return;
    }

    const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}${formData.suffix ? ' ' + formData.suffix : ''}`.trim();

    try {
      const newApp = db.submitRegistration({
        fullName,
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address.trim(),
        barangay: formData.barangay,
        municipality: formData.municipality,
        province: formData.province,
        contactNumber: formData.contactNumber.trim(),
        email: formData.email.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactNumber: formData.emergencyContactNumber.trim(),
        emergencyContactRelation: formData.emergencyContactRelation.trim(),
        dateOfRegistration: formData.dateOfRegistration,
        previousTraining: formData.previousTraining.trim(),
        certifications: formData.certifications.trim(),
        skills: formData.skills.trim(),
        username: cleanUsername,
        passwordHash: formData.password,
        profilePhoto: formData.profilePhoto,
        supportingDocuments: formData.supportingDocumentsNote ? [formData.supportingDocumentsNote] : [],
      });

      setSubmittedApp({
        applicationNumber: newApp.applicationNumber,
        fullName: newApp.fullName,
        username: cleanUsername,
        profilePhoto: formData.profilePhoto,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit registration application.');
    }
  };

  const handleCloseAll = () => {
    setSubmittedApp(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-red-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <SacertLogo size={48} inverted showText={false} />
            <div>
              <span className="text-[10px] font-mono tracking-widest text-red-400 uppercase font-extrabold block">
                SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM
              </span>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight font-serif">
                MEMBER REGISTRATION PORTAL
              </h2>
              <p className="text-xs text-slate-300">
                Official Applicant Enrollment & ID Credential Processing
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseAll}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {submittedApp ? (
            /* Success / Pending Approval Screen */
            <div className="text-center py-6 sm:py-8 space-y-6 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-700 animate-bounce">
                <Clock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 bg-amber-100 border border-amber-300 text-amber-900 font-mono font-black text-xs uppercase tracking-wider rounded-full">
                  APPLICATION STATUS: PENDING APPROVAL
                </span>
                <h3 className="text-2xl font-black text-slate-900 font-serif">
                  Registration Successfully Submitted!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Thank you for applying to join the{' '}
                  <strong className="text-slate-900 font-semibold">
                    SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM
                  </strong>
                  . Your application and official ID photograph have been securely transmitted to the Command Office.
                </p>
              </div>

              {/* Application Summary Card with ID Photo Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-4 shadow-xs">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-24 rounded-xl border-2 border-slate-800 bg-white overflow-hidden shadow-xs shrink-0 flex items-center justify-center">
                    {submittedApp.profilePhoto ? (
                      <img
                        src={submittedApp.profilePhoto}
                        alt={submittedApp.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div className="space-y-1 font-mono text-xs">
                    <p className="text-[11px] text-slate-500 uppercase">Application Reference No.</p>
                    <p className="text-base font-black text-red-700">{submittedApp.applicationNumber}</p>
                    <p className="font-extrabold text-slate-900 font-sans text-sm">{submittedApp.fullName}</p>
                    <p className="text-slate-600">Reserved Account: @{submittedApp.username}</p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                  <strong>Notice:</strong> Your account will become active as soon as an Administrator reviews and approves your submission. Once approved, you can log in to the Member Portal using your username and password to view your official Member ID and trainings.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseAll}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Return to Portal Home
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-300 text-red-900 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Section 1: Official Responder Photo for ID */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-red-700" />
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase">
                      1. Upload Member Picture for Official ID <span className="text-red-600">*</span>
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-bold">
                    CR-80 ID Specification
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Avatar / ID Photo Box */}
                  <div className="relative group shrink-0">
                    <div className="w-28 h-32 rounded-xl border-4 border-slate-800 bg-white overflow-hidden shadow-md flex items-center justify-center">
                      {formData.profilePhoto ? (
                        <img
                          src={formData.profilePhoto}
                          alt="Member ID Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-3 text-slate-400">
                          <User className="w-10 h-10 mx-auto text-slate-300 mb-1" />
                          <span className="text-[9px] font-bold uppercase tracking-wider block">
                            Photo Required
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 flex-1 text-xs text-center sm:text-left">
                    <p className="font-bold text-slate-900">
                      Upload your portrait photograph (JPEG, PNG, or WEBP)
                    </p>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      This photo will appear on your official <strong>SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM</strong> laminated ID card, responder registry, and public QR verification page. Please ensure a clear front-facing portrait.
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isCompressing ? 'Processing Image...' : 'Choose ID Picture'}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/jpg"
                          onChange={handlePhotoUpload}
                          disabled={isCompressing}
                          className="hidden"
                        />
                      </label>

                      {formData.profilePhoto && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, profilePhoto: '' }))}
                          className="px-3 py-2 text-red-700 hover:bg-red-50 rounded-lg font-bold text-xs transition-colors"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Personal Identification */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <User className="w-4 h-4 text-red-700" />
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    2. Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Juan"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Middle Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Santos"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dela Cruz"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Suffix</label>
                    <input
                      type="text"
                      placeholder="e.g. Jr., III"
                      value={formData.suffix}
                      onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Address & Contact */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Home className="w-4 h-4 text-red-700" />
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    3. Address & Contact Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Municipality (11 Municipalities of Catanduanes) *
                    </label>
                    <select
                      value={formData.municipality}
                      onChange={(e) => {
                        const newMun = e.target.value;
                        const brgys = getBarangaysByMunicipality(newMun);
                        setFormData({
                          ...formData,
                          municipality: newMun,
                          barangay: brgys[0] || '',
                        });
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none font-bold"
                    >
                      {CATANDUANES_MUNICIPALITIES.map((mun) => (
                        <option key={mun} value={mun}>
                          {mun}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Barangay ({formData.municipality}) *
                    </label>
                    <select
                      value={formData.barangay}
                      onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none font-medium"
                    >
                      {getBarangaysByMunicipality(formData.municipality).map((brgy) => (
                        <option key={brgy} value={brgy}>
                          Brgy. {brgy}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-semibold mb-1">Street Address / Zone / Sitio *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Purok 2, San Roque Street"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Mobile / Contact Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="0917-123-4567"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="responder@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Emergency Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Phone className="w-4 h-4 text-red-700" />
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    4. Emergency Contact (In Case of Emergency)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Contact Person Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maria Dela Cruz"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Emergency Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="0918-765-4321"
                      value={formData.emergencyContactNumber}
                      onChange={(e) => setFormData({ ...formData, emergencyContactNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Relationship</label>
                    <input
                      type="text"
                      placeholder="e.g. Spouse / Parent / Sibling"
                      value={formData.emergencyContactRelation}
                      onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Qualifications & Skills */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <Award className="w-4 h-4 text-red-700" />
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">
                    5. Experience, Training & Skills
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Previous Training</label>
                    <input
                      type="text"
                      placeholder="e.g. Standard First Aid, BLS, Fire Drill"
                      value={formData.previousTraining}
                      onChange={(e) => setFormData({ ...formData, previousTraining: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Certifications Held</label>
                    <input
                      type="text"
                      placeholder="e.g. PRC Red Cross BLS-CPR, TESDA EMR"
                      value={formData.certifications}
                      onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Skills & Specializations</label>
                    <input
                      type="text"
                      placeholder="e.g. VHF Radio, Water Rescue, Driving"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Supporting Documents / Verification Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Barangay Clearance No. 2026-114, Valid Gov ID submitted to Brgy. Hall"
                    value={formData.supportingDocumentsNote}
                    onChange={(e) => setFormData({ ...formData, supportingDocumentsNote: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Section 6: Portal Account Credentials */}
              <div className="space-y-3 bg-slate-900 text-white p-4 rounded-xl">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <KeyRound className="w-4 h-4 text-red-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">
                    6. Portal Access Credentials (For Login Once Approved)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Desired Username *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500 font-mono">@</span>
                      <input
                        type="text"
                        required
                        placeholder="juandelacruz"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:ring-2 focus:ring-red-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Create Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-type password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-200">
                <p className="text-[11px] text-slate-500 text-center sm:text-left">
                  By submitting, you certify that all information is truthful and subject to review by SACERT leadership.
                </p>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleCloseAll}
                    className="w-1/2 sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 sm:w-auto px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Submit Registration</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
