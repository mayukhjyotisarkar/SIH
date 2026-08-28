export type ConnectivityStatus = 'online' | 'degraded' | 'offline';

export type LanguageCode = 'en' | 'hi' | 'bn' | 'ta' | 'te';

export interface ConsentDetails {
  recordVoice: boolean;
  storeDocuments: boolean;
  shareHospital: boolean;
}

export interface PatientRegistration {
  abhaId?: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone?: string;
  language: LanguageCode;
  ayushMode: boolean;
  homeopathyMode?: boolean;
  medicalSystem?: 'allopathy' | 'ayurveda' | 'homeopathy';
  consent: ConsentDetails;
}

export interface QAPair {
  questionId: string;
  field: string;
  questionText: string;
  patientAnswer: string;
  mode: 'voice' | 'tap' | 'staff-manual';
  timestamp: string;
}

export interface AdaptiveQuestion {
  question: string;
  field: string;
  options: string[];
  done: boolean;
  progressPercent: number;
  source?: 'llm' | 'fallback' | 'staff-manual';
  symptomCategory?: string;
  systemSummary?: string;
}

export interface AudioTranscriptionResponse {
  transcript: string;
  detectedLanguage: string;
  accent?: string;
  confidence: number;
  source: 'whisper' | 'gemini_audio' | 'browser_native' | 'simulated' | 'indic_conformer';
  normalizedMedicalTerms: string[];
}

export interface DepartmentRouting {
  department: string;
  departmentCode?: string;
  doctorName: string;
  doctorTitle?: string;
  roomNumber: string;
  floorLocation?: string;
  isAmbiguous: boolean;
  assignedBy: 'ai-triage' | 'staff-triage' | 'emergency-protocol';
  routingReason: string;
  confidence?: number;
}

export interface RedFlag {
  triggered: boolean;
  reason: string;
  action: string;
  urgency?: 'routine' | 'urgent' | 'emergency';
}

export interface InvestigationItem {
  test: string;
  value: string;
  unit: string;
  ref_range?: string;
  flag?: 'NORMAL' | 'HIGH' | 'LOW';
}

export interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
}

export interface ExtractedDocumentData {
  laboratory?: string;
  doctor_name?: string;
  clinic?: string;
  test_date?: string;
  rx_date?: string;
  diagnoses?: string[];
  medications?: MedicationItem[];
  investigations?: InvestigationItem[];
  clinical_impression?: string;
  advice?: string;
  [key: string]: any;
}

export interface PriorInvestigation {
  id: string;
  document: string;
  documentType: 'lab_report' | 'printed_prescription' | 'handwritten_prescription' | 'other';
  extracted: ExtractedDocumentData;
  flag?: string | null;
  confidence: number;
  isSample: boolean;
  timestamp: string;
  imageUrl?: string;
  status: 'success' | 'needs_review' | 'failed';
  extractionSource?: 'vision_llm' | 'local_ocr_fallback' | 'sample_curated' | 'manual_correction';
}

export interface HistoryOfPresentIllness {
  onset: string;
  site: string;
  character: string;
  radiation: string;
  aggravating: string;
  relieving: string;
  associatedSymptoms: string[];
  symptomCategory?: string;
  clinicalRedFlagsChecked?: string[];
  ayushDetails?: Record<string, string>;
  homeopathicDetails?: Record<string, string>;
}

export interface DrugAllergyHistory {
  currentMedications: string[];
  allergies: string;
}

export interface PersonalHistory {
  diet: string;
  smoking: string;
  alcohol: string;
}

export type ProvenanceType = 
  | 'patient-conversation' 
  | 'attendant-conversation' 
  | 'staff-manual' 
  | 'document-extraction' 
  | 'document-extraction-fallback' 
  | 'manual-correction' 
  | 'physician-amended';

export interface PatientVitals {
  weightKg?: string | null;
  heightCm?: string | null;
  bmi?: string | null;
  bloodPressure?: string | null;
  pulseBpm?: string | null;
  temperatureF?: string | null;
  disclosureStatus?: 'disclosed' | 'partially_disclosed' | 'declined';
  nonDisclosureReason?: string | null;
  disclosureAlertAcknowledged?: boolean;
}

export interface PatientSession {
  sessionId: string;
  patientId: string;
  visitId: string;
  tokenNumber: string;
  patientName: string;
  age: number;
  gender: string;
  language: LanguageCode;
  ayushMode: boolean;
  homeopathyMode?: boolean;
  medicalSystem?: 'allopathy' | 'ayurveda' | 'homeopathy';
  connectivityStatus: ConnectivityStatus;
  flaggedForStaff: boolean;
  chiefComplaint: string;
  historyOfPresentIllness: HistoryOfPresentIllness;
  pastMedicalHistory: string[];
  drugAllergyHistory: DrugAllergyHistory;
  familyHistory: string[];
  personalHistory: PersonalHistory;
  reviewOfSystems: string;
  vitals?: PatientVitals;
  nurseSummary?: string;
  pertinentPositives?: string[];
  pertinentNegatives?: string[];
  triageAcuity?: 'Routine' | 'Semi-urgent' | 'Priority Emergency';
  nurseRecommendations?: string[];
  departmentRouting?: DepartmentRouting;
  staffCallActive?: boolean;
  staffCallReason?: string | null;
  priorInvestigations: PriorInvestigation[];
  redFlag: RedFlag;
  assignedBed?: string | null;
  emergencyActionLog?: string[];
  fieldProvenance: Record<string, ProvenanceType>;
  enteredByStaffId?: string | null;
  physicianReviewStatus: 'Pending confirmation' | 'Accepted' | 'Amended' | 'Rejected';
  physicianNotes?: string;
  sectionReviews: Record<string, 'accepted' | 'amended' | 'rejected'>;
  conversationTurns: QAPair[];
  createdAt: string;
  updatedAt: string;
  status: 'in_progress' | 'scanned' | 'confirmed' | 'in_physician_review' | 'completed';
  version: number;
}

export interface StaffAccount {
  staffId: string;
  username: string;
  fullName: string;
  role: string;
  department: string;
}

export interface DifferentialDiagnosis {
  condition: string;
  icd10?: string;
  probability: 'High' | 'Moderate' | 'Consider / Low';
  rationale: string;
}

export interface SuggestedDrug {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  rationale: string;
  potency?: string | null;
  repetition?: string | null;
  contraindicationWarning?: string | null;
}

export interface CDSSResponse {
  differentialDiagnoses: DifferentialDiagnosis[];
  suggestedTreatments: SuggestedDrug[];
  keyPointsToNotice: string[];
  recommendedInvestigations: string[];
  clinicalRationale: string;
  source: 'gemini' | 'groq' | 'openrouter' | 'guideline_rules';
  disclaimer: string;
}

