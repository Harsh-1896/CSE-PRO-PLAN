import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  LayoutDashboard,
  FolderKanban,
  FileText,
  FileCheck2,
  Files,
  BarChart3,
  Bell,
  User,
  LogOut,
  Users2,
  UserCheck2,
  Settings,
  HelpCircle,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({
  currentView = 'dashboard',
  onNavigate,
  unreadCount = 3
}) {
  const { user, role, logout } = useAuth();

  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'My Projects', icon: FolderKanban },
    { id: 'proposals', label: 'Proposals', icon: FileText },
    { id: 'reviews', label: 'Reviews', icon: FileCheck2 },
    { id: 'documents', label: 'Documents', icon: Files },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const guideNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'My Assigned Projects', icon: FolderKanban },
    { id: 'reviews', label: 'Reviews', icon: FileCheck2 },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const coordinatorNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'team_mgmt', label: 'Team Management', icon: Users2 },
    { id: 'guide_alloc', label: 'Guide Allocation', icon: UserCheck2 },
    { id: 'reviews', label: 'Reviews', icon: FileCheck2 },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const navItems = role === 'coordinator' ? coordinatorNav : role === 'guide' ? guideNav : studentNav;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 min-h-screen sticky top-0 z-30 shadow-2xs select-none">
      {/* Top Brand Logo */}
      <div>
        <div className="h-18 px-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/25 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="font-black text-slate-900 tracking-tight text-base leading-none">
              SMART-PRO
            </div>
            <div className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
              CSE Department
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate && onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive
                        ? 'bg-white text-brand-600'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Logout Footer */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

