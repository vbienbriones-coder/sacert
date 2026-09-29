import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { SacertLogo } from './SacertLogo';
import { QrCodeBadge } from './QrCodeBadge';
import { db } from '../services/db';
import { compressAndReadFile } from '../utils/image';
import { Printer, X, RefreshCw, UserCheck, Shield, Camera, Upload, CheckCircle2 } from 'lucide-react';

interface MemberIdCardViewProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
  onVerify?: () => void;
  onPhotoUpdated?: (newPhoto: string) => void;
}

export const MemberIdCardView: React.FC<MemberIdCardViewProps> = ({
  member,
  isOpen,
  onClose,
  onVerify,
  onPhotoUpdated,
}) => {
  const [cardSide, setCardSide] = useState<'both' | 'front' | 'back'>('both');
  const [currentPhoto, setCurrentPhoto] = useState(member.profilePhoto || '');
  const [isUploading, setIsUploading] = useState(false);
  const [photoSuccessMsg, setPhotoSuccessMsg] = useState('');

  useEffect(() => {
    setCurrentPhoto(member.profilePhoto || '');
  }, [member.profilePhoto]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    setIsUploading(true);
    try {
      const dataUrl = await compressAndReadFile(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.88,
      });

      setCurrentPhoto(dataUrl);
      db.updateMember(member.id, { profilePhoto: dataUrl }, 'User / Administrator');
      if (onPhotoUpdated) {
        onPhotoUpdated(dataUrl);
      }
      setPhotoSuccessMsg('ID photo updated successfully!');
      setTimeout(() => setPhotoSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to process image. Please try another file.');
    } finally {
      setIsUploading(false);
    }
  };

  const verifyUrl = `${window.location.origin}/?verify=member&code=${member.memberId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">OFFICIAL RESPONDER ID CARD</span>
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-red-700 text-white rounded">
              {member.memberId}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Upload / Change Photo button in header */}
            <label className="px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs">
              <Camera className="w-4 h-4 text-amber-400" />
              <span>{isUploading ? 'Saving Photo...' : 'Upload ID Photo'}</span>
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
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg flex items-center gap-2 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              PRINT ID CARD
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {photoSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs font-bold text-emerald-800 flex items-center gap-2 print:hidden">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{photoSuccessMsg}</span>
          </div>
        )}

        {/* View Mode Switcher (Screen only) */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Display:</span>
            <div className="flex bg-slate-200 p-0.5 rounded-lg">
              <button
                onClick={() => setCardSide('both')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  cardSide === 'both' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                }`}
              >
                Front & Back
              </button>
              <button
                onClick={() => setCardSide('front')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  cardSide === 'front' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                }`}
              >
                Front Only
              </button>
              <button
                onClick={() => setCardSide('back')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  cardSide === 'back' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                }`}
              >
                Back Only
              </button>
            </div>
          </div>
          <span className="text-slate-500 font-mono text-[11px]">
            Hover or click photo frame on card to upload photo
          </span>
        </div>

        {/* Card Canvas */}
        <div className="p-6 sm:p-10 bg-slate-200/80 flex flex-wrap items-center justify-center gap-8 overflow-y-auto">
          {/* ============ FRONT OF CARD ============ */}
          {(cardSide === 'both' || cardSide === 'front') && (
            <div className="w-[340px] h-[520px] bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden flex flex-col justify-between relative select-none print:shadow-none print:border-slate-800">
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
                {/* Photo Frame with Direct Click/Hover Upload */}
                <div className="w-32 h-36 rounded-xl border-4 border-slate-800 bg-slate-100 overflow-hidden shadow-inner flex items-center justify-center relative group">
                  {currentPhoto ? (
                    <img
                      src={currentPhoto}
                      alt={member.fullName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
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

                  {/* Hover Upload Overlay on Card */}
                  <label
                    className="absolute inset-0 bg-slate-950/75 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-2 print:hidden"
                    title="Click to upload/change photo for this ID"
                  >
                    <Camera className="w-7 h-7 text-amber-400 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider leading-tight">
                      {currentPhoto ? 'Change Photo' : 'Upload Photo'}
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
                  <span className="text-base font-extrabold text-amber-400 tracking-wider">
                    {member.memberId}
                  </span>
                </div>
              </div>

              {/* Bottom Footer Band */}
              <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-[10px] font-mono border-t border-slate-700">
                <span>ONBOARDED: {member.dateOnboarded}</span>
                <span className="text-amber-400 font-bold">SACERT</span>
              </div>
            </div>
          )}

          {/* ============ BACK OF CARD ============ */}
          {(cardSide === 'both' || cardSide === 'back') && (
            <div className="w-[340px] h-[520px] bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden flex flex-col justify-between select-none print:shadow-none print:border-slate-800">
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
                  <QrCodeBadge value={verifyUrl} size={90} />
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

              {/* Back Footer */}
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

        {/* Footer info (Screen only) */}
        <div className="bg-white p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span>Public verification URL: {verifyUrl}</span>
          {onVerify && (
            <button
              onClick={onVerify}
              className="text-red-700 hover:text-red-800 font-bold underline"
            >
              Test Public Verification
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
