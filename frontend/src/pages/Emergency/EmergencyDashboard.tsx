import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, Flame, ShieldAlert, HeartPulse, Activity, 
  Stethoscope, Bed, Siren, RefreshCw, CheckCircle2, 
  ArrowRight, Clock, User, PhoneCall, Zap, FileText,
  Search, X, Filter
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

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'emergency' | 'urgent'>('all');
  const [bedStatusFilter, setBedStatusFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');

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

  // Filtered Queue based on Search and Filter Pills
  const filteredQueue = useMemo(() => {
    return emergencyQueue.filter((patient) => {
      // 1. Urgency filter
      if (urgencyFilter !== 'all' && patient.redFlag?.urgency !== urgencyFilter) {
        return false;
      }

      // 2. Bed Status filter
      if (bedStatusFilter === 'assigned' && !patient.assignedBed) {
        return false;
      }
      if (bedStatusFilter === 'unassigned' && patient.assignedBed) {
        return false;
      }

      // 3. Search query matching
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const nameMatch = (patient.patientName || '').toLowerCase().includes(q);
      const tokenMatch = (patient.tokenNumber || '').toLowerCase().includes(q);
      const abhaMatch = (patient.patientId || '').toLowerCase().includes(q);
      const reasonMatch = (patient.redFlag?.reason || '').toLowerCase().includes(q);
      const ccMatch = (patient.chiefComplaint || '').toLowerCase().includes(q);
      const bedMatch = (patient.assignedBed || '').toLowerCase().includes(q);

      return nameMatch || tokenMatch || abhaMatch || reasonMatch || ccMatch || bedMatch;
    });
  }, [emergencyQueue, searchQuery, urgencyFilter, bedStatusFilter]);

  const activeRedFlagCount = emergencyQueue.length;
  const emergencyCount = emergencyQueue.filter(p => p.redFlag?.urgency === 'emergency').length;
  const urgentCount = emergencyQueue.filter(p => p.redFlag?.urgency === 'urgent').length;

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
            className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* 2. Emergency Search & Triage Filter Bar */}
      <div className="max-w-6xl mx-auto bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Input Box with Action Button */}
          <div className="relative flex-1 w-full flex items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emergency cases by Patient Name, Token, ABHA ID, Symptoms, or Bed..."
                className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 focus:border-rose-500 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {}}
              className="ml-2 px-4 py-2.5 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 shrink-0 transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            
            {/* Filter: All / Emergency / Urgent */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setUrgencyFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  urgencyFilter === 'all'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({activeRedFlagCount})
              </button>
              <button
                type="button"
                onClick={() => setUrgencyFilter('emergency')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  urgencyFilter === 'emergency'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                🚨 Critical ({emergencyCount})
              </button>
              <button
                type="button"
                onClick={() => setUrgencyFilter('urgent')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  urgencyFilter === 'urgent'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                ⚠️ Urgent ({urgentCount})
              </button>
            </div>

            {/* Filter: Bed Allocation */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setBedStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  bedStatusFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Beds
              </button>
              <button
                type="button"
                onClick={() => setBedStatusFilter('assigned')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  bedStatusFilter === 'assigned' ? 'bg-emerald-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Bed Assigned
              </button>
              <button
                type="button"
                onClick={() => setBedStatusFilter('unassigned')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  bedStatusFilter === 'unassigned' ? 'bg-amber-800 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Awaiting Bed
              </button>
            </div>

          </div>
        </div>

        {/* Search Results Summary */}
        {(searchQuery || urgencyFilter !== 'all' || bedStatusFilter !== 'all') && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
            <span>
              Showing <strong className="text-white font-bold">{filteredQueue.length}</strong> of {activeRedFlagCount} active emergency cases
              {searchQuery && <span> matching "<span className="text-rose-400">{searchQuery}</span>"</span>}
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setUrgencyFilter('all');
                setBedStatusFilter('all');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 3. Priority Queue Stream */}
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
        ) : filteredQueue.length === 0 ? (
          /* No search results */
          <div className="py-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-3 max-w-lg mx-auto">
            <Search className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Matching Emergency Cases</h3>
            <p className="text-xs text-slate-400">
              No emergency cases match your search or active filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setUrgencyFilter('all');
                setBedStatusFilter('all');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              Clear Search & Filters
            </button>
          </div>
        ) : (
          /* Active Red-Flag Cards */
          <div className="space-y-5">
            {filteredQueue.map((patient) => {
              const isEmergencyAcuity = patient.redFlag?.urgency === 'emergency';
              const assignedBed = patient.assignedBed || selectedBeds[patient.sessionId] || "Trauma Bay 1";
              const symptomCategory = patient.historyOfPresentIllness?.symptomCategory;

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
                          <span className="text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2.5 py-0.5 rounded">
                            {isEmergencyAcuity ? 'CODE EMERGENCY' : 'PRIORITY RED FLAG'}
                          </span>
                          <span className="text-xs text-rose-300 font-mono">
                            Detected at Kiosk #1
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                          {patient.redFlag?.reason || "Acute Clinical Red Flag"}
                        </h3>
                        <p className="text-xs text-rose-200 font-semibold">
                          Recommended Action: {patient.redFlag?.action || "Immediate casualty evaluation"}
                        </p>
                      </div>
                    </div>

                    {/* Patient Identifiers */}
                    <div className="text-right space-y-1">
                      <span className="px-3 py-1 bg-rose-950 border border-rose-600 text-rose-300 text-xs font-mono font-black rounded-xl">
                        Token #{patient.tokenNumber}
                      </span>
                      <div className="text-[11px] text-slate-400 font-mono pt-1">
                        ABHA: {patient.patientId}
                      </div>
                    </div>
                  </div>

                  {/* Middle Grid: Demographics, Chief Complaint & Vitals */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    
                    {/* Patient Identity */}
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Patient Information
                      </span>
                      <div className="space-y-1">
                        <div className="text-base font-extrabold text-white">
                          {patient.patientName}
                        </div>
                        <div className="text-slate-300 font-medium">
                          {patient.age} Yrs • {patient.gender} • {patient.language?.toUpperCase()}
                        </div>
                        <div className="text-[11px] text-teal-400 font-mono pt-0.5">
                          ABHA ID: {patient.patientId}
                        </div>
                      </div>
                    </div>

                    {/* Chief Complaint Presentation */}
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">
                        Reported Symptoms & Complaint
                      </span>
                      <p className="text-slate-200 font-semibold text-xs leading-relaxed">
                        "{patient.chiefComplaint || 'Acute presentation requiring immediate assessment'}"
                      </p>
                      {symptomCategory && (
                        <span className="inline-block px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-bold">
                          {symptomCategory}
                        </span>
                      )}
                    </div>

                    {/* Casualty Bed Allocation Card */}
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                      <span className="text-[10px] uppercase font-bold text-teal-400 block tracking-wider flex items-center justify-between">
                        <span>Casualty Bed Allocation</span>
                        <Bed className="w-3.5 h-3.5" />
                      </span>
                      
                      {patient.assignedBed ? (
                        <div className="p-2 bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-bold rounded-xl text-center text-xs">
                          Allocated: {patient.assignedBed}
                        </div>
                      ) : (
                        <select
                          value={selectedBeds[patient.sessionId] || ""}
                          onChange={(e) => handleBedSelect(patient.sessionId, e.target.value)}
                          aria-label="Select Casualty Bed"
                          className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-bold p-2.5 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer"
                        >
                          <option value="">Select Casualty Bed / Bay...</option>
                          {CASUALTY_BEDS.map((bed, bi) => (
                            <option key={bi} value={bed}>{bed}</option>
                          ))}
                        </select>
                      )}
                      
                      <div className="text-[10px] text-slate-400 italic">
                        {patient.assignedBed ? "Patient wheeled into allocated bay." : "Select bed to initiate casualty transport."}
                      </div>
                    </div>

                  </div>

                  {/* Action Log if actions previously executed */}
                  {patient.emergencyActionLog && patient.emergencyActionLog.length > 0 && (
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1 text-xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Executed Stat Protocol Log:</span>
                      <div className="flex flex-wrap gap-2">
                        {patient.emergencyActionLog.map((logItem, li) => (
                          <span key={li} className="px-2.5 py-0.5 bg-rose-950 border border-rose-700 text-rose-200 text-[11px] font-mono rounded-md">
                            ✓ {logItem}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Action Strip: Immediate 1-Click Orders */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold text-slate-400">1-Click Stat Orders:</span>
                      
                      {/* Stat ECG */}
                      <button
                        type="button"
                        onClick={() => handleExecuteEmergencyAction(patient.sessionId, "Stat 12-Lead ECG & Cardiac Enzymes", assignedBed)}
                        disabled={actionInProgress[`${patient.sessionId}_Stat 12-Lead ECG & Cardiac Enzymes`]}
                        className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow cursor-pointer"
                      >
                        {actionInProgress[`${patient.sessionId}_Stat 12-Lead ECG & Cardiac Enzymes`] ? "Ordering..." : "⚡ Stat 12-Lead ECG"}
                      </button>

                      {/* IV Line & O2 */}
                      <button
                        type="button"
                        onClick={() => handleExecuteEmergencyAction(patient.sessionId, "18G IV Cannula & High-Flow O2", assignedBed)}
                        disabled={actionInProgress[`${patient.sessionId}_18G IV Cannula & High-Flow O2`]}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
                      >
                        {actionInProgress[`${patient.sessionId}_18G IV Cannula & High-Flow O2`] ? "Ordering..." : "💉 18G IV & O2"}
                      </button>

                      {/* Code Red */}
                      <button
                        type="button"
                        onClick={() => handleExecuteEmergencyAction(patient.sessionId, "Code Red Resuscitation Team Dispatch", assignedBed)}
                        disabled={actionInProgress[`${patient.sessionId}_Code Red Resuscitation Team Dispatch`]}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl animate-pulse shadow cursor-pointer"
                      >
                        {actionInProgress[`${patient.sessionId}_Code Red Resuscitation Team Dispatch`] ? "Dispatching..." : "🚨 Code Red Team"}
                      </button>
                    </div>

                    {/* View Full Clinical EHR Note */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/physician/review/${patient.sessionId}`)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Open Emergency Clinical File</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
