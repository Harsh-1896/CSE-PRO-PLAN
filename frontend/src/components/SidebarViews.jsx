import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  TrendingUp,
  FolderKanban,
  FileText,
  FileCheck2,
  Files,
  Bell,
  User,
  Users2,
  UserCheck2,
  Settings,
  Search,
  ExternalLink,
  ChevronRight,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Printer,
  Calendar,
  Layers,
  Sparkles,
  Download,
  RotateCcw,
  Check,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export default function SidebarViews({
  viewId,
  projects = [],
  onSelectProject,
  onOpenRegisterModal,
  onOpenAssignGuideModal,
  onResetData
}) {
  const { user, role } = useAuth();
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  // Filter projects by type or search
  const filteredProjects = projects.filter(p => {
    const matchesSearch =
      (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.domain || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.guideName || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'all') return true;
    if (filterType === 'mini') return p.type === 'Mini Project';
    if (filterType === 'major') return p.type === 'Major Project';
    if (filterType === 'awaiting') return p.needsGuideAllocation || p.status === 'Awaiting Guide Allocation';
    if (filterType === 'approved') return p.status === 'Approved' || p.overallMarks?.stagesCompleted === 5;
    return true;
  });

  // Collect all documents across all projects
  const allDocs = [];
  projects.forEach(p => {
    (p.stages || []).forEach(s => {
      if (s.submission) {
        allDocs.push({
          projectId: p.id,
          projectTitle: p.title,
          stageName: s.name,
          stageOrder: s.order,
          fileName: s.submission.fileName,
          fileSize: s.submission.fileSize,
          fileUrl: s.submission.fileUrl,
          submittedAt: s.submission.submittedAt,
          submittedBy: s.submission.submittedBy,
          guideName: p.guideName
        });
      }
    });
  });

  // Collect all stage reviews across all projects
  const allReviews = [];
  projects.forEach(p => {
    (p.stages || []).forEach(s => {
      if (s.submission || s.review) {
        allReviews.push({
          projectId: p.id,
          projectTitle: p.title,
          project: p,
          stage: s,
          status: s.status,
          decision: s.review?.decision,
          comments: s.review?.comments,
          marks: s.review?.marks,
          reviewedBy: s.review?.reviewedBy || p.guideName,
          reviewedAt: s.review?.reviewedAt
        });
      }
    });
  });

  // ==========================================
  // VIEW 1: ANALYTICS (Role-Aware: Student, Guide, HOD/Coordinator)
  // ==========================================
  if (viewId === 'analytics') {
    // 1. STUDENT ANALYTICS VIEW
    if (role === 'student') {
      const myProject = projects.find(
        p => p.createdBy === user?.id ||
        (p.teamMembers && p.teamMembers.some(m => m.rollNumber === user?.rollNumber))
      ) || projects[0];

      const stages = myProject?.stages || [];
      const completedCount = myProject?.overallMarks?.stagesCompleted || 0;
      const progressPercent = Math.round((completedCount / 5) * 100);

      return (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Student Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Hello, {user?.name || 'Student'}! 👋</span>
                <span className="text-base font-normal text-slate-500">Project Performance & Analytics</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Your stage-by-stage evaluation trajectory, rubric criteria scoring, and milestone velocities.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {myProject && (
                <button
                  onClick={() => onSelectProject && onSelectProject(myProject)}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-sm shadow-brand-500/25 transition-all flex items-center gap-1.5"
                >
                  <span>Open Project Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 4 Student KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cumulative Score</span>
                <span className="text-2xl font-black text-brand-600 mt-1 block">
                  {myProject?.overallMarks?.obtained || 0} / {myProject?.overallMarks?.totalPossible || 200}
                </span>
                <span className="text-[11px] text-emerald-600 font-bold mt-0.5 block">
                  {myProject?.overallMarks?.percentage || 0}% • {myProject?.overallMarks?.grade || 'In Progress'}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Milestones Cleared</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {completedCount} <span className="text-sm font-normal text-slate-400">/ 5 Stages</span>
                </span>
                <span className="text-[11px] text-indigo-600 font-bold mt-0.5 block">
                  {progressPercent}% Curriculum target
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Project Status</span>
                <span className="text-lg font-black text-emerald-600 mt-1 block truncate max-w-[130px]">
                  {myProject?.status || 'Active'}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block font-mono">
                  {myProject?.id || 'PRJ-2026-001'}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FolderKanban className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Faculty Guide</span>
                <span className="text-sm font-black text-slate-900 mt-1 block truncate max-w-[130px]">
                  {myProject?.guideName || 'Pending Allocation'}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block truncate max-w-[130px]">
                  {myProject?.guideDesignation || 'CSE Supervisor'}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <UserCheck2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Student Charts Split Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Chart (60%): Stage Score Trajectory */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Stage Score Trajectory
                  </h3>
                  <p className="text-xs text-slate-400">Awarded marks vs maximum milestone points</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-brand-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
                    <span>Awarded Marks</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                    <span>Max Marks</span>
                  </span>
                </div>
              </div>

              {/* Stage Progress Bars */}
              <div className="space-y-3 pt-2">
                {stages.map((stg, idx) => {
                  const maxMarks = stg.review?.marks ? stg.review.marks.maxTotal : idx < 2 ? 30 : idx < 4 ? 40 : 60;
                  const awarded = stg.review?.marks ? stg.review.marks.total : 0;
                  const pct = maxMarks > 0 ? Math.round((awarded / maxMarks) * 100) : 0;

                  return (
                    <div key={stg.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-brand-50 text-brand-600 text-[10px] font-black flex items-center justify-center">
                            0{idx + 1}
                          </span>
                          <span className="text-slate-900">{stg.name}</span>
                          <span className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                            stg.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : stg.status === 'changes_requested'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {stg.status === 'approved' ? 'Approved' : stg.status}
                          </span>
                        </div>

                        <span className="font-mono text-indigo-700">
                          {stg.review?.marks ? `${awarded} / ${maxMarks} (${pct}%)` : 'Locked / Pending'}
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${stg.review?.marks ? pct : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Card (40%): Rubric Evaluation Parameters */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Department Rubric Benchmark
                </h3>
                <p className="text-xs text-slate-400">Evaluated parameters across milestones</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Problem Definition & Novelty</div>
                    <div className="text-[10px] text-slate-400">Literature survey & engineering clarity</div>
                  </div>
                  <span className="font-mono text-xs font-black text-brand-600 bg-brand-50 px-2 py-1 rounded-lg border border-brand-200">
                    9.0 / 10
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">System Architecture & Methodology</div>
                    <div className="text-[10px] text-slate-400">UML diagrams & algorithm design</div>
                  </div>
                  <span className="font-mono text-xs font-black text-brand-600 bg-brand-50 px-2 py-1 rounded-lg border border-brand-200">
                    8.5 / 10
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Implementation & Code Quality</div>
                    <div className="text-[10px] text-slate-400">Repository commits, test coverage</div>
                  </div>
                  <span className="font-mono text-xs font-black text-brand-600 bg-brand-50 px-2 py-1 rounded-lg border border-brand-200">
                    8.5 / 10
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Viva Defense & Presentation</div>
                    <div className="text-[10px] text-slate-400">Technical answering & slide quality</div>
                  </div>
                  <span className="font-mono text-xs font-black text-brand-600 bg-brand-50 px-2 py-1 rounded-lg border border-brand-200">
                    9.2 / 10
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Active Cohort: <strong>B.Tech Sem 7</strong></span>
                {myProject && (
                  <button
                    onClick={() => onSelectProject && onSelectProject(myProject)}
                    className="text-brand-600 font-bold hover:underline"
                  >
                    View Project Dossier →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 2. COORDINATOR & HOD ANALYTICS VIEW (Screen 5 from Template)
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{role === 'guide' ? `Welcome, Dr. ${user?.name || 'Guide'}!` : 'Welcome, HOD!'}</span>
              <span className="text-base font-normal text-slate-500">Department Project Overview</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time analytics, milestone completion trajectories, and domain distribution metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-500" />
              <span>AY 2025-2026 • Sem 7</span>
            </span>
          </div>
        </div>

        {/* 4 KPI Cards from Screen 5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Projects</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">82</span>
              <span className="text-[11px] text-emerald-600 font-bold mt-0.5 block">+12% vs last year</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
              <FolderKanban className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Avg Score</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">87.5%</span>
              <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">Consistent grade</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Top Domain</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">AI & ML</span>
              <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">35% of all cohorts</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">On Time Completion</span>
              <span className="text-2xl font-black text-purple-600 mt-1 block">92%</span>
              <span className="text-[11px] text-emerald-600 font-bold mt-0.5 block">High submission rate</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Charts Split Row from Screen 5 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Chart (60% = 7 cols): Department Analytics Line Graph */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Department Analytics
                </h3>
                <p className="text-xs text-slate-400">Monthly project submissions vs completion rate</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-brand-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
                  <span>Projects</span>
                </span>
                <span className="flex items-center gap-1.5 text-purple-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span>Completion Rate</span>
                </span>
              </div>
            </div>

            {/* Visual SVG Multi-Line Chart matching Screen 5 */}
            <div className="h-56 w-full pt-4 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180">
                {/* Horizontal grid lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1" />

                {/* Y-axis labels */}
                <text x="5" y="24" fill="#94a3b8" fontSize="10" fontWeight="bold">100</text>
                <text x="5" y="64" fill="#94a3b8" fontSize="10" fontWeight="bold">75</text>
                <text x="5" y="104" fill="#94a3b8" fontSize="10" fontWeight="bold">50</text>
                <text x="5" y="144" fill="#94a3b8" fontSize="10" fontWeight="bold">25</text>

                {/* Line 1: Projects (Blue Curve) */}
                <path
                  d="M 50 130 C 130 110, 200 90, 260 80 C 320 70, 390 50, 460 35"
                  fill="none"
                  stroke="#1a62ea"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Points for Blue Line */}
                <circle cx="50" cy="130" r="4" fill="#1a62ea" />
                <circle cx="150" cy="105" r="4" fill="#1a62ea" />
                <circle cx="260" cy="80" r="4" fill="#1a62ea" />
                <circle cx="360" cy="55" r="4" fill="#1a62ea" />
                <circle cx="460" cy="35" r="4" fill="#1a62ea" />

                {/* Line 2: Completion Rate (Purple Curve) */}
                <path
                  d="M 50 150 C 130 140, 200 120, 260 95 C 320 90, 390 70, 460 50"
                  fill="none"
                  stroke="#9333ea"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Points for Purple Line */}
                <circle cx="50" cy="150" r="4" fill="#9333ea" />
                <circle cx="150" cy="135" r="4" fill="#9333ea" />
                <circle cx="260" cy="95" r="4" fill="#9333ea" />
                <circle cx="360" cy="75" r="4" fill="#9333ea" />
                <circle cx="460" cy="50" r="4" fill="#9333ea" />

                {/* X-axis labels */}
                <text x="50" y="175" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="bold">Aug</text>
                <text x="150" y="175" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="bold">Sep</text>
                <text x="260" y="175" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="bold">Oct</text>
                <text x="360" y="175" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="bold">Nov</text>
                <text x="460" y="175" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="bold">Dec</text>
              </svg>
            </div>
          </div>

          {/* Right Chart (40% = 5 cols): Top Domains Donut Chart */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Top Domains
              </h3>
              <p className="text-xs text-slate-400">Distribution of engineering domains</p>
            </div>

            <div className="flex items-center justify-center gap-6 py-2">
              {/* Donut Chart Gauge with 90% */}
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                  {/* AI & ML: 35% */}
                  <circle
                    cx="50" cy="50" r="38"
                    stroke="#1a62ea" strokeWidth="12" fill="none"
                    strokeDasharray="238" strokeDashoffset="155" strokeLinecap="round"
                  />
                  {/* Web Dev: 30% */}
                  <circle
                    cx="50" cy="50" r="38"
                    stroke="#0284c7" strokeWidth="12" fill="none"
                    strokeDasharray="238" strokeDashoffset="175"
                    className="opacity-70"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-900 leading-none">90%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Coverage</span>
                </div>
              </div>

              {/* Legend List from Screen 5 */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-slate-700 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
                    <span>AI & ML</span>
                  </span>
                  <span className="font-mono font-black text-slate-900">35%</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-slate-700 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                    <span>Web Dev</span>
                  </span>
                  <span className="font-mono font-black text-slate-900">30%</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-slate-700 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>IoT</span>
                  </span>
                  <span className="font-mono font-black text-slate-900">20%</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-slate-700 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <span>Others</span>
                  </span>
                  <span className="font-mono font-black text-slate-900">15%</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Evaluated Cohorts: <strong>B.Tech Sem 7</strong></span>
              <span className="text-brand-600 font-bold cursor-pointer hover:underline">Full Breakdown →</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: PROJECTS REGISTRY / MY PROJECTS
  // ==========================================
  if (viewId === 'projects' || viewId === 'proposals') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {viewId === 'proposals' ? 'Project Proposals & Registrations' : 'Project Registry & Cohorts'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse registered student capstones, supervisor allocations, and evaluation status.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenRegisterModal && (
              <button
                onClick={onOpenRegisterModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-500/25"
              >
                <Plus className="w-4 h-4" />
                <span>Submit New Proposal</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['all', 'mini', 'major', 'awaiting', 'approved'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                  filterType === type
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {type === 'awaiting' ? 'Awaiting Guide' : type}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by title, domain, guide..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* Projects Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(proj => (
            <div
              key={proj.id}
              onClick={() => onSelectProject && onSelectProject(proj)}
              className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-brand-300 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200">
                    {proj.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      proj.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : proj.needsGuideAllocation
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                <h3 className="font-black text-sm text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                  {proj.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {proj.description || 'No detailed scope outlined.'}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Team:</span>
                    <span className="font-bold truncate max-w-[180px]">
                      {proj.teamMembers.map(m => m.name).join(', ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Supervisor:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[180px]">
                      {proj.guideName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500 font-bold">
                  Score: {proj.overallMarks?.obtained || 0} / {proj.overallMarks?.totalPossible || 200}
                </span>
                <span className="text-brand-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: GUIDE ALLOCATION (Coordinator View)
  // ==========================================
  if (viewId === 'guide_alloc') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Faculty Guide Allocation Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign supervisors to newly registered proposals, balance faculty workloads, or reassign guides.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="p-4">Project ID</th>
                <th className="p-4">Project Title & Domain</th>
                <th className="p-4">Student Team</th>
                <th className="p-4">Current Supervisor</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Allocation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map(proj => (
                <tr key={proj.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900">{proj.id}</td>
                  <td className="p-4 max-w-xs">
                    <div className="font-bold text-slate-900 truncate">{proj.title}</div>
                    <div className="text-[11px] text-slate-400">{proj.domain}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{proj.teamMembers[0]?.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{proj.teamMembers[0]?.rollNumber}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{proj.guideName}</div>
                    <div className="text-[10px] text-slate-400">{proj.guideDesignation || 'CSE Faculty'}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        proj.needsGuideAllocation
                          ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {proj.needsGuideAllocation ? 'Awaiting Guide' : 'Guide Assigned'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {onOpenAssignGuideModal && (
                      <button
                        onClick={() => onOpenAssignGuideModal(proj)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                          proj.needsGuideAllocation
                            ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {proj.needsGuideAllocation ? 'Allocate Guide' : 'Reassign Guide'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 4: REVIEWS HUB
  // ==========================================
  if (viewId === 'reviews' || viewId === 'feedback') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Milestone Reviews & Evaluations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active evaluation queue, guide scorecards, and stage verification history.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="p-4">Project</th>
                <th className="p-4">Milestone Stage</th>
                <th className="p-4">Status</th>
                <th className="p-4">Evaluator</th>
                <th className="p-4 text-center">Score</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allReviews.map((rev, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 max-w-xs">
                    <div className="font-bold text-slate-900 truncate">{rev.projectTitle}</div>
                    <div className="text-[10px] font-mono text-brand-600">{rev.projectId}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-800">
                    Phase 0{rev.stage.order}: {rev.stage.name}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        rev.decision === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : rev.decision === 'changes_requested'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {rev.decision === 'approved' ? 'Approved' : rev.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 font-medium">{rev.reviewedBy}</td>
                  <td className="p-4 text-center font-mono font-black text-indigo-700">
                    {rev.marks ? `${rev.marks.total} / ${rev.marks.maxTotal}` : '-'}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onSelectProject && onSelectProject(rev.project)}
                      className="px-3 py-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                    >
                      Inspect Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 5: DOCUMENTS REPOSITORY
  // ==========================================
  if (viewId === 'documents') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Department Document Repository
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Master archive of all uploaded synopsis files, architecture documents, slides, and reports.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="p-4">Project</th>
                <th className="p-4">Stage Deliverable</th>
                <th className="p-4">Uploaded File</th>
                <th className="p-4">Submitted By</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allDocs.map((doc, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 max-w-xs">
                    <div className="font-bold text-slate-900 truncate">{doc.projectTitle}</div>
                    <div className="text-[10px] font-mono text-slate-400">{doc.projectId}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-800">{doc.stageName}</td>
                  <td className="p-4 flex items-center gap-2 text-slate-700">
                    <FileText className="w-4 h-4 text-brand-500" />
                    <span className="font-medium truncate max-w-[160px]">{doc.fileName}</span>
                    <span className="text-[10px] text-slate-400">({doc.fileSize})</span>
                  </td>
                  <td className="p-4 text-slate-600">{doc.submittedBy}</td>
                  <td className="p-4 text-slate-500">
                    {new Date(doc.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-colors"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 6: NOTIFICATIONS
  // ==========================================
  if (viewId === 'notifications') {
    const notifications = [
      {
        id: 1,
        title: 'Synopsis Approved by Dr. Priya Mehta',
        desc: 'Stage 01 Synopsis for "AI-Powered Traffic Optimization" marked Approved with 26/30 marks.',
        time: '2 hours ago',
        unread: true
      },
      {
        id: 2,
        title: 'Review 1 Presentations Scheduled',
        desc: 'Department milestone Review 1 defense presentations commence on 10 November 2026.',
        time: '1 day ago',
        unread: false
      },
      {
        id: 3,
        title: 'Guide Allocation Updated by Coordinator',
        desc: 'Prof. K. Sunitha reassigned supervisor for Project PRJ-2026-003.',
        time: '2 days ago',
        unread: false
      }
    ];

    return (
      <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Department Notifications
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Stay updated on evaluation events, reviews, and allocations.</p>
          </div>
          <span className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200">
            3 Unread
          </span>
        </div>

        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all ${
                n.unread
                  ? 'bg-white border-brand-200 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl mt-0.5 ${n.unread ? 'bg-brand-50 text-brand-600' : 'bg-slate-200 text-slate-500'}`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{n.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{n.desc}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                  </div>
                </div>
                {n.unread && (
                  <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 7: PROFILE
  // ==========================================
  if (viewId === 'profile') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            User Profile & Identity
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Academic registry and department credentials.</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-brand-500/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{user?.name || 'Academic User'}</h2>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200 capitalize">
                {role}
              </span>
              <p className="text-xs text-slate-400 mt-1 font-mono">{user?.email}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Department</span>
              <span className="font-bold text-slate-800">Computer Science & Engineering</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Academic Year</span>
              <span className="font-bold text-slate-800">2025-2026 (Semester 7)</span>
            </div>
            {user?.rollNumber && (
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Roll Number</span>
                <span className="font-mono font-bold text-slate-800">{user.rollNumber}</span>
              </div>
            )}
            <div>
              <span className="text-slate-400 font-semibold block text-[11px]">Account Status</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified CSE Portal User</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 8: TEAM MANAGEMENT
  // ==========================================
  if (viewId === 'team_mgmt') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Student Team Batch Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Student project cohorts, leader roll numbers, and supervisor allocations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(proj => (
            <div key={proj.id} className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-mono font-bold text-brand-600 text-xs">{proj.id}</span>
                <span className="text-[10px] font-bold text-slate-400">{proj.type}</span>
              </div>

              <h4 className="font-black text-xs text-slate-900 line-clamp-1">{proj.title}</h4>

              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Team Members ({proj.teamMembers.length})
                </span>
                {proj.teamMembers.map((m, mIdx) => (
                  <div key={mIdx} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-xl">
                    <span className="font-medium text-slate-800">{m.name}</span>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{m.rollNumber}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Supervisor:</span>
                <span className="font-bold text-slate-800">{proj.guideName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 9: REPORTS / SETTINGS
  // ==========================================
  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Department Reports & Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">System configurations, semester toggles, and data utilities.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h4 className="font-black text-sm text-slate-900">Download Consolidated Cohort Report</h4>
            <p className="text-xs text-slate-400 mt-0.5">Generate printable PDF marksheet dossiers for all projects.</p>
          </div>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <h4 className="font-black text-sm text-slate-900">Reset Demo Database</h4>
            <p className="text-xs text-slate-400 mt-0.5">Restore all projects, reviews, and test marks to default seed records.</p>
          </div>
          {onResetData && (
            <button
              onClick={onResetData}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

