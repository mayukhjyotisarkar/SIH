import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wifi, WifiOff, AlertTriangle, UserCheck, Clock, 
  Activity, ArrowRight, RefreshCw, LogOut, CheckCircle2, 
  Bell, ShieldAlert, Stethoscope, MapPin, BellRing, Check, X
} from 'lucide-react';
import { StaffAccount } from '../../types';
import { ApiService } from '../../services/api';

interface StaffMonitorProps {
  staff: StaffAccount;
  onLogout: () => void;
  onTakeoverSession?: (sessionId: string) => void;
}

export const StaffMonitor: React.FC<StaffMonitorProps> = ({
  staff,
  onLogout,
  onTakeoverSession,
}) => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Record<string, any>>({});
  
  // Department Assign Modal
  const [selectedSessionForDept, setSelectedSessionForDept] = useState<any | null>(null);
  const [targetDept, setTargetDept] = useState<string>('General_Medicine');
  const [deptNotes, setDeptNotes] = useState<string>('');
  const [isAssigningDept, setIsAssigningDept] = useState<boolean>(false);

  const fetchStaffSessions = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getStaffSessions();
      setSessions(data);
    } catch (err: any) {
      console.error("Staff sessions error:", err);
      if (err.status === 401) {
        onLogout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffSessions();
    ApiService.fetchDepartments()
      .then((res) => setDepartments(res))
      .catch((e) => console.warn("Could not fetch department directory:", e));

    const interval = setInterval(fetchStaffSessions, 5000);

    // Setup live WebSocket for priority alerts
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws/staff`;
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          setLiveAlerts((prev) => [msg, ...prev.slice(0, 4)]);
          fetchStaffSessions();
        } catch (e) {}
      };
    } catch (e) {
      console.warn("WebSocket could not connect, polling active.");
    }

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, []);

  const handleTakeover = (sessionId: string) => {
    if (onTakeoverSession) {
      onTakeoverSession(sessionId);
    }
    navigate(`/staff/takeover/${sessionId}`);
  };

  const handleConfirmDepartmentAssignment = async () => {
    if (!selectedSessionForDept) return;
    setIsAssigningDept(true);
    try {
      const deptInfo = departments[targetDept] || {};
      await ApiService.assignDepartment(selectedSessionForDept.sessionId, {
        department: targetDept.replace(/_/g, ' '),
        doctorName: deptInfo.doctorName,
        doctorTitle: deptInfo.doctorTitle,
        roomNumber: deptInfo.roomNumber,
        floorLocation: deptInfo.floorLocation,
        notes: deptNotes || `Triaged and assigned by ${staff.fullName}`
      });
      setSelectedSessionForDept(null);
      setDeptNotes('');
      fetchStaffSessions();
    } catch (err) {
      console.error("Failed to assign department:", err);
    } finally {
      setIsAssigningDept(false);
    }
  };

  const offlineOrFlaggedCount = sessions.filter(
    (s) => s.connectivityStatus === 'offline' || s.flaggedForStaff
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-700 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>OPD Floor Monitoring & Intervention Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Active Kiosk Sessions & Failover Monitor
          </h1>
          <p className="text-xs text-slate-500">
            Signed in as: <strong className="text-slate-900">{staff.fullName}</strong> ({staff.role}) • {staff.department}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchStaffSessions}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Real-time Alerts Banner */}
      {liveAlerts.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg space-y-2 border border-slate-800">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Bell className="w-4 h-4 animate-bounce" />
            <span>Live System Events & Alerts</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {liveAlerts.map((alert, idx) => (
              <div key={idx} className="bg-slate-800/80 p-2.5 rounded-xl text-xs flex items-center justify-between border border-slate-700">
                <span className="font-semibold text-slate-200 truncate">
                  [{alert.type}]: {alert.data?.patientName || alert.data?.tokenNumber || 'Kiosk Alert'} - {alert.data?.reason || alert.data?.message || 'Updated'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">Just now</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monitor Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Kiosks</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{sessions.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <Wifi className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Flagged / Offline</span>
            <div className="text-2xl font-black text-rose-700 mt-1">{offlineOrFlaggedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
            <WifiOff className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Manual Staff Intakes</span>
            <div className="text-2xl font-black text-amber-700 mt-1">
              {sessions.filter((s) => s.enteredByStaffId).length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Dedicated Triage Calls & Ambiguous Cases Banner */}
      {sessions.some((s) => s.staffCallActive || s.flaggedForStaff || s.departmentRouting?.isAmbiguous) && (
        <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center space-x-2 text-amber-900">
            <BellRing className="w-5 h-5 text-amber-700 animate-bounce" />
            <h3 className="font-extrabold text-base text-slate-950">
              Active Triage Nurse Assistance Calls & Ambiguous Cases
            </h3>
            <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-xs font-black">
              {sessions.filter((s) => s.staffCallActive || s.flaggedForStaff || s.departmentRouting?.isAmbiguous).length} Calls
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sessions
              .filter((s) => s.staffCallActive || s.flaggedForStaff || s.departmentRouting?.isAmbiguous)
              .map((s) => (
                <div
                  key={s.sessionId}
                  className="bg-white p-4 rounded-xl border border-amber-300 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black bg-slate-900 text-amber-300 px-2 py-0.5 rounded text-xs">
                          {s.tokenNumber}
                        </span>
                        <strong className="text-slate-900 text-sm font-bold">{s.patientName}</strong>
                        <span className="text-xs text-slate-500">({s.age}y/{s.gender})</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 font-medium line-clamp-2">
                        {s.staffCallReason || s.chiefComplaint || 'Ambiguous symptoms / Patient assistance requested'}
                      </p>
                    </div>

                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 shrink-0">
                      Nurse Paged
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Curr: <strong>{s.departmentRouting?.department || 'Unassigned'}</strong>
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedSessionForDept(s)}
                        className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center space-x-1 shadow-sm"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Assign Clinic</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTakeover(s.sessionId)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1 shadow-sm"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Take Over</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Session Table */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900">Floor Kiosk Sessions</h3>
          <span className="text-xs text-slate-500">Sorted with offline & flagged sessions at top</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Token #</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Connectivity</th>
                <th className="py-3 px-4">Assigned Department</th>
                <th className="py-3 px-4">Chief Complaint / Red Flag</th>
                <th className="py-3 px-4 text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-sm">
                    No active sessions currently on the OPD floor.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => {
                  const isOffline = s.connectivityStatus === 'offline';
                  const isFlagged = s.flaggedForStaff || s.staffCallActive;
                  const dept = s.departmentRouting;

                  return (
                    <tr
                      key={s.sessionId}
                      className={`hover:bg-slate-50 transition-colors ${
                        isOffline || isFlagged ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      {/* Token */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 bg-slate-800 text-white rounded text-xs">
                          {s.tokenNumber}
                        </span>
                      </td>

                      {/* Patient */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{s.patientName}</div>
                        <div className="text-xs text-slate-500 font-mono">{s.patientId}</div>
                      </td>

                      {/* Connectivity Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            s.connectivityStatus === 'online'
                              ? 'bg-teal-100 text-teal-800'
                              : s.connectivityStatus === 'degraded'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {s.connectivityStatus === 'online' ? (
                            <Wifi className="w-3.5 h-3.5 text-teal-700" />
                          ) : (
                            <WifiOff className="w-3.5 h-3.5 text-rose-700" />
                          )}
                          <span className="capitalize">{s.connectivityStatus}</span>
                        </span>
                      </td>

                      {/* Assigned Department */}
                      <td className="py-3.5 px-4">
                        {dept ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center space-x-1 text-xs font-bold text-slate-900">
                              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                              <span>{dept.department}</span>
                            </span>
                            <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-rose-500" />
                              <span>{dept.roomNumber} • {dept.doctorName}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Pending intake</span>
                        )}
                      </td>

                      {/* Chief Complaint / Red Flag */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">
                          {s.chiefComplaint || 'Awaiting initial symptoms'}
                        </div>
                        {s.redFlag?.triggered && (
                          <div className="text-[11px] font-bold text-rose-700 flex items-center space-x-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span className="truncate">{s.redFlag.reason}</span>
                          </div>
                        )}
                      </td>

                      {/* Intervention Buttons */}
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => setSelectedSessionForDept(s)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 transition-all inline-flex items-center space-x-1"
                          title="Assign or change OPD Department"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Clinic</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTakeover(s.sessionId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center space-x-1.5 transition-all shadow-sm ${
                            isOffline || isFlagged
                              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
                              : 'bg-slate-800 hover:bg-slate-900 text-white'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{s.enteredByStaffId ? 'Edit' : 'Take Over'}</span>
                          <ArrowRight className="w-3 h-3" />
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

      {/* Department Assignment Modal */}
      {selectedSessionForDept && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Assign OPD Department & Specialist
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient: <strong>{selectedSessionForDept.patientName}</strong> ({selectedSessionForDept.tokenNumber})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSessionForDept(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                  Select Hospital Department & Clinic:
                </label>
                <select
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm bg-white"
                >
                  {Object.keys(departments).length > 0 ? (
                    Object.entries(departments).map(([key, info]: [string, any]) => (
                      <option key={key} value={key}>
                        {key.replace(/_/g, ' ')} — {info.doctorName} ({info.roomNumber})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Ophthalmology">Ophthalmology — Dr. Radhika Nair (Room 102)</option>
                      <option value="Cardiology">Cardiology — Dr. A. K. Banerjee (Room 204)</option>
                      <option value="Orthopedics">Orthopedics — Dr. Vikram Mehta (Room 108)</option>
                      <option value="Gastroenterology">Gastroenterology — Dr. Sunita Rao (Room 215)</option>
                      <option value="Pulmonology">Pulmonology — Dr. Amit Roy (Room 302)</option>
                      <option value="Neurology">Neurology — Dr. Debabrata Sen (Room 310)</option>
                      <option value="Endocrinology">Endocrinology — Dr. Meera Nambiar (Room 220)</option>
                      <option value="Dermatology">Dermatology — Dr. Shalini Verma (Room 114)</option>
                      <option value="ENT">ENT — Dr. Rajesh Kulkarni (Room 116)</option>
                      <option value="Pediatrics">Pediatrics — Dr. Ananya Sengupta (Room 105)</option>
                      <option value="General_Medicine">General Medicine — Dr. Subhash Chandra (Room 101)</option>
                      <option value="AYUSH_Ayurveda">AYUSH Ayurveda — Vaidya Raghavan Sharma (AYUSH-01)</option>
                      <option value="Emergency">Emergency Resuscitation Unit (ER Bay-1)</option>
                    </>
                  )}
                </select>
              </div>

              {departments[targetDept] && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1">
                  <div className="text-teal-900 font-bold">
                    {departments[targetDept].doctorName} • <span className="text-teal-700">{departments[targetDept].roomNumber}</span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    {departments[targetDept].floorLocation}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                  Triage Notes / Routing Rationale:
                </label>
                <textarea
                  value={deptNotes}
                  onChange={(e) => setDeptNotes(e.target.value)}
                  placeholder="e.g. Evaluated at kiosk, eye strain and blurry vision confirmed. Directed to Eye clinic."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedSessionForDept(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDepartmentAssignment}
                disabled={isAssigningDept}
                className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isAssigningDept ? 'Assigning...' : 'Confirm Assignment'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
