import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { OfficialContact, RadioNetConfig } from '../../types';
import { playRadioTone } from '../../utils/audio';
import {
  PhoneCall,
  Radio,
  Plus,
  MapPin,
  Clock,
  Mail,
  ShieldAlert,
  X,
  Edit2,
  Trash2,
  RotateCcw,
  Volume2,
  Activity,
  Signal,
  Check,
  Search,
  Settings,
} from 'lucide-react';

export const EmergencyContactsView: React.FC = () => {
  const { isAdmin, currentUser } = useAuth();
  const [contacts, setContacts] = useState<OfficialContact[]>(db.getOfficialContacts());
  const [radioConfig, setRadioConfig] = useState<RadioNetConfig>(db.getRadioNetConfig());
  const [searchQuery, setSearchQuery] = useState('');
  const [msgSuccess, setMsgSuccess] = useState('');
  const [msgError, setMsgError] = useState('');

  // Contact Modal State (Add or Edit)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    agency: '',
    name: '',
    phone: '',
    mobile: '',
    radioFrequency: '',
    email: '',
    address: 'San Andres, Catanduanes',
    availableHours: '24/7 Hotline',
    isEmergencyHotline: true,
  });

  // Radio Net Frequency Modal State
  const [isRadioModalOpen, setIsRadioModalOpen] = useState(false);
  const [radioForm, setRadioForm] = useState({
    frequency: '425.025 MHz',
    netName: 'SACERT Tactical Primary Net',
    repeaterShift: 'Simplex (Direct)',
    plTone: '88.5 Hz (CTCSS)',
    netController: 'SACERT BASE-1 / EOC Operations',
    operatingInstructions:
      'All SACERT stations must monitor 425.025 MHz during disaster alerts, weather disturbances, and field operations.',
  });

  const [isPlayingChime, setIsPlayingChime] = useState(false);

  const reloadData = () => {
    setContacts(db.getOfficialContacts());
    const rc = db.getRadioNetConfig();
    setRadioConfig(rc);
  };

  useEffect(() => {
    const unsub = db.subscribe(() => {
      reloadData();
    });
    return () => unsub();
  }, []);

  const openAddModal = () => {
    setEditingContactId(null);
    setContactForm({
      agency: '',
      name: '',
      phone: '',
      mobile: '',
      radioFrequency: '425.025 MHz',
      email: '',
      address: 'San Andres, Catanduanes',
      availableHours: '24/7 Hotline',
      isEmergencyHotline: true,
    });
    setIsContactModalOpen(true);
  };

  const openEditModal = (contact: OfficialContact) => {
    setEditingContactId(contact.id);
    setContactForm({
      agency: contact.agency,
      name: contact.name,
      phone: contact.phone,
      mobile: contact.mobile,
      radioFrequency: contact.radioFrequency || '',
      email: contact.email || '',
      address: contact.address,
      availableHours: contact.availableHours,
      isEmergencyHotline: contact.isEmergencyHotline,
    });
    setIsContactModalOpen(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    const adminName = currentUser?.fullName || 'Administrator';

    if (editingContactId) {
      // Update
      const res = db.updateOfficialContact(
        editingContactId,
        {
          agency: contactForm.agency,
          name: contactForm.name,
          phone: contactForm.phone,
          mobile: contactForm.mobile,
          radioFrequency: contactForm.radioFrequency || undefined,
          email: contactForm.email || undefined,
          address: contactForm.address,
          availableHours: contactForm.availableHours,
          isEmergencyHotline: contactForm.isEmergencyHotline,
        },
        adminName
      );

      if (res) {
        setMsgSuccess(`Emergency hotline "${contactForm.name}" updated successfully.`);
      } else {
        setMsgError('Could not update contact.');
      }
    } else {
      // Add
      db.addOfficialContact(
        {
          agency: contactForm.agency,
          name: contactForm.name,
          phone: contactForm.phone,
          mobile: contactForm.mobile,
          radioFrequency: contactForm.radioFrequency || undefined,
          email: contactForm.email || undefined,
          address: contactForm.address,
          availableHours: contactForm.availableHours,
          isEmergencyHotline: contactForm.isEmergencyHotline,
        },
        adminName
      );
      setMsgSuccess(`Contact "${contactForm.name}" added to emergency directory.`);
    }

    reloadData();
    setIsContactModalOpen(false);
    setTimeout(() => {
      setMsgSuccess('');
      setMsgError('');
    }, 4000);
  };

  const handleDeleteContact = (contact: OfficialContact) => {
    if (!window.confirm(`Are you sure you want to remove "${contact.name}" (${contact.agency}) from the emergency hotlines directory?`)) {
      return;
    }
    const adminName = currentUser?.fullName || 'Administrator';
    const deleted = db.deleteOfficialContact(contact.id, adminName);
    if (deleted) {
      setMsgSuccess(`Hotline "${contact.name}" removed from directory.`);
      reloadData();
      setTimeout(() => setMsgSuccess(''), 4000);
    }
  };

  const handleResetDefaults = () => {
    if (
      !window.confirm(
        'Reset the Emergency Hotlines directory back to default San Andres municipal emergency agencies?'
      )
    ) {
      return;
    }
    const adminName = currentUser?.fullName || 'Administrator';
    db.resetOfficialContacts(adminName);
    reloadData();
    setMsgSuccess('Hotlines directory restored to official defaults.');
    setTimeout(() => setMsgSuccess(''), 4000);
  };

  const openRadioModal = () => {
    setRadioForm({
      frequency: radioConfig.frequency || '425.025 MHz',
      netName: radioConfig.netName || 'SACERT Tactical Primary Net',
      repeaterShift: radioConfig.repeaterShift || 'Simplex (Direct)',
      plTone: radioConfig.plTone || '88.5 Hz (CTCSS)',
      netController: radioConfig.netController || 'SACERT BASE-1 / EOC Operations',
      operatingInstructions:
        radioConfig.operatingInstructions ||
        'All SACERT stations must monitor 425.025 MHz during disaster alerts, weather disturbances, and field operations.',
    });
    setIsRadioModalOpen(true);
  };

  const handleSaveRadioNet = (e: React.FormEvent) => {
    e.preventDefault();
    const adminName = currentUser?.fullName || 'Administrator';
    const updated = db.updateRadioNetConfig(radioForm, adminName);
    setRadioConfig(updated);
    setIsRadioModalOpen(false);
    setMsgSuccess(`EOC Ops Online Radio Net set to ${radioForm.frequency} (${radioForm.netName}).`);
    setTimeout(() => setMsgSuccess(''), 4000);
  };

  const handleTestTone = () => {
    setIsPlayingChime(true);
    playRadioTone();
    setTimeout(() => setIsPlayingChime(false), 700);
  };

  // Filter contacts by search query
  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.agency.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.mobile.toLowerCase().includes(q) ||
      (c.radioFrequency && c.radioFrequency.toLowerCase().includes(q)) ||
      c.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Emergency Hotlines & Tactical Comms
            </span>
            <span className="text-xs text-slate-500">· Official Command Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif mt-1">
            SAN ANDRES EMERGENCY HOTLINES
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Official 24/7 telephone numbers, mobile dispatch, radio frequencies, and station locations
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleResetDefaults}
              title="Reset to default official directory"
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Reset Defaults
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Hotline
            </button>
          </div>
        )}
      </div>

      {/* Success / Error Alerts */}
      {msgSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700" />
            {msgSuccess}
          </span>
          <button onClick={() => setMsgSuccess('')} className="text-emerald-700 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}
      {msgError && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-900 text-xs font-semibold rounded-lg flex items-center justify-between">
          <span>{msgError}</span>
          <button onClick={() => setMsgError('')} className="text-red-700 hover:text-red-900">
            ✕
          </button>
        </div>
      )}

      {/* --- EOC OPS ONLINE RADIO NET BANNER (425.025 MHz) --- */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 border-2 border-red-600/60 shadow-xl text-white p-5 sm:p-6">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black uppercase bg-red-500/20 text-red-300 border border-red-500/40">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                EOC Ops Online Radio Net
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                <Activity className="w-3 h-3 animate-pulse" />
                ONLINE & MONITORING
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-xs uppercase font-mono tracking-widest text-slate-400">Tactical Frequency:</span>
              <span className="text-3xl sm:text-4xl font-mono font-black text-amber-300 tracking-tight bg-slate-950/60 px-3 py-1 rounded-lg border border-amber-400/40 shadow-inner">
                {radioConfig.frequency || '425.025 MHz'}
              </span>
              <span className="text-xs text-red-200 font-bold">
                {radioConfig.netName || 'SACERT Tactical Primary Net'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono text-slate-300">
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px] block">MODE / REPEATER:</span>
                <span className="font-bold text-white">{radioConfig.repeaterShift || 'Simplex (Direct)'}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px] block">SUB-TONE / CTCSS:</span>
                <span className="font-bold text-amber-300">{radioConfig.plTone || '88.5 Hz (CTCSS)'}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px] block">NET CONTROLLER:</span>
                <span className="font-bold text-white truncate block">
                  {radioConfig.netController || 'SACERT BASE-1 / EOC'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 pt-1 leading-relaxed max-w-3xl">
              <span className="font-bold text-amber-300 font-mono">OP INSTR:</span>{' '}
              {radioConfig.operatingInstructions ||
                'All SACERT stations must monitor 425.025 MHz during disaster alerts, weather disturbances, and field operations.'}
            </p>
          </div>

          <div className="flex flex-row lg:flex-col gap-2 shrink-0 justify-start lg:justify-center">
            <button
              onClick={handleTestTone}
              disabled={isPlayingChime}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Volume2 className={`w-4 h-4 text-amber-400 ${isPlayingChime ? 'animate-bounce' : ''}`} />
              <span>{isPlayingChime ? 'Testing Chime...' : 'Test Net Audio'}</span>
            </button>

            {isAdmin && (
              <button
                onClick={openRadioModal}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <Settings className="w-4 h-4" />
                <span>Edit Radio Net Freq</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search hotlines by agency, name, phone, mobile, or frequency..."
          className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700 font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all group relative"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                  {contact.availableHours}
                </span>

                <div className="flex items-center gap-1">
                  {contact.isEmergencyHotline && (
                    <span
                      title="24/7 Rapid Emergency Response"
                      className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping inline-block mr-1"
                    />
                  )}

                  {/* Admin Edit & Delete Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => openEditModal(contact)}
                        title="Edit hotline details"
                        className="p-1 text-slate-600 hover:text-blue-700 hover:bg-white rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact)}
                        title="Delete hotline"
                        className="p-1 text-slate-600 hover:text-red-700 hover:bg-white rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h2 className="text-sm font-extrabold text-slate-900 leading-snug">{contact.name}</h2>
              <p className="text-xs text-slate-500 font-semibold">{contact.agency}</p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-700 font-mono">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="text-slate-500 text-[10px]">Landline:</span>
                <a href={`tel:${contact.phone}`} className="font-bold text-slate-900 hover:underline">
                  {contact.phone}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-slate-500 text-[10px]">Mobile:</span>
                <a href={`tel:${contact.mobile}`} className="font-bold text-slate-900 hover:underline">
                  {contact.mobile}
                </a>
              </div>

              {contact.radioFrequency && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Radio className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-slate-500 text-[10px]">Radio:</span>
                  <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    {contact.radioFrequency}
                  </span>
                </div>
              )}

              {contact.email && (
                <div className="flex items-center gap-2 text-slate-600 text-[11px] font-sans">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`mailto:${contact.email}`} className="truncate hover:underline text-slate-700">
                    {contact.email}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2 text-slate-500 font-sans text-[11px] pt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{contact.address}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <a
                href={`tel:${contact.mobile || contact.phone}`}
                className="w-full py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Hotline</span>
              </a>
              {isAdmin && (
                <button
                  onClick={() => openEditModal(contact)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center justify-center transition-colors border border-slate-200"
                  title="Edit Hotline"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
          No emergency contacts match your search query "{searchQuery}".
        </div>
      )}

      {/* --- ADD / EDIT CONTACT MODAL --- */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 border-b border-red-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-sm text-white">
                  {editingContactId ? 'EDIT EMERGENCY HOTLINE' : 'ADD NEW EMERGENCY AGENCY'}
                </h3>
              </div>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="p-6 space-y-3.5 text-xs overflow-y-auto">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Agency Classification *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MDRRMO / Coast Guard / Police / Hospital / Fire"
                  value={contactForm.agency}
                  onChange={(e) => setContactForm({ ...contactForm, agency: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Office / Station / Agency Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. San Andres Municipal Police Station"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Landline Telephone *</label>
                  <input
                    type="text"
                    required
                    placeholder="(052) 811-2000"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mobile Hotline *</label>
                  <input
                    type="text"
                    required
                    placeholder="0919-555-CERT"
                    value={contactForm.mobile}
                    onChange={(e) => setContactForm({ ...contactForm, mobile: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Radio Frequency (Tactical Net)</label>
                  <input
                    type="text"
                    placeholder="e.g. 425.025 MHz"
                    value={contactForm.radioFrequency}
                    onChange={(e) => setContactForm({ ...contactForm, radioFrequency: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Official Email Address</label>
                  <input
                    type="email"
                    placeholder="eoc@sanandres.gov.ph"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Operating Hours *</label>
                  <input
                    type="text"
                    required
                    placeholder="24/7 Hotline / Response"
                    value={contactForm.availableHours}
                    onChange={(e) => setContactForm({ ...contactForm, availableHours: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Physical Address / Station Location</label>
                  <input
                    type="text"
                    placeholder="Brgy. Wagdas, San Andres, Catanduanes"
                    value={contactForm.address}
                    onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  id="isEmergencyHotline"
                  checked={contactForm.isEmergencyHotline}
                  onChange={(e) => setContactForm({ ...contactForm, isEmergencyHotline: e.target.checked })}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isEmergencyHotline" className="text-slate-800 font-semibold cursor-pointer select-none">
                  Flag as Priority 24/7 Emergency Dispatch Hotline
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold transition-colors shadow-xs"
                >
                  {editingContactId ? 'Update Hotline' : 'Save New Hotline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT EOC RADIO NET FREQUENCY MODAL --- */}
      {isRadioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-slate-950 text-white p-4 border-b border-red-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">EDIT EOC OPS ONLINE RADIO NET</h3>
              </div>
              <button
                onClick={() => setIsRadioModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRadioNet} className="p-6 space-y-3.5 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-slate-800 text-[11px]">
                <strong className="text-red-700 font-bold block mb-1">Tactical Comms Configuration:</strong>
                Updating this frequency sets the master dispatch frequency across the SACERT EOC Operations system and
                synchronizes with all field responders. Default frequency is <span className="font-mono font-bold text-red-900">425.025 MHz</span>.
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  EOC Radio Net Frequency (MHz) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="425.025 MHz"
                  value={radioForm.frequency}
                  onChange={(e) => setRadioForm({ ...radioForm, frequency: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-black text-sm text-red-700 focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Radio Net Name</label>
                <input
                  type="text"
                  required
                  placeholder="SACERT Tactical Primary Net"
                  value={radioForm.netName}
                  onChange={(e) => setRadioForm({ ...radioForm, netName: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Repeater / Shift Mode</label>
                  <input
                    type="text"
                    placeholder="Simplex (Direct)"
                    value={radioForm.repeaterShift}
                    onChange={(e) => setRadioForm({ ...radioForm, repeaterShift: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">PL Tone / CTCSS</label>
                  <input
                    type="text"
                    placeholder="88.5 Hz (CTCSS)"
                    value={radioForm.plTone}
                    onChange={(e) => setRadioForm({ ...radioForm, plTone: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Net Controller Station</label>
                <input
                  type="text"
                  placeholder="SACERT BASE-1 / EOC Operations"
                  value={radioForm.netController}
                  onChange={(e) => setRadioForm({ ...radioForm, netController: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Operating Instructions</label>
                <textarea
                  rows={2}
                  value={radioForm.operatingInstructions}
                  onChange={(e) => setRadioForm({ ...radioForm, operatingInstructions: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRadioModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors shadow-xs"
                >
                  Save Radio Net Parameters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
