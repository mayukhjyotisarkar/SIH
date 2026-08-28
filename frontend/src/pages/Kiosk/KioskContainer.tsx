import React, { useState, useEffect } from 'react';
import { 
  LanguageCode, PatientRegistration, PatientSession, 
  AdaptiveQuestion, RedFlag, ConnectivityStatus 
} from '../../types';
import { ApiService } from '../../services/api';
import { StepIdentify } from './StepIdentify';
import { StepConverse } from './StepConverse';
import { StepScan } from './StepScan';
import { StepSummarize } from './StepSummarize';
import { AlertCircle, WifiOff } from 'lucide-react';

interface KioskContainerProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  connectivity: ConnectivityStatus;
  onUpdateConnectivity: (status: ConnectivityStatus) => void;
}

import { translateAdaptiveQuestion } from '../../utils/clinicalQuestionsI18n';

const INITIAL_QUESTION: AdaptiveQuestion = {
  question: "What is your main health problem or chief complaint today?",
  field: "chief_complaint",
  options: [
    "Severe chest pain / tightness",
    "High fever with chills and cough",
    "Severe stomach ache / acidity",
    "Joint pain & stiffness in knees"
  ],
  done: false,
  progressPercent: 20,
  source: "fallback"
};

const INITIAL_RED_FLAG: RedFlag = {
  triggered: false,
  reason: "",
  action: "",
  urgency: "routine"
};

export const KioskContainer: React.FC<KioskContainerProps> = ({
  currentLang,
  onLanguageChange,
  connectivity,
  onUpdateConnectivity,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [session, setSession] = useState<PatientSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Adaptive Question (initialized in active language)
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion>(() =>
    translateAdaptiveQuestion(INITIAL_QUESTION, currentLang)
  );
  const [redFlag, setRedFlag] = useState<RedFlag>(INITIAL_RED_FLAG);

  // When current language changes mid-flow, immediately translate the active question into the selected language
  useEffect(() => {
    setCurrentQuestion((prev) => translateAdaptiveQuestion(prev, currentLang));
  }, [currentLang]);

  // Check connectivity heartbeat
  useEffect(() => {
    if (session) {
      const activeId = session.sessionId || session.patientId;
      ApiService.updateConnectivity(activeId, connectivity).catch(() => {
        if (connectivity === 'online') {
          onUpdateConnectivity('degraded');
        }
      });
    }
  }, [connectivity, session]);

  // Step 1 Complete -> Initialize Session
  const handleStartSession = async (reg: PatientRegistration) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const newSession = await ApiService.startSession(reg);
      setSession(newSession);
      // Guarantee clean question & red flag state for new patient intake in selected language
      const initialTranslated = translateAdaptiveQuestion(INITIAL_QUESTION, currentLang);
      setCurrentQuestion(initialTranslated);
      setRedFlag(INITIAL_RED_FLAG);
      setIsConfirmed(false);
      setCurrentStep(2);
    } catch (err: any) {
      console.error("Start session failed:", err);
      setErrorMessage("Could not connect to FastAPI server. Please ensure backend is running.");
      onUpdateConnectivity('offline');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit Answer -> Get next adaptive question
  const handleAnswerSubmit = async (
    answer: string,
    mode: 'voice' | 'tap',
    ayushMode: boolean,
    field?: string,
    questionText?: string
  ) => {
    if (!session) return;
    const activeId = session.sessionId || session.patientId;
    const activeField = field || currentQuestion.field || 'chief_complaint';
    const activeQuestionText = questionText || currentQuestion.question;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await ApiService.submitAnswer(
        activeId,
        answer,
        mode,
        ayushMode,
        activeField,
        activeQuestionText
      );
      setSession(res.session);
      setRedFlag(res.redFlag);
      const translatedAdaptive = translateAdaptiveQuestion(res.adaptive, currentLang);
      setCurrentQuestion(translatedAdaptive);

      if (res.adaptive.done) {
        setTimeout(() => setCurrentStep(3), 1500);
      }
    } catch (err: any) {
      console.error("Submit answer error:", err);
      setErrorMessage("Backend communication interrupted. Staff alert sent.");
      onUpdateConnectivity('degraded');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Undo Answer
  const handleUndoAnswer = async () => {
    if (!session) return;
    const activeId = session.sessionId || session.patientId;
    setIsLoading(true);
    try {
      const res = await ApiService.undoAnswer(activeId);
      setSession(res.session);
      setCurrentQuestion(res.adaptive);
    } catch (err) {
      console.error("Undo error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle AYUSH mode live
  const handleToggleAyush = (active: boolean) => {
    if (session) {
      setSession({ ...session, ayushMode: active });
    }
  };

  // Step 3: Upload Real Document
  const handleUploadFile = async (file: File) => {
    if (!session) return;
    const activeId = session.sessionId || session.patientId;
    setIsLoading(true);
    try {
      const doc = await ApiService.uploadDocument(activeId, file);
      setSession({
        ...session,
        priorInvestigations: [...session.priorInvestigations, doc],
      });
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage("Document upload failed. Try sample document demo mode.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Load Sample Demo Document
  const handleLoadSample = async (sampleId: string) => {
    if (!session) return;
    const activeId = session.sessionId || session.patientId;
    setIsLoading(true);
    try {
      const doc = await ApiService.loadSampleDocument(activeId, sampleId);
      setSession({
        ...session,
        priorInvestigations: [...session.priorInvestigations, doc],
      });
    } catch (err) {
      console.error("Sample doc load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Correct Extracted Fields
  const handleCorrectDoc = async (docId: string, extracted: any) => {
    if (!session) return;
    const activeId = session.sessionId || session.patientId;
    try {
      const res = await ApiService.correctDocument(activeId, docId, extracted);
      if (res.session) {
        setSession(res.session);
      } else {
        const updatedDocs = session.priorInvestigations.map((d) =>
          d.id === docId ? { ...d, extracted, confidence: 1.0, status: 'success' as const, extractionSource: 'manual_correction' as const } : d
        );
        setSession({ ...session, priorInvestigations: updatedDocs });
      }
    } catch (err) {
      console.error("Correction error:", err);
    }
  };

  // Step 3: Delete Erroneous Document
  const handleDeleteDoc = async (docId: string) => {
    if (!session) return;
    const activeId = session.sessionId || session.patientId;
    setIsLoading(true);
    try {
      const updatedSession = await ApiService.deleteDocument(activeId, docId);
      setSession(updatedSession);
    } catch (err) {
      console.error("Delete document error:", err);
      setErrorMessage("Could not remove document.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Replace / Re-Scan Document
  const handleReplaceDoc = async (docId: string, file: File) => {
    if (!session) return;
    const activeId = session.sessionId || session.patientId;
    setIsLoading(true);
    try {
      const newDoc = await ApiService.replaceDocument(activeId, docId, file);
      const updatedDocs = session.priorInvestigations.map((d) =>
        d.id === docId ? newDoc : d
      );
      setSession({
        ...session,
        priorInvestigations: updatedDocs,
      });
    } catch (err) {
      console.error("Replace document error:", err);
      setErrorMessage("Could not replace document.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Confirm Intake Summary
  const handleConfirmSummary = async () => {
    if (!session) return;
    const activeId = session.sessionId || session.patientId;
    setIsLoading(true);
    try {
      await ApiService.confirmSession(activeId);
      setIsConfirmed(true);
    } catch (err) {
      console.error("Confirm error:", err);
      setErrorMessage("Could not route to physician queue.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setSession(null);
    setCurrentStep(1);
    setIsConfirmed(false);
    setCurrentQuestion(INITIAL_QUESTION);
    setRedFlag(INITIAL_RED_FLAG);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Offline Alert Banner */}
      {connectivity === 'offline' && (
        <div className="max-w-4xl mx-auto mb-6 bg-amber-500 text-slate-950 p-4 rounded-2xl shadow-lg flex items-center justify-between border-2 border-amber-600">
          <div className="flex items-center space-x-3">
            <WifiOff className="w-6 h-6 animate-bounce" />
            <div>
              <span className="font-bold text-sm">Kiosk Connectivity Degraded / Offline</span>
              <p className="text-xs text-slate-900">Hospital Staff Operator has been alerted and can take over manual entry if required.</p>
            </div>
          </div>
          <button
            onClick={() => onUpdateConnectivity('online')}
            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold"
          >
            Simulate Reconnect
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="max-w-3xl mx-auto mb-4 p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Progress Bar (When not on success screen) */}
      {!isConfirmed && (
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            <span className={currentStep >= 1 ? 'text-teal-700 font-extrabold' : ''}>1. Identify</span>
            <span className={currentStep >= 2 ? 'text-teal-700 font-extrabold' : ''}>2. Symptoms</span>
            <span className={currentStep >= 3 ? 'text-teal-700 font-extrabold' : ''}>3. Documents</span>
            <span className={currentStep >= 4 ? 'text-teal-700 font-extrabold' : ''}>4. Confirm</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Renderers */}
      {currentStep === 1 && (
        <StepIdentify
          currentLang={currentLang}
          onLanguageChange={onLanguageChange}
          onComplete={handleStartSession}
          isLoading={isLoading}
        />
      )}

      {currentStep === 2 && session && (
        <StepConverse
          session={session}
          currentLang={currentLang}
          onLanguageChange={onLanguageChange}
          currentQuestion={currentQuestion}
          redFlag={redFlag}
          onAnswerSubmit={handleAnswerSubmit}
          onUndoAnswer={handleUndoAnswer}
          onProceedToScan={() => setCurrentStep(3)}
          isLoading={isLoading}
          onToggleAyush={handleToggleAyush}
        />
      )}

      {currentStep === 3 && session && (
        <StepScan
          session={session}
          currentLang={currentLang}
          onUploadFile={handleUploadFile}
          onLoadSample={handleLoadSample}
          onCorrectDoc={handleCorrectDoc}
          onDeleteDoc={handleDeleteDoc}
          onReplaceDoc={handleReplaceDoc}
          onProceedToSummary={() => setCurrentStep(4)}
          onBackToConverse={() => setCurrentStep(2)}
          isLoading={isLoading}
        />
      )}

      {currentStep === 4 && session && (
        <StepSummarize
          session={session}
          currentLang={currentLang}
          onConfirm={handleConfirmSummary}
          onBackToScan={() => setCurrentStep(3)}
          onRestart={handleRestart}
          isLoading={isLoading}
          isConfirmed={isConfirmed}
        />
      )}

    </div>
  );
};
