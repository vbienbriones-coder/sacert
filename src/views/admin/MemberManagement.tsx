import React, { useState } from 'react';
import { Member, MembershipStatus, ResponderLevel, BloodType } from '../../types';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { MemberIdCardView } from '../../components/MemberIdCardView';
import { MemberRecordPrintView } from '../../components/MemberRecordPrintView';
import { compressAndReadFile } from '../../utils/image';
import { CATANDUANES_MUNICIPALITIES, getBarangaysByMunicipality } from '../../data/catanduanes';
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  KeyRound,
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  CreditCard,
  Printer,
  ShieldCheck,
  ShieldAlert,
  X,
  AlertCircle,
  FileCheck,
  Upload,
  Camera,
  UserPlus,
} from 'lucide-react';

interface MemberManagementProps {
  onNavigate?: (view: string) => void;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({ onNavigate }) => {
  const { currentUser, isSuperAdmin } = useAuth();
  const pendingCount = db.getRegistrations('PENDING').length;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [municipalityFilter, setMunicipalityFilter] = useState<string>('ALL');
  const [barangayFilter, setBarangayFilter] = useState<string>('ALL');
  const [designationFilter, setDesignationFilter] = useState<string>('ALL');
  const [includeDeactivated, setIncludeDeactivated] = useState<boolean>(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedForCard, setSelectedForCard] = useState<Member | null>(null);
  const [selectedForDossier, setSelectedForDossier] = useState<Member | null>(null);
  const [credentialModalMember, setCredentialModalMember] = useState<Member | null>(null);
  const [tempPass, setTempPass] = useState('');
  const [msgSuccess, setMsgSuccess] = useState('');
  const [msgError, setMsgError] = useState('');

  // Form state for Add/Edit Member (all 24 fields)
  const [formData, setFormData] = useState({
    memberId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    dateOfBirth: '1995-01-01',
    sex: 'Male' as 'Male' | 'Female' | 'Other',
    address: 'Zone 1',
    barangay: 'Wagdas',
    municipality: 'San Andres',
    province: 'Catanduanes',
    contactNumber: '0917-000-0000',
    email: '',
    emergencyContact: '',
    emergencyContactNumber: '',
    emergencyContactRelation: 'Spouse',
    dateJoined: new Date().toISOString().split('T')[0],
    dateOnboarded: new Date().toISOString().split('T')[0],
    membershipStatus: 'ACTIVE' as MembershipStatus,
    designation: 'Community Responder',
    responderLevel: 'Level 1 - Basic Responder' as ResponderLevel,
    bloodType: 'O+' as BloodType,
    profilePhoto: '',
    username: '',
    password: '',
  });

  const settings = db.getSettings();
  const allMembers = db.getMembers(includeDeactivated);

  // Filtered members
  const filteredMembers = allMembers.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      m.fullName.toLowerCase().includes(q) ||
      m.memberId.toLowerCase().includes(q) ||
      m.barangay.toLowerCase().includes(q) ||
      m.contactNumber.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.designation.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'ALL' || m.membershipStatus === statusFilter;
    const matchMunicipality = municipalityFilter === 'ALL' || (m.municipality || 'San Andres') === municipalityFilter;
    const matchBarangay = barangayFilter === 'ALL' || m.barangay === barangayFilter;
    const matchDesignation = designationFilter === 'ALL' || m.designation === designationFilter;

    return matchQuery && matchStatus && matchMunicipality && matchBarangay && matchDesignation;
  });

  // Extract distinct barangays & designations for filter dropdowns
  const distinctBarangays =
    municipalityFilter === 'ALL'
      ? Array.from(new Set(allMembers.map((m) => m.barangay))).sort()
      : getBarangaysByMunicipality(municipalityFilter);
  const distinctDesignations = settings.designations || [];

  const openAddModal = () => {
    const nextId = db.getNextMemberId();
    setFormData({
      memberId: nextId,
      firstName: '',
      middleName: '',
      lastName: '',
      suffix: '',
      dateOfBirth: '1996-05-15',
      sex: 'Male',
      address: 'Purok 1',
      barangay: distinctBarangays[0] || 'Wagdas',
      municipality: 'San Andres',
      province: 'Catanduanes',
      contactNumber: '0917-555-0000',
      email: '',
      emergencyContact: '',
      emergencyContactNumber: '0917-555-0001',
      emergencyContactRelation: 'Parent',
      dateJoined: new Date().toISOString().split('T')[0],
      dateOnboarded: new Date().toISOString().split('T')[0],
      membershipStatus: 'ACTIVE',
      designation: distinctDesignations[0] || 'Community Responder',
      responderLevel: 'Level 1 - Basic Responder',
      bloodType: 'O+',
      profilePhoto: '',
      username: '',
      password: '',
    });
    setEditingMember(null);
    setIsAddModalOpen(true);
    setMsgError('');
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setFormData({
      memberId: member.memberId,
      firstName: member.firstName,
      middleName: member.middleName,
      lastName: member.lastName,
      suffix: member.suffix || '',
      dateOfBirth: member.dateOfBirth,
      sex: member.sex,
      address: member.address,
      barangay: member.barangay,
      municipality: member.municipality,
      province: member.province,
      contactNumber: member.contactNumber,
      email: member.email,
      emergencyContact: member.emergencyContact,
      emergencyContactNumber: member.emergencyContactNumber,
      emergencyContactRelation: member.emergencyContactRelation || '',
      dateJoined: member.dateJoined,
      dateOnboarded: member.dateOnboarded,
      membershipStatus: member.membershipStatus,
      designation: member.designation,
      responderLevel: member.responderLevel,
      bloodType: member.bloodType,
      profilePhoto: member.profilePhoto || '',
      username: '',
      password: '',
    });
    setIsAddModalOpen(true);
    setMsgError('');
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    setMsgError('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setMsgError('First Name and Last Name are required.');
      return;
    }

    const adminName = currentUser?.fullName || 'Administrator';
    const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}${formData.suffix ? ' ' + formData.suffix : ''}`.trim();

    try {
      if (editingMember) {
        db.updateMember(
          editingMember.id,
          {
            ...formData,
            fullName,
          },
          adminName
        );
        setMsgSuccess(`Member "${fullName}" successfully updated.`);
      } else {
        // Create Member
        const newMember = db.addMember(
          {
            ...formData,
            fullName,
            skills: ['CERT Basic Course', 'Emergency Medical Triage'],
            qualifications: ['SACERT Responder Certificate'],
            awards: [],
            deploymentsCount: 0,
            deletedAt: null,
          },
          adminName
        );

        // Optionally create user login credentials right away
        if (formData.username.trim() && formData.password.trim()) {
          const newUser = db.createUser(
            {
              username: formData.username.trim(),
              passwordHash: formData.password.trim(),
              role: 'MEMBER',
              memberId: newMember.memberId,
              fullName,
              email: formData.email,
              accountStatus: 'ACTIVE',
            },
            adminName
          );
          db.updateMember(newMember.id, { userId: newUser.id }, adminName);
        }

        setMsgSuccess(`Member "${fullName}" (${newMember.memberId}) successfully enrolled.`);
      }

      setIsAddModalOpen(false);
      setEditingMember(null);
    } catch (err: any) {
      setMsgError(err.message || 'An error occurred while saving.');
    }
  };

  const handleToggleDeactivate = (member: Member) => {
    const adminName = currentUser?.fullName || 'Administrator';
    if (member.deletedAt || member.membershipStatus === 'INACTIVE') {
      db.restoreMember(member.id, adminName);
      setMsgSuccess(`Member ${member.fullName} has been restored to ACTIVE status.`);
    } else {
      if (window.confirm(`Are you sure you want to deactivate ${member.fullName}? Historical records will be safely preserved.`)) {
        db.softDeleteMember(member.id, adminName);
        setMsgSuccess(`Member ${member.fullName} has been deactivated.`);
      }
    }
  };

  const handleGenerateCredentials = (member: Member) => {
    setCredentialModalMember(member);
    const suggestedUsername = `sacert.${member.lastName.toLowerCase()}${member.firstName.charAt(0).toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
    const suggestedPass = `SACERT#${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData((prev) => ({
      ...prev,
      username: suggestedUsername,
      password: suggestedPass,
    }));
    setTempPass(suggestedPass);
  };

  const handleSaveCredentials = () => {
    if (!credentialModalMember) return;
    const adminName = currentUser?.fullName || 'Administrator';

    try {
      // Find existing user or create
      const existingUser = credentialModalMember.userId
        ? db.getUserById(credentialModalMember.userId)
        : db.getUserByUsername(formData.username);

      if (existingUser) {
        db.resetUserPassword(existingUser.id, formData.password, adminName, true);
        db.updateUser(existingUser.id, { username: formData.username, accountStatus: 'ACTIVE' }, adminName);
        setMsgSuccess(`Credentials updated for ${credentialModalMember.fullName}. Password reset successfully.`);
      } else {
        const newUser = db.createUser(
          {
            username: formData.username,
            passwordHash: formData.password,
            role: 'MEMBER',
            memberId: credentialModalMember.memberId,
            fullName: credentialModalMember.fullName,
            email: credentialModalMember.email,
            accountStatus: 'FORCE_PASSWORD_CHANGE',
          },
          adminName
        );
        db.updateMember(credentialModalMember.id, { userId: newUser.id }, adminName);
        setMsgSuccess(`Login credentials issued for ${credentialModalMember.fullName}: Username: ${formData.username}`);
      }

      setCredentialModalMember(null);
    } catch (err: any) {
      setMsgError(err.message || 'Error generating credentials.');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Member ID',
      'Full Name',
      'Barangay',
      'Designation',
      'Responder Level',
      'Blood Type',
      'Contact Number',
      'Email',
      'Emergency Contact',
      'Emergency Phone',
      'Status',
      'Date Onboarded',
    ];

    const rows = filteredMembers.map((m) => [
      m.memberId,
      `"${m.fullName}"`,
      `"${m.barangay}"`,
      `"${m.designation}"`,
      `"${m.responderLevel}"`,
      m.bloodType,
      m.contactNumber,
      m.email,
      `"${m.emergencyContact}"`,
      m.emergencyContactNumber,
      m.membershipStatus,
      m.dateOnboarded,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SACERT_Members_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Personnel Registry
            </span>
            <span className="text-xs text-slate-500">· {allMembers.length} Total Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1">
            SACERT MEMBER MANAGEMENT
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Maintain official responder rosters, issue login credentials, print ID cards & 201 records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pendingCount > 0 && onNavigate && (
            <button
              onClick={() => onNavigate('registrations')}
              className="px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs animate-pulse cursor-pointer"
              title="Review pending member registration applications"
            >
              <UserPlus className="w-4 h-4 text-amber-700" />
              <span>{pendingCount} Pending Requests</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Enroll New Member
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {msgSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-lg flex items-center justify-between">
          <span>✓ {msgSuccess}</span>
          <button onClick={() => setMsgSuccess('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID, contact, barangay..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          {/* Municipality filter */}
          <div>
            <select
              value={municipalityFilter}
              onChange={(e) => {
                setMunicipalityFilter(e.target.value);
                setBarangayFilter('ALL');
              }}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white font-bold"
            >
              <option value="ALL">All 11 Municipalities</option>
              {CATANDUANES_MUNICIPALITIES.map((mun) => (
                <option key={mun} value={mun}>
                  {mun}
                </option>
              ))}
            </select>
          </div>

          {/* Barangay filter */}
          <div>
            <select
              value={barangayFilter}
              onChange={(e) => setBarangayFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
            >
              <option value="ALL">
                {municipalityFilter === 'ALL' ? 'All Barangays' : `All ${municipalityFilter} Barangays`}
              </option>
              {distinctBarangays.map((b) => (
                <option key={b} value={b}>
                  Brgy. {b}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="RESIGNED">RESIGNED</option>
              <option value="RETIRED">RETIRED</option>
              <option value="DECEASED">DECEASED</option>
            </select>
          </div>

          {/* Designation filter */}
          <div>
            <select
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
            >
              <option value="ALL">All Designations</option>
              {distinctDesignations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800 font-mono">{filteredMembers.length}</strong> of{' '}
            <strong className="text-slate-800 font-mono">{allMembers.length}</strong> members
          </span>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeDeactivated}
              onChange={(e) => setIncludeDeactivated(e.target.checked)}
              className="rounded text-red-700 focus:ring-red-600 w-3.5 h-3.5"
            />
            <span>Include Deactivated/Inactive Records</span>
          </label>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase font-bold tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Member ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Designation & Level</th>
                <th className="py-3 px-4">Barangay</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      member.deletedAt ? 'bg-slate-50 opacity-70' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-red-900 whitespace-nowrap">
                      {member.memberId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0">
                          {member.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">{member.fullName}</p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Blood: {member.bloodType} · {member.sex}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{member.designation}</p>
                      <p className="text-[11px] text-slate-500">{member.responderLevel.split('-')[0]}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      Brgy. {member.barangay}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      <div>{member.contactNumber}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{member.email}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                          member.membershipStatus === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : member.membershipStatus === 'SUSPENDED'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {member.membershipStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* ID Card preview */}
                        <button
                          onClick={() => setSelectedForCard(member)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                          title="View & Print Responder ID Card"
                        >
                          <CreditCard className="w-4 h-4 text-blue-700" />
                        </button>

                        {/* Dossier Record */}
                        <button
                          onClick={() => setSelectedForDossier(member)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                          title="Print 201 Personnel Record"
                        >
                          <Printer className="w-4 h-4 text-slate-700" />
                        </button>

                        {/* Issue Credentials */}
                        <button
                          onClick={() => handleGenerateCredentials(member)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                          title="Issue / Reset Login Credentials"
                        >
                          <KeyRound className="w-4 h-4 text-amber-600" />
                        </button>

                        {/* Edit Member */}
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                          title="Edit Member Information"
                        >
                          <Edit2 className="w-4 h-4 text-slate-700" />
                        </button>

                        {/* Soft Deactivate / Restore */}
                        <button
                          onClick={() => handleToggleDeactivate(member)}
                          className={`p-1.5 rounded transition-colors ${
                            member.deletedAt || member.membershipStatus === 'INACTIVE'
                              ? 'text-emerald-700 hover:bg-emerald-100'
                              : 'text-red-600 hover:bg-red-100'
                          }`}
                          title={
                            member.deletedAt || member.membershipStatus === 'INACTIVE'
                              ? 'Restore Member'
                              : 'Soft Deactivate Member'
                          }
                        >
                          {member.deletedAt || member.membershipStatus === 'INACTIVE' ? (
                            <RotateCcw className="w-4 h-4" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No members found matching the specified filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= ADD / EDIT MEMBER MODAL (All 24 fields) ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b-2 border-red-700">
              <div>
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest block">
                  SACERT Personnel Administration
                </span>
                <h2 className="text-lg font-black uppercase text-white font-serif">
                  {editingMember ? 'MODIFY MEMBER RECORD' : 'ENROLL NEW SACERT MEMBER'}
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="overflow-y-auto p-6 space-y-6 text-xs">
              {msgError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{msgError}</span>
                </div>
              )}

              {/* 1. Identification & Names */}
              <div>
                <h3 className="font-extrabold uppercase text-slate-900 border-b border-slate-200 pb-1 mb-3 text-xs tracking-wider">
                  1. Identification & Full Name
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Member ID <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.memberId}
                      onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded font-mono font-bold uppercase focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      First Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Middle Name</label>
                    <input
                      type="text"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-slate-600 font-semibold mb-1">
                        Last Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Suffix</label>
                      <input
                        type="text"
                        placeholder="Jr."
                        value={formData.suffix}
                        onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Demographic & Medical */}
              <div>
                <h3 className="font-extrabold uppercase text-slate-900 border-b border-slate-200 pb-1 mb-3 text-xs tracking-wider">
                  2. Demographic & Medical Data
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Sex</label>
                    <select
                      value={formData.sex}
                      onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Blood Type</label>
                    <select
                      value={formData.bloodType}
                      onChange={(e) => setFormData({ ...formData, bloodType: e.target.value as any })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none bg-white font-bold text-red-700"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Address & Station */}
              <div>
                <h3 className="font-extrabold uppercase text-slate-900 border-b border-slate-200 pb-1 mb-3 text-xs tracking-wider">
                  3. Address & Geographical Location
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Municipality (11 Municipalities) *
                    </label>
                    <select
                      value={formData.municipality || 'San Andres'}
                      onChange={(e) => {
                        const newMun = e.target.value;
                        const brgys = getBarangaysByMunicipality(newMun);
                        setFormData({
                          ...formData,
                          municipality: newMun,
                          barangay: brgys[0] || '',
                        });
                      }}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none font-bold bg-white"
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
                      Barangay ({formData.municipality || 'San Andres'}) *
                    </label>
                    <select
                      value={formData.barangay}
                      onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none bg-white font-medium"
                    >
                      {getBarangaysByMunicipality(formData.municipality || 'San Andres').map((b) => (
                        <option key={b} value={b}>
                          Brgy. {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Street / Zone / Purok Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. Purok 1, Coastal Road"
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Contact & Emergency Contact */}
              <div>
                <h3 className="font-extrabold uppercase text-slate-900 border-b border-slate-200 pb-1 mb-3 text-xs tracking-wider">
                  4. Contact & Emergency Hotlines
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Contact Number</label>
                    <input
                      type="text"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Emergency Contact Person</label>
                    <input
                      type="text"
                      placeholder="Name (e.g. Spouse/Parent)"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Emergency Phone Number</label>
                    <input
                      type="text"
                      value={formData.emergencyContactNumber}
                      onChange={(e) => setFormData({ ...formData, emergencyContactNumber: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none font-mono text-red-900 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* 5. SACERT Position, Designation & Status */}
              <div>
                <h3 className="font-extrabold uppercase text-slate-900 border-b border-slate-200 pb-1 mb-3 text-xs tracking-wider">
                  5. Official SACERT Designation & Status
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Position / Designation</label>
                    <select
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none bg-white font-semibold"
                    >
                      {distinctDesignations.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Responder Level</label>
                    <select
                      value={formData.responderLevel}
                      onChange={(e) => setFormData({ ...formData, responderLevel: e.target.value as any })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none bg-white"
                    >
                      <option value="Level 1 - Volunteer Responder">Level 1 - Volunteer Responder</option>
                      <option value="Level 2 - Basic Responder">Level 2 - Basic Responder</option>
                      <option value="Level 3 - Intermediate Responder">Level 3 - Intermediate Responder</option>
                      <option value="Level 4 - Advanced Responder">Level 4 - Advanced Responder</option>
                      <option value="Level 5 - Specialized Teams">Level 4 - Specialized Teams</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Membership Status</label>
                    <select
                      value={formData.membershipStatus}
                      onChange={(e) => setFormData({ ...formData, membershipStatus: e.target.value as any })}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none bg-white font-bold"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                      <option value="RESIGNED">RESIGNED</option>
                      <option value="RETIRED">RETIRED</option>
                      <option value="DECEASED">DECEASED</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Date Joined</label>
                      <input
                        type="date"
                        value={formData.dateJoined}
                        onChange={(e) => setFormData({ ...formData, dateJoined: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Onboarded</label>
                      <input
                        type="date"
                        value={formData.dateOnboarded}
                        onChange={(e) => setFormData({ ...formData, dateOnboarded: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Profile Photo Upload */}
              <div>
                <h3 className="font-extrabold uppercase text-slate-900 border-b border-slate-200 pb-1 mb-3 text-xs tracking-wider">
                  6. Official Member Photo Upload
                </h3>
                <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  {/* Photo Preview */}
                  <div className="w-24 h-28 rounded-xl border-2 border-slate-300 bg-white overflow-hidden shadow-inner flex items-center justify-center shrink-0">
                    {formData.profilePhoto ? (
                      <img
                        src={formData.profilePhoto}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                        <span className="text-[9px] uppercase font-bold block">No Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    <label className="block font-semibold text-slate-700">
                      Upload Responder Photograph (JPEG, PNG, WEBP - Max 3MB)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-red-400" />
                        <span>Choose Photo File...</span>
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
                              const result = await compressAndReadFile(file, {
                                maxWidth: 600,
                                maxHeight: 600,
                                quality: 0.88,
                              });
                              setFormData((prev) => ({ ...prev, profilePhoto: result }));
                            } catch (err) {
                              alert('Error processing image. Please try another file.');
                            }
                          }}
                          className="hidden"
                        />
                      </label>

                      {formData.profilePhoto && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, profilePhoto: '' }))}
                          className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-bold transition-colors"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Uploaded photo will be printed on official SACERT ID Cards and 201 Personnel Dossiers.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. Credentials (Optional during enrollment) */}
              {!editingMember && (
                <div>
                  <h3 className="font-extrabold uppercase text-slate-900 border-b border-slate-200 pb-1 mb-3 text-xs tracking-wider">
                    6. Optional Initial Portal Account Credentials
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Username</label>
                      <input
                        type="text"
                        placeholder="e.g. sacert.reyes"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Temporary Password</label>
                      <input
                        type="text"
                        placeholder="e.g. Member@2026"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-600 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold uppercase tracking-wide shadow-xs"
                >
                  {editingMember ? 'Save Modifications' : 'Register Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ISSUE / RESET CREDENTIALS MODAL ================= */}
      {credentialModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">LOGIN CREDENTIAL ISSUANCE</h3>
              </div>
              <button
                onClick={() => setCredentialModalMember(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="font-bold text-slate-900">{credentialModalMember.fullName}</p>
                <p className="text-slate-500 font-mono">
                  {credentialModalMember.memberId} · {credentialModalMember.designation}
                </p>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Temporary Password</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded font-mono font-bold text-red-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const rand = `SACERT#${Math.floor(1000 + Math.random() * 9000)}`;
                      setFormData({ ...formData, password: rand });
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded font-bold whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  User will be forced to change this password upon their first successful login.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCredentialModalMember(null)}
                  className="px-3 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCredentials}
                  className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded font-bold"
                >
                  Save & Issue Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ID Card Viewer Modal */}
      {selectedForCard && (
        <MemberIdCardView
          member={selectedForCard}
          isOpen={true}
          onClose={() => setSelectedForCard(null)}
        />
      )}

      {/* 201 Dossier Record Printable Modal */}
      {selectedForDossier && (
        <MemberRecordPrintView
          member={selectedForDossier}
          isOpen={true}
          onClose={() => setSelectedForDossier(null)}
        />
      )}
    </div>
  );
};
