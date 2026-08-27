import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, UserCheck, AlertTriangle, 
  CheckCircle2, Wifi, ShieldAlert, Sparkles, RefreshCw 
} from 'lucide-react';
import { PatientSession, StaffAccount } from '../../types';
import { ApiService } from '../../services/api';

interface StaffTakeoverProps {
  sessionId?: string;
  staff?: StaffAccount;
  onBackToMonitor?: () => void;
}

export const StaffTakeover: React.FC<StaffTakeoverProps> = ({
  sessionId: propSessionId,
  staff: propStaff,
  onBackToMonitor,
}) => {
  const params = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const activeSessionId = propSessionId || params.sessionId || '';
  const currentStaff = propStaff || ApiService.getStaffAccount() || {
    staffId: 'STAFF-OPD-101',
    fullName: 'Sister Priya Sharma',
    role: 'OPD Triage Staff Nurse',
    department: 'OPD Triage',
    username: 'nurse_priya'
  };

  const [session, setSession] = useState<PatientSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [conflictData, setConflictData] = useState<any | null>(null);

  // Form Fields for Manual Entry
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [hpiOnset, setHpiOnset] = useState<string>('');
  const [hpiCharacter, setHpiCharacter] = useState<string>('');
  const [hpiRadiation, setHpiRadiation] = useState<string>('');
  const [hpiAssociated, setHpiAssociated] = useState<string>('');
  const [pastMedical, setPastMedical] = useState<string>('');
  const [drugAllergies, setDrugAllergies] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');

  const fetchSession = async () => {
    if (!activeSessionId) return;
    setIsLoading(true);
    try {
      const data = await ApiService.getSession(activeSessionId);
      setSession(data);
      setChiefComplaint(data.chiefComplaint || '');
      setHpiOnset(data.historyOfPresentIllness?.onset || '');
      setHpiCharacter(data.historyOfPresentIllness?.character || '');
      setHpiRadiation(data.historyOfPresentIllness?.radiation || '');
      setHpiAssociated(data.historyOfPresentIllness?.associatedSymptoms?.join(', ') || '');
      setPastMedical(data.pastMedicalHistory?.join(', ') || '');
      setDrugAllergies(data.drugAllergyHistory?.allergies || '');
    } catch (err) {
      console.error("Takeover load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [activeSessionId]);

  const handleSubmit = async (forceOverride: boolean = false) => {
    if (!session) return;
    setIsSubmitting(true);
    setConflictData(null);
    setSuccessMessage(null);

    const payload = {
      staffId: currentStaff.staffId,
      chiefComplaint,
      historyOfPresentIllness: {
        onset: hpiOnset,
        site: session.historyOfPresentIllness?.site || '',
        character: hpiCharacter,
        radiation: hpiRadiation,
        aggravating: session.historyOfPresentIllness?.aggravating || '',
        relieving: session.historyOfPresentIllness?.relieving || '',
        associatedSymptoms: hpiAssociated ? hpiAssociated.split(',').map((s) => s.trim()) : [],
      },
      pastMedicalHistory: pastMedical ? pastMedical.split(',').map((s) => s.trim()) : [],
      drugAllergyHistory: {
        currentMedications: session.drugAllergyHistory?.currentMedications || [],
        allergies: drugAllergies || 'No known drug allergies (NKDA)',
      },
      manualNotes,
      expectedVersion: session.version,
      forceOverride,
    };

    try {
      const res = await ApiService.staffTakeover(session.sessionId, payload);
      setSession(res.session);
      setSuccessMessage("Manual clinical intake successfully saved and marked as staff-manual provenance.");
    } catch (err: any) {
      console.error("Takeover submit error:", err);
      if (err.status === 409) {
        // Version conflict detected
        try {
          const parsed = JSON.parse(err.raw);
          setConflictData(parsed);
        } catch {
          setConflictData({ detail: "Kiosk has reconnected with newer data." });
        }
      } else {
        alert(err.message || "Failed to save staff takeover.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHandback = async () => {
    if (!session) return;
    try {
      await ApiService.staffHandback(session.sessionId);
      alert("Session returned to Kiosk. Kiosk connectivity marked online.");
      handleBack();
    } catch (err) {
      console.error("Handback error:", err);
    }
  };

  const handleBack = () => {
    if (onBackToMonitor) {
      onBackToMonitor();
    } else {
      navigate('/staff');
    }
  };

  if (isLoading || !session) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-slate-500">
        Loading session for manual intervention...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Staff Monitor</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleHandback}
            className="px-3.5 py-2 bg-teal-50 border border-teal-300 text-teal-800 text-xs font-bold rounded-xl hover:bg-teal-100 transition-colors flex items-center space-x-1"
          >
            <Wifi className="w-3.5 h-3.5 text-teal-600" />
            <span>Handback to Kiosk</span>
          </button>
        </div>
      </div>

      {/* Reconnection Conflict Resolution Card */}
      {conflictData && (
        <div className="bg-rose-50 border-2 border-rose-400 rounded-2xl p-5 shadow-lg space-y-3 text-rose-950">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-sm text-rose-900">Reconnection Version Conflict Detected</h3>
              <p className="text-xs text-rose-800 mt-1">
                {conflictData.detail || "The patient kiosk reconnected and submitted newer data while you were editing."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => handleSubmit(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Keep Staff Changes (Force Override)
            </button>
            <button
              onClick={() => {
                setConflictData(null);
                fetchSession();
              }}
              className="px-4 py-2 bg-white border border-rose-300 text-rose-900 text-xs font-bold rounded-xl hover:bg-rose-100"
            >
              Use Latest Kiosk Data
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => navigate('/physician')}
            className="px-3 py-1 bg-emerald-700 text-white text-xs rounded-lg shadow-sm"
          >
            View in Physician Queue →
          </button>
        </div>
      )}

      {/* Patient Meta Strip */}
      <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 font-semibold block">Patient Name</span>
          <strong className="text-sm text-slate-900">{session.patientName}</strong>
        </div>
        <div>
          <span className="text-slate-400 font-semibold block">Age / Gender</span>
          <strong className="text-sm text-slate-900">{session.age} Yrs / {session.gender}</strong>
        </div>
        <div>
          <span className="text-slate-400 font-semibold block">Token #</span>
          <strong className="text-sm font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {session.tokenNumber}
          </strong>
        </div>
        <div>
          <span className="text-slate-400 font-semibold block">Staff Operator</span>
          <strong className="text-xs text-slate-700 font-medium">
            {currentStaff.fullName} ({currentStaff.staffId})
          </strong>
        </div>
      </div>

      {/* Staff Manual Intake Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5">
        
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-amber-600" />
            <span>Manual Clinical History Entry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data entered here will be tagged with <span className="font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">staff-manual</span> provenance and dispatched to the attending doctor's queue.
          </p>
        </div>

        {/* Chief Complaint */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Chief Complaint <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            placeholder="e.g., Severe epigastric burning pain and nausea x 3 days"
            required
            className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* HPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Onset / Duration
            </label>
            <input
              type="text"
              value={hpiOnset}
              onChange={(e) => setHpiOnset(e.target.value)}
              placeholder="e.g., Started 2 hours ago suddenly"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Character & Intensity (1-10)
            </label>
            <input
              type="text"
              value={hpiCharacter}
              onChange={(e) => setHpiCharacter(e.target.value)}
              placeholder="e.g., Squeezing pressure 8/10"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Radiation / Spread
            </label>
            <input
              type="text"
              value={hpiRadiation}
              onChange={(e) => setHpiRadiation(e.target.value)}
              placeholder="e.g., Radiating to left shoulder / jaw"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Associated Symptoms
            </label>
            <input
              type="text"
              value={hpiAssociated}
              onChange={(e) => setHpiAssociated(e.target.value)}
              placeholder="e.g., Cold sweating, shortness of breath, dizziness"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Past History & Allergies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Past Medical / Surgical History
            </label>
            <input
              type="text"
              value={pastMedical}
              onChange={(e) => setPastMedical(e.target.value)}
              placeholder="e.g., Type 2 Diabetes (6 yrs), Hypertension"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Known Drug Allergies
            </label>
            <input
              type="text"
              value={drugAllergies}
              onChange={(e) => setDrugAllergies(e.target.value)}
              placeholder="e.g., Allergic to Diclofenac / Penicillin (or NKDA)"
              className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Staff Manual Clinical Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Staff Operator Notes (Intervention Reason)
          </label>
          <textarea
            rows={2}
            value={manualNotes}
            onChange={(e) => setManualNotes(e.target.value)}
            placeholder="e.g., Patient unable to use touchscreen due to tremor. Manual intake conducted by Sister Priya at triage desk."
            className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting || !chiefComplaint.trim()}
            className="px-6 py-3.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center space-x-2 min-h-[48px] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Submit Manual Intake to Doctor Queue'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
