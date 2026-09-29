import React, { useState } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { SystemSettings } from '../../types';
import { compressAndReadFile } from '../../utils/image';
import {
  Settings,
  Save,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Building,
  Hash,
  ShieldAlert,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser, isSuperAdmin } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>(db.getSettings());
  const [msgSuccess, setMsgSuccess] = useState('');
  const [newDesignation, setNewDesignation] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const adminName = currentUser?.fullName || 'Administrator';
    db.updateSettings(settings, adminName);
    setMsgSuccess('System configurations updated successfully.');
  };

  const handleExportJson = () => {
    const jsonStr = db.exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SACERT_System_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    setMsgSuccess('Database backup snapshot downloaded.');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const adminName = currentUser?.fullName || 'Administrator';
        const success = db.importDatabaseJson(content, adminName);
        if (success) {
          setSettings(db.getSettings());
          setMsgSuccess('Database restored from JSON backup snapshot successfully.');
        } else {
          alert('Invalid database snapshot format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    if (
      window.confirm(
        'Are you sure you want to reset to the factory sample demo dataset? This will restore initial sample members, certificates, and trainings.'
      )
    ) {
      const adminName = currentUser?.fullName || 'Administrator';
      db.resetToFactoryDemo(adminName);
      setSettings(db.getSettings());
      setMsgSuccess('System restored to official factory sample dataset.');
    }
  };

  const addDesignation = () => {
    if (!newDesignation.trim()) return;
    if (settings.designations.includes(newDesignation.trim())) return;
    setSettings({
      ...settings,
      designations: [...settings.designations, newDesignation.trim()],
    });
    setNewDesignation('');
  };

  const removeDesignation = (des: string) => {
    setSettings({
      ...settings,
      designations: settings.designations.filter((d) => d !== des),
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              Administration Config
            </span>
            <span className="text-xs text-slate-500">· System Parameters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1">
            SACERT SYSTEM SETTINGS
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Configure institutional organization profile, numbering prefixes, operational roles, and database backups
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {msgSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-lg flex items-center justify-between">
          <span>✓ {msgSuccess}</span>
          <button onClick={() => setMsgSuccess('')} className="font-bold">
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Section 1: Organization Identity */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Building className="w-4 h-4 text-red-700" />
            <h2 className="text-sm font-extrabold uppercase text-slate-900 tracking-wide">
              1. Institutional Identity & Organization Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-slate-600 font-semibold mb-1">Organization Official Name</label>
              <input
                type="text"
                value={settings.organizationName}
                onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded font-serif font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Abbreviation</label>
              <input
                type="text"
                value={settings.organizationAbbreviation}
                onChange={(e) => setSettings({ ...settings, organizationAbbreviation: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded font-mono font-bold uppercase text-red-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Official Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded italic"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Municipality & Province</label>
              <input
                type="text"
                value={`${settings.municipality}, ${settings.province}`}
                disabled
                className="w-full p-2 bg-slate-100 border border-slate-300 rounded text-slate-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Headquarters Physical Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>

          {/* Official Logo Upload */}
          <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-slate-900 font-bold uppercase tracking-wider text-xs">
                Official SACERT Organization Crest / Logo
              </label>
              {settings.organizationLogo ? (
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                  ✓ Custom Crest Active
                </span>
              ) : (
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                  Default Vector Crest Active
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Dual Previews */}
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-300 shadow-sm flex items-center justify-center overflow-hidden shrink-0 p-2">
                    {settings.organizationLogo ? (
                      <img
                        src={settings.organizationLogo}
                        alt="Uploaded Crest"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase text-center">
                        Vector Crest (Light)
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 mt-1 block">Light Surface</span>
                </div>

                <div className="text-center">
                  <div className="w-24 h-24 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-sm flex items-center justify-center overflow-hidden shrink-0 p-2">
                    {settings.organizationLogo ? (
                      <img
                        src={settings.organizationLogo}
                        alt="Uploaded Crest Dark"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-[9px] font-mono font-bold text-red-400 uppercase text-center">
                        Vector Crest (Dark)
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 mt-1 block">Dark Surface</span>
                </div>
              </div>

              <div className="space-y-2 flex-1 text-xs">
                <p className="text-slate-600 font-medium">
                  Upload the official seal of the San Andres Community Emergency Response Team. This emblem appears automatically on the Top Navigation Bar, Login Portal, Member ID Cards, Printable Certificates, and 201 Dossiers.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-red-400" />
                    <span>Upload Official SACERT Logo...</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml,image/jpg"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) {
                          alert('Please upload an image file (PNG, SVG, JPG, WEBP).');
                          return;
                        }
                        try {
                          const result = await compressAndReadFile(file, {
                            maxWidth: 500,
                            maxHeight: 500,
                            quality: 0.92,
                          });
                          setSettings((prev) => ({ ...prev, organizationLogo: result }));
                        } catch (err) {
                          alert('Error processing image file.');
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  {settings.organizationLogo && (
                    <button
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, organizationLogo: '' }))}
                      className="px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-bold transition-colors"
                    >
                      Reset to Default Vector Crest
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Accepted formats: PNG (recommended for transparent background), SVG, JPG, WEBP.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Official Contact Hotline</label>
              <input
                type="text"
                value={settings.contactNumber}
                onChange={(e) => setSettings({ ...settings, contactNumber: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Official Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Portal Website</label>
              <input
                type="text"
                value={settings.website}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Authorized Signatories */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <h2 className="text-sm font-extrabold uppercase text-slate-900 tracking-wide">
              2. Official Certificate & ID Issuance Signatories
            </h2>
          </div>
          <p className="text-slate-500 text-[11px]">
            Designated leadership executive signatories printed on official Certificates of Competency, ID cards, and 201 dossiers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <label className="block font-bold text-slate-800 text-[11px] uppercase">
                Primary Signatory (President)
              </label>
              <div>
                <span className="text-slate-500 block text-[10px]">Full Name:</span>
                <input
                  type="text"
                  value={settings.defaultSignatory1Name}
                  onChange={(e) => setSettings({ ...settings, defaultSignatory1Name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-serif font-bold text-slate-900"
                />
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Designation / Title:</span>
                <input
                  type="text"
                  value={settings.defaultSignatory1Title}
                  onChange={(e) => setSettings({ ...settings, defaultSignatory1Title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-mono font-semibold"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <label className="block font-bold text-slate-800 text-[11px] uppercase">
                Secondary Signatory (Vice President)
              </label>
              <div>
                <span className="text-slate-500 block text-[10px]">Full Name:</span>
                <input
                  type="text"
                  value={settings.defaultSignatory2Name}
                  onChange={(e) => setSettings({ ...settings, defaultSignatory2Name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-serif font-bold text-slate-900"
                />
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Designation / Title:</span>
                <input
                  type="text"
                  value={settings.defaultSignatory2Title}
                  onChange={(e) => setSettings({ ...settings, defaultSignatory2Title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded font-mono font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Numbering Schemes */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Hash className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-extrabold uppercase text-slate-900 tracking-wide">
              2. Unique Identifier & Numbering Formats
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Member ID Prefix (Unique Constraint)
              </label>
              <input
                type="text"
                value={settings.memberIdPrefix}
                onChange={(e) => setSettings({ ...settings, memberIdPrefix: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">Example: SACERT-2026-0001</p>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Certificate Number Prefix (Unique Constraint)
              </label>
              <input
                type="text"
                value={settings.certificateNumberPrefix}
                onChange={(e) => setSettings({ ...settings, certificateNumberPrefix: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded font-mono font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">Example: CERT-2026-0089</p>
            </div>
          </div>
        </div>

        {/* Section 3: Designations Management */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-sm font-extrabold uppercase text-slate-900 tracking-wide">
              3. Configurable SACERT Responder Designations
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {settings.designations.map((des) => (
              <span
                key={des}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
              >
                <span>{des}</span>
                <button
                  type="button"
                  onClick={() => removeDesignation(des)}
                  className="text-slate-400 hover:text-red-600 font-bold"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-md pt-2">
            <input
              type="text"
              value={newDesignation}
              onChange={(e) => setNewDesignation(e.target.value)}
              placeholder="Add new designation (e.g. Drone Pilot)..."
              className="flex-1 p-2 border border-slate-300 rounded text-xs"
            />
            <button
              type="button"
              onClick={addDesignation}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold"
            >
              Add Role
            </button>
          </div>
        </div>

        {/* Section 4: Data Management & Backup */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-extrabold uppercase text-slate-900 tracking-wide">
              4. Database Backup, Data Export & System Recovery
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-800 block">Export Full Database</span>
              <p className="text-slate-500 text-[11px]">
                Download a complete JSON snapshot containing all 16 relational tables and audit logs.
              </p>
              <button
                type="button"
                onClick={handleExportJson}
                className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded font-bold text-slate-700 flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download Backup (.json)
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-800 block">Restore Database Snapshot</span>
              <p className="text-slate-500 text-[11px]">
                Import a previously exported JSON backup file to restore records.
              </p>
              <label className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded font-bold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-4 h-4" /> Restore from File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2">
              <span className="font-bold text-red-900 block">Reset to Sample Demo Data</span>
              <p className="text-red-700 text-[11px]">
                Reset all 16 tables to initial official sample dataset (Super Admin, Admins, 5 Responders).
              </p>
              <button
                type="button"
                onClick={handleFactoryReset}
                className="w-full py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Factory Demo Reset
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
