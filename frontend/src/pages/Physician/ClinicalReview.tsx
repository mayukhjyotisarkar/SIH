import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Check, Edit3, X, AlertTriangle, 
  CheckCircle2, FileText, User, Save, Building2, 
  ShieldCheck, AlertCircle, Stethoscope, Sparkles,
  Pill, FlaskConical, PlusCircle, CheckCheck, Lightbulb,
  ChevronRight, RefreshCw, ShieldAlert, HeartPulse, Activity
} from 'lucide-react';
import { PatientSession, CDSSResponse, DifferentialDiagnosis, SuggestedDrug } from '../../types';
import { ApiService } from '../../services/api';
import { ProvenanceTag } from '../../components/ProvenanceTag';
import { AbnormalBadge } from '../../components/AbnormalBadge';

interface ClinicalReviewProps {
  sessionId?: string;
  onBackToQueue?: () => void;
}

export const ClinicalReview: React.FC<ClinicalReviewProps> = ({
  sessionId: propSessionId,
  onBackToQueue,
}) => {
  const params = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const activeSessionId = propSessionId || params.sessionId || '';

  const [session, setSession] = useState<PatientSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // CDSS State
  const [cdssData, setCdssData] = useState<CDSSResponse | null>(null);
  const [isLoadingCDSS, setIsLoadingCDSS] = useState<boolean>(false);
  const [adoptedItems, setAdoptedItems] = useState<Record<string, boolean>>({});

  // Section review states: 'accepted' | 'amended' | 'rejected'
  const [sectionReviews, setSectionReviews] = useState<Record<string, 'accepted' | 'amended' | 'rejected'>>({
    chiefComplaint: 'accepted',
    historyOfPresentIllness: 'accepted',
    pastMedicalHistory: 'accepted',
    drugAllergyHistory: 'accepted',
    familyHistory: 'accepted',
    personalHistory: 'accepted',
    reviewOfSystems: 'accepted',
  });

  // Amended draft data
  const [amendedData, setAmendedData] = useState<any>({});
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});
  const [physicianNotes, setPhysicianNotes] = useState<string>('');

  const fetchCDSS = async (sessionIdToFetch: string) => {
    setIsLoadingCDSS(true);
    try {
      const cdss = await ApiService.getClinicalDecisionSupport(sessionIdToFetch);
      setCdssData(cdss);
    } catch (err) {
      console.error("Fetch CDSS error:", err);
    } finally {
      setIsLoadingCDSS(false);
    }
  };

  useEffect(() => {
    if (!activeSessionId) return;

    const fetchSession = async () => {
      setIsLoading(true);
      try {
        const data = await ApiService.getPhysicianSession(activeSessionId);
        setSession(data);
        setPhysicianNotes(data.physicianNotes || '');
        if (data.sectionReviews && Object.keys(data.sectionReviews).length > 0) {
          setSectionReviews((prev) => ({ ...prev, ...data.sectionReviews }));
        }
        setAmendedData({
          chiefComplaint: data.chiefComplaint,
          historyOfPresentIllness: { ...data.historyOfPresentIllness },
          pastMedicalHistory: [...data.pastMedicalHistory],
          drugAllergyHistory: { ...data.drugAllergyHistory },
          reviewOfSystems: data.reviewOfSystems,
        });

        // Automatically fetch AI Clinical Decision Support suggestions
        fetchCDSS(activeSessionId);
      } catch (err) {
        console.error("Fetch session detail error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, [activeSessionId]);

  const handleSetStatus = (sectionKey: string, status: 'accepted' | 'amended' | 'rejected') => {
    setSectionReviews((prev) => ({ ...prev, [sectionKey]: status }));
    setEditingSections((prev) => ({ ...prev, [sectionKey]: status === 'amended' }));
  };

  const handleSaveDraftReview = async () => {
    if (!session) return;
    setIsSaving(true);
    try {
      const activeId = session.sessionId || session.patientId;
      await ApiService.reviewSection(activeId, {
        sectionReviews,
        amendedData,
        physicianNotes,
        overallStatus: Object.values(sectionReviews).includes('amended') ? 'Amended' : 'Accepted',
      });
      const updated = await ApiService.getPhysicianSession(activeId);
      setSession(updated);
    } catch (err) {
      console.error("Save review error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdoptDiagnosis = (d: DifferentialDiagnosis) => {
    const key = `dx_${d.condition}`;
    setAdoptedItems((prev) => ({ ...prev, [key]: true }));
    const addition = `\n• Differential Diagnosis: ${d.condition}${d.icd10 ? ` (${d.icd10})` : ''} — ${d.rationale}`;
    setPhysicianNotes((prev) => (prev ? prev + addition : addition.trim()));
  };

  const handleAdoptTreatment = (drug: SuggestedDrug) => {
    const key = `rx_${drug.name}`;
    setAdoptedItems((prev) => ({ ...prev, [key]: true }));
    const addition = `\n• Rx: ${drug.name} | Dose: ${drug.dosage} | Frequency: ${drug.frequency} | Duration: ${drug.duration} (${drug.rationale})`;
    setPhysicianNotes((prev) => (prev ? prev + addition : addition.trim()));
  };

  const handleAdoptInvestigation = (inv: string) => {
    const key = `inv_${inv}`;
    setAdoptedItems((prev) => ({ ...prev, [key]: true }));
    const addition = `\n• Ordered Investigation: ${inv}`;
    setPhysicianNotes((prev) => (prev ? prev + addition : addition.trim()));
  };

  const handleAdoptAllCDSS = () => {
    if (!cdssData) return;
    let text = `\n\n--- [AI Clinical Decision Support Plan Adopted by Physician] ---`;
    if (cdssData.differentialDiagnoses.length > 0) {
      text += `\nDifferential Diagnoses Considered:\n` + cdssData.differentialDiagnoses.map((d) => `  • ${d.condition}${d.icd10 ? ` (${d.icd10})` : ''} - ${d.probability} likelihood (${d.rationale})`).join('\n');
    }
    if (cdssData.suggestedTreatments.length > 0) {
      text += `\nPrescription Orders:\n` + cdssData.suggestedTreatments.map((t, idx) => `  ${idx + 1}. ${t.name} — ${t.dosage} (${t.frequency}) for ${t.duration}`).join('\n');
    }
    if (cdssData.recommendedInvestigations.length > 0) {
      text += `\nDiagnostic Investigations:\n` + cdssData.recommendedInvestigations.map((inv) => `  • ${inv}`).join('\n');
    }
    setPhysicianNotes((prev) => (prev ? prev + text : text.trim()));

    const allKeys: Record<string, boolean> = { all: true };
    cdssData.suggestedTreatments.forEach((t) => (allKeys[`rx_${t.name}`] = true));
    cdssData.differentialDiagnoses.forEach((d) => (allKeys[`dx_${d.condition}`] = true));
    cdssData.recommendedInvestigations.forEach((i) => (allKeys[`inv_${i}`] = true));
    setAdoptedItems(allKeys);
  };

  const handleFinalizeRecord = async () => {
    if (!session) return;
    setIsSaving(true);
    try {
      const activeId = session.sessionId || session.patientId;
      await handleSaveDraftReview();
      await ApiService.savePhysicianRecord(activeId);
      setIsSavedSuccess(true);
      // Auto-redirect doctor back to patient queue
      setTimeout(() => {
        handleBack();
      }, 700);
    } catch (err) {
      console.error("Finalize error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (onBackToQueue) {
      onBackToQueue();
    } else {
      navigate('/physician');
    }
  };

  if (isLoading || !session) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center text-slate-500">
        Loading patient clinical note...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Queue</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveDraftReview}
            disabled={isSaving}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center space-x-1.5 min-h-[40px]"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft Note</span>
          </button>

          <button
            onClick={handleFinalizeRecord}
            disabled={isSaving || isSavedSuccess}
            className={`px-5 py-2 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 min-h-[40px] ${
              isSavedSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSavedSuccess ? 'Record Saved & Finalized' : 'Accept & Save to EHR'}</span>
          </button>
        </div>
      </div>

      {/* Red Flag Emergency Banner if triggered */}
      {session.redFlag?.triggered && (
        <div className="bg-rose-600 text-white rounded-2xl p-5 shadow-lg border-2 border-rose-400">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-7 h-7 text-white shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider bg-white text-rose-700 px-2 py-0.5 rounded">
                TRIAGE RED FLAG TRIGGERED
              </span>
              <h3 className="text-lg font-extrabold">{session.redFlag.reason}</h3>
              <p className="text-xs text-rose-100">{session.redFlag.action}</p>
            </div>
          </div>
        </div>
      )}

      {/* Physician Review Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center space-x-2">
          <Stethoscope className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Draft Clinical Intake for Physician Review:</strong> This note is pre-assembled by MediKiosk. Please verify, edit, and accept each section below before saving.
          </span>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
          Status: {session.physicianReviewStatus}
        </span>
      </div>

      {/* Patient Header Identity Card */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-400 font-semibold block">Patient Name</span>
          <strong className="text-base text-slate-900 font-bold">{session.patientName}</strong>
        </div>
        <div>
          <span className="text-slate-400 font-semibold block">Age / Gender</span>
          <strong className="text-base text-slate-900 font-bold">{session.age} Yrs / {session.gender}</strong>
        </div>
        <div>
          <span className="text-slate-400 font-semibold block">ABHA Health ID</span>
          <strong className="text-sm font-mono text-slate-900">{session.patientId}</strong>
        </div>
        <div>
          <span className="text-slate-400 font-semibold block">Token / Visit ID</span>
          <strong className="text-sm font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            {session.tokenNumber} • {session.visitId}
          </strong>
        </div>
      </div>

      {/* Baseline OPD Vitals Card */}
      <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Baseline OPD Vitals</span>
            <strong className="text-sm text-slate-800 font-bold">Physical & Hemodynamic Parameters</strong>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {session.vitals?.weightKg && (
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold block">Weight / Height</span>
              <strong className="text-slate-900 font-bold">{session.vitals.weightKg}</strong>
            </div>
          )}
          {session.vitals?.bloodPressure && (
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold block">Blood Pressure</span>
              <strong className="text-slate-900 font-bold">{session.vitals.bloodPressure}</strong>
            </div>
          )}
          {session.vitals?.disclosureStatus === 'declined' && (
            <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-amber-900">
              <span className="text-[10px] font-bold block text-amber-700">Vitals Non-Disclosure</span>
              <strong className="font-bold">{session.vitals.nonDisclosureReason || 'Patient chose not to disclose'}</strong>
              <span className="text-[10px] text-slate-500 block">• Measure physically during exam</span>
            </div>
          )}
          {(!session.vitals || (!session.vitals.weightKg && !session.vitals.bloodPressure && session.vitals.disclosureStatus !== 'declined')) && (
            <div className="text-slate-400 italic">
              Standard baseline vitals pending physician/nurse physical examination
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Nurse Clinical Intake Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl border border-slate-700 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-extrabold text-white">
              Triage Nurse Clinical Summary & Synthesis
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-950 text-teal-300 border border-teal-700">
              Acuity: {session.triageAcuity || 'Routine OPD'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Intake: {session.conversationTurns?.length || 0} turns collected
            </span>
          </div>
        </div>

        {/* Narrative Synthesis */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 text-sm text-slate-200 leading-relaxed">
          <p className="font-medium">
            {session.nurseSummary || (
              `Patient presents with ${session.chiefComplaint || 'general OPD symptoms'}. Detailed history collected across chronology, associated systemic complaints, comorbidities, current daily prescription medications, and drug allergy status.`
            )}
          </p>
        </div>

        {/* Pertinent Positives & Negatives Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Positives */}
          <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pertinent Clinical Positives</span>
            </span>
            <ul className="space-y-1 text-slate-300">
              {(session.pertinentPositives && session.pertinentPositives.length > 0) ? (
                session.pertinentPositives.slice(0, 4).map((pos, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-teal-400 font-bold">•</span>
                    <span>{pos}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400">• Primary presentation: {session.chiefComplaint}</li>
              )}
            </ul>
          </div>

          {/* Negatives */}
          <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ruled-Out Alarms & Pertinent Negatives</span>
            </span>
            <ul className="space-y-1 text-slate-300">
              {(session.pertinentNegatives && session.pertinentNegatives.length > 0) ? (
                session.pertinentNegatives.slice(0, 4).map((neg, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{neg}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400">• Denies acute focal neurological/cardiac alarm features</li>
              )}
            </ul>
          </div>
        </div>

        {/* Nurse Recommended Workup for Attending Physician */}
        {session.nurseRecommendations && session.nurseRecommendations.length > 0 && (
          <div className="p-3 bg-teal-950/40 rounded-xl border border-teal-800/50 text-xs flex flex-wrap items-center gap-2">
            <span className="font-bold text-teal-300 shrink-0">Nurse Suggested Workup:</span>
            <div className="flex flex-wrap gap-1.5">
              {session.nurseRecommendations.map((rec, idx) => (
                <span key={idx} className="px-2.5 py-0.5 bg-teal-900/60 text-teal-200 border border-teal-700/60 rounded-md font-medium text-[11px]">
                  {rec}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Structured Clinical Note Sections */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 divide-y divide-slate-200 overflow-hidden">
        
        {/* Section 1: Chief Complaint */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                1. Chief Complaint
              </h3>
              <ProvenanceTag
                provenance={session.fieldProvenance?.['chiefComplaint'] || 'patient-conversation'}
                staffId={session.enteredByStaffId}
              />
            </div>

            {/* Accept / Amend / Reject Controls */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => handleSetStatus('chiefComplaint', 'accepted')}
                className={`px-2.5 py-1 text-xs font-bold rounded flex items-center space-x-1 ${
                  sectionReviews.chiefComplaint === 'accepted' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>Accept</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetStatus('chiefComplaint', 'amended')}
                className={`px-2.5 py-1 text-xs font-bold rounded flex items-center space-x-1 ${
                  sectionReviews.chiefComplaint === 'amended' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Amend</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetStatus('chiefComplaint', 'rejected')}
                className={`px-2.5 py-1 text-xs font-bold rounded flex items-center space-x-1 ${
                  sectionReviews.chiefComplaint === 'rejected' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <X className="w-3 h-3" />
                <span>Reject</span>
              </button>
            </div>
          </div>

          {editingSections.chiefComplaint ? (
            <textarea
              rows={2}
              value={amendedData.chiefComplaint || ''}
              onChange={(e) => setAmendedData({ ...amendedData, chiefComplaint: e.target.value })}
              className="w-full text-sm p-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-blue-50/30 font-medium"
            />
          ) : (
            <p className="text-base font-semibold text-slate-900">
              {amendedData.chiefComplaint || session.chiefComplaint}
            </p>
          )}
        </div>

        {/* Section 2: History of Present Illness (HPI) */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                2. History of Present Illness (SOCRATES)
              </h3>
              {session.historyOfPresentIllness?.symptomCategory && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                  {session.historyOfPresentIllness.symptomCategory.replace(/_/g, ' ')} Focus
                </span>
              )}
              <ProvenanceTag
                provenance={session.fieldProvenance?.['historyOfPresentIllness'] || 'patient-conversation'}
                staffId={session.enteredByStaffId}
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => handleSetStatus('historyOfPresentIllness', 'accepted')}
                className={`px-2.5 py-1 text-xs font-bold rounded flex items-center space-x-1 ${
                  sectionReviews.historyOfPresentIllness === 'accepted' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>Accept</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetStatus('historyOfPresentIllness', 'amended')}
                className={`px-2.5 py-1 text-xs font-bold rounded flex items-center space-x-1 ${
                  sectionReviews.historyOfPresentIllness === 'amended' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Amend</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetStatus('historyOfPresentIllness', 'rejected')}
                className={`px-2.5 py-1 text-xs font-bold rounded flex items-center space-x-1 ${
                  sectionReviews.historyOfPresentIllness === 'rejected' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <X className="w-3 h-3" />
                <span>Reject</span>
              </button>
            </div>
          </div>

          {editingSections.historyOfPresentIllness ? (
            <div className="space-y-3 bg-blue-50/40 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center space-x-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Physician SOCRATES History Editor</span>
                </span>
                <button
                  type="button"
                  onClick={() => setEditingSections((prev) => ({ ...prev, historyOfPresentIllness: false }))}
                  className="text-xs font-bold text-blue-700 hover:underline"
                >
                  Done Editing
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Onset & Chronology (O / T):
                  </label>
                  <input
                    type="text"
                    value={amendedData.historyOfPresentIllness?.onset || ''}
                    onChange={(e) =>
                      setAmendedData({
                        ...amendedData,
                        historyOfPresentIllness: {
                          ...amendedData.historyOfPresentIllness,
                          onset: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Sudden onset 2 hours ago during exertion"
                    className="w-full p-2 text-xs border border-blue-300 rounded-lg bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Character & Severity (C / S):
                  </label>
                  <input
                    type="text"
                    value={amendedData.historyOfPresentIllness?.character || ''}
                    onChange={(e) =>
                      setAmendedData({
                        ...amendedData,
                        historyOfPresentIllness: {
                          ...amendedData.historyOfPresentIllness,
                          character: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Crushing, heavy pressure, 8/10 severity"
                    className="w-full p-2 text-xs border border-blue-300 rounded-lg bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Site & Radiation (S / R):
                  </label>
                  <input
                    type="text"
                    value={amendedData.historyOfPresentIllness?.radiation || ''}
                    onChange={(e) =>
                      setAmendedData({
                        ...amendedData,
                        historyOfPresentIllness: {
                          ...amendedData.historyOfPresentIllness,
                          radiation: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Precordial area radiating to left arm and jaw"
                    className="w-full p-2 text-xs border border-blue-300 rounded-lg bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Associated Symptoms (A):
                  </label>
                  <input
                    type="text"
                    value={
                      Array.isArray(amendedData.historyOfPresentIllness?.associatedSymptoms)
                        ? amendedData.historyOfPresentIllness.associatedSymptoms.join(', ')
                        : (amendedData.historyOfPresentIllness?.associatedSymptoms || '')
                    }
                    onChange={(e) =>
                      setAmendedData({
                        ...amendedData,
                        historyOfPresentIllness: {
                          ...amendedData.historyOfPresentIllness,
                          associatedSymptoms: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean),
                        },
                      })
                    }
                    placeholder="e.g. Diaphoresis, nausea, lightheadedness"
                    className="w-full p-2 text-xs border border-blue-300 rounded-lg bg-white font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Aggravating & Relieving Factors (E / R):
                  </label>
                  <input
                    type="text"
                    value={amendedData.historyOfPresentIllness?.aggravating || ''}
                    onChange={(e) =>
                      setAmendedData({
                        ...amendedData,
                        historyOfPresentIllness: {
                          ...amendedData.historyOfPresentIllness,
                          aggravating: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Aggravated by climbing stairs, partially relieved by rest"
                    className="w-full p-2 text-xs border border-blue-300 rounded-lg bg-white font-medium"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block">Onset & Chronology:</span>
                <span className="text-slate-900 font-bold">
                  {amendedData.historyOfPresentIllness?.onset || session.historyOfPresentIllness?.onset || 'Acute presentation'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block">Character & Severity:</span>
                <span className="text-slate-900 font-bold">
                  {amendedData.historyOfPresentIllness?.character || session.historyOfPresentIllness?.character || 'Moderate intensity'}
                </span>
              </div>
              {(amendedData.historyOfPresentIllness?.radiation || session.historyOfPresentIllness?.radiation) && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
                  <span className="text-slate-500 font-semibold block">Site & Radiation:</span>
                  <span className="text-slate-900 font-bold">
                    {amendedData.historyOfPresentIllness?.radiation || session.historyOfPresentIllness?.radiation}
                  </span>
                </div>
              )}
              {((amendedData.historyOfPresentIllness?.associatedSymptoms && amendedData.historyOfPresentIllness.associatedSymptoms.length > 0) ||
                (session.historyOfPresentIllness?.associatedSymptoms && session.historyOfPresentIllness.associatedSymptoms.length > 0)) && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
                  <span className="text-slate-500 font-semibold block">Associated Symptoms:</span>
                  <span className="text-slate-900 font-bold">
                    {Array.isArray(amendedData.historyOfPresentIllness?.associatedSymptoms) && amendedData.historyOfPresentIllness.associatedSymptoms.length > 0
                      ? amendedData.historyOfPresentIllness.associatedSymptoms.join(', ')
                      : session.historyOfPresentIllness?.associatedSymptoms?.join(', ')}
                  </span>
                </div>
              )}
              {(amendedData.historyOfPresentIllness?.aggravating || session.historyOfPresentIllness?.aggravating) && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
                  <span className="text-slate-500 font-semibold block">Triggers & Relieving Factors:</span>
                  <span className="text-slate-900 font-bold">
                    {amendedData.historyOfPresentIllness?.aggravating || session.historyOfPresentIllness?.aggravating}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* AYUSH Ayurveda Details if available */}
          {(session.historyOfPresentIllness?.ayushDetails || session.historyOfPresentIllness?.ayurvedicDetails) && (
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-300 text-xs space-y-2.5 mt-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <strong className="text-amber-950 font-extrabold flex items-center gap-1.5 text-sm">
                  <span>🌿 AYUSH Ayurveda Classical Roga-Rogi &amp; Dashavidha Pariksha Dossier</span>
                </strong>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                  Ayurvedic OPD Protocol
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {Object.entries(session.historyOfPresentIllness.ayurvedicDetails || session.historyOfPresentIllness.ayushDetails || {}).map(([k, v]) => {
                  const labels: Record<string, string> = {
                    doshaLakshana: 'Doshic Manifestation (Roga Lakshana)',
                    dosha: 'Doshic Manifestation (Roga Lakshana)',
                    agniPariksha: 'Jatharagni Capacity (Digestive Fire)',
                    agni: 'Jatharagni Capacity (Digestive Fire)',
                    kosthaMala: 'Kostha & Bowel Evacuation (Bowel Nature)',
                    kostha: 'Kostha & Bowel Evacuation (Bowel Nature)',
                    amaLakshana: 'Ama & Srotorodha (Metabolic Toxicity)',
                    ama: 'Ama & Srotorodha (Metabolic Toxicity)',
                    prakritiDeha: 'Deha-Prakriti (Lifelong Constitution)',
                    prakriti: 'Deha-Prakriti (Lifelong Constitution)',
                    aharaViharaHetu: 'Ahara-Vihara Hetu (Diet & Lifestyle Routine)',
                    nidraManasika: 'Nidra & Manasika (Sleep & Mental State)',
                    nidra: 'Nidra & Manasika (Sleep & Mental State)',
                    ayurvedicMedicationsPathya: 'Classical Formulations & Pathya Compliance',
                    pathya: 'Classical Formulations & Pathya Compliance',
                  };
                  const label = labels[k] || k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
                  return (
                    <div key={k} className="bg-white/90 p-2.5 rounded-xl border border-amber-200/80 shadow-xs">
                      <span className="capitalize font-bold text-amber-900 block text-[11px] mb-0.5">{label}</span>
                      <span className="text-slate-800 font-medium">{v}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AYUSH Homeopathy Details if available */}
          {session.historyOfPresentIllness?.homeopathicDetails && (
            <div className="p-3.5 bg-cyan-50 rounded-xl border border-cyan-200 text-xs space-y-1 mt-2">
              <strong className="text-cyan-950 font-bold flex items-center gap-1">
                <span>💧 AYUSH Homeopathy Totality &amp; Modalities Findings:</span>
              </strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {Object.entries(session.historyOfPresentIllness.homeopathicDetails).map(([k, v]) => (
                  <div key={k} className="bg-white/80 p-2 rounded-lg border border-cyan-100">
                    <span className="capitalize font-bold text-cyan-900 block">{k.replace(/([A-Z])/g, ' $1')}: </span>
                    <span className="text-slate-800 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Past Medical / Surgical History */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                3. Past Medical & Surgical History
              </h3>
              <ProvenanceTag provenance={session.fieldProvenance?.['pastMedicalHistory'] || 'patient-conversation'} />
            </div>
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => handleSetStatus('pastMedicalHistory', 'accepted')}
                className={`px-2.5 py-1 text-xs font-bold rounded flex items-center space-x-1 ${
                  sectionReviews.pastMedicalHistory === 'accepted' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>Accept</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetStatus('pastMedicalHistory', 'amended')}
                className={`px-2.5 py-1 text-xs font-bold rounded flex items-center space-x-1 ${
                  sectionReviews.pastMedicalHistory === 'amended' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Amend</span>
              </button>
            </div>
          </div>

          {editingSections.pastMedicalHistory ? (
            <div className="space-y-2 bg-blue-50/40 p-3.5 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">Edit Past Conditions (one per line):</span>
                <button
                  type="button"
                  onClick={() => setEditingSections((prev) => ({ ...prev, pastMedicalHistory: false }))}
                  className="text-xs font-bold text-blue-700 hover:underline"
                >
                  Done Editing
                </button>
              </div>
              <textarea
                rows={3}
                value={amendedData.pastMedicalHistory?.join('\n') || ''}
                onChange={(e) =>
                  setAmendedData({
                    ...amendedData,
                    pastMedicalHistory: e.target.value.split('\n').filter(Boolean),
                  })
                }
                placeholder="Enter conditions..."
                className="w-full text-xs p-2.5 border border-blue-300 rounded-lg bg-white font-medium"
              />
            </div>
          ) : (
            <ul className="text-xs sm:text-sm text-slate-800 list-disc list-inside space-y-1 font-medium">
              {(amendedData.pastMedicalHistory?.length > 0 ? amendedData.pastMedicalHistory : session.pastMedicalHistory)?.length > 0 ? (
                (amendedData.pastMedicalHistory?.length > 0 ? amendedData.pastMedicalHistory : session.pastMedicalHistory).map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))
              ) : (
                <li className="text-slate-500">No major chronic illnesses reported.</li>
              )}
            </ul>
          )}
        </div>

        {/* Section 4: Drug & Allergy History */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                4. Drug & Allergy History
              </h3>
              <ProvenanceTag provenance={session.fieldProvenance?.['drugAllergyHistory'] || 'patient-conversation'} />
            </div>
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => handleSetStatus('drugAllergyHistory', 'accepted')}
                className={`px-2.5 py-1 text-xs font-bold rounded flex items-center space-x-1 ${
                  sectionReviews.drugAllergyHistory === 'accepted' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>Accept</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetStatus('drugAllergyHistory', 'amended')}
                className={`px-2.5 py-1 text-xs font-bold rounded flex items-center space-x-1 ${
                  sectionReviews.drugAllergyHistory === 'amended' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Amend</span>
              </button>
            </div>
          </div>

          {editingSections.drugAllergyHistory ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-blue-50/40 p-3.5 rounded-xl border border-blue-200">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Known Drug Allergies:</label>
                </div>
                <input
                  type="text"
                  value={amendedData.drugAllergyHistory?.allergies || ''}
                  onChange={(e) =>
                    setAmendedData({
                      ...amendedData,
                      drugAllergyHistory: {
                        ...amendedData.drugAllergyHistory,
                        allergies: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Allergic to Penicillin / NKDA"
                  className="w-full p-2 text-xs border border-blue-300 rounded-lg bg-white font-bold text-rose-700"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Current Routine Medications:</label>
                  <button
                    type="button"
                    onClick={() => setEditingSections((prev) => ({ ...prev, drugAllergyHistory: false }))}
                    className="text-xs font-bold text-blue-700 hover:underline"
                  >
                    Done
                  </button>
                </div>
                <input
                  type="text"
                  value={
                    Array.isArray(amendedData.drugAllergyHistory?.currentMedications)
                      ? amendedData.drugAllergyHistory.currentMedications.join(', ')
                      : (amendedData.drugAllergyHistory?.currentMedications || '')
                  }
                  onChange={(e) =>
                    setAmendedData({
                      ...amendedData,
                      drugAllergyHistory: {
                        ...amendedData.drugAllergyHistory,
                        currentMedications: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean),
                      },
                    })
                  }
                  placeholder="e.g. Tab. Telmisartan 40mg (OD)"
                  className="w-full p-2 text-xs border border-blue-300 rounded-lg bg-white font-medium"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block">Known Drug Allergies:</span>
                <strong className="text-rose-700 font-bold">
                  {amendedData.drugAllergyHistory?.allergies || session.drugAllergyHistory?.allergies || 'No known drug allergies (NKDA)'}
                </strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block">Current Routine Medications:</span>
                <strong className="text-slate-900 font-bold">
                  {Array.isArray(amendedData.drugAllergyHistory?.currentMedications) && amendedData.drugAllergyHistory.currentMedications.length > 0
                    ? amendedData.drugAllergyHistory.currentMedications.join(', ')
                    : (session.drugAllergyHistory?.currentMedications?.join(', ') || 'None reported')}
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Prior Investigations & Lab Findings */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                5. Attached Medical Records & Lab Findings ({session.priorInvestigations?.length || 0})
              </h3>
              <ProvenanceTag provenance={session.fieldProvenance?.['priorInvestigations'] || 'document-extraction'} />
            </div>
          </div>

          {(!session.priorInvestigations || session.priorInvestigations.length === 0) ? (
            <p className="text-xs text-slate-500 italic">No prior investigations uploaded.</p>
          ) : (
            <div className="space-y-4">
              {session.priorInvestigations.map((doc, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{doc.document}</span>
                      <span className="text-xs text-slate-500 ml-2">({doc.timestamp})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.flag && (
                        <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                          ⚠️ {doc.flag}
                        </span>
                      )}
                      {doc.imageUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewImage(doc.imageUrl || null)}
                          className="text-xs text-blue-700 font-bold hover:underline"
                        >
                          View Image
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Investigations Table */}
                  {doc.extracted?.investigations && doc.extracted.investigations.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-200/70 text-slate-700 font-bold">
                          <tr>
                            <th className="p-2">Biomarker / Test</th>
                            <th className="p-2">Result</th>
                            <th className="p-2">Unit</th>
                            <th className="p-2">Reference</th>
                            <th className="p-2">Flag</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {doc.extracted.investigations.map((item, i) => (
                            <tr key={i} className={item.flag === 'HIGH' || item.flag === 'LOW' ? 'bg-rose-50' : ''}>
                              <td className="p-2 font-medium text-slate-900">{item.test}</td>
                              <td className="p-2 font-bold font-mono text-slate-900">{item.value}</td>
                              <td className="p-2 text-slate-600">{item.unit}</td>
                              <td className="p-2 text-slate-600">{item.ref_range || 'Standard'}</td>
                              <td className="p-2"><AbnormalBadge flag={item.flag} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Medications Table if prescription */}
                  {doc.extracted?.medications && doc.extracted.medications.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                        <div className="flex items-center space-x-2 text-xs">
                          <span className="font-bold text-slate-800 uppercase tracking-wide">
                            Prescribed Medications ({doc.extracted.medications.length})
                          </span>
                          {doc.extracted.doctor_name && (
                            <span className="text-slate-500 font-medium">
                              • By {doc.extracted.doctor_name} {doc.extracted.clinic ? `(${doc.extracted.clinic})` : ''}
                            </span>
                          )}
                        </div>
                        {doc.extracted.rx_date && (
                          <span className="text-[11px] text-slate-400 font-medium">
                            Date: {doc.extracted.rx_date}
                          </span>
                        )}
                      </div>

                      {/* Structured Prescription Table */}
                      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">Medicine & Strength</th>
                              <th className="py-2.5 px-3">Dosage</th>
                              <th className="py-2.5 px-3">Frequency / Timing</th>
                              <th className="py-2.5 px-3">Duration</th>
                              <th className="py-2.5 px-3">Special Instructions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {doc.extracted.medications.map((m: any, mi: number) => (
                              <tr key={mi} className="hover:bg-slate-50/60">
                                <td className="py-2.5 px-3 font-bold text-slate-900">
                                  {m.name}
                                </td>
                                <td className="py-2.5 px-3 text-slate-700 font-medium">
                                  {m.dosage || '1 tablet'}
                                </td>
                                <td className="py-2.5 px-3 text-blue-900 font-medium">
                                  <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                                    {m.frequency || 'Once daily'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-bold text-amber-900">
                                  <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                                    {m.duration || '5 days'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-500 italic">
                                  {m.instructions || m.timing || 'As prescribed'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Diagnoses & Advice if present */}
                      {((doc.extracted.diagnoses && doc.extracted.diagnoses.length > 0) || doc.extracted.advice || doc.extracted.clinical_impression) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                          {doc.extracted.diagnoses && doc.extracted.diagnoses.length > 0 && (
                            <div className="p-2.5 bg-slate-100/70 rounded-lg border border-slate-200">
                              <span className="font-bold text-slate-700 block mb-1">Documented Diagnoses:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {doc.extracted.diagnoses.map((dx: string, dxi: number) => (
                                  <span key={dxi} className="px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-800 text-[11px] font-semibold">
                                    {dx}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {(doc.extracted.advice || doc.extracted.clinical_impression) && (
                            <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-200 text-emerald-950">
                              <span className="font-bold text-emerald-900 block mb-1">Doctor Advice / Impression:</span>
                              <p className="text-[11px] font-medium">{doc.extracted.advice || doc.extracted.clinical_impression}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI CLINICAL DECISION SUPPORT & TREATMENT ASSISTANT (CDSS) */}
        <div className="p-6 space-y-5 bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-teal-50/70 border-t-2 border-b-2 border-indigo-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                  <span>AI Clinical Decision Support System (CDSS) & Treatment Assistant</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200">
                    Physician Stress Reduction Engine
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-600">
                Evidence-based differential diagnoses, standard Indian OPD drug regimens, physical exam signs, and recommended lab workup. Review and adopt with 1-click.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fetchCDSS(activeSessionId)}
                disabled={isLoadingCDSS}
                className="px-3 py-1.5 bg-white border border-indigo-300 hover:bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCDSS ? 'animate-spin' : ''}`} />
                <span>{isLoadingCDSS ? 'Analyzing...' : 'Refresh AI Support'}</span>
              </button>

              {cdssData && (
                <button
                  type="button"
                  onClick={handleAdoptAllCDSS}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center space-x-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Adopt Full Plan into Notes</span>
                </button>
              )}
            </div>
          </div>

          {isLoadingCDSS && !cdssData && (
            <div className="py-8 text-center space-y-2">
              <div className="inline-block p-3 bg-white rounded-full shadow-sm animate-pulse">
                <HeartPulse className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
              <p className="text-xs font-bold text-indigo-900">Synthesizing clinical decision support guidelines & differential diagnoses...</p>
            </div>
          )}

          {cdssData && (
            <div className="space-y-4 pt-1">
              
              {/* 1. Differential Diagnoses Grid */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-indigo-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    1. Differential Diagnoses & Likelihood Probabilities
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {cdssData.differentialDiagnoses.map((dx, idx) => {
                    const isAdopted = adoptedItems[`dx_${dx.condition}`] || adoptedItems.all;
                    const probBadge = 
                      dx.probability === 'High' 
                        ? 'bg-rose-100 text-rose-800 border-rose-200' 
                        : dx.probability === 'Moderate'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200';

                    return (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-indigo-100 shadow-sm flex flex-col justify-between space-y-2">
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-1.5">
                            <strong className="text-xs font-bold text-slate-900 leading-tight">{dx.condition}</strong>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${probBadge}`}>
                              {dx.probability}
                            </span>
                          </div>
                          {dx.icd10 && (
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                              ICD: {dx.icd10}
                            </span>
                          )}
                          <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                            {dx.rationale}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAdoptDiagnosis(dx)}
                          className={`w-full py-1 px-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1 ${
                            isAdopted
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                          }`}
                        >
                          {isAdopted ? <Check className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                          <span>{isAdopted ? 'Diagnosis Added' : 'Add to Plan'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Suggested Drug Regimens Table */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Pill className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    2. Suggested Evidence-Based Treatment Regimens (Indian OPD Standard)
                  </h4>
                </div>
                <div className="overflow-x-auto bg-white rounded-xl border border-indigo-100 shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 text-slate-700 uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Medicine & Strength</th>
                        <th className="py-2.5 px-3">Dosage</th>
                        <th className="py-2.5 px-3">Frequency / Timing</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3">Clinical Rationale</th>
                        <th className="py-2.5 px-3 text-right">Doctor Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cdssData.suggestedTreatments.map((drug, idx) => {
                        const isAdopted = adoptedItems[`rx_${drug.name}`] || adoptedItems.all;
                        return (
                          <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              <div className="space-y-0.5">
                                <span>{drug.name}</span>
                                {drug.potency && (
                                  <span className="ml-1.5 px-2 py-0.5 rounded bg-cyan-100 border border-cyan-300 text-cyan-900 text-[10px] font-bold">
                                    💧 Potency: {drug.potency}
                                  </span>
                                )}
                                {drug.contraindicationWarning && (
                                  <div className="flex items-center space-x-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                    <ShieldAlert className="w-3 h-3 text-rose-600" />
                                    <span>{drug.contraindicationWarning}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 font-medium">{drug.dosage}</td>
                            <td className="py-2.5 px-3 text-blue-900 font-medium">
                              <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100 font-semibold">
                                {drug.frequency}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-amber-900">
                              <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                                {drug.duration}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 italic max-w-xs">{drug.rationale}</td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleAdoptTreatment(drug)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all inline-flex items-center space-x-1 ${
                                  isAdopted
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                                }`}
                              >
                                {isAdopted ? <Check className="w-3 h-3" /> : <PlusCircle className="w-3 h-3" />}
                                <span>{isAdopted ? 'Prescribed' : 'Add to Rx'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Bottom Row: Key Points to Notice & Recommended Labs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Points to Notice */}
                <div className="p-3.5 bg-white rounded-xl border border-indigo-100 shadow-sm space-y-2">
                  <div className="flex items-center space-x-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      3. Key Physical Exam Signs & Red Flags
                    </h4>
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-700 font-medium list-disc list-inside">
                    {cdssData.keyPointsToNotice.map((pt, pti) => (
                      <li key={pti} className="leading-snug">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Investigations */}
                <div className="p-3.5 bg-white rounded-xl border border-indigo-100 shadow-sm space-y-2">
                  <div className="flex items-center space-x-1.5">
                    <FlaskConical className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      4. Recommended Diagnostic Lab Orders
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cdssData.recommendedInvestigations.map((inv, invi) => {
                      const isAdopted = adoptedItems[`inv_${inv}`] || adoptedItems.all;
                      return (
                        <button
                          key={invi}
                          type="button"
                          onClick={() => handleAdoptInvestigation(inv)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                            isAdopted
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
                          }`}
                        >
                          {isAdopted ? <Check className="w-3 h-3" /> : <PlusCircle className="w-3 h-3" />}
                          <span>{inv}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Physician Discretion & Safety Notice */}
              <div className="bg-white/80 border border-indigo-200 rounded-xl p-3 flex items-start space-x-2.5 text-[11px] text-slate-600">
                <ShieldCheck className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Physician Clinical Discretion Protocol:</strong> {cdssData.disclaimer} Click <strong>"Add to Plan"</strong> on any individual item or <strong>"Adopt Full Plan"</strong> to stage the text directly into the editable assessment box below.
                </p>
              </div>

            </div>
          )}
        </div>

        {/* Section 6: Physician Notes & Consultation Plan */}
        <div className="p-6 space-y-3 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              6. Attending Physician Notes & Assessment Plan
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              Editable • Staged with Doctor's Final Approval
            </span>
          </div>
          <textarea
            rows={4}
            value={physicianNotes}
            onChange={(e) => setPhysicianNotes(e.target.value)}
            placeholder="Add doctor's clinical impression, physical examination findings, prescription orders, and follow-up plan (or adopt suggestions from AI CDSS above)..."
            className="w-full text-sm p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-900 leading-relaxed"
          />
        </div>

      </div>

      {/* Confirmation & Final Save Footer */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={handleBack}
          className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
        >
          Back to Queue
        </button>

        <button
          onClick={handleFinalizeRecord}
          disabled={isSaving || isSavedSuccess}
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2 min-h-[48px]"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Confirm and Save to Patient Record</span>
        </button>
      </div>

      {/* Image Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Medical Document Preview</h3>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="text-slate-500 hover:text-slate-800 font-bold text-sm px-2 py-1"
              >
                ✕ Close
              </button>
            </div>
            <div className="overflow-auto flex-1 flex items-center justify-center bg-slate-100 rounded-xl p-2">
              <img src={previewImage} alt="Document" className="max-h-[70vh] object-contain rounded" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
