import React, { useState } from 'react';
import { 
  Globe, Volume2, ShieldCheck, User, Sparkles, 
  CheckCircle2, ArrowRight, HeartPulse, Stethoscope, Droplets, Leaf
} from 'lucide-react';
import { LanguageCode, PatientRegistration, ConsentDetails } from '../../types';
import { translations } from '../../utils/i18n';
import { playConsentAudio } from '../../utils/sound';

interface StepIdentifyProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onComplete: (data: PatientRegistration) => void;
  isLoading: boolean;
}

export const StepIdentify: React.FC<StepIdentifyProps> = ({
  currentLang,
  onLanguageChange,
  onComplete,
  isLoading,
}) => {
  const t = translations[currentLang] || translations.en;

  const [hasAbha, setHasAbha] = useState<boolean>(true);
  const [abhaId, setAbhaId] = useState<string>('91-4521-8890-1204');
  const [fullName, setFullName] = useState<string>('Ramesh Chandra Sharma');
  const [age, setAge] = useState<number>(52);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [medicalSystem, setMedicalSystem] = useState<'allopathy' | 'ayurveda' | 'homeopathy'>('allopathy');

  const [consent, setConsent] = useState<ConsentDetails>({
    recordVoice: true,
    storeDocuments: true,
    shareHospital: true,
  });

  const languages: { code: LanguageCode; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    onComplete({
      abhaId: hasAbha ? abhaId : undefined,
      fullName,
      age: Number(age) || 30,
      gender,
      language: currentLang,
      ayushMode: medicalSystem === 'ayurveda',
      homeopathyMode: medicalSystem === 'homeopathy',
      medicalSystem,
      consent,
    });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white p-6 sm:p-8">
        <div className="flex items-center space-x-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Step 1 of 4 • Patient Identification</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold">{t.identifyTitle}</h2>
        <p className="text-sm text-teal-100 mt-1 max-w-xl">
          Quick intake to prepare your clinical file for the doctor. Select your language, clinical system, and details below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
        
        {/* 1. Language Selection Pills */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center space-x-2">
            <Globe className="w-4 h-4 text-teal-600" />
            <span>{t.selectLanguage}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {languages.map((lang) => (
              <button
                type="button"
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`py-3 px-3 rounded-xl border-2 text-center transition-all min-h-[48px] cursor-pointer ${
                  currentLang === lang.code
                    ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                <div className="text-sm">{lang.native}</div>
                <div className="text-[11px] text-slate-500 font-medium">{lang.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. System of Medicine Selector (Allopathy / Ayurveda / Homeopathy) */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <HeartPulse className="w-4 h-4 text-teal-600" />
              <span>Select System of Medicine (OPD Track)</span>
            </span>
            <span className="text-xs text-slate-500 font-normal">AYUSH & Modern Medicine</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* 1. Allopathy Card */}
            <button
              type="button"
              onClick={() => setMedicalSystem('allopathy')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                medicalSystem === 'allopathy'
                  ? 'border-teal-600 bg-teal-50/80 text-teal-950 shadow-md ring-2 ring-teal-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                  <Stethoscope className="w-5 h-5" />
                </div>
                {medicalSystem === 'allopathy' && (
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Modern Allopathy</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  MBBS/MD Specialist OPD • SOCRATES triage & evidence-based care.
                </p>
              </div>
            </button>

            {/* 2. Ayurveda Card */}
            <button
              type="button"
              onClick={() => setMedicalSystem('ayurveda')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                medicalSystem === 'ayurveda'
                  ? 'border-amber-600 bg-amber-50/80 text-amber-950 shadow-md ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Leaf className="w-5 h-5" />
                </div>
                {medicalSystem === 'ayurveda' && (
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">AYUSH Ayurveda</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  BAMS/MD Ayu • Dashavidha Pariksha, Prakriti, Agni & Doshas.
                </p>
              </div>
            </button>

            {/* 3. Homeopathy Card */}
            <button
              type="button"
              onClick={() => setMedicalSystem('homeopathy')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                medicalSystem === 'homeopathy'
                  ? 'border-cyan-600 bg-cyan-50/80 text-cyan-950 shadow-md ring-2 ring-cyan-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-cyan-100 text-cyan-800">
                  <Droplets className="w-5 h-5" />
                </div>
                {medicalSystem === 'homeopathy' && (
                  <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">AYUSH Homeopathy</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  BHMS/MD Hom • Totality, Thermals, Modalities (&lt; &amp; &gt;) &amp; Similimum.
                </p>
              </div>
            </button>

          </div>
        </div>

        {/* 3. ABHA Mode vs New Patient Mode */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
            <span className="text-sm font-bold text-slate-800">
              {t.abhaOrManual}
            </span>
            <div className="inline-flex rounded-lg bg-slate-200/80 p-1">
              <button
                type="button"
                onClick={() => setHasAbha(true)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  hasAbha ? 'bg-teal-700 text-white shadow' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                ABHA ID
              </button>
              <button
                type="button"
                onClick={() => setHasAbha(false)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  !hasAbha ? 'bg-teal-700 text-white shadow' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                New Patient Form
              </button>
            </div>
          </div>

          {hasAbha ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.abhaIdLabel}
              </label>
              <input
                type="text"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                placeholder={t.abhaPlaceholder}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-base font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white min-h-[48px]"
              />
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No ABHA ID? Fill in your details below to generate a temporary hospital OPD visit token.
            </p>
          )}

          {/* Patient Details Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.fullNameLabel} *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.ageLabel} *
              </label>
              <input
                type="number"
                required
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white min-h-[48px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.genderLabel}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white min-h-[48px] cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Granular Consent Section (DPDP & ABDM Compliant) */}
        <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>{t.consentTitle}</span>
            </div>
            <button
              type="button"
              onClick={() => playConsentAudio(currentLang)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-100 hover:bg-teal-200 text-teal-900 rounded-lg transition-colors min-h-[36px] cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t.playAudio}</span>
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {t.consentDesc}
          </p>

          <div className="space-y-3 pt-1">
            {/* Toggle 1 */}
            <label className="flex items-start space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consent.recordVoice}
                onChange={(e) => setConsent({ ...consent, recordVoice: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 mt-0.5 cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-700 font-medium">
                {t.consentVoice}
              </span>
            </label>

            {/* Toggle 2 */}
            <label className="flex items-start space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consent.storeDocuments}
                onChange={(e) => setConsent({ ...consent, storeDocuments: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 mt-0.5 cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-700 font-medium">
                {t.consentDocs}
              </span>
            </label>

            {/* Toggle 3 */}
            <label className="flex items-start space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consent.shareHospital}
                onChange={(e) => setConsent({ ...consent, shareHospital: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 mt-0.5 cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-700 font-medium">
                {t.consentShare}
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg shadow-teal-700/30 transition-all flex items-center justify-center space-x-2 min-h-[56px] cursor-pointer"
        >
          {isLoading ? (
            <span>Preparing Kiosk Session...</span>
          ) : (
            <>
              <span>{t.startBtn}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

      </form>

    </div>
  );
};
