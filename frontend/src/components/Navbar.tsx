import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Stethoscope, Monitor, ShieldAlert, Wifi, WifiOff, Globe, Activity } from 'lucide-react';
import { LanguageCode, ConnectivityStatus } from '../types';
import { translations } from '../utils/i18n';

interface NavbarProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  connectivity: ConnectivityStatus;
  onToggleConnectivity?: (status: ConnectivityStatus) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  connectivity,
  onToggleConnectivity,
}) => {
  const location = useLocation();
  const t = translations[currentLang] || translations.en;

  const isKiosk = location.pathname.startsWith('/kiosk');
  const isPhysician = location.pathname.startsWith('/physician');
  const isStaff = location.pathname.startsWith('/staff');

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">MediKiosk</span>
                <span className="text-[10px] uppercase font-semibold bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
                  OPD AI Intake
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">AI Clinical History & Pre-Consultation</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Link
              to="/kiosk"
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isKiosk
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>{t.kioskMode}</span>
            </Link>

            <Link
              to="/physician"
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isPhysician
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>{t.physicianMode}</span>
            </Link>

            <Link
              to="/staff"
              className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isStaff
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{t.staffMode}</span>
            </Link>
          </nav>

          {/* Right Controls: Language & Connectivity Simulator */}
          <div className="flex items-center space-x-3">
            
            {/* Language Picker */}
            <div className="relative flex items-center">
              <Globe className="w-4 h-4 text-slate-400 mr-1.5 hidden md:block" />
              <select
                value={currentLang}
                onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
                aria-label="Select Language"
              >
                <option value="en">English (EN)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>

            {/* Interactive Connectivity Simulator (Demo Testing) */}
            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <span className="text-[11px] text-slate-400 hidden lg:inline font-mono">Network:</span>
              <div
                onClick={() => {
                  if (onToggleConnectivity) {
                    const next: Record<ConnectivityStatus, ConnectivityStatus> = {
                      online: 'degraded',
                      degraded: 'offline',
                      offline: 'online',
                    };
                    onToggleConnectivity(next[connectivity]);
                  }
                }}
                title="Click to simulate network degradation / offline failover"
                className={`flex items-center space-x-1.5 px-2 py-1 rounded cursor-pointer transition-colors text-xs font-semibold ${
                  connectivity === 'online'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : connectivity === 'degraded'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                }`}
              >
                {connectivity === 'online' ? (
                  <>
                    <Wifi className="w-3.5 h-3.5" />
                    <span>ONLINE</span>
                  </>
                ) : connectivity === 'degraded' ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 animate-pulse" />
                    <span>DEGRADED</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 animate-bounce" />
                    <span>OFFLINE</span>
                  </>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

