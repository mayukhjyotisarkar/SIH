import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, AlertTriangle, Clock, User, FileText, 
  CheckCircle2, Search, Filter, RefreshCw, ArrowRight, 
  Sparkles, ShieldCheck 
} from 'lucide-react';
import { ApiService } from '../../services/api';

interface PhysicianQueueProps {
  onSelectPatient?: (sessionId: string) => void;
}

export const PhysicianQueue: React.FC<PhysicianQueueProps> = ({ onSelectPatient }) => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterMode, setFilterMode] = useState<'all' | 'red_flags' | 'pending'>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getPhysicianQueue();
      setQueue(data);
    } catch (err) {
      console.error("Queue fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenPatient = (sessionId: string) => {
    if (onSelectPatient) {
      onSelectPatient(sessionId);
    }
    navigate(`/physician/session/${sessionId}`);
  };

  const filteredQueue = queue.filter((item) => {
    if (filterMode === 'red_flags' && !item.redFlag?.triggered) return false;
    if (filterMode === 'pending' && item.physicianReviewStatus !== 'Pending confirmation') return false;
    if (selectedDeptFilter !== 'all') {
      const deptName = item.departmentRouting?.department?.toLowerCase() || '';
      const filterTarget = selectedDeptFilter.toLowerCase().replace(/_/g, ' ');
      if (!deptName.includes(filterTarget)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.patientName?.toLowerCase().includes(q) ||
        item.tokenNumber?.toLowerCase().includes(q) ||
        item.chiefComplaint?.toLowerCase().includes(q) ||
        item.departmentRouting?.department?.toLowerCase().includes(q) ||
        item.departmentRouting?.doctorName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const redFlagCount = queue.filter((p) => p.redFlag?.triggered).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Stethoscope className="w-4 h-4" />
            <span>OPD Clinical Triage & Review</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Physician Consultation Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time pre-consultation intake summaries prepared by MediKiosk & hospital staff.
          </p>
        </div>

        {/* Action Counters & Refresh */}
        <div className="flex items-center space-x-3">
          {redFlagCount > 0 && (
            <div className="flex items-center space-x-2 bg-rose-50 text-rose-800 border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-bold animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{redFlagCount} Priority Red Flag(s)</span>
            </div>
          )}

          <button
            onClick={fetchQueue}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors flex items-center space-x-1.5 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search patient, token, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Filter Tabs */}
          <div className="inline-flex rounded-lg bg-slate-100 p-1 w-full sm:w-auto justify-center">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                filterMode === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Patients ({queue.length})
            </button>
            <button
              onClick={() => setFilterMode('red_flags')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center space-x-1 ${
                filterMode === 'red_flags' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Red Flags ({redFlagCount})</span>
            </button>
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                filterMode === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Review
            </button>
          </div>
        </div>

        {/* Department / Specialty Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Clinic Filter:
          </span>
          {[
            { id: 'all', label: 'All Clinics' },
            { id: 'Ophthalmology', label: 'Eye / Ophthalmology' },
            { id: 'Cardiology', label: 'Cardiology' },
            { id: 'Orthopedics', label: 'Orthopedics' },
            { id: 'Gastroenterology', label: 'Gastroenterology' },
            { id: 'Pulmonology', label: 'Pulmonology' },
            { id: 'Neurology', label: 'Neurology' },
            { id: 'Endocrinology', label: 'Endocrinology' },
            { id: 'Dermatology', label: 'Dermatology' },
            { id: 'ENT', label: 'ENT' },
            { id: 'Pediatrics', label: 'Pediatrics' },
            { id: 'General_Medicine', label: 'General Medicine' },
            { id: 'AYUSH', label: 'AYUSH' }
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDeptFilter(d.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedDeptFilter === d.id
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Table / List View */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Token #</th>
                <th className="py-3.5 px-4">Patient Name & Info</th>
                <th className="py-3.5 px-4">ESI & NEWS2 Triage</th>
                <th className="py-3.5 px-4">Assigned Department</th>
                <th className="py-3.5 px-4">Chief Complaint & Red Flag</th>
                <th className="py-3.5 px-4">Records</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-sm">
                    No patients currently waiting in this clinic filter.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((pt) => {
                  const isRedFlag = pt.redFlag?.triggered;
                  const dept = pt.departmentRouting;
                  const esi = pt.triageScore?.esiLevel || (isRedFlag ? 2 : 3);
                  const esiCat = pt.triageScore?.esiCategory || (isRedFlag ? 'Emergent' : 'Urgent');
                  const news2 = pt.triageScore?.news2Score || 0;

                  return (
                    <tr
                      key={pt.sessionId}
                      onClick={() => handleOpenPatient(pt.sessionId)}
                      className={`hover:bg-blue-50/60 cursor-pointer transition-colors ${
                        isRedFlag ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      {/* Token */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-900">
                        <span className="px-2.5 py-1 rounded bg-slate-800 text-white text-xs">
                          {pt.tokenNumber}
                        </span>
                      </td>

                      {/* Patient Name */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 text-sm">{pt.patientName}</div>
                        <div className="text-xs text-slate-500 font-medium">
                          {pt.age} Yrs • {pt.gender} • <span className="font-mono">{pt.patientId}</span>
                        </div>
                        {pt.ayushMode && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                            AYUSH OPD
                          </span>
                        )}
                      </td>

                      {/* ESI & NEWS2 Triage */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-block text-[11px] font-extrabold px-2 py-0.5 rounded-md w-fit ${
                            (esi === 1 || isRedFlag)
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : esi === 2
                              ? 'bg-orange-500 text-white shadow-2xs'
                              : esi === 3
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-teal-100 text-teal-900'
                          }`}>
                            ESI {esi}: {esiCat}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            NEWS2: <strong className="text-slate-800 font-bold">{news2}</strong>
                          </span>
                        </div>
                      </td>

                      {/* Assigned Department */}
                      <td className="py-4 px-4">
                        {dept ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center space-x-1 font-bold text-xs text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                              <Stethoscope className="w-3 h-3 text-blue-700" />
                              <span>{dept.department}</span>
                            </span>
                            <div className="text-[11px] text-slate-500">
                              {dept.roomNumber} • {dept.doctorName}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">General OPD</span>
                        )}
                      </td>

                      {/* Chief Complaint */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="text-slate-900 font-semibold truncate">
                          {pt.chiefComplaint}
                        </div>
                        {isRedFlag ? (
                          <div className="mt-1 flex items-center space-x-1 text-rose-700 font-bold text-xs">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{pt.redFlag.reason}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 mt-0.5">{pt.createdAt}</div>
                        )}
                      </td>

                      {/* Documents Count */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>{pt.docCount || pt.priorInvestigations?.length || 0} docs</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            pt.physicianReviewStatus === 'Accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : pt.physicianReviewStatus === 'Amended'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {pt.physicianReviewStatus}
                        </span>
                        {pt.enteredByStaffId && (
                          <div className="mt-1 text-[10px] text-amber-800 font-medium">
                            Via Staff ({pt.enteredByStaffId})
                          </div>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPatient(pt.sessionId);
                          }}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center space-x-1 shadow-sm transition-colors"
                        >
                          <span>Review Note</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
