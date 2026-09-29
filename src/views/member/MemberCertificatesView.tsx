import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/db';
import { Certificate } from '../../types';
import { CertificateView } from '../../components/CertificateView';
import { Award, Printer, ShieldCheck, QrCode } from 'lucide-react';

interface MemberCertificatesViewProps {
  onOpenVerify: (certNo?: string) => void;
}

export const MemberCertificatesView: React.FC<MemberCertificatesViewProps> = ({ onOpenVerify }) => {
  const { currentMember } = useAuth();
  const member = currentMember || db.getMembers()[0];
  const certificates = db.getCertificatesByMemberId(member.memberId);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            Official Credentials
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1">
          MY ISSUED CERTIFICATES
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Official digital credentials of completion and competency with automated QR verification seals
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {certificates.map((c) => (
          <div
            key={c.id}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-red-900 text-xs">{c.certificateNumber}</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    c.status === 'VALID' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 leading-snug">{c.title}</h2>
              <p className="text-xs text-slate-500 font-mono">Issued by: {c.issuedBy}</p>
              <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-2 border-t border-slate-100">
                <span>Date: {c.dateIssued}</span>
                <span>Valid: {c.expiryDate || 'Permanent'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSelectedCert(c)}
                className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>View & Print</span>
              </button>
              <button
                onClick={() => onOpenVerify(c.certificateNumber)}
                className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                title="Verify online"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Verify</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedCert && (
        <CertificateView
          certificate={selectedCert}
          isOpen={true}
          onClose={() => setSelectedCert(null)}
          onVerify={() => {
            const num = selectedCert.certificateNumber;
            setSelectedCert(null);
            onOpenVerify(num);
          }}
        />
      )}
    </div>
  );
};
