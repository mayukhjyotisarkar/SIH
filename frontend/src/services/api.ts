import { 
  PatientRegistration, PatientSession, AdaptiveQuestion, 
  RedFlag, PriorInvestigation, ConnectivityStatus, StaffAccount,
  AudioTranscriptionResponse, CDSSResponse 
} from '../types';

const API_BASE = '/api';
const STAFF_TOKEN_KEY = 'medikiosk_staff_token';
const STAFF_ACCOUNT_KEY = 'medikiosk_staff_account';

export class ApiService {
  private static connectivityFailures = 0;

  // --- Staff Token Storage Helpers ---
  static setStaffAuth(token: string, staff: StaffAccount) {
    localStorage.setItem(STAFF_TOKEN_KEY, token);
    localStorage.setItem(STAFF_ACCOUNT_KEY, JSON.stringify(staff));
  }

  static getStaffToken(): string | null {
    return localStorage.getItem(STAFF_TOKEN_KEY);
  }

  static getStaffAccount(): StaffAccount | null {
    const raw = localStorage.getItem(STAFF_ACCOUNT_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static clearStaffAuth() {
    localStorage.removeItem(STAFF_TOKEN_KEY);
    localStorage.removeItem(STAFF_ACCOUNT_KEY);
  }

  private static async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      this.connectivityFailures++;
      const errText = await res.text();
      let parsedMsg = `API Error [${res.status}]: ${errText}`;
      try {
        const jsonErr = JSON.parse(errText);
        if (jsonErr.detail) parsedMsg = jsonErr.detail;
      } catch {}
      const error: any = new Error(parsedMsg);
      error.status = res.status;
      error.raw = errText;
      throw error;
    }
    this.connectivityFailures = 0;
    return res.json();
  }

  // --- Session & Intake ---
  static async startSession(registration: PatientRegistration): Promise<PatientSession> {
    const res = await fetch(`${API_BASE}/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registration)
    });
    return this.handleResponse<PatientSession>(res);
  }

  static async getSession(sessionId: string): Promise<PatientSession> {
    const res = await fetch(`${API_BASE}/session/${sessionId}`);
    return this.handleResponse<PatientSession>(res);
  }

  static async submitAnswer(
    sessionId: string,
    answer: string,
    mode: 'voice' | 'tap' | 'staff-manual' = 'tap',
    ayushMode: boolean = false,
    field?: string,
    questionText?: string
  ): Promise<{ adaptive: AdaptiveQuestion; redFlag: RedFlag; session: PatientSession }> {
    const res = await fetch(`${API_BASE}/session/${sessionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer, mode, ayushMode, field, questionText })
    });
    return this.handleResponse(res);
  }

  static async undoAnswer(sessionId: string): Promise<{ adaptive: AdaptiveQuestion; session: PatientSession }> {
    const res = await fetch(`${API_BASE}/session/${sessionId}/back`, {
      method: 'POST'
    });
    return this.handleResponse(res);
  }

  static async transcribeAudio(
    sessionId: string,
    audioBlob: Blob,
    languageHint: string = 'en-IN',
    accentHint?: string
  ): Promise<AudioTranscriptionResponse> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'voice_recording.webm');
    const query = new URLSearchParams({ languageHint });
    if (accentHint) query.append('accentHint', accentHint);
    
    const res = await fetch(`${API_BASE}/session/${sessionId}/audio-transcribe?${query.toString()}`, {
      method: 'POST',
      body: formData
    });
    return this.handleResponse<AudioTranscriptionResponse>(res);
  }

  // --- Documents & OCR ---
  static async uploadDocument(sessionId: string, file: File): Promise<PriorInvestigation> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/session/${sessionId}/document/upload`, {
      method: 'POST',
      body: formData
    });
    return this.handleResponse<PriorInvestigation>(res);
  }

  static async loadSampleDocument(sessionId: string, sampleId: string): Promise<PriorInvestigation> {
    const res = await fetch(`${API_BASE}/session/${sessionId}/document/sample/${sampleId}`, {
      method: 'POST'
    });
    return this.handleResponse<PriorInvestigation>(res);
  }

  static async correctDocument(sessionId: string, documentId: string, extracted: any): Promise<any> {
    const res = await fetch(`${API_BASE}/session/${sessionId}/document/manual-correct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, extracted })
    });
    return this.handleResponse(res);
  }

  static async deleteDocument(sessionId: string, documentId: string): Promise<PatientSession> {
    const res = await fetch(`${API_BASE}/session/${sessionId}/document/${documentId}`, {
      method: 'DELETE'
    });
    return this.handleResponse<PatientSession>(res);
  }

  static async replaceDocument(sessionId: string, documentId: string, file: File): Promise<PriorInvestigation> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/session/${sessionId}/document/${documentId}/replace`, {
      method: 'POST',
      body: formData
    });
    return this.handleResponse<PriorInvestigation>(res);
  }

  // --- Summary & Confirm ---
  static async confirmSession(sessionId: string): Promise<{
    status: string;
    sessionId: string;
    tokenNumber: string;
    visitId: string;
    message: string;
  }> {
    const res = await fetch(`${API_BASE}/session/${sessionId}/confirm`, {
      method: 'POST'
    });
    return this.handleResponse(res);
  }

  // --- Connectivity ---
  static async updateConnectivity(
    sessionId: string,
    status: ConnectivityStatus,
    failCount: number = 0
  ): Promise<{ status: ConnectivityStatus; flaggedForStaff: boolean; version?: number }> {
    const res = await fetch(`${API_BASE}/session/${sessionId}/connectivity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        failCount,
        clientTimestamp: new Date().toISOString()
      })
    });
    return this.handleResponse(res);
  }

  // --- Staff Portal (Authenticated) ---
  static async staffLogin(username: string, password: string): Promise<{ token: string; staff: StaffAccount }> {
    const res = await fetch(`${API_BASE}/staff/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await this.handleResponse<{ token: string; staff: StaffAccount }>(res);
    this.setStaffAuth(data.token, data.staff);
    return data;
  }

  static async getStaffSessions(): Promise<any[]> {
    const token = this.getStaffToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/staff/sessions`, { headers });
    return this.handleResponse<any[]>(res);
  }

  static async staffTakeover(sessionId: string, payload: any): Promise<any> {
    const token = this.getStaffToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/staff/session/${sessionId}/takeover`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    return this.handleResponse(res);
  }

  static async staffHandback(sessionId: string): Promise<any> {
    const token = this.getStaffToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/staff/session/${sessionId}/handback`, {
      method: 'POST',
      headers
    });
    return this.handleResponse(res);
  }

  // --- Staff Assistance Call & Department Assignment ---
  static async callStaff(sessionId: string, reason?: string, kioskId?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/session/${sessionId}/call-staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, kioskId })
    });
    return this.handleResponse(res);
  }

  static async fetchDepartments(): Promise<Record<string, any>> {
    const res = await fetch(`${API_BASE}/departments`);
    return this.handleResponse<Record<string, any>>(res);
  }

  static async assignDepartment(
    sessionId: string,
    payload: {
      department: string;
      doctorName?: string;
      doctorTitle?: string;
      roomNumber?: string;
      floorLocation?: string;
      notes?: string;
    }
  ): Promise<any> {
    const token = this.getStaffToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/staff/session/${sessionId}/assign-department`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    return this.handleResponse(res);
  }

  // --- Emergency Casualty Dashboard ---
  static async getEmergencyQueue(): Promise<PatientSession[]> {
    const res = await fetch(`${API_BASE}/emergency/queue`);
    return this.handleResponse<PatientSession[]>(res);
  }

  static async triggerEmergencyAction(
    sessionId: string,
    action: string,
    assignedBed?: string,
    notes?: string,
    dispatchedBy: string = "Emergency Triage Officer"
  ): Promise<any> {
    const res = await fetch(`${API_BASE}/emergency/session/${sessionId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, assignedBed, notes, dispatchedBy })
    });
    return this.handleResponse(res);
  }

  // --- Physician Dashboard ---
  static async getPhysicianQueue(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/physician/queue`);
    return this.handleResponse<any[]>(res);
  }

  static async getPhysicianSession(sessionId: string): Promise<PatientSession> {
    const res = await fetch(`${API_BASE}/physician/session/${sessionId}`);
    return this.handleResponse<PatientSession>(res);
  }

  static async reviewSection(sessionId: string, payload: any): Promise<any> {
    const res = await fetch(`${API_BASE}/physician/session/${sessionId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return this.handleResponse(res);
  }

  static async getClinicalDecisionSupport(sessionId: string): Promise<CDSSResponse> {
    const res = await fetch(`${API_BASE}/physician/session/${sessionId}/clinical-decision-support`, {
      method: 'POST'
    });
    return this.handleResponse<CDSSResponse>(res);
  }

  static async savePhysicianRecord(sessionId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/physician/session/${sessionId}/save-record`, {
      method: 'POST'
    });
    return this.handleResponse(res);
  }
}
