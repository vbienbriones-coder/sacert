import React from 'react';
import { Member } from '../types';
import { db } from '../services/db';
import { SacertLogo } from './SacertLogo';
import { QrCodeBadge } from './QrCodeBadge';
import { Printer, X, Download, UserCheck, ShieldCheck } from 'lucide-react';

interface MemberRecordPrintViewProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
}

export const MemberRecordPrintView: React.FC<MemberRecordPrintViewProps> = ({
  member,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  // Query member's certificates & trainings
  const certificates = db.getCertificatesByMemberId(member.memberId);
  const trainings = db.getTrainings().filter((t) =>
    t.participants.some((p) => p.memberId === member.memberId)
  );

  const handlePrint = () => {
    window.print();
  };

  const verifyUrl = `${window.location.origin}/?verify=member&code=${member.memberId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Top Control Bar */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">OFFICIAL 201 DOSSIER</span>
            <span className="font-bold text-sm text-white">{member.fullName}</span>
            <span className="px-2 py-0.5 text-xs font-mono bg-red-700 text-white rounded">
              {member.memberId}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg flex items-center gap-2 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              PRINT DOSSIER
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Canvas */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center">
          <div
            id="member-dossier-print"
            className="w-full max-w-[850px] bg-white text-slate-900 p-8 sm:p-12 shadow-lg border border-slate-300 relative select-none"
          >
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-5 mb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <SacertLogo size={70} />
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-red-900 uppercase font-serif tracking-tight">
                    SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM
                  </h1>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mt-1">
                    Official Member 201 Personnel Record File
                  </p>
                  <p className="text-[11px] italic text-slate-600">
                    "Always Alert. Always Prepared."
                  </p>
                </div>
              </div>
              <div className="text-right">
                <QrCodeBadge value={verifyUrl} size={70} />
                <span className="text-[9px] font-mono text-slate-500 block text-center mt-1">
                  ID: {member.memberId}
                </span>
              </div>
            </div>

            {/* Profile Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6 pb-6 border-b border-slate-200">
              {/* Photo Box */}
              <div className="sm:col-span-1 flex flex-col items-center">
                <div className="w-36 h-44 rounded-lg border-2 border-slate-800 bg-slate-100 overflow-hidden flex items-center justify-center">
                  {member.profilePhoto ? (
                    <img
                      src={member.profilePhoto}
                      alt={member.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400">
                      <UserCheck className="w-12 h-12 mx-auto mb-1 text-slate-400" />
                      <span className="text-[10px] uppercase font-bold block">PHOTO ON FILE</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <span className="px-2 py-0.5 text-xs font-bold font-mono bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                    {member.membershipStatus}
                  </span>
                </div>
              </div>

              {/* Personal Data */}
              <div className="sm:col-span-3 grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-500 uppercase font-semibold block text-[10px]">
                    Full Name:
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">{member.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold block text-[10px]">
                    Member Identification Number:
                  </span>
                  <span className="font-mono font-bold text-red-800 text-sm">{member.memberId}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold block text-[10px]">
                    SACERT Designation / Role:
                  </span>
                  <span className="font-bold text-slate-900">{member.designation}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold block text-[10px]">
                    Responder Competency Level:
                  </span>
                  <span className="font-semibold text-slate-800">{member.responderLevel}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold block text-[10px]">
                    Station Barangay:
                  </span>
                  <span className="font-semibold text-slate-800">{member.barangay}, San Andres</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold block text-[10px]">
                    Blood Type / Sex:
                  </span>
                  <span className="font-bold text-slate-900">
                    {member.bloodType} · {member.sex}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold block text-[10px]">
                    Contact Number:
                  </span>
                  <span className="font-mono text-slate-900 font-semibold">{member.contactNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold block text-[10px]">
                    Official Email:
                  </span>
                  <span className="text-slate-900">{member.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold block text-[10px]">
                    Date Joined / Date Onboarded:
                  </span>
                  <span className="font-mono text-slate-800">
                    {member.dateJoined} / {member.dateOnboarded}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold block text-[10px]">
                    Recorded Disaster Deployments:
                  </span>
                  <span className="font-bold text-slate-900">{member.deploymentsCount} Missions</span>
                </div>
              </div>
            </div>

            {/* Emergency Contact & Residential Address */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-200 text-xs">
              <div className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Residential Address
                </span>
                <p className="font-medium text-slate-800">
                  {member.address}, Brgy. {member.barangay}
                </p>
                <p className="text-slate-600">
                  {member.municipality}, {member.province}, Philippines
                </p>
              </div>

              <div className="bg-red-50/70 p-3.5 rounded border border-red-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 block">
                  Designated Emergency Contact Person
                </span>
                <p className="font-bold text-slate-900">{member.emergencyContact}</p>
                <p className="font-mono font-semibold text-slate-800">
                  Hotline: {member.emergencyContactNumber}
                </p>
                {member.emergencyContactRelation && (
                  <p className="text-slate-600 text-[11px]">
                    Relationship: {member.emergencyContactRelation}
                  </p>
                )}
              </div>
            </div>

            {/* Skills & Qualifications */}
            <div className="mb-6 pb-6 border-b border-slate-200 space-y-3 text-xs">
              <h3 className="font-extrabold uppercase text-slate-900 tracking-wide text-xs">
                Emergency Skills & Professional Qualifications
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Specialized Technical Skills:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {member.skills?.length > 0 ? (
                      member.skills.map((skill, i) => <li key={i}>{skill}</li>)
                    ) : (
                      <li>General First Responder Foundation</li>
                    )}
                  </ul>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Accreditations & Honors:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {member.qualifications?.map((q, i) => <li key={i}>{q}</li>)}
                    {member.awards?.map((a, i) => <li key={`a-${i}`}>🎖 {a}</li>)}
                    {!member.qualifications?.length && !member.awards?.length && (
                      <li>Standard CERT Accreditation</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Completed Trainings Log */}
            <div className="mb-6 pb-6 border-b border-slate-200 space-y-2 text-xs">
              <h3 className="font-extrabold uppercase text-slate-900 tracking-wide text-xs">
                Official SACERT Training Log ({trainings.length})
              </h3>
              {trainings.length > 0 ? (
                <table className="w-full text-left border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px]">
                    <tr>
                      <th className="p-2 border-b border-slate-200">Code</th>
                      <th className="p-2 border-b border-slate-200">Training Program</th>
                      <th className="p-2 border-b border-slate-200">Dates</th>
                      <th className="p-2 border-b border-slate-200">Hours</th>
                      <th className="p-2 border-b border-slate-200">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {trainings.map((t) => (
                      <tr key={t.id}>
                        <td className="p-2 font-mono font-semibold">{t.trainingId}</td>
                        <td className="p-2 font-medium">{t.title}</td>
                        <td className="p-2 font-mono">{t.startDate}</td>
                        <td className="p-2 font-mono">{t.hours} hrs</td>
                        <td className="p-2 font-bold text-emerald-700">{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-slate-500 italic">No formal trainings recorded yet.</p>
              )}
            </div>

            {/* Issued Certificates */}
            <div className="mb-8 space-y-2 text-xs">
              <h3 className="font-extrabold uppercase text-slate-900 tracking-wide text-xs">
                Issued Certifications ({certificates.length})
              </h3>
              {certificates.length > 0 ? (
                <table className="w-full text-left border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px]">
                    <tr>
                      <th className="p-2 border-b border-slate-200">Certificate #</th>
                      <th className="p-2 border-b border-slate-200">Title</th>
                      <th className="p-2 border-b border-slate-200">Date Issued</th>
                      <th className="p-2 border-b border-slate-200">Validity</th>
                      <th className="p-2 border-b border-slate-200">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {certificates.map((c) => (
                      <tr key={c.id}>
                        <td className="p-2 font-mono font-bold text-red-900">{c.certificateNumber}</td>
                        <td className="p-2 font-medium">{c.title}</td>
                        <td className="p-2 font-mono">{c.dateIssued}</td>
                        <td className="p-2 font-mono">{c.expiryDate || 'Permanent'}</td>
                        <td className="p-2 font-bold text-emerald-700">{c.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-slate-500 italic">No certificates issued on file.</p>
              )}
            </div>

            {/* Signatures & Certification Block */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-slate-900 text-center text-xs">
              <div>
                <p className="font-serif italic font-bold text-sm text-slate-900 mb-1">
                  VINCENT B. BRIONES
                </p>
                <p className="text-[10px] uppercase font-bold text-slate-600 border-t border-slate-400 pt-1">
                  PRESIDENT (SACERT)
                </p>
              </div>
              <div>
                <p className="font-serif italic font-bold text-sm text-slate-900 mb-1">
                  NICHOLSON J. DASALLA
                </p>
                <p className="text-[10px] uppercase font-bold text-slate-600 border-t border-slate-400 pt-1">
                  VICE PRESIDENT (SACERT)
                </p>
              </div>
            </div>

            <div className="mt-8 text-center text-[10px] font-mono text-slate-400">
              San Andres Community Emergency Response Team Official Digital System · Printed on {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
