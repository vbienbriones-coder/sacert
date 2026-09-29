import React, { useRef } from 'react';
import { Certificate } from '../types';
import { SacertLogo } from './SacertLogo';
import { QrCodeBadge } from './QrCodeBadge';
import { Printer, ShieldCheck, ShieldAlert, X, Download } from 'lucide-react';

interface CertificateViewProps {
  certificate: Certificate;
  isOpen: boolean;
  onClose: () => void;
  onVerify?: () => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  certificate,
  isOpen,
  onClose,
  onVerify,
}) => {
  const printAreaRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VALID':
        return {
          text: '✓ VALID CERTIFICATE',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'REISSUED':
        return {
          text: '✓ REISSUED & VALID',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
        };
      case 'EXPIRED':
        return {
          text: '⚠ EXPIRED',
          color: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'REVOKED':
        return {
          text: '✕ REVOKED',
          color: 'bg-red-100 text-red-800 border-red-300',
        };
      default:
        return {
          text: status,
          color: 'bg-slate-100 text-slate-800 border-slate-300',
        };
    }
  };

  const statusBadge = getStatusBadge(certificate.status);
  const verifyUrl = `${window.location.origin}/?verify=cert&code=${certificate.certificateNumber}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Controls Bar (Hidden during print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">CERTIFICATE INSPECTOR</span>
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${statusBadge.color}`}>
              {statusBadge.text}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg flex items-center gap-2 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              PRINT CERTIFICATE
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center">
          <div
            ref={printAreaRef}
            id="certificate-print-sheet"
            className="w-full max-w-[850px] bg-[#FDFAF4] text-slate-900 border-8 border-double border-[#8B0000] p-6 sm:p-10 shadow-lg relative rounded-xs select-none"
            style={{
              backgroundImage: 'radial-gradient(#8B000010 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            {/* Revoked watermark if revoked */}
            {certificate.status === 'REVOKED' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="text-red-600/25 text-7xl sm:text-9xl font-black uppercase tracking-widest -rotate-25 border-8 border-dashed border-red-600/30 p-8 rounded-2xl">
                  REVOKED
                </div>
              </div>
            )}

            {/* Header: Logos & Authority */}
            <div className="text-center space-y-2 border-b-2 border-red-950/20 pb-6">
              <div className="flex items-center justify-center gap-4 sm:gap-8">
                <SacertLogo size={74} />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-red-900 mt-1 font-serif">
                  SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM
                </h1>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-700 mt-1">
                  Official Disaster Operations & First Responder Training Directorate
                </p>
                <p className="text-[11px] italic text-slate-600 mt-0.5">
                  "Always Alert. Always Prepared."
                </p>
              </div>
            </div>

            {/* Certificate Title */}
            <div className="text-center my-6 space-y-1">
              <span className="text-xs uppercase font-bold tracking-widest text-slate-500">
                This certifies that
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-wide font-serif pt-2 pb-1 border-b border-slate-300 max-w-md mx-auto">
                {certificate.recipientName}
              </h2>
              <p className="text-xs font-mono font-semibold text-slate-600 pt-1">
                SACERT MEMBER ID: {certificate.memberId}
              </p>
            </div>

            {/* Body Text */}
            <div className="text-center space-y-3 px-4 sm:px-12 my-6">
              <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                has successfully completed all prescribed coursework, field simulations, and competency evaluations for
              </p>
              <h3 className="text-base sm:text-xl font-black text-red-900 uppercase font-serif tracking-wide px-4 py-2 bg-red-50/70 border border-red-200/60 rounded">
                {certificate.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700">
                conducted under the auspices of <strong>{certificate.issuedBy}</strong> on{' '}
                <span className="font-semibold">{certificate.dateCompleted}</span>.
              </p>
            </div>

            {/* Signatures & QR Block */}
            <div className="pt-8 mt-6 border-t border-slate-300 grid grid-cols-3 items-end gap-4 text-center">
              {/* Signatory 1 */}
              <div className="space-y-1">
                <div className="h-10 flex items-end justify-center">
                  <div className="font-serif italic font-bold text-slate-800 text-sm border-b border-slate-900 pb-1 w-4/5 text-center">
                    {certificate.signatories[0]?.name || 'VINCENT B. BRIONES'}
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-800 uppercase">
                  {certificate.signatories[0]?.title || 'PRESIDENT (SACERT)'}
                </p>
              </div>

              {/* Center QR Seal */}
              <div className="flex flex-col items-center justify-center space-y-1">
                <QrCodeBadge value={verifyUrl} size={90} className="shadow-xs" />
                <span className="text-[9px] font-mono uppercase text-slate-500 font-bold">
                  SCAN TO VERIFY
                </span>
              </div>

              {/* Signatory 2 */}
              <div className="space-y-1">
                <div className="h-10 flex items-end justify-center">
                  <div className="font-serif italic font-bold text-slate-800 text-sm border-b border-slate-900 pb-1 w-4/5 text-center">
                    {certificate.signatories[1]?.name || 'NICHOLSON J. DASALLA'}
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs font-bold text-slate-800 uppercase">
                  {certificate.signatories[1]?.title || 'VICE PRESIDENT (SACERT)'}
                </p>
              </div>
            </div>

            {/* Bottom Metadata Ribbon */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-500">
              <div>
                <span>CERT NO: </span>
                <strong className="text-slate-800">{certificate.certificateNumber}</strong>
              </div>
              <div>
                <span>DATE ISSUED: </span>
                <strong className="text-slate-800">{certificate.dateIssued}</strong>
              </div>
              {certificate.expiryDate && (
                <div>
                  <span>VALID UNTIL: </span>
                  <strong className="text-slate-800">{certificate.expiryDate}</strong>
                </div>
              )}
              <div>
                <span>STATUS: </span>
                <strong className={certificate.status === 'VALID' ? 'text-emerald-700' : 'text-red-700'}>
                  {certificate.status}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info (Screen only) */}
        <div className="bg-white p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span className="font-mono">Verification URL: {verifyUrl}</span>
          {onVerify && (
            <button
              onClick={onVerify}
              className="text-red-700 hover:text-red-800 font-bold underline"
            >
              Open Public Verification
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
