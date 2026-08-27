import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, Flame, ShieldAlert, HeartPulse, Activity, 
  Stethoscope, Bed, Siren, RefreshCw, CheckCircle2, 
  ArrowRight, Clock, User, PhoneCall, Zap, FileText
} from 'lucide-react';
import { PatientSession } from '../../types';
import { ApiService } from '../../services/api';

const CASUALTY_BEDS = [
  "Trauma Bay 1 (Critical)",
  "Resuscitation Bed A",
  "Resuscitation Bed B",
  "Acute Cardiac Bay 1",
  "Acute Cardiac Bay 2",
  "Casualty Observation 1",
  "Casualty Observation 2",
  "ICU Step-down Triage"
];

export const EmergencyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [emergencyQueue, setEmergencyQueue] = useState<PatientSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionInProgress, setActionInProgress] = useState<Record<string, boolean>>({});
  const [selectedBeds, setSelectedBeds] = useState<Record<string, string>>({});
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchEmergencyQueue = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await ApiService.getEmergencyQueue();
      setEmergencyQueue(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to fetch emergency queue:", err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Initial fetch and 3-second live polling
  useEffect(() => {
    fetchEmergencyQueue(true);
    const interval = setInterval(() => {
      fetchEmergencyQueue(false);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBedSelect = (sessionId: string, bed: string) => {
    setSelectedBeds((prev) => ({ ...prev, [sessionId]: bed }));
  };

  const handleExecuteEmergencyAction = async (
    sessionId: string,
    action: string,
    bedOverride?: string
  ) => {
    const activeBed = bedOverride || selectedBeds[sessionId] || "Casualty Bay 1";
    setActionInProgress((prev) => ({ ...prev, [`${sessionId}_${action}`]: true }));
    try {
      await ApiService.triggerEmergencyAction(
        sessionId,
        action,
        activeBed,
        `Stat emergency protocol initiated for patient triage safety.`
      );
      await fetchEmergencyQueue(false);
    } catch (err) {
      console.error("Emergency action error:", err);
    } finally {
      setActionInProgress((prev) => ({ ...prev, [`${sessionId}_${action}`]: false }));
    }
  };

  const activeRedFlagCount = emergencyQueue.length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* 1. Header Banner with Live Alert Pulse */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 p-6 rounded-3xl border-2 border-rose-600/70 shadow-2xl shadow-rose-950/80">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-rose-600 text-white rounded-2xl shadow-lg animate-pulse">
              <Siren className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black uppercase tracking-widest bg-rose-600 text-white px-2.5 py-0.5 rounded-md">
                  CASUALTY RED-FLAG TRIAGE
                </span>
                <span className="text-xs text-rose-300 font-mono flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                  Live Stream Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Emergency Medical Officer & Trauma Desk
              </h1>
            </div>
          </div>
          <p className="text-xs text-rose-200/80 max-w-2xl font-medium">
            Exclusive stream of acute patient cases flagged with critical triage red flags by MediKiosk. Immediate bed assignment, stat orders, and resuscitation dispatch.
          </p>
        </div>

        {/* Live Metrics / Controls */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900/90 border border-rose-500/40 px-4 py-2 rounded-2xl text-center shadow-inner">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Red Flags</span>
            <span className="text-2xl font-black text-rose-400">
              {activeRedFlagCount}
            </span>
          </div>

          <button
            type="button"
            onClick={() => fetchEmergencyQueue(true)}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* 2. Priority Queue Stream */}
      <div className="max-w-6xl mx-auto space-y-6">
        
        {isLoading && emergencyQueue.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3 bg-slate-900/50 rounded-3xl border border-slate-800">
            <div className="inline-block p-4 bg-slate-800 rounded-full animate-spin">
              <Activity className="w-8 h-8 text-rose-500" />
            </div>
            <p className="text-sm font-bold">Scanning Emergency Casualty Stream...</p>
          </div>
        ) : emergencyQueue.length === 0 ? (
          /* Empty State: Zero active red flags */
          <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-emerald-500/30 p-8 space-y-4 max-w-2xl mx-auto shadow-xl">
            <div className="w-16 h-16 bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white">No Active Emergency Red Flags</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Casualty triage is currently clear. All active kiosk patient intakes have routine clinical stability.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/physician"
                className="inline-flex items-center space-x-2 text-xs font-bold text-teal-400 hover:text-teal-300 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <span>View Standard OPD Doctor Queue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Active Red-Flag Cards */
          <div className="space-y-5">
            {emergencyQueue.map((patient) => {
              const isEmergencyAcuity = patient.redFlag?.urgency === 'emergency';
              const assignedBed = patient.assignedBed || selectedBeds[patient.sessionId] || "Trauma Bay 1";

              return (
                <div
                  key={patient.sessionId}
                  className={`rounded-3xl p-6 sm:p-7 bg-slate-900 border-2 shadow-2xl transition-all space-y-6 ${
                    isEmergencyAcuity
                      ? 'border-rose-500 shadow-rose-950/60 ring-2 ring-rose-500/20'
                      : 'border-amber-500/80 shadow-amber-950/40'
                  }`}
                >
                  {/* Top Bar: Emergency Reason Banner */}
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-2 border-b border-slate-800">
                    <div className="flex items-start space-x-3.5">
                      <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg shrink-0 mt-0.5 animate-bounce">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded">
                            {isEmergencyAcuity ? 'CODE EMERGENCY' : 'PRIORITY RED FLAG'}
                          </span>
                          <span className="text-xs text-rose-300 font-mono">
                            Token: <strong className="text-white font-bold">{patient.tokenNumber}</strong>
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs text-slate-400 font-mono">
                            Visit: {patient.visitId}
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-extrabold text-white">
                          {patient.redFlag?.reason || "Acute Clinical Red Flag Triggered"}
                        </h2>
                        <p className="text-xs font-semibold text-rose-200">
                          Recommended Action: {patient.redFlag?.action || "Immediate casualty evaluation & nurse response."}
                        </p>
                      </div>
                    </div>

                    {/* Bed Badge if assigned */}
                    <div className="flex items-center space-x-2">
                      {patient.assignedBed ? (
                        <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm">
                          <Bed className="w-4 h-4 text-emerald-400" />
                          <span>Assigned: <strong>{patient.assignedBed}</strong></span>
                        </div>
                      ) : (
                        <div className="bg-rose-950/80 border border-rose-600/70 text-rose-300 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 animate-pulse">
                          <Bed className="w-4 h-4 text-rose-400" />
                          <span>Bed Unassigned (Pending)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Patient Clinical Profile Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    
                    {/* Demographics & Chief Complaint */}
                    <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Information</span>
                      <div className="space-y-0.5">
                        <strong className="text-base text-white font-bold block">{patient.patientName}</strong>
                        <span className="text-slate-400 font-medium">{patient.age} Yrs / {patient.gender}</span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-400 font-bold block">Chief Complaint:</span>
                        <p className="text-slate-200 font-semibold mt-0.5 leading-snug">{patient.chiefComplaint}</p>
                      </div>
                    </div>

                    {/* HPI & Comorbidities */}
                    <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Clinical Presentation & HPI</span>
                      {patient.historyOfPresentIllness ? (
                        <div className="space-y-1 text-[11px] text-slate-300 font-medium">
                          {patient.historyOfPresentIllness.onset && <div><strong>Onset:</strong> {patient.historyOfPresentIllness.onset}</div>}
                          {patient.historyOfPresentIllness.character && <div><strong>Character:</strong> {patient.historyOfPresentIllness.character}</div>}
                          {patient.historyOfPresentIllness.radiation && <div><strong>Radiation:</strong> {patient.historyOfPresentIllness.radiation}</div>}
                        </div>
                      ) : (
                        <p className="text-slate-500 italic">Pre-consultation history gathered at kiosk.</p>
                      )}
                      <div className="pt-1.5 border-t border-slate-800/80">
                        <span className="text-[10px] text-slate-400 font-bold block">Known Allergies:</span>
                        <p className="text-rose-400 font-bold mt-0.5">
                          {patient.drugAllergyHistory?.allergies || "No known drug allergies reported"}
                        </p>
                      </div>
                    </div>

                    {/* Trauma Bed Allocation & Direct Protocol Action */}
                    <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block">
                          Casualty Bed / Trauma Bay Allocation:
                        </label>
                        <select
                          value={selectedBeds[patient.sessionId] || patient.assignedBed || CASUALTY_BEDS[0]}
                          onChange={(e) => handleBedSelect(patient.sessionId, e.target.value)}
                          className="w-full bg-slate-900 text-xs font-bold text-white p-2.5 rounded-xl border border-slate-700 focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer"
                        >
                          {CASUALTY_BEDS.map((bed, bi) => (
                            <option key={bi} value={bed}>{bed}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleExecuteEmergencyAction(patient.sessionId, "Bed Allocated & Transfer Dispatched", selectedBeds[patient.sessionId] || CASUALTY_BEDS[0])}
                        disabled={actionInProgress[`${patient.sessionId}_Bed Allocated & Transfer Dispatched`]}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
                      >
                        <Bed className="w-3.5 h-3.5" />
                        <span>Confirm Bed Transfer</span>
                      </button>
                    </div>

                  </div>

                  {/* 1-Click Fast-Track Emergency Action Protocols */}
                  <div className="bg-slate-950/90 rounded-2xl p-4 border border-rose-900/50 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        1-Click Emergency Orders:
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      
                      {/* Stat ECG & Cardiac Biomarkers */}
                      <button
                        type="button"
                        onClick={() => handleExecuteEmergencyAction(patient.sessionId, "Stat 12-Lead ECG + Troponin-I Ordered")}
                        disabled={actionInProgress[`${patient.sessionId}_Stat 12-Lead ECG + Troponin-I Ordered`]}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-700/60 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
                      >
                        <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                        <span>Stat ECG + Trop-I</span>
                      </button>

                      {/* IV Cannulation & O2 Access */}
                      <button
                        type="button"
                        onClick={() => handleExecuteEmergencyAction(patient.sessionId, "18G IV Cannulation & O2 Therapy Dispatched")}
                        disabled={actionInProgress[`${patient.sessionId}_18G IV Cannulation & O2 Therapy Dispatched`]}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-700/60 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
                      >
                        <Activity className="w-3.5 h-3.5 text-blue-400" />
                        <span>18G IV & O2 Support</span>
                      </button>

                      {/* Rapid Response Code */}
                      <button
                        type="button"
                        onClick={() => handleExecuteEmergencyAction(patient.sessionId, "Rapid Response Trauma Team Paged")}
                        disabled={actionInProgress[`${patient.sessionId}_Rapid Response Trauma Team Paged`]}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center space-x-1"
                      >
                        <Siren className="w-3.5 h-3.5" />
                        <span>Dispatch Code Red</span>
                      </button>

                      {/* Open Full Clinical Review */}
                      <button
                        type="button"
                        onClick={() => navigate(`/physician/session/${patient.sessionId}`)}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Emergency Doctor Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </div>

                  {/* Action Log if present */}
                  {patient.emergencyActionLog && patient.emergencyActionLog.length > 0 && (
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-1">
                      <span className="font-bold text-slate-400 block">Emergency Action Audit Trail:</span>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        {patient.emergencyActionLog.map((logItem, li) => (
                          <li key={li} className="font-mono text-[10px] text-emerald-400">
                            {logItem}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
