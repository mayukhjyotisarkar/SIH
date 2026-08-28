import React, { useState } from 'react';
import { 
  CheckCircle2, Volume2, ShieldCheck, ArrowLeft, 
  Sparkles, ArrowRight, Building2, Network, 
  QrCode, Printer, Check, RotateCcw, AlertTriangle,
  Stethoscope, MapPin, User, BellRing
} from 'lucide-react';
import { LanguageCode, PatientSession } from '../../types';
import { translations } from '../../utils/i18n';
import { playTextToSpeech } from '../../utils/sound';

interface StepSummarizeProps {
  session: PatientSession;
  currentLang: LanguageCode;
  onConfirm: () => Promise<void>;
  onBackToScan: () => void;
  onRestart: () => void;
  isLoading: boolean;
  isConfirmed: boolean;
}

export const StepSummarize: React.FC<StepSummarizeProps> = ({
  session,
  currentLang,
  onConfirm,
  onBackToScan,
  onRestart,
  isLoading,
  isConfirmed,
}) => {
  const t = translations[currentLang] || translations.en;

  const routing = session.departmentRouting;

  const handlePlaySummary = () => {
    const summaryText = currentLang === 'hi'
      ? `नमस्ते ${session.patientName} जी। आपकी मुख्य समस्या है: ${session.chiefComplaint}। आपका टोकन नंबर है ${session.tokenNumber}। आपको ${routing?.department || 'जनरल ओपीडी'} में डॉक्टर ${routing?.doctorName || ''} के पास ${routing?.roomNumber || 'कमरा नंबर 101'} पर जाना है।`
      : `Summary for ${session.patientName}. Chief concern: ${session.chiefComplaint}. Your token number is ${session.tokenNumber}. You are routed to ${routing?.department || 'General Medicine'}, Doctor ${routing?.doctorName || ''} at ${routing?.roomNumber || 'Room 101'}.`;
    playTextToSpeech(summaryText, currentLang);
  };

  // If confirmed, show Success Screen
  if (isConfirmed) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center p-8 sm:p-12 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Success Icon Badge */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            INTAKE COMPLETE & ROUTED
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {t.successTitle}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto">
            {t.successSubtitle}
          </p>
        </div>

        {/* Token Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 max-w-md mx-auto shadow-xl space-y-3">
          <span className="text-xs uppercase font-bold text-teal-400 tracking-wider">
            {t.tokenNumberLabel}
          </span>
          <div className="text-5xl font-black font-mono text-white tracking-tight">
            {session.tokenNumber}
          </div>
          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Patient: <strong>{session.patientName}</strong></span>
            <span>Visit: <strong>{session.visitId}</strong></span>
          </div>
        </div>

        {/* Department & Doctor Routing Card */}
        {routing && (
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-300/80 rounded-2xl p-6 max-w-lg mx-auto text-left shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-teal-600 text-white rounded-xl shadow-sm">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-200/70 px-2 py-0.5 rounded">
                    ASSIGNED OPD CLINIC
                  </span>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {routing.department}
                  </h3>
                </div>
              </div>

              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm ${
                routing.assignedBy === 'staff-triage'
                  ? 'bg-amber-500 text-slate-950 border border-amber-600'
                  : 'bg-teal-700 text-white'
              }`}>
                {routing.assignedBy === 'staff-triage' ? 'Staff Triage' : 'AI Triaged'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-teal-200/60">
              <div className="space-y-0.5">
                <span className="text-slate-500 font-semibold flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-teal-700" />
                  <span>Assigned Doctor:</span>
                </span>
                <strong className="text-slate-900 block font-bold text-sm">
                  {routing.doctorName}
                </strong>
                <span className="text-[11px] text-slate-600">
                  {routing.doctorTitle || 'Consultant Specialist'}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-500 font-semibold flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>OPD Location:</span>
                </span>
                <strong className="text-emerald-800 block font-bold text-sm">
                  {routing.roomNumber}
                </strong>
                <span className="text-[11px] text-slate-600">
                  {routing.floorLocation || 'Main OPD Block'}
                </span>
              </div>
            </div>

            {routing.isAmbiguous && (
              <div className="bg-amber-100/90 border border-amber-300 text-amber-950 p-2.5 rounded-xl text-xs flex items-center space-x-2">
                <BellRing className="w-4 h-4 text-amber-800 shrink-0" />
                <span>
                  <strong>Nurse Assistance Active:</strong> Sister Priya Sharma has been notified to guide you directly to your consultation room.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Interoperability Architecture Diagram (ABHA + Hospital EHR) */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-lg mx-auto text-left space-y-3">
          <div className="flex items-center space-x-2 text-slate-800 text-xs font-bold">
            <Network className="w-4 h-4 text-teal-600" />
            <span>Digital Health Interoperability Status</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-1.5">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="font-bold text-slate-900">ABHA PHR</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Linked</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-1.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="font-bold text-slate-900">Hospital EHR</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Queued</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-1.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="font-bold text-slate-900">DPDP Consent</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Active</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center space-x-2 min-h-[48px]"
          >
            <Printer className="w-4 h-4" />
            <span>Print Token Slip</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 min-h-[48px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Patient Intake</span>
          </button>
        </div>

      </div>
    );
  }

  // Pre-confirmation Summary Review Screen
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200">
        <div className="flex items-center space-x-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Step 4 of 4 • Review & Confirmation</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t.summaryTitle}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {t.summarySubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={handlePlaySummary}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-teal-100 hover:bg-teal-200 text-teal-900 text-xs font-bold rounded-xl transition-colors shrink-0 min-h-[44px]"
          >
            <Volume2 className="w-4 h-4" />
            <span>{t.playAudio}</span>
          </button>
        </div>
      </div>

      {/* Structured Summary Cards */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
        
        {/* Patient Identity Bar */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-slate-500 font-semibold">Patient Name: </span>
            <strong className="text-slate-900 font-bold text-sm">{session.patientName}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">Age/Gender: </span>
            <strong className="text-slate-900">{session.age} Yrs / {session.gender}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">ABHA ID: </span>
            <strong className="font-mono text-slate-900">{session.patientId}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">Language: </span>
            <strong className="uppercase text-teal-700">{session.language}</strong>
          </div>
        </div>

        {/* Nurse Clinical Synthesis Box */}
        {session.nurseSummary && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs space-y-2">
            <div className="flex items-center space-x-1.5 text-teal-900 font-bold">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <span className="uppercase tracking-wider">Clinical Triage Intake Report:</span>
            </div>
            <p className="text-slate-800 leading-relaxed font-medium">
              {session.nurseSummary}
            </p>
          </div>
        )}

        {/* Assigned Department & Specialist Recommendation */}
        {routing && (
          <div className="p-4 bg-slate-900 text-white rounded-2xl text-xs space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-teal-300 uppercase tracking-wider text-[11px]">
                  Recommended OPD Department & Specialist
                </span>
              </div>
              <span className="bg-teal-950 text-teal-300 border border-teal-700/60 px-2 py-0.5 rounded text-[10px] font-bold">
                {routing.roomNumber}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300 pt-1 border-t border-slate-800">
              <div>
                <span className="text-slate-400 block text-[11px]">Department:</span>
                <strong className="text-white text-sm">{routing.department}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Consultant Physician:</span>
                <strong className="text-white text-sm">{routing.doctorName}</strong>
                <span className="text-slate-400 block text-[10px]">{routing.floorLocation}</span>
              </div>
            </div>
          </div>
        )}

        {/* 1. Chief Complaint */}
        <div className="space-y-1 border-b border-slate-200 pb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
            1. Chief Complaint & Presenting Problem
          </h4>
          <p className="text-base sm:text-lg font-bold text-slate-900">
            {session.chiefComplaint || 'General OPD checkup requested.'}
          </p>
        </div>

        {/* 2. History of Present Illness (HPI) */}
        <div className="space-y-2 border-b border-slate-200 pb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
            2. History of Present Illness (HPI)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-semibold block">Onset & Duration:</span>
              <span className="text-slate-900 font-bold">{session.historyOfPresentIllness.onset || 'Acute onset'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-semibold block">Pain Character / Severity:</span>
              <span className="text-slate-900 font-bold">{session.historyOfPresentIllness.character || 'Moderate intensity'}</span>
            </div>
            {session.historyOfPresentIllness.radiation && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 sm:col-span-2">
                <span className="text-slate-500 font-semibold block">Site & Radiation:</span>
                <span className="text-slate-900 font-bold">{session.historyOfPresentIllness.radiation}</span>
              </div>
            )}
          </div>

          {/* AYUSH Details if active */}
          {(session.historyOfPresentIllness.ayushDetails || session.historyOfPresentIllness.ayurvedicDetails) && (
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-300 text-xs space-y-2 mt-2">
              <strong className="text-amber-950 font-bold block text-sm">🌿 AYUSH Ayurveda Roga-Rogi &amp; Dashavidha Pariksha Summary:</strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {Object.entries(session.historyOfPresentIllness.ayurvedicDetails || session.historyOfPresentIllness.ayushDetails || {}).map(([k, v]) => {
                  const labels: Record<string, string> = {
                    doshaLakshana: 'Doshic Manifestation (Roga Lakshana)',
                    dosha: 'Doshic Manifestation (Roga Lakshana)',
                    agniPariksha: 'Jatharagni (Digestive Fire)',
                    agni: 'Jatharagni (Digestive Fire)',
                    kosthaMala: 'Kostha (Bowel Nature)',
                    kostha: 'Kostha (Bowel Nature)',
                    amaLakshana: 'Ama (Metabolic Toxicity)',
                    ama: 'Ama (Metabolic Toxicity)',
                    prakritiDeha: 'Deha-Prakriti (Constitution)',
                    prakriti: 'Deha-Prakriti (Constitution)',
                    aharaViharaHetu: 'Ahara-Vihara (Diet & Routine)',
                    nidraManasika: 'Nidra & Manasika (Sleep & Mind)',
                    nidra: 'Nidra & Manasika (Sleep & Mind)',
                    ayurvedicMedicationsPathya: 'Ayurvedic Regimen & Pathya',
                    pathya: 'Ayurvedic Regimen & Pathya',
                  };
                  const label = labels[k] || k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
                  return (
                    <div key={k} className="bg-white/80 p-2 rounded-lg border border-amber-200">
                      <span className="capitalize font-bold text-amber-900 block text-[11px]">{label}: </span>
                      <span className="text-slate-800 font-medium">{v}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. Past Medical & Drug History */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
              3. Past Medical History
            </h4>
            <ul className="text-xs text-slate-800 list-disc list-inside space-y-0.5 font-medium">
              {session.pastMedicalHistory.length > 0 ? (
                session.pastMedicalHistory.map((item, idx) => <li key={idx}>{item}</li>)
              ) : (
                <li className="text-slate-500">No major chronic hospital illnesses</li>
              )}
            </ul>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
              4. Current Medications & Allergies
            </h4>
            <div className="text-xs text-slate-800 space-y-1 font-medium">
              <p>
                <span className="text-slate-500">Allergies: </span>
                <strong className="text-slate-900">{session.drugAllergyHistory.allergies}</strong>
              </p>
              <p>
                <span className="text-slate-500">Daily Medicines: </span>
                <span>{session.drugAllergyHistory.currentMedications.join(', ') || 'None regularly'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 5. Attached Documents Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
            5. Attached Medical Records & Lab Extractions ({session.priorInvestigations.length})
          </h4>
          {session.priorInvestigations.length > 0 ? (
            <div className="space-y-2">
              {session.priorInvestigations.map((doc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{doc.document}</span>
                    <span className="text-slate-500 ml-2">({doc.timestamp})</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Digitized ({Math.round(doc.confidence * 100)}% Conf)
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No previous documents attached.</p>
          )}
        </div>

      </div>

      {/* Confirmation Button Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onBackToScan}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-sm font-semibold text-slate-700 hover:text-slate-900 px-5 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 min-h-[48px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.fixBtn}</span>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={onConfirm}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-base font-bold text-white px-8 py-4 rounded-xl bg-teal-700 hover:bg-teal-800 shadow-xl shadow-teal-700/30 transition-all min-h-[56px]"
        >
          {isLoading ? (
            <span>Sending Record to Doctor...</span>
          ) : (
            <>
              <Check className="w-5 h-5" />
              <span>{t.confirmSendBtn}</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

