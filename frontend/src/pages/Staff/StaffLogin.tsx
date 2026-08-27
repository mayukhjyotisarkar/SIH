import React, { useState } from 'react';
import { UserCheck, Lock, User, ShieldAlert, Sparkles, Building } from 'lucide-react';
import { StaffAccount } from '../../types';
import { ApiService } from '../../services/api';

interface StaffLoginProps {
  onLoginSuccess: (staff: StaffAccount) => void;
}

export const StaffLogin: React.FC<StaffLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('nurse_priya');
  const [password, setPassword] = useState<string>('hospital123');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const demoAccounts = [
    { name: 'Sister Priya Sharma', user: 'nurse_priya', pass: 'hospital123', role: 'OPD Triage Staff Nurse' },
    { name: 'Rajesh Varma', user: 'admin_raj', pass: 'admin123', role: 'Kiosk & IT Operator' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await ApiService.staffLogin(username, password);
      onLoginSuccess(data.staff);
    } catch (err: any) {
      console.error("Staff login error:", err);
      setErrorMessage(err.message || "Invalid staff username or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
            <UserCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Hospital Staff Portal</h2>
          <p className="text-xs text-slate-500">
            Kiosk connectivity monitoring, failover intervention & manual clinical intake.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Staff Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="nurse_priya"
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Hospital Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center space-x-2 min-h-[48px]"
          >
            <UserCheck className="w-4 h-4" />
            <span>{isLoading ? 'Authenticating...' : 'Sign In as Staff'}</span>
          </button>
        </form>

        {/* Demo Fast Fill */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            Demo Pre-Registered Staff Accounts
          </span>
          <div className="grid grid-cols-1 gap-2">
            {demoAccounts.map((acc) => (
              <button
                type="button"
                key={acc.user}
                onClick={() => {
                  setUsername(acc.user);
                  setPassword(acc.pass);
                }}
                className="text-left p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs text-slate-700 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{acc.name}</span>
                  <span className="text-[10px] text-slate-500">{acc.role}</span>
                </div>
                <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  Select
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
