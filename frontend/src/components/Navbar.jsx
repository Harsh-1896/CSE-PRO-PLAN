import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import {
  Search,
  Bell,
  ChevronDown,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Check,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';

export default function Navbar({
  onResetData,
  onGoHome,
  viewingProject,
  searchQuery,
  onSearchChange,
  onOpenNotifications
}) {
  const { user, role, quickDemoLogin, logout } = useAuth();
  const [switching, setSwitching] = useState(false);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleRoleSwitch = async (email) => {
    setSwitching(true);
    setShowSwitchMenu(false);
    try {
      await quickDemoLogin(email);
      if (onGoHome) onGoHome();
    } catch (err) {
      alert('Failed to switch persona: ' + err.message);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="h-18 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs no-print">
      {/* Left: Search Bar & Project Back button */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {viewingProject && (
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0 shadow-2xs"
            title="Return to main dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects, updates..."
            value={searchQuery || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center gap-3">
        {/* Semester Pill Dropdown */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold shadow-2xs cursor-pointer">
          <Calendar className="w-3.5 h-3.5 text-brand-500" />
          <span>Current Semester: Sem 7</span>
          <ChevronDown className="w-3 h-3 text-brand-400" />
        </div>

        {/* 1-Click Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowSwitchMenu(!showSwitchMenu)}
            disabled={switching}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all"
            title="Switch Persona"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Role:</span>
            <span className="text-amber-300 capitalize">{role}</span>
            <ChevronDown className="w-3 h-3 text-slate-300" />
          </button>

          {showSwitchMenu && (
            <div
              className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
              onClick={() => setShowSwitchMenu(false)}
            >
              <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <span>Select Persona</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-bold">1-Click</span>
              </div>
              <div className="p-1 space-y-1">
                {DEMO_USERS.map((demo) => {
                  const isCurrent = user?.email === demo.email;
                  return (
                    <button
                      key={demo.email}
                      onClick={() => handleRoleSwitch(demo.email)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-brand-50 font-bold text-brand-900 border border-brand-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-slate-900 leading-tight">{demo.name}</div>
                        <div className="text-[11px] text-slate-400 capitalize">{demo.role} • {demo.email}</div>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-brand-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo */}
        <button
          onClick={onResetData}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          title="Reset Department Data"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Open Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white"></span>
        </button>

        {/* User Avatar & Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-extrabold text-slate-900 leading-none">
              {user?.name || 'User'}
            </div>
            <div className="text-[10px] font-semibold text-slate-400 capitalize mt-0.5">
              {role || 'Student'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
