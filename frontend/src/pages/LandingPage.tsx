import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Monitor, Stethoscope, ShieldAlert, HeartPulse, 
  FileSearch, Activity, Sparkles, CheckCircle2, 
  WifiOff, ArrowRight 
} from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../utils/i18n';

interface LandingPageProps {
  currentLang: LanguageCode;
}

export const LandingPage: React.FC<LandingPageProps> = ({ currentLang }) => {
  const navigate = useNavigate();
  const t = translations[currentLang] || translations.en;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center space-y-4 mb-12">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen OPD Intake for Indian Public & Private Hospitals</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Medi<span className="text-teal-400">Kiosk</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          AI-powered clinical pre-consultation platform streamlining OPD waiting halls with conversational history capture, Vision OCR, and instant triage.
        </p>
      </div>

      {/* 3 Main Persona Cards (Kiosk, Physician, Staff) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
        
        {/* 1. Patient Kiosk Card */}
        <div
          onClick={() => navigate('/kiosk')}
          className="group relative bg-slate-800/80 hover:bg-slate-800 border-2 border-teal-500/30 hover:border-teal-400 rounded-2xl p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/10 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Monitor className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Patient Persona</span>
              <h2 className="text-2xl font-bold text-white mt-1 group-hover:text-teal-300 transition-colors">
                Patient Intake Kiosk
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Voice & touch guided symptom intake in 5 Indian languages. Features adaptive SOCRATES questioning, AYUSH mode, document scanning, and ABHA registration.
              </p>
            </div>
            <ul className="space-y-2 pt-2 border-t border-slate-700/60 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Multilingual Voice + Touch Chips</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Real Vision-LLM Document OCR</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Non-LLM Red Flag Safety Guardrail</span>
              </li>
            </ul>
          </div>
          <div className="pt-6 mt-4 flex items-center text-sm font-semibold text-teal-400 group-hover:translate-x-1 transition-transform">
            <span>Launch Patient Kiosk</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </div>
        </div>

        {/* 2. Physician Dashboard Card */}
        <div
          onClick={() => navigate('/physician')}
          className="group relative bg-slate-800/80 hover:bg-slate-800 border-2 border-blue-500/30 hover:border-blue-400 rounded-2xl p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Doctor Persona</span>
              <h2 className="text-2xl font-bold text-white mt-1 group-hover:text-blue-300 transition-colors">
                Physician OPD Dashboard
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Triage queue with red-flag badges and structured clinical notes. Review, accept, amend, or reject sections with complete audit provenance tags.
              </p>
            </div>
            <ul className="space-y-2 pt-2 border-t border-slate-700/60 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Priority Triage Queue & Tokens</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Inline Section Accept / Amend / Reject</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Traceable Fact Provenance Badges</span>
              </li>
            </ul>
          </div>
          <div className="pt-6 mt-4 flex items-center text-sm font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
            <span>Open Doctor Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </div>
        </div>

        {/* 3. Staff Operator Portal Card */}
        <div
          onClick={() => navigate('/staff')}
          className="group relative bg-slate-800/80 hover:bg-slate-800 border-2 border-amber-500/30 hover:border-amber-400 rounded-2xl p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Hospital Staff Persona</span>
              <h2 className="text-2xl font-bold text-white mt-1 group-hover:text-amber-300 transition-colors">
                Staff Operator Failover
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Live kiosk connectivity monitor and manual intake failover. Step in when kiosks disconnect or elderly patients require direct assistance.
              </p>
            </div>
            <ul className="space-y-2 pt-2 border-t border-slate-700/60 text-xs text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Real-Time Kiosk Health Monitoring</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Structured Manual Data Takeover</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Safe Reconnection Conflict Handling</span>
              </li>
            </ul>
          </div>
          <div className="pt-6 mt-4 flex items-center text-sm font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>Staff Portal Login</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </div>
        </div>

      </div>

      {/* Feature Highlights Grid */}
      <div className="max-w-5xl mx-auto border-t border-slate-800 pt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="p-4 rounded-xl bg-slate-800/40">
          <HeartPulse className="w-6 h-6 text-rose-400 mx-auto mb-2" />
          <h4 className="font-semibold text-sm text-white">Rule-Based Safety</h4>
          <p className="text-xs text-slate-400 mt-1">Non-LLM red flag triage on every turn</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/40">
          <FileSearch className="w-6 h-6 text-teal-400 mx-auto mb-2" />
          <h4 className="font-semibold text-sm text-white">Dual-Path OCR</h4>
          <p className="text-xs text-slate-400 mt-1">Real upload & bundled sample demo mode</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/40">
          <Activity className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
          <h4 className="font-semibold text-sm text-white">AYUSH Supported</h4>
          <p className="text-xs text-slate-400 mt-1">Ayurvedic Dashavidha Pariksha frame</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/40">
          <WifiOff className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <h4 className="font-semibold text-sm text-white">Offline Failover</h4>
          <p className="text-xs text-slate-400 mt-1">Hospital staff failover & manual intake</p>
        </div>
      </div>

    </div>
  );
};

