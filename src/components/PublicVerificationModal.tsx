import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { SacertLogo } from './SacertLogo';
import { Certificate, Member } from '../types';
import { Search, ShieldCheck, ShieldAlert, X, ExternalLink, Award, UserCheck } from 'lucide-react';

interface PublicVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'cert' | 'member';
  initialCode?: string;
}

export const PublicVerificationModal: React.FC<PublicVerificationProps> = ({
  isOpen,
  onClose,
  initialType = 'cert',
  initialCode = '',
}) => {
  const [activeTab, setActiveTab] = useState<'cert' | 'member'>(initialType);
  const [query, setQuery] = useState(initialCode);
  const [verifiedCert, setVerifiedCert] = useState<Certificate | null>(null);
  const [verifiedMember, setVerifiedMember] = useState<Member | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialCode) {
      setQuery(initialCode);
      handleVerify(initialType, initialCode);
    } else {
      setVerifiedCert(null);
      setVerifiedMember(null);
      setHasSearched(false);
      setErrorMsg('');
    }
  }, [initialCode, initialType, isOpen]);

  const handleVerify = (type: 'cert' | 'member', searchVal: string) => {
    const term = searchVal.trim().toUpperCase();
    setHasSearched(true);
    setErrorMsg('');
    setVerifiedCert(null);
    setVerifiedMember(null);

    if (!term) {
      setErrorMsg('Please enter a Certificate Number or Member ID to verify.');
      return;
    }

    if (type === 'cert') {
      const cert = db.getCertificateByNumber(term);
      if (cert) {
        setVerifiedCert(cert);
      } else {
        // Also check if they entered just the number part
        const match = db.getCertificates().find((c) => c.certificateNumber.toUpperCase().includes(term));
        if (match) {
          setVerifiedCert(match);
        } else {
          setErrorMsg(`No official certificate found matching "${term}". Please ensure the certificate number is typed accurately.`);
        }
      }
    } else {
      const member = db.getMemberByMemberId(term);
      if (member) {
        setVerifiedMember(member);
      } else {
        const match = db.getMembers(true).find((m) => m.memberId.toUpperCase().includes(term));
        if (match) {
          setVerifiedMember(match);
        } else {
          setErrorMsg(`No registered SACERT member found matching "${term}".`);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b-4 border-red-700 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <SacertLogo size={42} inverted showText={false} />
            <div>
              <p className="text-xs font-bold text-red-400 uppercase tracking-widest">
                Official Public Registry
              </p>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                SACERT CREDENTIAL VERIFICATION
              </h2>
              <p className="text-xs text-red-200">
                SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => {
              setActiveTab('cert');
              setHasSearched(false);
              setQuery('');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'cert'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            Verify Certificate
          </button>
          <button
            onClick={() => {
              setActiveTab('member');
              setHasSearched(false);
              setQuery('');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'member'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Verify Member ID
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(activeTab, query);
            }}
            className="space-y-3"
          >
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              {activeTab === 'cert' ? 'Enter Certificate Number:' : 'Enter SACERT Member ID:'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={activeTab === 'cert' ? 'e.g. CERT-2026-0089' : 'e.g. SACERT-2026-0001'}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 uppercase font-mono tracking-wider font-semibold"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                VERIFY
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              {activeTab === 'cert'
                ? 'Sample valid numbers: CERT-2026-0089, CERT-2026-0090, CERT-2026-0104'
                : 'Sample member IDs: SACERT-2026-0001, SACERT-2026-0002, SACERT-2026-0003'}
            </p>
          </form>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-900">Verification Inconclusive</p>
                <p className="text-xs text-red-700 mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Certificate Result */}
          {activeTab === 'cert' && verifiedCert && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Verification Status
                </span>
                {verifiedCert.status === 'VALID' || verifiedCert.status === 'REISSUED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-full text-xs font-extrabold tracking-wide">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    ✓ VALID CERTIFICATE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 border border-red-300 text-red-800 rounded-full text-xs font-extrabold tracking-wide">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    ✕ CERTIFICATE {verifiedCert.status}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block uppercase font-medium">Certificate Number:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{verifiedCert.certificateNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-medium">Certificate Holder:</span>
                  <span className="font-bold text-slate-900 text-sm">{verifiedCert.recipientName}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block uppercase font-medium">Training / Program:</span>
                  <span className="font-semibold text-slate-900">{verifiedCert.trainingTitle}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-medium">Date Issued:</span>
                  <span className="font-mono text-slate-900 font-semibold">{verifiedCert.dateIssued}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-medium">Issued By:</span>
                  <span className="text-slate-900 font-semibold">{verifiedCert.issuedBy}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-medium">Organization:</span>
                  <span className="text-slate-900 font-semibold">{verifiedCert.organization}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-medium">Member Identifier:</span>
                  <span className="font-mono text-slate-900 font-semibold">{verifiedCert.memberId}</span>
                </div>
              </div>

              {verifiedCert.revocationReason && (
                <div className="p-3 bg-red-100/60 border border-red-300 rounded text-xs text-red-900">
                  <span className="font-bold">Revocation Notice: </span>
                  {verifiedCert.revocationReason}
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 text-center">
                Official digital credential record maintained by San Andres Community Emergency Response Team.
              </div>
            </div>
          )}

          {/* Member Result */}
          {activeTab === 'member' && verifiedMember && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Responder Roster Status
                </span>
                {verifiedMember.membershipStatus === 'ACTIVE' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-full text-xs font-extrabold tracking-wide">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    ✓ ACTIVE RESPONDER
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 rounded-full text-xs font-extrabold tracking-wide">
                    STATUS: {verifiedMember.membershipStatus}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block uppercase font-medium">Full Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{verifiedMember.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-medium">Member ID:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{verifiedMember.memberId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-medium">Designation:</span>
                  <span className="font-semibold text-slate-900">{verifiedMember.designation}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-medium">Responder Level:</span>
                  <span className="font-semibold text-slate-900">{verifiedMember.responderLevel}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-medium">Operating Division:</span>
                  <span className="font-semibold text-slate-900">SACERT Emergency Response Team</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-medium">Date Onboarded:</span>
                  <span className="font-mono text-slate-900 font-semibold">{verifiedMember.dateOnboarded}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-center justify-between">
                <span>Total Recorded Emergency Deployments:</span>
                <span className="font-bold font-mono text-blue-950 text-sm">{verifiedMember.deploymentsCount} operations</span>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 text-center">
                Security Privacy Notice: For privacy compliance, contact numbers, exact home addresses, dates of birth, and emergency contacts are strictly withheld from public verification.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM · Security Registry
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
