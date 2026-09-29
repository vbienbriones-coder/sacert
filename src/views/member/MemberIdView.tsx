import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { SacertLogo } from '../../components/SacertLogo';
import { QrCodeBadge } from '../../components/QrCodeBadge';
import { compressAndReadFile } from '../../utils/image';
import { MemberIdCardView } from '../../components/MemberIdCardView';
import {
  CreditCard,
  Printer,
  ShieldCheck,
  Camera,
  Upload,
  UserCheck,
  CheckCircle2,
  Trash2,
  AlertCircle,
  QrCode,
  Info,
  Maximize2,
} from 'lucide-react';

interface MemberIdViewProps {
  onOpenVerify: (memberId?: string) => void;
}

export const MemberIdView: React.FC<MemberIdViewProps> = ({ onOpenVerify }) => {
  const { currentMember, updateMemberProfile } = useAuth();
  const member = currentMember || db.getMembers()[0];

  const [cardSide, setCardSide] = useState<'both' | 'front' | 'back'>('both');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const dataUrl = await compressAndReadFile(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.88,
      });

      // Update in database and context
      db.updateMember(member.id, { profilePhoto: dataUrl }, member.fullName);
      const res = await updateMemberProfile({ profilePhoto: dataUrl });

      if (res.success) {
        setSuccessMsg('Official ID photograph successfully updated!');
        setTimeout(() => setSuccessMsg(''), 4500);
      } else {
        setErrorMsg(res.error || 'Failed to update photo.');
      }
    } catch (err) {
      setErrorMsg('Failed to process image file. Please try another image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your official ID photograph?')) return;

    try {
      db.updateMember(member.id, { profilePhoto: '' }, member.fullName);
      await updateMemberProfile({ profilePhoto: '' });
      setSuccessMsg('ID photograph removed. Default avatar is now displayed.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg('Failed to remove photograph.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const verifyUrl = `${window.location.origin}/?verify=member&code=${member.memberId}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Responder Credential Card
            </span>
            <span className="text-xs text-slate-500 font-mono">· CR-80 Specification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1">
            MY OFFICIAL SACERT ID CARD
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Digital responder identification card with high-resolution photo and encoded QR public registry verification
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Upload Button in Top Bar */}
          <label className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs">
            <Camera className="w-4 h-4 text-amber-400" />
            <span>{isUploading ? 'Uploading...' : 'Upload ID Picture'}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onChange={handlePhotoUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>

          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg flex items-center gap-2 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print ID Card</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 font-black">
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-900 text-xs font-bold rounded-xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-700 hover:text-red-900 font-black">
            ✕
          </button>
        </div>
      )}

      {/* ID Picture Upload Management Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-red-700" />
            <h2 className="text-sm font-extrabold uppercase text-slate-900 tracking-wide">
              Official Responder Photograph for ID
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Current Status: {member.profilePhoto ? 'Custom Photo Active' : 'No Photo Uploaded'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Photo Avatar Preview */}
          <div className="relative group shrink-0">
            <div className="w-28 h-32 rounded-xl border-4 border-slate-800 bg-slate-100 overflow-hidden shadow-md flex items-center justify-center">
              {member.profilePhoto ? (
                <img
                  src={member.profilePhoto}
                  alt={member.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2 text-slate-400">
                  <UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-1" />
                  <span className="text-[10px] uppercase font-bold block">No Photo</span>
                </div>
              )}
            </div>

            {/* Quick hover trigger */}
            <label
              className="absolute inset-0 bg-slate-950/70 text-white rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
              title="Click to choose a new picture"
            >
              <Camera className="w-6 h-6 mb-1 text-amber-400" />
              <span>Change Photo</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handlePhotoUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>

          {/* Upload Controls & Guidelines */}
          <div className="space-y-3 flex-1 text-xs w-full text-center sm:text-left">
            <div>
              <p className="font-bold text-slate-900 text-sm">
                Upload your official portrait picture for your SACERT ID Card
              </p>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Your photograph is printed directly on your official laminated CR-80 responder card and displays during field operations and public registry QR scans.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
              <label className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-2">
                <Upload className="w-4 h-4 text-white" />
                <span>{isUploading ? 'Compressing & Saving...' : 'Choose Picture File...'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handlePhotoUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>

              {member.profilePhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 hover:border-red-200 rounded-xl font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Picture</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Full-Screen Badge Preview</span>
              </button>
            </div>

            <div className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Photograph guidelines:</strong> Clear face-forward portrait, shoulders included, good natural or studio lighting against a clean white or light background. Mobile phone selfies in uniform are accepted.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live On-Page ID Card View */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold font-serif">
              Official SACERT Responder Credential
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Hover over or click the picture on the card to replace photograph
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Card View:</span>
            <div className="flex bg-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setCardSide('both')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  cardSide === 'both' ? 'bg-red-700 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Both Sides
              </button>
              <button
                onClick={() => setCardSide('front')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  cardSide === 'front' ? 'bg-red-700 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Front
              </button>
              <button
                onClick={() => setCardSide('back')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  cardSide === 'back' ? 'bg-red-700 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Display Dual Card Layout */}
        <div className="flex flex-wrap items-center justify-center gap-8 py-4">
          {/* ============ FRONT OF CARD ============ */}
          {(cardSide === 'both' || cardSide === 'front') && (
            <div className="w-[340px] h-[520px] bg-white rounded-2xl shadow-2xl border-2 border-slate-700 overflow-hidden flex flex-col justify-between relative select-none">
              {/* Header Bands */}
              <div>
                <div className="bg-[#B71C1C] text-white p-3 text-center border-b-2 border-amber-400">
                  <div className="flex items-center justify-center gap-2">
                    <SacertLogo size={36} inverted showText={false} />
                    <div className="text-left">
                      <p className="text-[9px] font-bold tracking-widest text-red-100 uppercase">
                        OFFICIAL DISASTER RESPONDER
                      </p>
                      <h4 className="text-xs font-black uppercase tracking-tight text-white leading-tight">
                        SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM
                      </h4>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1565C0] py-1 text-center text-white text-[10px] font-extrabold uppercase tracking-widest">
                  Official Disaster First Responder
                </div>
              </div>

              {/* Photo & Identity */}
              <div className="p-5 flex flex-col items-center text-center space-y-3">
                {/* Photo Frame with Hover Upload Overlay */}
                <div className="w-32 h-36 rounded-xl border-4 border-slate-800 bg-slate-100 overflow-hidden shadow-inner flex items-center justify-center relative group">
                  {member.profilePhoto ? (
                    <img
                      src={member.profilePhoto}
                      alt={member.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-200 to-slate-300 text-slate-500">
                      <UserCheck className="w-12 h-12 text-slate-400 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {member.sex}
                      </span>
                    </div>
                  )}

                  {/* Status chip */}
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded">
                    ACTIVE
                  </span>

                  {/* Overlay click to upload */}
                  <label
                    className="absolute inset-0 bg-slate-950/75 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-2"
                    title="Click to upload new picture for your ID"
                  >
                    <Camera className="w-7 h-7 text-amber-400 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">
                      {member.profilePhoto ? 'Change Picture' : 'Upload Picture'}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handlePhotoUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Name & Designation */}
                <div className="space-y-1 w-full">
                  <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight leading-tight">
                    {member.fullName}
                  </h3>
                  <div className="inline-block px-3 py-1 bg-red-50 border border-red-200 text-red-900 rounded font-bold text-xs uppercase tracking-wide">
                    {member.designation}
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600">
                    {member.responderLevel}
                  </p>
                </div>

                {/* Member ID Code */}
                <div className="w-full bg-slate-950 text-white py-2 px-3 rounded-lg text-center font-mono">
                  <span className="text-[9px] text-slate-400 block tracking-widest uppercase">
                    SACERT ID NUMBER
                  </span>
                  <span className="text-sm font-bold tracking-widest text-amber-400">
                    {member.memberId}
                  </span>
                </div>
              </div>

              {/* Bottom Strip */}
              <div className="bg-slate-900 text-white text-[10px] font-mono py-2 px-4 flex items-center justify-between border-t border-red-700">
                <span>ONBOARDED: {member.dateOnboarded}</span>
                <span className="text-amber-400 font-bold">SACERT</span>
              </div>
            </div>
          )}

          {/* ============ BACK OF CARD ============ */}
          {(cardSide === 'both' || cardSide === 'back') && (
            <div className="w-[340px] h-[520px] bg-white rounded-2xl shadow-2xl border-2 border-slate-700 overflow-hidden flex flex-col justify-between select-none">
              {/* Back Header */}
              <div className="bg-slate-900 text-white p-3 text-center border-b border-red-700">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-400 block">
                  EMERGENCY IDENTIFICATION & VALIDATION
                </span>
                <p className="text-xs font-serif font-black text-white">
                  SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM
                </p>
              </div>

              {/* Back Content */}
              <div className="p-5 space-y-4 text-xs">
                {/* Emergency Contact */}
                <div className="bg-red-50/80 border border-red-200 p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">
                    In Case of Emergency Notify:
                  </span>
                  <p className="font-bold text-slate-900 text-xs">{member.emergencyContact}</p>
                  <p className="font-mono font-semibold text-slate-800 text-xs">
                    {member.emergencyContactNumber}
                  </p>
                  {member.emergencyContactRelation && (
                    <p className="text-[11px] text-slate-500 italic">
                      Relation: {member.emergencyContactRelation}
                    </p>
                  )}
                </div>

                {/* Medical Data */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                      Blood Group
                    </span>
                    <span className="text-base font-black text-red-700">{member.bloodType}</span>
                  </div>
                  <div className="p-2 bg-slate-100 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                      Station Brgy
                    </span>
                    <span className="text-xs font-bold text-slate-800">{member.barangay}</span>
                  </div>
                </div>

                {/* QR Code Validation */}
                <div className="flex items-center justify-center gap-4 py-2 border-y border-slate-200">
                  <QrCodeBadge value={verifyUrl} size={86} />
                  <div className="text-left space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                      SECURITY QR CODE
                    </span>
                    <p className="text-[11px] font-semibold text-slate-800 leading-tight">
                      Scan with any smartphone camera to verify responder identity in public registry.
                    </p>
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {member.memberId}
                    </span>
                  </div>
                </div>

                {/* Official Statement */}
                <div className="text-center space-y-1">
                  <p className="text-[10px] text-slate-600 italic leading-snug">
                    "This credential certifies that the bearer is a bonafide member of SACERT authorized to participate in emergency rescue operations."
                  </p>
                  <p className="text-xs font-serif font-extrabold text-red-900 tracking-wider">
                    "Always Alert. Always Prepared."
                  </p>
                </div>
              </div>

              {/* Back Footer with Signatories */}
              <div className="bg-slate-900 text-white p-3 text-center border-t border-slate-700 space-y-1">
                <div className="flex items-center justify-around">
                  <div>
                    <div className="font-serif italic text-xs font-bold text-red-300">
                      VINCENT B. BRIONES
                    </div>
                    <div className="text-[8.5px] font-mono uppercase text-slate-400">
                      PRESIDENT (SACERT)
                    </div>
                  </div>
                  <div>
                    <div className="font-serif italic text-xs font-bold text-red-300">
                      NICHOLSON J. DASALLA
                    </div>
                    <div className="text-[8.5px] font-mono uppercase text-slate-400">
                      VICE PRESIDENT (SACERT)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Public Verification Link */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <span className="font-mono text-[11px]">QR Registry Link: {verifyUrl}</span>
          <button
            onClick={() => onOpenVerify(member.memberId)}
            className="text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Test Public QR Verification Registry</span>
          </button>
        </div>
      </div>

      {/* Modal for full print */}
      {isPrintModalOpen && (
        <MemberIdCardView
          member={member}
          isOpen={true}
          onClose={() => setIsPrintModalOpen(false)}
          onVerify={() => {
            const id = member.memberId;
            setIsPrintModalOpen(false);
            onOpenVerify(id);
          }}
          onPhotoUpdated={(newPhoto) => {
            updateMemberProfile({ profilePhoto: newPhoto });
          }}
        />
      )}
    </div>
  );
};
