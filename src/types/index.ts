export type RoleType = 'SUPER_ADMIN' | 'ADMINISTRATOR' | 'MEMBER';

export type MembershipStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'RESIGNED'
  | 'RETIRED'
  | 'DECEASED';

export type AccountStatus = 'ACTIVE' | 'DISABLED' | 'FORCE_PASSWORD_CHANGE';

export type ResponderLevel =
  | 'Level 1 - Volunteer Responder'
  | 'Level 2 - Basic Responder'
  | 'Level 3 - Intermediate Responder'
  | 'Level 4 - Advanced Responder'
  | 'Level 5 - Specialized Teams';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown';

export type PriorityLevel = 'NORMAL' | 'IMPORTANT' | 'URGENT' | 'EMERGENCY';

export type CertificateStatus = 'VALID' | 'EXPIRED' | 'REVOKED' | 'REISSUED';

export type TrainingStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  username: string;
  passwordHash: string; // In production this is bcrypt; simulated secure hash
  role: RoleType;
  memberId?: string; // Links to Member table if role is MEMBER or Admin with member profile
  fullName: string;
  email: string;
  accountStatus: AccountStatus;
  failedLoginAttempts: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  memberId: string; // Unique, e.g. SACERT-2026-0001
  userId?: string; // Linked User account ID
  firstName: string;
  middleName: string;
  lastName: string;
  suffix?: string;
  fullName: string;
  dateOfBirth: string;
  sex: 'Male' | 'Female' | 'Other';
  address: string;
  barangay: string;
  municipality: string;
  province: string;
  contactNumber: string;
  email: string;
  emergencyContact: string;
  emergencyContactNumber: string;
  emergencyContactRelation?: string;
  dateJoined: string;
  dateOnboarded: string;
  membershipStatus: MembershipStatus;
  designation: string; // E.g., Team Leader, Medical First Responder, etc.
  responderLevel: ResponderLevel;
  bloodType: BloodType;
  profilePhoto: string;
  skills: string[];
  qualifications: string[];
  awards: string[];
  deploymentsCount: number;
  qrVerificationCode: string;
  deletedAt?: string | null; // Soft delete support
  createdAt: string;
  updatedAt: string;
}

export interface Training {
  id: string;
  trainingId: string; // Unique e.g. TRN-2026-001
  title: string;
  type: string; // First Aid, BLS, SAR, Fire, DRRM, etc.
  provider: string; // SACERT, MDRRMO, BFP, PRC, OCD
  date: string;
  startDate: string;
  endDate: string;
  venue: string;
  instructor: string;
  facilitator: string;
  hours: number;
  description: string;
  status: TrainingStatus;
  participants: TrainingParticipant[];
  certificateTemplateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingParticipant {
  memberId: string;
  memberName: string;
  status: 'REGISTERED' | 'ATTENDED' | 'COMPLETED' | 'INCOMPLETE';
  completedDate?: string;
  certificateIssued?: boolean;
  certificateNumber?: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string; // Unique e.g. CERT-2026-0089
  title: string;
  recipientName: string;
  memberId: string;
  trainingId?: string;
  trainingTitle: string;
  dateIssued: string;
  dateCompleted: string;
  expiryDate?: string;
  issuedBy: string; // E.g. "San Andres Municipal Disaster Risk Reduction & Management Office & SACERT Leadership"
  organization: string; // "SAN ANDRES COMMUNITY EMERGENCY RESPONSE TEAM"
  status: CertificateStatus;
  qrCodeUrl: string;
  verificationCode: string;
  revocationReason?: string;
  revokedAt?: string;
  revokedBy?: string;
  reissuedFrom?: string;
  signatories: {
    name: string;
    title: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  title: string;
  bodyText: string;
  borderStyle: string;
  primaryColor: string;
  signatory1Name: string;
  signatory1Title: string;
  signatory2Name: string;
  signatory2Title: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  date: string;
  priority: PriorityLevel;
  category?: 'EMERGENCY' | 'TRAINING' | 'NOTICE' | 'SCHEDULED' | 'GENERAL';
  targetAudience: 'ALL' | 'ACTIVE_ONLY' | 'SPECIFIC_DESIGNATION' | 'SPECIFIC_TRAINING_GROUP';
  targetValue?: string; // Designation name or training ID
  expirationDate?: string;
  authorName: string;
  popupOnLogin?: boolean;
  isPopup?: boolean;
  scheduledAt?: string;
  readBy?: string[];
  createdAt: string;
}

export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED';

export interface RegistrationApplication {
  id: string;
  applicationNumber: string; // E.g. REG-2026-0001
  fullName: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  barangay: string;
  municipality: string;
  province: string;
  contactNumber: string;
  email: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  emergencyContactRelation: string;
  dateOfRegistration: string;
  previousTraining: string;
  certifications: string;
  skills: string;
  username: string;
  passwordHash: string; // Plain/hashed for creation upon approval
  profilePhoto?: string;
  supportingDocuments?: string[];
  status: RegistrationStatus;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CallsignEntry {
  callsign: string;
  memberName: string;
  designation: string;
  unit: string;
  status: 'ACTIVE' | 'STANDBY' | 'MONITORING';
}

export interface RadioNetConfig {
  id: string;
  frequency: string; // Default: '425.025 MHz'
  netName: string;
  operatingInstructions: string;
  emergencyProcedures: string;
  contactInformation: string;
  netController: string;
  activeCallsign: string;
  callsignsRoster: CallsignEntry[];
  importantAnnouncements: string;
  repeaterShift?: string;
  plTone?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  priority: PriorityLevel;
  sentBy: string;
  sentAt: string;
  expiresAt?: string;
  targetAudience: 'ALL' | 'ACTIVE_ONLY' | 'SPECIFIC_MEMBERS';
  targetMemberIds?: string[];
  active: boolean;
  acknowledgements: {
    memberId: string;
    memberName: string;
    receivedAt: string;
    acknowledgedAt: string;
  }[];
}

export interface Notification {
  id: string;
  recipientId: string; // User ID or 'ALL'
  title: string;
  message: string;
  type: 'ANNOUNCEMENT' | 'EMERGENCY' | 'TRAINING' | 'CERTIFICATE' | 'SYSTEM';
  priority: PriorityLevel;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  targetId?: string;
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface OfficialContact {
  id: string;
  name: string;
  agency: string;
  phone: string;
  mobile: string;
  radioFrequency?: string;
  email?: string;
  address: string;
  availableHours: string;
  isEmergencyHotline: boolean;
}

export interface SystemSettings {
  organizationName: string;
  organizationAbbreviation: string;
  organizationLogo?: string;
  tagline: string;
  municipality: string;
  province: string;
  address: string;
  contactNumber: string;
  email: string;
  website: string;
  certificateNumberPrefix: string;
  memberIdPrefix: string;
  allowMemberSelfProfileEdit: boolean;
  defaultSignatory1Name: string;
  defaultSignatory1Title: string;
  defaultSignatory2Name: string;
  defaultSignatory2Title: string;
  radioNetFrequency: string;
  radioNetName: string;
  designations: string[];
  membershipStatuses: string[];
  trainingCategories: string[];
}

export type TrainingSubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface MemberTrainingSubmission {
  id: string;
  submissionNumber: string; // e.g. TRN-SUB-001
  memberId: string;
  memberName: string;
  title: string;
  type: string; // Category e.g. First Aid, BLS, WASAR, Fire, DRRM
  provider: string; // e.g. MDRRMO, PRC, BFP, OCD, etc.
  dateCompleted: string;
  startDate?: string;
  endDate?: string;
  hours: number;
  venue?: string;
  instructor?: string;
  certificateNumber?: string;
  certificateProofPhoto?: string; // base64 photo of certificate/proof
  description?: string;
  status: TrainingSubmissionStatus;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedTrainingId?: string;
  createdAt: string;
  updatedAt: string;
}
