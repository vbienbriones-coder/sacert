import React, { useState } from 'react';
import { Member } from '../../types';
import { db } from '../../services/db';
import { MemberIdCardView } from '../../components/MemberIdCardView';
import { compressAndReadFile } from '../../utils/image';
import { CreditCard, Search, Printer, Eye, QrCode, Camera, Upload, CheckCircle2 } from 'lucide-react';

interface IdManagementProps {
  onOpenVerify: (memberId?: string) => void;
}

export const IdManagement: React.FC<IdManagementProps> = ({ onOpenVerify }) => {
  const [members, setMembers] = useState<Member[]>(db.getMembers(false));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [successToast, setSuccessToast] = useState('');

  const reloadMembers = () => {
    setMembers(db.getMembers(false));
  };

  const handleMemberPhotoUpload = async (memberId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    try {
      const dataUrl = await compressAndReadFile(file, { maxWidth: 600, maxHeight: 600, quality: 0.88 });
      db.updateMember(memberId, { profilePhoto: dataUrl }, 'Administrator');
      reloadMembers();
      setSuccessToast('Responder ID photograph updated successfully.');
      setTimeout(() => setSuccessToast(''), 3500);
    } catch (err) {
      alert('Error updating photograph.');
    }
  };

  const filtered = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      m.fullName.toLowerCase().includes(q) ||
      m.memberId.toLowerCase().includes(q) ||
      m.designation.toLowerCase().includes(q) ||
      m.barangay.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Credentials & Identification
            </span>
            <span className="text-xs text-slate-500">· Official CR-80 Responder Badges</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1">
            SACERT MEMBER ID MANAGEMENT
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Generate, preview, and print official dual-sided ID cards with encoded QR verification codes
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Printer className="w-4 h-4" />
          Batch Print ID Cards
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search responder by name, ID number, barangay, or position..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ID Cards Grid Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            {/* Top Badge Mini-View */}
            <div className="p-4 bg-gradient-to-r from-red-800 to-red-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest text-red-200 block uppercase">
                  SAN ANDRES CERT
                </span>
                <p className="font-mono font-bold text-xs text-amber-300">{member.memberId}</p>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-white text-red-900 rounded font-mono">
                {member.bloodType}
              </span>
            </div>

            {/* Identity Info */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                {/* Avatar with Click-to-Upload Camera Overlay */}
                <div className="relative group w-14 h-16 rounded-xl bg-slate-100 border-2 border-slate-300 overflow-hidden shadow-2xs shrink-0 flex items-center justify-center">
                  {member.profilePhoto ? (
                    <img src={member.profilePhoto} alt={member.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-slate-600 text-sm">{member.firstName.charAt(0)}</span>
                  )}
                  <label
                    className="absolute inset-0 bg-slate-950/75 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1"
                    title="Upload / Change Photo for ID"
                  >
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span className="text-[8px] font-bold uppercase mt-0.5">Photo</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={(e) => handleMemberPhotoUpload(member.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{member.fullName}</h3>
                  <p className="text-xs text-red-700 font-semibold">{member.designation}</p>
                  <p className="text-[11px] text-slate-500 font-mono">Brgy. {member.barangay}</p>
                </div>
              </div>

              <div className="p-2 bg-slate-50 rounded border border-slate-100 text-[11px] text-slate-600 space-y-0.5 font-mono">
                <p>
                  <span className="text-slate-400">ICE:</span> {member.emergencyContact}
                </p>
                <p>
                  <span className="text-slate-400">Tel:</span> {member.emergencyContactNumber}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenVerify(member.memberId)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5 text-slate-500" />
                  <span>Verify</span>
                </button>
                <label
                  className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                  title="Upload / Replace Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Photo</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={(e) => handleMemberPhotoUpload(member.id, e)}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                onClick={() => setSelectedMember(member)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-red-400" />
                <span>Open ID Card</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ID Card Modal */}
      {selectedMember && (
        <MemberIdCardView
          member={selectedMember}
          isOpen={true}
          onClose={() => setSelectedMember(null)}
          onVerify={() => {
            const id = selectedMember.memberId;
            setSelectedMember(null);
            onOpenVerify(id);
          }}
          onPhotoUpdated={(newPhoto) => {
            reloadMembers();
            setSelectedMember((prev) => (prev ? { ...prev, profilePhoto: newPhoto } : null));
          }}
        />
      )}
    </div>
  );
};
