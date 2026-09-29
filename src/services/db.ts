import {
  User,
  Member,
  Training,
  Certificate,
  CertificateTemplate,
  Announcement,
  EmergencyAlert,
  Notification,
  AuditLog,
  OfficialContact,
  SystemSettings,
  RoleType,
  MembershipStatus,
  RegistrationApplication,
  RegistrationStatus,
  RadioNetConfig,
  CallsignEntry,
  MemberTrainingSubmission,
  TrainingSubmissionStatus,
} from '../types';

const STORAGE_KEY = 'sacert_system_db_v6';

export interface DatabaseState {
  users: User[];
  members: Member[];
  trainings: Training[];
  certificates: Certificate[];
  certificateTemplates: CertificateTemplate[];
  announcements: Announcement[];
  emergencyAlerts: EmergencyAlert[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  officialContacts: OfficialContact[];
  systemSettings: SystemSettings;
  registrations: RegistrationApplication[];
  radioNetConfig: RadioNetConfig;
  trainingSubmissions: MemberTrainingSubmission[];
}

// Initial default settings
const defaultSettings: SystemSettings = {
  organizationName: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
  organizationAbbreviation: 'SACERT',
  organizationLogo: '',
  tagline: 'Always Alert. Always Prepared.',
  municipality: 'San Andres',
  province: '',
  address: 'San Andres Headquarters, Philippines',
  contactNumber: '0919-555-CERT',
  email: 'sacert.official@gmail.com',
  website: 'https://sacert.org',
  certificateNumberPrefix: 'CERT-2026-',
  memberIdPrefix: 'SACERT-2026-',
  allowMemberSelfProfileEdit: true,
  defaultSignatory1Name: 'VINCENT B. BRIONES',
  defaultSignatory1Title: 'PRESIDENT (SACERT)',
  defaultSignatory2Name: 'NICHOLSON J. DASALLA',
  defaultSignatory2Title: 'VICE PRESIDENT (SACERT)',
  radioNetFrequency: '425.025 MHz',
  radioNetName: 'SACERT Tactical Primary Net',
  designations: [
    'Team Leader',
    'Deputy Team Leader',
    'Medical First Responder',
    'Search & Rescue (SAR) Specialist',
    'Fire Response Specialist',
    'Water Rescue Specialist',
    'Communications & Radio Officer',
    'Logistics & Equipment Officer',
    'Safety & Triage Officer',
    'Community Responder',
  ],
  membershipStatuses: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'RESIGNED', 'RETIRED', 'DECEASED'],
  trainingCategories: [
    'Community Emergency Response Team (CERT) Basic',
    'Emergency Medical Response & Basic Life Support (BLS)',
    'Search and Rescue (SAR) - Urban & Mountain',
    'Water Rescue & Life Saving',
    'Fire Safety & Suppression',
    'Disaster Risk Reduction and Management (DRRM)',
    'Emergency Telecommunications & Incident Command',
  ],
};

// Seed Radio Net Configuration
const defaultRadioNetConfig: RadioNetConfig = {
  id: 'rad-1',
  frequency: '425.025 MHz',
  netName: 'SACERT Tactical Primary Net',
  operatingInstructions: 'All SACERT stations must monitor 425.025 MHz during disaster alerts, weather disturbances, and field operations. Keep transmissions brief, clear, and professional. Use standard ITU phonetic alphabet and tactical pro-words.',
  emergencyProcedures: '1. In priority emergency traffic, break in with "BREAK-BREAK EMERGENCY" or "MAYDAY".\n2. All stations immediately cease non-essential traffic and stand by.\n3. Net Control will acknowledge priority traffic and direct emergency response assets.',
  contactInformation: 'SACERT Communications Directorate · Tactical Net Control Officer · Frequency: 425.025 MHz (Simplex / Direct)',
  netController: 'Janine P. Bautista (SACERT Comms Officer)',
  activeCallsign: 'SACERT BASE-1',
  repeaterShift: 'Simplex (Direct)',
  plTone: '88.5 Hz (CTCSS)',
  importantAnnouncements: 'Daily Net Call is conducted every 0800H and 1700H on 425.025 MHz. All active barangay responder stations must check in.',
  callsignsRoster: [
    { callsign: 'SACERT BASE-1', memberName: 'Janine P. Bautista', designation: 'Net Controller', unit: 'HQ Communications Net', status: 'ACTIVE' },
    { callsign: 'SACERT ALPHA-1', memberName: 'Rafael A. Reyes Jr.', designation: 'Team Leader', unit: 'SAR Strike Team 1', status: 'ACTIVE' },
    { callsign: 'SACERT MED-1', memberName: 'Maria Clara V. Santos', designation: 'Medical Lead', unit: 'Emergency Medical Unit', status: 'STANDBY' },
    { callsign: 'SACERT RESCUE-2', memberName: 'Danilo G. Cruz', designation: 'SAR Specialist', unit: 'Rapid Water & Mountain SAR', status: 'MONITORING' },
    { callsign: 'SACERT ECHO-3', memberName: 'Eduardo S. Mendoza', designation: 'Community Responder', unit: 'Barangay Auxiliary Net', status: 'MONITORING' },
  ],
  updatedAt: new Date().toISOString(),
  updatedBy: 'SUPER_ADMIN',
};

// Seed Prospective Member Registrations
const defaultRegistrations: RegistrationApplication[] = [
  {
    id: 'reg-1',
    applicationNumber: 'REG-2026-0001',
    fullName: 'Juan Carlo M. De La Cruz',
    firstName: 'Juan Carlo',
    middleName: 'Mendoza',
    lastName: 'De La Cruz',
    dateOfBirth: '1998-05-14',
    gender: 'Male',
    address: 'Purok 4, Riverside',
    barangay: 'Salvacion',
    municipality: 'San Andres',
    province: '',
    contactNumber: '0919-555-8821',
    email: 'juancarlo.delacruz@gmail.com',
    emergencyContactName: 'Carmen De La Cruz',
    emergencyContactNumber: '0919-555-8822',
    emergencyContactRelation: 'Mother',
    dateOfRegistration: '2026-03-20',
    previousTraining: 'Basic First Aid & CPR (PRC 2024)',
    certifications: 'Red Cross First Aid Provider',
    skills: 'Patient Bandaging, Splinting, Physical Rescue Assistance',
    username: 'juan.delacruz',
    passwordHash: 'sacert4810',
    profilePhoto: '',
    supportingDocuments: ['Barangay_Clearance_2026.pdf', 'Medical_Fitness_Certificate.pdf'],
    status: 'PENDING',
    createdAt: '2026-03-20T08:30:00Z',
    updatedAt: '2026-03-20T08:30:00Z',
  },
  {
    id: 'reg-2',
    applicationNumber: 'REG-2026-0002',
    fullName: 'Ana Marie S. Flores',
    firstName: 'Ana Marie',
    middleName: 'Santos',
    lastName: 'Flores',
    dateOfBirth: '2000-11-28',
    gender: 'Female',
    address: 'Zone 1, Centro',
    barangay: 'Wagdas',
    municipality: 'San Andres',
    province: '',
    contactNumber: '0921-555-9934',
    email: 'anamarie.flores@gmail.com',
    emergencyContactName: 'Roberto Flores',
    emergencyContactNumber: '0921-555-9935',
    emergencyContactRelation: 'Father',
    dateOfRegistration: '2026-03-22',
    previousTraining: 'Community Disaster Risk Management, VHF Radio Net Operations',
    certifications: 'NTC Amateur Radio Operator (Class C)',
    skills: 'Radio Telecommunications, Incident Logging, Dispatch',
    username: 'ana.flores',
    passwordHash: 'sacert4810',
    profilePhoto: '',
    supportingDocuments: ['NTC_Radio_License_Copy.pdf', 'Valid_Government_ID.pdf'],
    status: 'PENDING',
    createdAt: '2026-03-22T09:15:00Z',
    updatedAt: '2026-03-22T09:15:00Z',
  },
];

// Seed Member Training Submissions for Admin Approval
const defaultTrainingSubmissions: MemberTrainingSubmission[] = [
  {
    id: 'sub-1',
    submissionNumber: 'MTS-2026-0001',
    memberId: 'SACERT-2026-0001',
    memberName: 'Rafael A. Reyes Jr.',
    title: 'Advanced Mass Casualty Triage & Incident Command System (ICS-200)',
    type: 'Emergency Medical Response & Basic Life Support (BLS)',
    provider: 'Office of Civil Defense (OCD Region V)',
    dateCompleted: '2026-03-15',
    startDate: '2026-03-13',
    endDate: '2026-03-15',
    hours: 24,
    venue: 'Camp General Simeon Ola, Legazpi City',
    instructor: 'Maj. Rodrigo S. Santos, OCD',
    certificateNumber: 'OCD-ICS-2026-0419',
    description: 'Completed 3-day certified specialized course on Incident Command System Level 200, ICS organization, operational period planning cycle, and resource management.',
    status: 'PENDING',
    createdAt: '2026-03-16T10:00:00Z',
    updatedAt: '2026-03-16T10:00:00Z',
  },
  {
    id: 'sub-2',
    submissionNumber: 'MTS-2026-0002',
    memberId: 'SACERT-2026-0003',
    memberName: 'Danilo G. Cruz',
    title: 'High-Angle Rope Rescue & Mountain Rappelling Operations',
    type: 'Search and Rescue (SAR) - Urban & Mountain',
    provider: 'Bureau of Fire Protection - Special Rescue Unit (BFP-SRU)',
    dateCompleted: '2026-02-28',
    hours: 32,
    venue: 'BFP Regional Training Center',
    instructor: 'SFO2 Gerald P. Alcantara',
    certificateNumber: 'BFP-SRU-2026-088',
    description: 'Mechanical advantage rope systems, high-angle casualty lowering and hauling, stretcher packaging in cliffside scenarios.',
    status: 'PENDING',
    createdAt: '2026-03-01T14:30:00Z',
    updatedAt: '2026-03-01T14:30:00Z',
  },
];

// Seed Official Contacts
const defaultContacts: OfficialContact[] = [
  {
    id: 'c-1',
    agency: 'SACERT Emergency Operations Center (EOC 24/7)',
    name: 'SACERT Operations Command Center',
    phone: '(052) 811-2045',
    mobile: '0919-555-CERT',
    radioFrequency: '425.025 MHz (Tactical Net)',
    email: 'operations@sacert.org',
    address: 'San Andres Central Operations Base',
    availableHours: '24/7 Hotline',
    isEmergencyHotline: true,
  },
  {
    id: 'c-2',
    agency: 'San Andres Fire Station',
    name: 'Fire Auxiliary Unit',
    phone: '(052) 811-2222',
    mobile: '0928-111-FIRE',
    radioFrequency: '425.025 MHz (Direct Relay)',
    email: 'fireaux@sacert.org',
    address: 'Brgy. Salvacion, San Andres',
    availableHours: '24/7 Response',
    isEmergencyHotline: true,
  },
  {
    id: 'c-3',
    agency: 'Philippine National Police (PNP)',
    name: 'San Andres Municipal Police Station',
    phone: '(052) 811-2111',
    mobile: '0998-598-6512',
    radioFrequency: '147.100 MHz',
    email: 'sanandres_mps@pnp.gov.ph',
    address: 'Brgy. Esperanza, San Andres, Catanduanes',
    availableHours: '24/7 Police Assistance',
    isEmergencyHotline: true,
  },
  {
    id: 'c-4',
    agency: 'San Andres Municipal Rural Health Unit (RHU)',
    name: 'San Andres RHU & Emergency Clinic',
    phone: '(052) 811-2300',
    mobile: '0917-888-RHU1',
    email: 'rhu.sanandres@catanduanes.gov.ph',
    address: 'Brgy. Wagdas, San Andres, Catanduanes',
    availableHours: '8:00 AM - 5:00 PM (Emergency on-call 24/7)',
    isEmergencyHotline: true,
  },
  {
    id: 'c-5',
    agency: 'Philippine Coast Guard (PCG)',
    name: 'Coast Guard Sub-Station San Andres',
    phone: '(052) 811-2999',
    mobile: '0929-333-COAST',
    radioFrequency: 'Ch 16 VHF (Marine)',
    address: 'Port of San Andres, Catanduanes',
    availableHours: '24/7 Maritime Watch',
    isEmergencyHotline: true,
  },
  {
    id: 'c-6',
    agency: 'Provincial DRRMO Catanduanes (PDRRMO)',
    name: 'Catanduanes Provincial Disaster Center',
    phone: '(052) 811-3000',
    mobile: '0920-999-PROV',
    address: 'Capitol Complex, Virac, Catanduanes',
    availableHours: '24/7 Provincial Operations',
    isEmergencyHotline: false,
  },
];

// Seed Members
const defaultMembers: Member[] = [
  {
    id: 'm-1',
    memberId: 'SACERT-2026-0001',
    firstName: 'Rafael',
    middleName: 'Alcantara',
    lastName: 'Reyes',
    suffix: 'Jr.',
    fullName: 'Rafael A. Reyes Jr.',
    dateOfBirth: '1988-04-12',
    sex: 'Male',
    address: 'Zone 2, Coastal Road',
    barangay: 'Wagdas',
    municipality: 'San Andres',
    province: 'Catanduanes',
    contactNumber: '0917-555-1001',
    email: 'rafael.reyes@sacert.org',
    emergencyContact: 'Elena Reyes (Spouse)',
    emergencyContactNumber: '0917-555-1002',
    emergencyContactRelation: 'Spouse',
    dateJoined: '2023-01-15',
    dateOnboarded: '2023-02-01',
    membershipStatus: 'ACTIVE',
    designation: 'Team Leader',
    responderLevel: 'Level 3 - Specialist/Trainer',
    bloodType: 'O+',
    profilePhoto: '',
    skills: ['Incident Command System (ICS-300)', 'Technical Rope Rescue', 'Advanced Medical First Response', 'Radio Telecommunications'],
    qualifications: ['Licensed EMT-Basic', 'Red Cross Certified Instructor', 'NDRRMC Incident Management'],
    awards: ['Distinguished Responder Medal 2024', 'Leadership Excellence Citation'],
    deploymentsCount: 14,
    qrVerificationCode: 'VER-M-0001-RAFAEL-REYES',
    createdAt: '2023-01-15T08:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'm-2',
    memberId: 'SACERT-2026-0002',
    firstName: 'Maria Clara',
    middleName: 'Villanueva',
    lastName: 'Santos',
    fullName: 'Maria Clara V. Santos',
    dateOfBirth: '1992-09-21',
    sex: 'Female',
    address: 'Purok 3, Riverside',
    barangay: 'Salvacion',
    municipality: 'San Andres',
    province: 'Catanduanes',
    contactNumber: '0918-555-2001',
    email: 'maria.santos@sacert.org',
    emergencyContact: 'Vicente Santos (Father)',
    emergencyContactNumber: '0918-555-2002',
    emergencyContactRelation: 'Father',
    dateJoined: '2023-06-10',
    dateOnboarded: '2023-07-01',
    membershipStatus: 'ACTIVE',
    designation: 'Medical First Responder',
    responderLevel: 'Level 2 - Advanced Responder',
    bloodType: 'A+',
    profilePhoto: '',
    skills: ['Triage & Patient Assessment', 'Cardiopulmonary Resuscitation (CPR/AED)', 'Trauma Stabilization', 'Emergency Pharmacology'],
    qualifications: ['Registered Nurse (RN)', 'BLS/ACLS Provider', 'Disaster Nursing Specialist'],
    awards: ['Meritorious Life Saving Award 2025'],
    deploymentsCount: 9,
    qrVerificationCode: 'VER-M-0002-MARIA-SANTOS',
    createdAt: '2023-06-10T08:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'm-3',
    memberId: 'SACERT-2026-0003',
    firstName: 'Danilo',
    middleName: 'Gomez',
    lastName: 'Cruz',
    fullName: 'Danilo G. Cruz',
    dateOfBirth: '1995-11-05',
    sex: 'Male',
    address: 'Sitio Baluarte',
    barangay: 'Palawig',
    municipality: 'San Andres',
    province: 'Catanduanes',
    contactNumber: '0920-555-3001',
    email: 'danilo.cruz@sacert.org',
    emergencyContact: 'Teresa Cruz (Mother)',
    emergencyContactNumber: '0920-555-3002',
    emergencyContactRelation: 'Mother',
    dateJoined: '2024-02-18',
    dateOnboarded: '2024-03-01',
    membershipStatus: 'ACTIVE',
    designation: 'Search & Rescue (SAR) Specialist',
    responderLevel: 'Level 2 - Advanced Responder',
    bloodType: 'B+',
    profilePhoto: '',
    skills: ['Confined Space Search', 'Mountain Bush Tracking', 'Swift Water Rescue', 'Chainsaw Operations'],
    qualifications: ['PADI Rescue Diver', 'BFP Fire Auxiliary Certified'],
    awards: ['Typhoon Response Citation 2024'],
    deploymentsCount: 8,
    qrVerificationCode: 'VER-M-0003-DANILO-CRUZ',
    createdAt: '2024-02-18T08:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'm-4',
    memberId: 'SACERT-2026-0004',
    firstName: 'Janine',
    middleName: 'Perez',
    lastName: 'Bautista',
    fullName: 'Janine P. Bautista',
    dateOfBirth: '1997-07-14',
    sex: 'Female',
    address: 'Near Barangay Hall',
    barangay: 'Lictin',
    municipality: 'San Andres',
    province: 'Catanduanes',
    contactNumber: '0922-555-4001',
    email: 'janine.bautista@sacert.org',
    emergencyContact: 'Marco Bautista (Brother)',
    emergencyContactNumber: '0922-555-4002',
    emergencyContactRelation: 'Brother',
    dateJoined: '2024-05-20',
    dateOnboarded: '2024-06-01',
    membershipStatus: 'ACTIVE',
    designation: 'Communications & Radio Officer',
    responderLevel: 'Level 2 - Advanced Responder',
    bloodType: 'AB+',
    profilePhoto: '',
    skills: ['VHF/HF Radio Net Control', 'Field Satellite Dispatch', 'Emergency Drone Reconnaissance', 'Mapping & GIS GPS'],
    qualifications: ['NTC Amateur Radio License (Class B)', 'Civil Defense Communications Specialist'],
    awards: ['Commendation for Critical Comms Link 2025'],
    deploymentsCount: 6,
    qrVerificationCode: 'VER-M-0004-JANINE-BAUTISTA',
    createdAt: '2024-05-20T08:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'm-5',
    memberId: 'SACERT-2026-0005',
    firstName: 'Eduardo',
    middleName: 'Soriano',
    lastName: 'Mendoza',
    fullName: 'Eduardo S. Mendoza',
    dateOfBirth: '2001-01-30',
    sex: 'Male',
    address: 'Sitio Mainit',
    barangay: 'Mayngaway',
    municipality: 'San Andres',
    province: 'Catanduanes',
    contactNumber: '0927-555-5001',
    email: 'eduardo.mendoza@sacert.org',
    emergencyContact: 'Rosalina Mendoza (Mother)',
    emergencyContactNumber: '0927-555-5002',
    emergencyContactRelation: 'Mother',
    dateJoined: '2025-01-10',
    dateOnboarded: '2025-02-01',
    membershipStatus: 'ACTIVE',
    designation: 'Community Responder',
    responderLevel: 'Level 1 - Basic Responder',
    bloodType: 'O-',
    profilePhoto: '',
    skills: ['First Aid & Bandaging', 'Evacuation Management', 'Basic Fire Fighting', 'Crowd Direction'],
    qualifications: ['CERT Basic Responder 2025', 'Community Fire Auxiliary'],
    awards: [],
    deploymentsCount: 3,
    qrVerificationCode: 'VER-M-0005-EDUARDO-MENDOZA',
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
];

// Seed Users with roles
const defaultUsers: User[] = [
  {
    id: 'u-1',
    username: '@superadmin',
    passwordHash: 'sacert4810',
    role: 'SUPER_ADMIN',
    fullName: 'VINCENT B. BRIONES',
    email: 'president.sacert@sanandres.gov.ph',
    accountStatus: 'ACTIVE',
    failedLoginAttempts: 0,
    lastLoginAt: '2026-09-28T07:15:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2026-09-28T07:15:00Z',
  },
  {
    id: 'u-2',
    username: '@admin',
    passwordHash: 'sacert4810',
    role: 'ADMINISTRATOR',
    fullName: 'NICHOLSON J. DASALLA',
    email: 'vicepresident.sacert@sanandres.gov.ph',
    accountStatus: 'ACTIVE',
    failedLoginAttempts: 0,
    lastLoginAt: '2026-09-27T14:30:00Z',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2026-09-27T14:30:00Z',
  },
];

// Seed Trainings
const defaultTrainings: Training[] = [
  {
    id: 't-1',
    trainingId: 'TRN-2026-001',
    title: 'Community Emergency Response Team (CERT) Standard Course',
    type: 'Disaster Preparedness & Response',
    provider: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
    date: '2025-02-10',
    startDate: '2025-02-10',
    endDate: '2025-02-14',
    venue: 'San Andres Municipal Gymnasium, Wagdas',
    instructor: 'Engr. Ronald Alcantara, MDRRM Officer',
    facilitator: 'Beatriz N. Ramos, Training Lead',
    hours: 40,
    description: 'Comprehensive 40-hour foundation course covering Disaster Preparedness, Fire Safety & Utility Controls, Disaster Medical Operations (Triage & Treatment), Light Search and Rescue, and CERT Organization & Disaster Psychology.',
    status: 'COMPLETED',
    participants: [
      { memberId: 'SACERT-2026-0001', memberName: 'Rafael A. Reyes Jr.', status: 'COMPLETED', completedDate: '2025-02-14', certificateIssued: true, certificateNumber: 'CERT-2026-0089' },
      { memberId: 'SACERT-2026-0002', memberName: 'Maria Clara V. Santos', status: 'COMPLETED', completedDate: '2025-02-14', certificateIssued: true, certificateNumber: 'CERT-2026-0090' },
      { memberId: 'SACERT-2026-0003', memberName: 'Danilo G. Cruz', status: 'COMPLETED', completedDate: '2025-02-14', certificateIssued: true, certificateNumber: 'CERT-2026-0091' },
      { memberId: 'SACERT-2026-0004', memberName: 'Janine P. Bautista', status: 'COMPLETED', completedDate: '2025-02-14', certificateIssued: true, certificateNumber: 'CERT-2026-0092' },
      { memberId: 'SACERT-2026-0005', memberName: 'Eduardo S. Mendoza', status: 'COMPLETED', completedDate: '2025-02-14', certificateIssued: true, certificateNumber: 'CERT-2026-0093' },
    ],
    createdAt: '2025-01-20T08:00:00Z',
    updatedAt: '2025-02-15T09:00:00Z',
  },
  {
    id: 't-2',
    trainingId: 'TRN-2026-002',
    title: 'Emergency Medical First Response & Basic Life Support (BLS-CPR/AED)',
    type: 'Medical First Response',
    provider: 'Philippine Red Cross Catanduanes Chapter',
    date: '2025-08-04',
    startDate: '2025-08-04',
    endDate: '2025-08-06',
    venue: 'San Andres RHU Training Hall, Wagdas',
    instructor: 'Dr. Katherine Joy Soriano, MHO',
    facilitator: 'Nurse Antonio Del Rosario',
    hours: 24,
    description: 'Hands-on clinical emergency medical intervention training: adult/child/infant CPR, foreign body airway obstruction relief, AED operation, emergency bleeding control, spinal immobilization, and START triage protocol.',
    status: 'COMPLETED',
    participants: [
      { memberId: 'SACERT-2026-0001', memberName: 'Rafael A. Reyes Jr.', status: 'COMPLETED', completedDate: '2025-08-06', certificateIssued: true, certificateNumber: 'CERT-2026-0104' },
      { memberId: 'SACERT-2026-0002', memberName: 'Maria Clara V. Santos', status: 'COMPLETED', completedDate: '2025-08-06', certificateIssued: true, certificateNumber: 'CERT-2026-0105' },
      { memberId: 'SACERT-2026-0003', memberName: 'Danilo G. Cruz', status: 'COMPLETED', completedDate: '2025-08-06', certificateIssued: true, certificateNumber: 'CERT-2026-0106' },
    ],
    createdAt: '2025-07-15T08:00:00Z',
    updatedAt: '2025-08-07T10:00:00Z',
  },
  {
    id: 't-3',
    trainingId: 'TRN-2026-003',
    title: 'Water Search and Rescue (WASAR) & Coastal Flood Evacuation Drill',
    type: 'Specialized Water Rescue',
    provider: 'Philippine Coast Guard Sub-Station San Andres',
    date: '2026-04-18',
    startDate: '2026-04-18',
    endDate: '2026-04-20',
    venue: 'Barangay Palawig Coastal Front & EOC',
    instructor: 'PO1 Armando Mendoza, PCG',
    facilitator: 'Rafael A. Reyes Jr., Team Leader',
    hours: 24,
    description: 'Intensive open-water rescue tactics, boat maneuvering, defensive swimming in turbulent surf, casualty extraction from flooded zones, and coordinated pre-emptive evacuation drills.',
    status: 'UPCOMING',
    participants: [
      { memberId: 'SACERT-2026-0001', memberName: 'Rafael A. Reyes Jr.', status: 'REGISTERED' },
      { memberId: 'SACERT-2026-0003', memberName: 'Danilo G. Cruz', status: 'REGISTERED' },
      { memberId: 'SACERT-2026-0004', memberName: 'Janine P. Bautista', status: 'REGISTERED' },
      { memberId: 'SACERT-2026-0005', memberName: 'Eduardo S. Mendoza', status: 'REGISTERED' },
    ],
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-03-01T08:00:00Z',
  },
];

// Seed Certificates
const defaultCertificates: Certificate[] = [
  {
    id: 'cert-1',
    certificateNumber: 'CERT-2026-0089',
    title: 'Certificate of Competency in Community Emergency Response (CERT)',
    recipientName: 'Rafael A. Reyes Jr.',
    memberId: 'SACERT-2026-0001',
    trainingId: 'TRN-2026-001',
    trainingTitle: 'Community Emergency Response Team (CERT) Standard Course',
    dateIssued: '2025-02-14',
    dateCompleted: '2025-02-14',
    expiryDate: '2028-02-14',
    issuedBy: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
    organization: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
    status: 'VALID',
    qrCodeUrl: '',
    verificationCode: 'VER-CERT-0089-RR-VALID',
    signatories: [
      { name: 'VINCENT B. BRIONES', title: 'PRESIDENT (SACERT)' },
      { name: 'NICHOLSON J. DASALLA', title: 'VICE PRESIDENT (SACERT)' },
    ],
    createdAt: '2025-02-14T14:00:00Z',
    updatedAt: '2025-02-14T14:00:00Z',
  },
  {
    id: 'cert-2',
    certificateNumber: 'CERT-2026-0090',
    title: 'Certificate of Competency in Community Emergency Response (CERT)',
    recipientName: 'Maria Clara V. Santos',
    memberId: 'SACERT-2026-0002',
    trainingId: 'TRN-2026-001',
    trainingTitle: 'Community Emergency Response Team (CERT) Standard Course',
    dateIssued: '2025-02-14',
    dateCompleted: '2025-02-14',
    expiryDate: '2028-02-14',
    issuedBy: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
    organization: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
    status: 'VALID',
    qrCodeUrl: '',
    verificationCode: 'VER-CERT-0090-MS-VALID',
    signatories: [
      { name: 'VINCENT B. BRIONES', title: 'PRESIDENT (SACERT)' },
      { name: 'NICHOLSON J. DASALLA', title: 'VICE PRESIDENT (SACERT)' },
    ],
    createdAt: '2025-02-14T14:00:00Z',
    updatedAt: '2025-02-14T14:00:00Z',
  },
  {
    id: 'cert-3',
    certificateNumber: 'CERT-2026-0091',
    title: 'Certificate of Competency in Community Emergency Response (CERT)',
    recipientName: 'Danilo G. Cruz',
    memberId: 'SACERT-2026-0003',
    trainingId: 'TRN-2026-001',
    trainingTitle: 'Community Emergency Response Team (CERT) Standard Course',
    dateIssued: '2025-02-14',
    dateCompleted: '2025-02-14',
    expiryDate: '2028-02-14',
    issuedBy: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
    organization: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
    status: 'VALID',
    qrCodeUrl: '',
    verificationCode: 'VER-CERT-0091-DC-VALID',
    signatories: [
      { name: 'VINCENT B. BRIONES', title: 'PRESIDENT (SACERT)' },
      { name: 'NICHOLSON J. DASALLA', title: 'VICE PRESIDENT (SACERT)' },
    ],
    createdAt: '2025-02-14T14:00:00Z',
    updatedAt: '2025-02-14T14:00:00Z',
  },
  {
    id: 'cert-4',
    certificateNumber: 'CERT-2026-0092',
    title: 'Certificate of Competency in Community Emergency Response (CERT)',
    recipientName: 'Janine P. Bautista',
    memberId: 'SACERT-2026-0004',
    trainingId: 'TRN-2026-001',
    trainingTitle: 'Community Emergency Response Team (CERT) Standard Course',
    dateIssued: '2025-02-14',
    dateCompleted: '2025-02-14',
    expiryDate: '2028-02-14',
    issuedBy: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
    organization: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
    status: 'VALID',
    qrCodeUrl: '',
    verificationCode: 'VER-CERT-0092-JB-VALID',
    signatories: [
      { name: 'VINCENT B. BRIONES', title: 'PRESIDENT (SACERT)' },
      { name: 'NICHOLSON J. DASALLA', title: 'VICE PRESIDENT (SACERT)' },
    ],
    createdAt: '2025-02-14T14:00:00Z',
    updatedAt: '2025-02-14T14:00:00Z',
  },
  {
    id: 'cert-5',
    certificateNumber: 'CERT-2026-0104',
    title: 'Emergency Medical First Responder & Basic Life Support Certificate',
    recipientName: 'Rafael A. Reyes Jr.',
    memberId: 'SACERT-2026-0001',
    trainingId: 'TRN-2026-002',
    trainingTitle: 'Emergency Medical First Response & Basic Life Support (BLS-CPR/AED)',
    dateIssued: '2025-08-06',
    dateCompleted: '2025-08-06',
    expiryDate: '2027-08-06',
    issuedBy: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
    organization: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
    status: 'VALID',
    qrCodeUrl: '',
    verificationCode: 'VER-CERT-0104-RR-VALID',
    signatories: [
      { name: 'VINCENT B. BRIONES', title: 'PRESIDENT (SACERT)' },
      { name: 'NICHOLSON J. DASALLA', title: 'VICE PRESIDENT (SACERT)' },
    ],
    createdAt: '2025-08-06T15:00:00Z',
    updatedAt: '2025-08-06T15:00:00Z',
  },
];

// Seed Announcements
const defaultAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Pre-Typhoon Readiness Check & Emergency Gear Inspection',
    message: 'All SACERT members across all barangay clusters are advised to inspect handheld radios, tactical flashlights, personal first aid kits, and heavy-duty rain gear. Report any unserviceable equipment to the Logistics Officer.',
    date: '2026-09-27',
    priority: 'IMPORTANT',
    targetAudience: 'ALL',
    authorName: 'Arthur T. Morales (Super Admin)',
    createdAt: '2026-09-27T08:00:00Z',
  },
  {
    id: 'ann-2',
    title: 'Quarterly Joint Coastal Evacuation & Tsunami Drill',
    message: 'Joint drill scheduled with BFP San Andres and PCG at Barangay Palawig and Wagdas coastal sectors on October 12, 2026. Muster time is 0600H at the Municipal Gym.',
    date: '2026-09-20',
    priority: 'NORMAL',
    targetAudience: 'ALL',
    authorName: 'Beatriz N. Ramos (Admin)',
    createdAt: '2026-09-20T10:00:00Z',
  },
  {
    id: 'ann-3',
    title: 'Medical First Responders Continuing Education Webinar',
    message: 'Special clinical refresher on Traumatic Bleeding Control and Tourniquet Protocol hosted by Provincial DOH. Accredited for 4 hours continuing education.',
    date: '2026-09-15',
    priority: 'NORMAL',
    targetAudience: 'SPECIFIC_DESIGNATION',
    targetValue: 'Medical First Responder',
    authorName: 'Beatriz N. Ramos (Admin)',
    createdAt: '2026-09-15T14:00:00Z',
  },
];

// Seed Emergency Alerts
const defaultEmergencyAlerts: EmergencyAlert[] = [
  {
    id: 'ea-1',
    title: '🚨 RED ALERT: PRE-EMPTIVE DEPLOYMENT STANDBY',
    message: 'All SACERT Responders in Barangay Wagdas, Salvacion, Palawig, and Lictin are hereby directed to report on standby status. Tropical storm approaching eastern seaboard. Ensure 2-way tactical radios on Primary Frequency 425.025 MHz.',
    priority: 'EMERGENCY',
    sentBy: 'Arthur T. Morales (Director)',
    sentAt: '2026-09-28T06:30:00Z',
    targetAudience: 'ALL',
    active: true,
    acknowledgements: [
      {
        memberId: 'SACERT-2026-0001',
        memberName: 'Rafael A. Reyes Jr.',
        receivedAt: '2026-09-28T06:31:00Z',
        acknowledgedAt: '2026-09-28T06:35:12Z',
      },
      {
        memberId: 'SACERT-2026-0002',
        memberName: 'Maria Clara V. Santos',
        receivedAt: '2026-09-28T06:31:05Z',
        acknowledgedAt: '2026-09-28T06:38:44Z',
      },
    ],
  },
  {
    id: 'ea-2',
    title: '⚠️ GALE WARNING: COASTAL BOAT EMBARGO',
    message: 'Small watercraft prohibited from sailing in San Andres waters. SAR and Water Rescue teams on standby for coastal perimeter monitoring.',
    priority: 'URGENT',
    sentBy: 'Beatriz N. Ramos (Admin)',
    sentAt: '2026-09-27T17:00:00Z',
    targetAudience: 'ACTIVE_ONLY',
    active: false,
    acknowledgements: [
      {
        memberId: 'SACERT-2026-0003',
        memberName: 'Danilo G. Cruz',
        receivedAt: '2026-09-27T17:02:10Z',
        acknowledgedAt: '2026-09-27T17:05:00Z',
      },
    ],
  },
];

// Seed Notifications
const defaultNotifications: Notification[] = [
  {
    id: 'notif-1',
    recipientId: 'ALL',
    title: '🚨 Emergency Alert Issued',
    message: 'RED ALERT: Pre-Emptive Deployment Standby issued by Command Center.',
    type: 'EMERGENCY',
    priority: 'EMERGENCY',
    isRead: false,
    createdAt: '2026-09-28T06:30:00Z',
  },
  {
    id: 'notif-2',
    recipientId: 'SACERT-2026-0001',
    title: 'Certificate Validated',
    message: 'Your CERT-2026-0089 certification is valid until 2028-02-14.',
    type: 'CERTIFICATE',
    priority: 'NORMAL',
    isRead: true,
    createdAt: '2026-09-25T10:00:00Z',
  },
  {
    id: 'notif-3',
    recipientId: 'ALL',
    title: 'New Training Scheduled',
    message: 'WASAR Coastal Flood Evacuation Drill scheduled for April 2026.',
    type: 'TRAINING',
    priority: 'NORMAL',
    isRead: false,
    createdAt: '2026-09-20T11:00:00Z',
  },
];

// Seed Audit Logs
const defaultAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    adminId: 'u-1',
    adminName: 'Chief Director Arthur T. Morales',
    action: 'BROADCAST_EMERGENCY_ALERT',
    target: 'All SACERT Responders',
    targetId: 'ea-1',
    newValue: 'RED ALERT: PRE-EMPTIVE DEPLOYMENT STANDBY',
    ipAddress: '192.168.1.10 (EOC Console)',
    timestamp: '2026-09-28T06:30:00Z',
  },
  {
    id: 'log-2',
    adminId: 'u-2',
    adminName: 'Training Officer Beatriz N. Ramos',
    action: 'ISSUE_CERTIFICATE',
    target: 'Rafael A. Reyes Jr. (SACERT-2026-0001)',
    targetId: 'CERT-2026-0104',
    newValue: 'Status: VALID (BLS-CPR/AED)',
    ipAddress: '192.168.1.15',
    timestamp: '2025-08-06T15:00:00Z',
  },
  {
    id: 'log-3',
    adminId: 'u-1',
    adminName: 'Chief Director Arthur T. Morales',
    action: 'CREATE_MEMBER',
    target: 'Eduardo S. Mendoza',
    targetId: 'SACERT-2026-0005',
    newValue: 'Position: Community Responder, Level 1',
    ipAddress: '192.168.1.10',
    timestamp: '2025-01-10T08:00:00Z',
  },
  {
    id: 'log-4',
    adminId: 'u-1',
    adminName: 'Chief Director Arthur T. Morales',
    action: 'ISSUE_CREDENTIALS',
    target: 'sacert.mendoza (Eduardo S. Mendoza)',
    targetId: 'u-7',
    newValue: 'Role: MEMBER, Account: ACTIVE',
    ipAddress: '192.168.1.10',
    timestamp: '2025-01-10T08:15:00Z',
  },
];

class DatabaseService {
  private state: DatabaseState;
  private listeners: (() => void)[] = [];

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DatabaseState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        let users: User[] = (parsed.users || defaultUsers).filter(
          (u: User) =>
            u.username.replace(/^@/, '') === 'superadmin' ||
            u.username.replace(/^@/, '') === 'admin' ||
            (!u.username.startsWith('sacert.') && u.passwordHash !== 'Member@2026')
        );

        // Ensure superadmin has @superadmin and sacert4810
        const superAdminUser = users.find((u) => u.username.replace(/^@/, '') === 'superadmin');
        if (superAdminUser) {
          superAdminUser.username = '@superadmin';
          superAdminUser.passwordHash = 'sacert4810';
          superAdminUser.accountStatus = 'ACTIVE';
          superAdminUser.failedLoginAttempts = 0;
          superAdminUser.fullName = 'VINCENT B. BRIONES';
          superAdminUser.role = 'SUPER_ADMIN';
        } else {
          users.unshift(defaultUsers[0]);
        }

        // Ensure admin has @admin and sacert4810
        const adminUser = users.find((u) => u.username.replace(/^@/, '') === 'admin' || u.username === 'admin_sanandres');
        if (adminUser) {
          adminUser.username = '@admin';
          adminUser.passwordHash = 'sacert4810';
          adminUser.accountStatus = 'ACTIVE';
          adminUser.failedLoginAttempts = 0;
          adminUser.fullName = 'NICHOLSON J. DASALLA';
          adminUser.role = 'ADMINISTRATOR';
        } else {
          users.splice(1, 0, defaultUsers[1]);
        }

        // Guarantee all schema tables exist
        return {
          users,
          members: parsed.members || defaultMembers,
          trainings: parsed.trainings || defaultTrainings,
          certificates: parsed.certificates || defaultCertificates,
          certificateTemplates: parsed.certificateTemplates || [],
          announcements: parsed.announcements || defaultAnnouncements,
          emergencyAlerts: parsed.emergencyAlerts || defaultEmergencyAlerts,
          notifications: parsed.notifications || defaultNotifications,
          auditLogs: parsed.auditLogs || defaultAuditLogs,
          officialContacts: parsed.officialContacts || defaultContacts,
          systemSettings: {
            ...defaultSettings,
            ...(parsed.systemSettings || {}),
            organizationName: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
            radioNetFrequency: parsed.systemSettings?.radioNetFrequency || '425.025 MHz',
          },
          registrations: parsed.registrations || defaultRegistrations,
          radioNetConfig: {
            ...defaultRadioNetConfig,
            ...(parsed.radioNetConfig || {}),
            frequency: parsed.radioNetConfig?.frequency || '425.025 MHz',
          },
          trainingSubmissions: parsed.trainingSubmissions || defaultTrainingSubmissions,
        };
      }
    } catch (e) {
      console.error('Failed to load database from localStorage:', e);
    }

    return {
      users: defaultUsers,
      members: defaultMembers,
      trainings: defaultTrainings,
      certificates: defaultCertificates,
      certificateTemplates: [],
      announcements: defaultAnnouncements,
      emergencyAlerts: defaultEmergencyAlerts,
      notifications: defaultNotifications,
      auditLogs: defaultAuditLogs,
      officialContacts: defaultContacts,
      systemSettings: defaultSettings,
      registrations: defaultRegistrations,
      radioNetConfig: defaultRadioNetConfig,
      trainingSubmissions: defaultTrainingSubmissions,
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save database to localStorage:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Database subscriber error:', err);
      }
    });
  }

  // --- AUDIT LOGGING ---
  public addAuditLog(params: {
    adminId: string;
    adminName: string;
    action: string;
    target: string;
    targetId?: string;
    previousValue?: string;
    newValue?: string;
  }) {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      adminId: params.adminId,
      adminName: params.adminName,
      action: params.action,
      target: params.target,
      targetId: params.targetId,
      previousValue: params.previousValue,
      newValue: params.newValue,
      ipAddress: '192.168.1.10 (SACERT Secured Node)',
      timestamp: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(newLog);
    this.saveState();
    return newLog;
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.state.auditLogs];
  }

  // --- USERS & AUTHENTICATION ---
  public getUsers(): User[] {
    return [...this.state.users];
  }

  public getUserByUsername(username: string): User | undefined {
    const clean = username.trim().toLowerCase().replace(/^@/, '');
    return this.state.users.find(
      (u) => u.username.toLowerCase().replace(/^@/, '') === clean
    );
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public authenticate(username: string, passwordAttempt: string): { success: boolean; user?: User; error?: string } {
    const user = this.getUserByUsername(username);
    if (!user) {
      return { success: false, error: 'Invalid username or password.' };
    }

    if (user.accountStatus === 'DISABLED') {
      return { success: false, error: 'This account has been disabled by an Administrator.' };
    }

    if (user.failedLoginAttempts >= 5) {
      return {
        success: false,
        error: 'Account temporarily locked due to excessive failed attempts. Please contact Administrator.',
      };
    }

    // In demo/production, password verify
    const isValid = user.passwordHash === passwordAttempt;

    if (!isValid) {
      user.failedLoginAttempts += 1;
      this.saveState();
      return { success: false, error: `Invalid username or password. (${5 - user.failedLoginAttempts} attempts remaining)` };
    }

    // Reset failed attempts on success
    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date().toISOString();
    this.saveState();

    return { success: true, user };
  }

  public createUser(userData: Omit<User, 'id' | 'failedLoginAttempts' | 'createdAt' | 'updatedAt'>, adminName: string): User {
    // Check username uniqueness
    if (this.getUserByUsername(userData.username)) {
      throw new Error(`Username "${userData.username}" is already in use.`);
    }

    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.users.push(newUser);
    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'CREATE_USER_ACCOUNT',
      target: newUser.username,
      targetId: newUser.id,
      newValue: `Role: ${newUser.role}, Status: ${newUser.accountStatus}`,
    });

    this.saveState();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>, adminName: string): User {
    const index = this.state.users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User account not found');

    const previous = { ...this.state.users[index] };
    const updated = {
      ...previous,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.state.users[index] = updated;

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'UPDATE_USER_ACCOUNT',
      target: updated.username,
      targetId: id,
      previousValue: `Status: ${previous.accountStatus}`,
      newValue: `Status: ${updated.accountStatus}`,
    });

    this.saveState();
    return updated;
  }

  public resetUserPassword(id: string, newPassword: string, adminName: string, forceChange = false): void {
    const user = this.getUserById(id);
    if (!user) throw new Error('User not found');

    user.passwordHash = newPassword;
    user.failedLoginAttempts = 0;
    if (forceChange) {
      user.accountStatus = 'FORCE_PASSWORD_CHANGE';
    }
    user.updatedAt = new Date().toISOString();

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'RESET_PASSWORD',
      target: user.username,
      targetId: user.id,
      newValue: forceChange ? 'Password reset (force change required)' : 'Password reset',
    });

    this.saveState();
  }

  // --- MEMBERS MANAGEMENT ---
  public getMembers(includeDeleted = false): Member[] {
    if (includeDeleted) return [...this.state.members];
    return this.state.members.filter((m) => !m.deletedAt);
  }

  public getMemberById(id: string): Member | undefined {
    return this.state.members.find((m) => m.id === id);
  }

  public getMemberByMemberId(memberId: string): Member | undefined {
    return this.state.members.find((m) => m.memberId.trim().toUpperCase() === memberId.trim().toUpperCase());
  }

  public getNextMemberId(): string {
    const prefix = this.state.systemSettings.memberIdPrefix || 'SACERT-2026-';
    const existing = this.state.members.map((m) => {
      const numPart = m.memberId.replace(prefix, '');
      const parsed = parseInt(numPart, 10);
      return isNaN(parsed) ? 0 : parsed;
    });
    const maxNum = existing.length > 0 ? Math.max(...existing) : 0;
    return `${prefix}${String(maxNum + 1).padStart(4, '0')}`;
  }

  public addMember(memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt' | 'qrVerificationCode'>, adminName: string): Member {
    // Check Member ID uniqueness
    if (this.getMemberByMemberId(memberData.memberId)) {
      throw new Error(`Member ID "${memberData.memberId}" already exists. Member IDs must be unique.`);
    }

    const newMember: Member = {
      ...memberData,
      id: `m-${Date.now()}`,
      qrVerificationCode: `VER-M-${memberData.memberId}-${memberData.lastName.toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.members.push(newMember);

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'CREATE_MEMBER',
      target: newMember.fullName,
      targetId: newMember.memberId,
      newValue: `Status: ${newMember.membershipStatus}, Designation: ${newMember.designation}`,
    });

    this.saveState();
    return newMember;
  }

  public updateMember(id: string, updates: Partial<Member>, adminName: string): Member {
    const index = this.state.members.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Member not found');

    const previous = { ...this.state.members[index] };

    // Check unique memberId if changing
    if (updates.memberId && updates.memberId !== previous.memberId) {
      const exists = this.getMemberByMemberId(updates.memberId);
      if (exists && exists.id !== id) {
        throw new Error(`Member ID "${updates.memberId}" is already assigned to another member.`);
      }
    }

    const updated: Member = {
      ...previous,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.state.members[index] = updated;

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'UPDATE_MEMBER',
      target: updated.fullName,
      targetId: updated.memberId,
      previousValue: `Status: ${previous.membershipStatus}, Pos: ${previous.designation}`,
      newValue: `Status: ${updated.membershipStatus}, Pos: ${updated.designation}`,
    });

    this.saveState();
    return updated;
  }

  public softDeleteMember(id: string, adminName: string): void {
    const member = this.getMemberById(id);
    if (!member) throw new Error('Member not found');

    member.deletedAt = new Date().toISOString();
    member.membershipStatus = 'INACTIVE';
    member.updatedAt = new Date().toISOString();

    // Also disable user account if present
    if (member.userId) {
      const user = this.getUserById(member.userId);
      if (user) {
        user.accountStatus = 'DISABLED';
      }
    }

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'DEACTIVATE_MEMBER_SOFT_DELETE',
      target: member.fullName,
      targetId: member.memberId,
      newValue: 'Status set to INACTIVE (Soft deleted)',
    });

    this.saveState();
  }

  public restoreMember(id: string, adminName: string): void {
    const member = this.getMemberById(id);
    if (!member) throw new Error('Member not found');

    member.deletedAt = null;
    member.membershipStatus = 'ACTIVE';
    member.updatedAt = new Date().toISOString();

    if (member.userId) {
      const user = this.getUserById(member.userId);
      if (user) {
        user.accountStatus = 'ACTIVE';
      }
    }

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'RESTORE_MEMBER',
      target: member.fullName,
      targetId: member.memberId,
      newValue: 'Status restored to ACTIVE',
    });

    this.saveState();
  }

  public permanentDeleteMember(id: string, adminName: string, reason: string): boolean {
    const memberIndex = this.state.members.findIndex((m) => m.id === id);
    if (memberIndex === -1) return false;

    const member = this.state.members[memberIndex];
    const memberName = member.fullName;
    const memberId = member.memberId;
    const userId = member.userId;

    // Remove member permanently
    this.state.members.splice(memberIndex, 1);

    // If there is an associated user login account, remove it
    if (userId) {
      const userIndex = this.state.users.findIndex((u) => u.id === userId);
      if (userIndex !== -1) {
        this.state.users.splice(userIndex, 1);
      }
    }

    // Record immutable audit log
    this.addAuditLog({
      adminId: 'superadmin',
      adminName,
      action: 'PERMANENT_RECORD_DELETION',
      target: `${memberName} (${memberId})`,
      targetId: memberId,
      previousValue: `Reason: ${reason || 'Administrative database sanitation'}`,
      newValue: 'Permanently removed from active database registry',
    });

    this.saveState();
    return true;
  }

  // --- TRAININGS ---
  public getTrainings(): Training[] {
    return [...this.state.trainings];
  }

  public getTrainingById(id: string): Training | undefined {
    return this.state.trainings.find((t) => t.id === id);
  }

  public getNextTrainingId(): string {
    const prefix = 'TRN-2026-';
    const nums = this.state.trainings.map((t) => {
      const p = parseInt(t.trainingId.replace(prefix, ''), 10);
      return isNaN(p) ? 0 : p;
    });
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `${prefix}${String(max + 1).padStart(3, '0')}`;
  }

  public createTraining(data: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>, adminName: string): Training {
    const newTraining: Training = {
      ...data,
      id: `t-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.trainings.push(newTraining);

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'CREATE_TRAINING',
      target: newTraining.title,
      targetId: newTraining.trainingId,
      newValue: `Date: ${newTraining.date}, Hours: ${newTraining.hours}`,
    });

    // Notify participants
    data.participants.forEach((p) => {
      this.addNotification({
        recipientId: p.memberId,
        title: 'New Training Assigned',
        message: `You have been assigned to: ${newTraining.title} on ${newTraining.startDate}`,
        type: 'TRAINING',
        priority: 'IMPORTANT',
      });
    });

    this.saveState();
    return newTraining;
  }

  public updateTraining(id: string, updates: Partial<Training>, adminName: string): Training {
    const index = this.state.trainings.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Training not found');

    const previous = { ...this.state.trainings[index] };
    const updated: Training = {
      ...previous,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.state.trainings[index] = updated;

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'UPDATE_TRAINING',
      target: updated.title,
      targetId: updated.trainingId,
      previousValue: `Status: ${previous.status}`,
      newValue: `Status: ${updated.status}, Participants: ${updated.participants.length}`,
    });

    this.saveState();
    return updated;
  }

  // --- CERTIFICATES ---
  public getCertificates(): Certificate[] {
    return [...this.state.certificates];
  }

  public getCertificateById(id: string): Certificate | undefined {
    return this.state.certificates.find((c) => c.id === id);
  }

  public getCertificateByNumber(certNo: string): Certificate | undefined {
    return this.state.certificates.find(
      (c) => c.certificateNumber.trim().toUpperCase() === certNo.trim().toUpperCase()
    );
  }

  public getCertificatesByMemberId(memberId: string): Certificate[] {
    return this.state.certificates.filter(
      (c) => c.memberId.trim().toUpperCase() === memberId.trim().toUpperCase()
    );
  }

  public getNextCertificateNumber(): string {
    const prefix = this.state.systemSettings.certificateNumberPrefix || 'CERT-2026-';
    const nums = this.state.certificates.map((c) => {
      const p = parseInt(c.certificateNumber.replace(prefix, ''), 10);
      return isNaN(p) ? 0 : p;
    });
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
  }

  public issueCertificate(data: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt' | 'verificationCode' | 'qrCodeUrl'>, adminName: string): Certificate {
    if (this.getCertificateByNumber(data.certificateNumber)) {
      throw new Error(`Certificate number "${data.certificateNumber}" is already in use.`);
    }

    const verificationCode = `VER-${data.certificateNumber}-${data.memberId}`;
    const newCert: Certificate = {
      ...data,
      id: `cert-${Date.now()}`,
      verificationCode,
      qrCodeUrl: `${window.location.origin}/?verify=cert&code=${data.certificateNumber}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.certificates.push(newCert);

    // Update training participant record if trainingId is set
    if (data.trainingId) {
      const training = this.state.trainings.find((t) => t.id === data.trainingId || t.trainingId === data.trainingId);
      if (training) {
        const participant = training.participants.find((p) => p.memberId === data.memberId);
        if (participant) {
          participant.status = 'COMPLETED';
          participant.certificateIssued = true;
          participant.certificateNumber = newCert.certificateNumber;
        }
      }
    }

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'ISSUE_CERTIFICATE',
      target: `${newCert.recipientName} (${newCert.memberId})`,
      targetId: newCert.certificateNumber,
      newValue: `Title: ${newCert.title}, Status: VALID`,
    });

    // Notify member
    this.addNotification({
      recipientId: newCert.memberId,
      title: 'Official Certificate Issued',
      message: `Your certificate "${newCert.title}" (${newCert.certificateNumber}) has been officially issued.`,
      type: 'CERTIFICATE',
      priority: 'IMPORTANT',
    });

    this.saveState();
    return newCert;
  }

  public revokeCertificate(id: string, reason: string, adminName: string): Certificate {
    const cert = this.getCertificateById(id);
    if (!cert) throw new Error('Certificate not found');

    cert.status = 'REVOKED';
    cert.revocationReason = reason;
    cert.revokedAt = new Date().toISOString();
    cert.revokedBy = adminName;
    cert.updatedAt = new Date().toISOString();

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'REVOKE_CERTIFICATE',
      target: `${cert.recipientName} (${cert.certificateNumber})`,
      targetId: cert.certificateNumber,
      newValue: `Revoked. Reason: ${reason}`,
    });

    this.addNotification({
      recipientId: cert.memberId,
      title: 'Certificate Revoked',
      message: `Your certificate ${cert.certificateNumber} was revoked: ${reason}`,
      type: 'CERTIFICATE',
      priority: 'URGENT',
    });

    this.saveState();
    return cert;
  }

  public reissueCertificate(id: string, adminName: string): Certificate {
    const oldCert = this.getCertificateById(id);
    if (!oldCert) throw new Error('Certificate not found');

    const nextNumber = this.getNextCertificateNumber();
    const newCert: Certificate = {
      ...oldCert,
      id: `cert-${Date.now()}`,
      certificateNumber: nextNumber,
      status: 'REISSUED',
      reissuedFrom: oldCert.certificateNumber,
      dateIssued: new Date().toISOString().split('T')[0],
      verificationCode: `VER-${nextNumber}-${oldCert.memberId}`,
      qrCodeUrl: `${window.location.origin}/?verify=cert&code=${nextNumber}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    oldCert.status = 'REVOKED';
    oldCert.revocationReason = `Superceded by Reissued Certificate ${nextNumber}`;
    oldCert.updatedAt = new Date().toISOString();

    this.state.certificates.push(newCert);

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'REISSUE_CERTIFICATE',
      target: `${newCert.recipientName} (${newCert.certificateNumber})`,
      targetId: newCert.certificateNumber,
      previousValue: `Old: ${oldCert.certificateNumber}`,
      newValue: `New: ${newCert.certificateNumber}`,
    });

    this.saveState();
    return newCert;
  }

  // --- ANNOUNCEMENTS ---
  public getAnnouncements(): Announcement[] {
    return [...this.state.announcements];
  }

  public createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt'>, adminName: string): Announcement {
    const newAnn: Announcement = {
      ...data,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.state.announcements.unshift(newAnn);

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'SEND_ANNOUNCEMENT',
      target: newAnn.title,
      targetId: newAnn.id,
      newValue: `Priority: ${newAnn.priority}, Audience: ${newAnn.targetAudience}`,
    });

    // Notify members
    this.addNotification({
      recipientId: 'ALL',
      title: `Announcement: ${newAnn.title}`,
      message: newAnn.message.slice(0, 120) + (newAnn.message.length > 120 ? '...' : ''),
      type: 'ANNOUNCEMENT',
      priority: newAnn.priority,
    });

    this.saveState();
    return newAnn;
  }

  public deleteAnnouncement(id: string, adminName: string): void {
    const ann = this.state.announcements.find((a) => a.id === id);
    this.state.announcements = this.state.announcements.filter((a) => a.id !== id);

    if (ann) {
      this.addAuditLog({
        adminId: 'admin',
        adminName,
        action: 'DELETE_ANNOUNCEMENT',
        target: ann.title,
        targetId: id,
      });
    }

    this.saveState();
  }

  // --- EMERGENCY ALERTS ---
  public getEmergencyAlerts(): EmergencyAlert[] {
    return [...this.state.emergencyAlerts];
  }

  public getActiveEmergencyAlerts(): EmergencyAlert[] {
    return this.state.emergencyAlerts.filter((a) => a.active);
  }

  public createEmergencyAlert(data: Omit<EmergencyAlert, 'id' | 'active' | 'acknowledgements'>, adminName: string): EmergencyAlert {
    const newAlert: EmergencyAlert = {
      ...data,
      id: `ea-${Date.now()}`,
      active: true,
      acknowledgements: [],
    };

    this.state.emergencyAlerts.unshift(newAlert);

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'BROADCAST_EMERGENCY_ALERT',
      target: newAlert.title,
      targetId: newAlert.id,
      newValue: `Priority: ${newAlert.priority}, SentAt: ${newAlert.sentAt}`,
    });

    // Broadcast system notification
    this.addNotification({
      recipientId: 'ALL',
      title: `🚨 EMERGENCY ALERT: ${newAlert.title}`,
      message: newAlert.message,
      type: 'EMERGENCY',
      priority: 'EMERGENCY',
    });

    this.saveState();
    return newAlert;
  }

  public acknowledgeEmergencyAlert(alertId: string, memberId: string, memberName: string): void {
    const alert = this.state.emergencyAlerts.find((a) => a.id === alertId);
    if (!alert) return;

    const existing = alert.acknowledgements.find((ack) => ack.memberId === memberId);
    if (!existing) {
      alert.acknowledgements.push({
        memberId,
        memberName,
        receivedAt: new Date(Date.now() - 5000).toISOString(),
        acknowledgedAt: new Date().toISOString(),
      });
      this.saveState();
    }
  }

  public resolveEmergencyAlert(alertId: string, adminName: string): void {
    const alert = this.state.emergencyAlerts.find((a) => a.id === alertId);
    if (!alert) return;

    alert.active = false;

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'STAND_DOWN_EMERGENCY_ALERT',
      target: alert.title,
      targetId: alertId,
      newValue: 'Alert set to STAND-DOWN / INACTIVE',
    });

    this.saveState();
  }

  // --- NOTIFICATIONS ---
  public getNotifications(recipientId?: string): Notification[] {
    if (!recipientId) return [...this.state.notifications];
    return this.state.notifications.filter(
      (n) => n.recipientId === 'ALL' || n.recipientId === recipientId
    );
  }

  public addNotification(data: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Notification {
    const newNotif: Notification = {
      ...data,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.state.notifications.unshift(newNotif);
    this.saveState();
    return newNotif;
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveState();
    }
  }

  public markAllNotificationsAsRead(recipientId?: string): void {
    this.state.notifications.forEach((n) => {
      if (!recipientId || n.recipientId === 'ALL' || n.recipientId === recipientId) {
        n.isRead = true;
      }
    });
    this.saveState();
  }

  // --- OFFICIAL CONTACTS ---
  public getOfficialContacts(): OfficialContact[] {
    return [...this.state.officialContacts];
  }

  public getOfficialContactById(id: string): OfficialContact | undefined {
    return this.state.officialContacts.find((c) => c.id === id);
  }

  public addOfficialContact(contact: Omit<OfficialContact, 'id'>, adminName: string): OfficialContact {
    const newContact: OfficialContact = {
      ...contact,
      id: `c-${Date.now()}`,
    };
    this.state.officialContacts.push(newContact);
    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'ADD_EMERGENCY_CONTACT',
      target: newContact.name,
      newValue: `Phone: ${newContact.phone}, Mobile: ${newContact.mobile}`,
    });
    this.saveState();
    return newContact;
  }

  public updateOfficialContact(
    id: string,
    updates: Partial<OfficialContact>,
    adminName: string
  ): OfficialContact | null {
    const index = this.state.officialContacts.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const old = this.state.officialContacts[index];
    const updated: OfficialContact = {
      ...old,
      ...updates,
      id: old.id,
    };
    this.state.officialContacts[index] = updated;

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'UPDATE_EMERGENCY_CONTACT',
      target: updated.name,
      previousValue: `Phone: ${old.phone}, Mobile: ${old.mobile}, Agency: ${old.agency}`,
      newValue: `Phone: ${updated.phone}, Mobile: ${updated.mobile}, Agency: ${updated.agency}`,
    });
    this.saveState();
    return updated;
  }

  public deleteOfficialContact(id: string, adminName: string): boolean {
    const index = this.state.officialContacts.findIndex((c) => c.id === id);
    if (index === -1) return false;

    const removed = this.state.officialContacts[index];
    this.state.officialContacts.splice(index, 1);

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'DELETE_EMERGENCY_CONTACT',
      target: removed.name,
      previousValue: `Agency: ${removed.agency}, Phone: ${removed.phone}`,
      newValue: 'Contact removed from official directory',
    });
    this.saveState();
    return true;
  }

  public resetOfficialContacts(adminName: string): OfficialContact[] {
    this.state.officialContacts = [...defaultContacts];
    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'RESET_EMERGENCY_CONTACTS',
      target: 'Emergency Hotlines Directory',
      newValue: 'Reset to official default directory',
    });
    this.saveState();
    return [...this.state.officialContacts];
  }

  // --- MEMBER TRAINING SUBMISSIONS & ACCREDITATION APPROVAL ---
  public getTrainingSubmissions(
    filterMemberId?: string,
    filterStatus?: TrainingSubmissionStatus
  ): MemberTrainingSubmission[] {
    let list = this.state.trainingSubmissions || [];
    if (filterMemberId) {
      list = list.filter((s) => s.memberId === filterMemberId);
    }
    if (filterStatus) {
      list = list.filter((s) => s.status === filterStatus);
    }
    return [...list];
  }

  public getTrainingSubmissionById(id: string): MemberTrainingSubmission | undefined {
    return (this.state.trainingSubmissions || []).find((s) => s.id === id);
  }

  public submitMemberTraining(
    data: Omit<MemberTrainingSubmission, 'id' | 'submissionNumber' | 'status' | 'createdAt' | 'updatedAt'>
  ): MemberTrainingSubmission {
    if (!this.state.trainingSubmissions) {
      this.state.trainingSubmissions = [];
    }
    const count = this.state.trainingSubmissions.length + 1;
    const subNum = `MTS-2026-${String(count).padStart(4, '0')}`;
    const newSubmission: MemberTrainingSubmission = {
      ...data,
      id: `sub-${Date.now()}`,
      submissionNumber: subNum,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.trainingSubmissions.unshift(newSubmission);

    // Notify admins about new training submitted
    this.addNotification({
      recipientId: 'ALL',
      title: 'New Member Training Submitted for Approval',
      message: `${data.memberName} (${data.memberId}) submitted "${data.title}" for training accreditation.`,
      type: 'TRAINING',
      priority: 'NORMAL',
    });

    this.saveState();
    return newSubmission;
  }

  public approveTrainingSubmission(
    id: string,
    adminNotes: string,
    adminName: string
  ): { success: boolean; training?: Training; submission?: MemberTrainingSubmission } {
    const sub = this.getTrainingSubmissionById(id);
    if (!sub) return { success: false };

    // 1. Create official Training record
    const nextTrnId = this.getNextTrainingId();
    const newTraining: Training = {
      id: `t-${Date.now()}`,
      trainingId: nextTrnId,
      title: sub.title,
      type: sub.type,
      provider: sub.provider,
      date: sub.dateCompleted,
      startDate: sub.startDate || sub.dateCompleted,
      endDate: sub.endDate || sub.dateCompleted,
      venue: sub.venue || 'San Andres Municipality / Accredited External Center',
      instructor: sub.instructor || 'Certified External Instructor',
      facilitator: adminName,
      hours: Number(sub.hours) || 8,
      description: sub.description || `Accredited external completion certificate submitted by ${sub.memberName}.`,
      status: 'COMPLETED',
      participants: [
        {
          memberId: sub.memberId,
          memberName: sub.memberName,
          status: 'COMPLETED',
          completedDate: sub.dateCompleted,
          certificateIssued: Boolean(sub.certificateNumber),
          certificateNumber: sub.certificateNumber,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.trainings.unshift(newTraining);

    // 2. Also register official Certificate record
    const certNum = sub.certificateNumber || `CERT-ACC-${Date.now().toString().slice(-5)}`;
    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      certificateNumber: certNum,
      title: sub.title,
      recipientName: sub.memberName,
      memberId: sub.memberId,
      trainingId: newTraining.trainingId,
      trainingTitle: newTraining.title,
      dateIssued: sub.dateCompleted,
      dateCompleted: sub.dateCompleted,
      issuedBy: sub.provider,
      organization: 'SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM',
      status: 'VALID',
      qrCodeUrl: '',
      verificationCode: `VER-ACC-${sub.memberId.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`,
      signatories: [
        { name: 'VINCENT B. BRIONES', title: 'PRESIDENT (SACERT)' },
        { name: 'NICHOLSON J. DASALLA', title: 'VICE PRESIDENT (SACERT)' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.certificates.unshift(newCert);

    // 3. Update member's qualifications
    const member = this.getMemberByMemberId(sub.memberId);
    if (member) {
      if (!member.qualifications.includes(sub.title)) {
        member.qualifications.push(sub.title);
      }
      this.updateMember(member.id, { qualifications: member.qualifications }, adminName);
    }

    // 4. Update submission status
    sub.status = 'APPROVED';
    sub.adminNotes = adminNotes || 'Approved and accredited into official SACERT responder records.';
    sub.reviewedBy = adminName;
    sub.reviewedAt = new Date().toISOString();
    sub.approvedTrainingId = newTraining.trainingId;
    sub.updatedAt = new Date().toISOString();

    // 5. Notify the member
    this.addNotification({
      recipientId: sub.memberId,
      title: 'Training Submission Approved! ✓',
      message: `Your submitted training "${sub.title}" (${sub.provider}) has been approved and accredited by ${adminName}.`,
      type: 'TRAINING',
      priority: 'IMPORTANT',
    });

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'APPROVE_MEMBER_TRAINING_SUBMISSION',
      target: `${sub.memberName} - ${sub.title}`,
      targetId: sub.submissionNumber,
      newValue: `Approved. Generated Training ${newTraining.trainingId}, Certificate ${certNum}`,
    });

    this.saveState();
    return { success: true, training: newTraining, submission: sub };
  }

  public rejectTrainingSubmission(id: string, reason: string, adminName: string): boolean {
    const sub = this.getTrainingSubmissionById(id);
    if (!sub) return false;

    sub.status = 'REJECTED';
    sub.adminNotes = reason;
    sub.reviewedBy = adminName;
    sub.reviewedAt = new Date().toISOString();
    sub.updatedAt = new Date().toISOString();

    this.addNotification({
      recipientId: sub.memberId,
      title: 'Training Submission Needs Review / Declined',
      message: `Your submitted training "${sub.title}" was declined: ${reason}`,
      type: 'TRAINING',
      priority: 'NORMAL',
    });

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'REJECT_MEMBER_TRAINING_SUBMISSION',
      target: `${sub.memberName} - ${sub.title}`,
      targetId: sub.submissionNumber,
      previousValue: `Reason: ${reason}`,
      newValue: 'Status set to REJECTED',
    });

    this.saveState();
    return true;
  }

  public deleteTrainingSubmission(id: string, adminName: string): boolean {
    const idx = (this.state.trainingSubmissions || []).findIndex((s) => s.id === id);
    if (idx === -1) return false;
    const sub = this.state.trainingSubmissions[idx];
    this.state.trainingSubmissions.splice(idx, 1);

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'DELETE_TRAINING_SUBMISSION',
      target: `${sub.memberName} - ${sub.title}`,
      targetId: sub.submissionNumber,
      newValue: 'Submission deleted by admin',
    });

    this.saveState();
    return true;
  }

  // --- SYSTEM SETTINGS ---
  public getSettings(): SystemSettings {
    return { ...this.state.systemSettings };
  }

  public updateSettings(updates: Partial<SystemSettings>, adminName: string): SystemSettings {
    this.state.systemSettings = {
      ...this.state.systemSettings,
      ...updates,
    };
    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'UPDATE_SYSTEM_SETTINGS',
      target: 'System Configuration',
      newValue: `Updated: ${Object.keys(updates).join(', ')}`,
    });
    this.saveState();
    return { ...this.state.systemSettings };
  }

  // --- BACKUP & EXPORT ---
  public exportDatabaseJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  // --- MEMBER REGISTRATION PORTAL & APPLICATIONS ---
  public getRegistrations(filterStatus?: RegistrationStatus): RegistrationApplication[] {
    const list = this.state.registrations || [];
    if (!filterStatus) return [...list];
    return list.filter((r) => r.status === filterStatus);
  }

  public getRegistrationById(id: string): RegistrationApplication | undefined {
    return (this.state.registrations || []).find((r) => r.id === id);
  }

  public submitRegistration(
    data: Omit<RegistrationApplication, 'id' | 'applicationNumber' | 'status' | 'createdAt' | 'updatedAt'>
  ): RegistrationApplication {
    const list = this.state.registrations || [];
    const appNum = `REG-2026-${String(list.length + 1).padStart(4, '0')}`;
    const newApp: RegistrationApplication = {
      ...data,
      id: `reg-${Date.now()}`,
      applicationNumber: appNum,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!this.state.registrations) {
      this.state.registrations = [];
    }
    this.state.registrations.unshift(newApp);

    // Create system notification for admins
    this.addNotification({
      recipientId: 'ALL',
      title: 'New Member Registration Submitted',
      message: `Applicant ${newApp.fullName} submitted registration for review (${appNum}).`,
      type: 'SYSTEM',
      priority: 'NORMAL',
    });

    this.saveState();
    return newApp;
  }

  public approveRegistration(
    id: string,
    adminName: string
  ): { success: boolean; member?: Member; user?: User; error?: string } {
    const app = this.getRegistrationById(id);
    if (!app) return { success: false, error: 'Registration application not found.' };

    if (app.status === 'APPROVED') {
      return { success: false, error: 'Application has already been approved.' };
    }

    // Generate Member ID
    const memberId = this.getNextMemberId();

    // Split name if needed
    const nameParts = app.fullName.trim().split(' ');
    const firstName = app.firstName || nameParts[0] || app.fullName;
    const lastName = app.lastName || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : '');
    const middleName = app.middleName || (nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '');

    // 1. Create Member
    const newMember: Member = {
      id: `m-${Date.now()}`,
      memberId,
      firstName,
      middleName,
      lastName,
      fullName: app.fullName,
      dateOfBirth: app.dateOfBirth,
      sex: app.gender,
      address: app.address,
      barangay: app.barangay,
      municipality: app.municipality || 'San Andres',
      province: app.province || '',
      contactNumber: app.contactNumber,
      email: app.email,
      emergencyContact: app.emergencyContactName,
      emergencyContactNumber: app.emergencyContactNumber,
      emergencyContactRelation: app.emergencyContactRelation,
      dateJoined: app.dateOfRegistration || new Date().toISOString().split('T')[0],
      dateOnboarded: new Date().toISOString().split('T')[0],
      membershipStatus: 'ACTIVE',
      designation: 'Community Responder',
      responderLevel: 'Level 1 - Basic Responder',
      bloodType: 'Unknown',
      profilePhoto: app.profilePhoto || '',
      skills: app.skills ? app.skills.split(',').map((s) => s.trim()) : [],
      qualifications: app.certifications ? app.certifications.split(',').map((s) => s.trim()) : [],
      awards: [],
      deploymentsCount: 0,
      qrVerificationCode: `VER-M-${memberId}-${lastName.toUpperCase() || 'MEMBER'}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 2. Create User account so approved applicant can immediately log into Member Portal
    let cleanUsername = app.username.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUsername) {
      cleanUsername = `sacert.${lastName.toLowerCase() || 'member'}`;
    }
    // ensure unique username
    if (this.getUserByUsername(cleanUsername)) {
      cleanUsername = `${cleanUsername}${Math.floor(100 + Math.random() * 900)}`;
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      username: cleanUsername,
      passwordHash: app.passwordHash || 'sacert4810',
      role: 'MEMBER',
      memberId: newMember.memberId,
      fullName: newMember.fullName,
      email: newMember.email,
      accountStatus: 'ACTIVE',
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    newMember.userId = newUser.id;

    // Push into database
    this.state.members.push(newMember);
    this.state.users.push(newUser);

    // Update registration status
    app.status = 'APPROVED';
    app.reviewedBy = adminName;
    app.reviewedAt = new Date().toISOString();
    app.updatedAt = new Date().toISOString();

    // Audit Log
    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'APPROVE_MEMBER_REGISTRATION',
      target: `${app.fullName} (${app.applicationNumber})`,
      targetId: newMember.memberId,
      newValue: `Approved by ${adminName}. Assigned Member ID: ${memberId}, Username: @${cleanUsername}`,
    });

    this.saveState();
    return { success: true, member: newMember, user: newUser };
  }

  public rejectRegistration(id: string, reason: string, adminName: string): boolean {
    const app = this.getRegistrationById(id);
    if (!app) return false;

    app.status = 'REJECTED';
    app.adminNotes = reason;
    app.reviewedBy = adminName;
    app.reviewedAt = new Date().toISOString();
    app.updatedAt = new Date().toISOString();

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'REJECT_MEMBER_REGISTRATION',
      target: `${app.fullName} (${app.applicationNumber})`,
      targetId: app.applicationNumber,
      previousValue: `Reason: ${reason}`,
      newValue: 'Status set to REJECTED',
    });

    this.saveState();
    return true;
  }

  public requestAdditionalInfoRegistration(id: string, notes: string, adminName: string): boolean {
    const app = this.getRegistrationById(id);
    if (!app) return false;

    app.status = 'ADDITIONAL_INFO_REQUIRED';
    app.adminNotes = notes;
    app.reviewedBy = adminName;
    app.reviewedAt = new Date().toISOString();
    app.updatedAt = new Date().toISOString();

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'REQUEST_ADDITIONAL_INFO_REGISTRATION',
      target: `${app.fullName} (${app.applicationNumber})`,
      targetId: app.applicationNumber,
      newValue: `Notes: ${notes}`,
    });

    this.saveState();
    return true;
  }

  public updateRegistration(id: string, updates: Partial<RegistrationApplication>, adminName: string): boolean {
    const app = this.getRegistrationById(id);
    if (!app) return false;

    Object.assign(app, updates, { updatedAt: new Date().toISOString() });

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'UPDATE_REGISTRATION_APPLICATION',
      target: `${app.fullName} (${app.applicationNumber})`,
      targetId: app.applicationNumber,
      newValue: 'Applicant data edited by admin',
    });

    this.saveState();
    return true;
  }

  public deleteRegistration(id: string, adminName: string, reason: string = 'Administrative review'): boolean {
    const idx = (this.state.registrations || []).findIndex((r) => r.id === id);
    if (idx === -1) return false;

    const app = this.state.registrations[idx];
    this.state.registrations.splice(idx, 1);

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'DELETE_REGISTRATION_APPLICATION',
      target: `${app.fullName} (${app.applicationNumber})`,
      targetId: app.applicationNumber,
      previousValue: `Reason: ${reason}`,
      newValue: 'Deleted from registration applications',
    });

    this.saveState();
    return true;
  }

  // --- RADIO NET MODULE ---
  public getRadioNetConfig(): RadioNetConfig {
    if (!this.state.radioNetConfig) {
      this.state.radioNetConfig = defaultRadioNetConfig;
    }
    return { ...this.state.radioNetConfig };
  }

  public updateRadioNetConfig(updates: Partial<RadioNetConfig>, adminName: string): RadioNetConfig {
    const current = this.getRadioNetConfig();
    const updated: RadioNetConfig = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: adminName,
    };

    this.state.radioNetConfig = updated;

    // Sync system settings radio frequency if changed
    if (updates.frequency) {
      this.state.systemSettings.radioNetFrequency = updates.frequency;
    }

    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'UPDATE_RADIO_NET_CONFIG',
      target: 'Radio Net Operations Configuration',
      newValue: `Frequency: ${updated.frequency}, Net: ${updated.netName}`,
    });

    this.saveState();
    return updated;
  }

  public addCallsign(entry: CallsignEntry, adminName: string): RadioNetConfig {
    const config = this.getRadioNetConfig();
    config.callsignsRoster = (config.callsignsRoster || []).filter((c) => c.callsign !== entry.callsign);
    config.callsignsRoster.push(entry);
    return this.updateRadioNetConfig({ callsignsRoster: config.callsignsRoster }, adminName);
  }

  public removeCallsign(callsign: string, adminName: string): RadioNetConfig {
    const config = this.getRadioNetConfig();
    config.callsignsRoster = (config.callsignsRoster || []).filter((c) => c.callsign !== callsign);
    return this.updateRadioNetConfig({ callsignsRoster: config.callsignsRoster }, adminName);
  }

  public updateCallsign(callsign: string, updates: Partial<CallsignEntry>, adminName: string): RadioNetConfig {
    const config = this.getRadioNetConfig();
    const index = (config.callsignsRoster || []).findIndex((c) => c.callsign === callsign);
    if (index !== -1) {
      config.callsignsRoster[index] = { ...config.callsignsRoster[index], ...updates };
      return this.updateRadioNetConfig({ callsignsRoster: config.callsignsRoster }, adminName);
    }
    return config;
  }

  // --- POPUP ANNOUNCEMENTS & READ RECEIPTS ---
  public getPopupAnnouncements(userId?: string): Announcement[] {
    const all = this.getAnnouncements();
    return all.filter((a) => {
      if (!a.popupOnLogin && !a.isPopup && a.priority !== 'EMERGENCY') return false;
      if (!userId) return true;
      const readList = a.readBy || [];
      return !readList.includes(userId);
    });
  }

  public markAnnouncementRead(announcementId: string, userId: string): void {
    const announcement = this.state.announcements.find((a) => a.id === announcementId);
    if (!announcement) return;
    if (!announcement.readBy) {
      announcement.readBy = [];
    }
    if (!announcement.readBy.includes(userId)) {
      announcement.readBy.push(userId);
      this.saveState();
    }
  }

  public importDatabaseJson(jsonString: string, adminName: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.users && parsed.members && parsed.certificates) {
        this.state = parsed;
        this.addAuditLog({
          adminId: 'admin',
          adminName,
          action: 'RESTORE_DATABASE_BACKUP',
          target: 'Full System Database',
          newValue: 'Restored from JSON backup snapshot',
        });
        this.saveState();
        return true;
      }
    } catch (e) {
      console.error('Import database failed:', e);
    }
    return false;
  }

  public resetToFactoryDemo(adminName: string): void {
    this.state = {
      users: defaultUsers,
      members: defaultMembers,
      trainings: defaultTrainings,
      certificates: defaultCertificates,
      certificateTemplates: [],
      announcements: defaultAnnouncements,
      emergencyAlerts: defaultEmergencyAlerts,
      notifications: defaultNotifications,
      auditLogs: defaultAuditLogs,
      officialContacts: defaultContacts,
      systemSettings: defaultSettings,
      registrations: defaultRegistrations,
      radioNetConfig: defaultRadioNetConfig,
      trainingSubmissions: defaultTrainingSubmissions,
    };
    this.addAuditLog({
      adminId: 'admin',
      adminName,
      action: 'FACTORY_RESET_DEMO_DATA',
      target: 'System Database',
      newValue: 'Reset to official sample dataset',
    });
    this.saveState();
  }
}

export const db = new DatabaseService();
