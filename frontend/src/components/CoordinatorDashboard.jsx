import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart2,
  Calendar,
  FileSpreadsheet,
  Search,
  Filter,
  ArrowRightLeft,
  UserCog,
  AlertTriangle,
  Award,
  Users,
  Layers,
  ChevronRight,
  ShieldCheck,
  Plus,
  FileText,
  UserCheck2
} from 'lucide-react';

export default function CoordinatorDashboard({
  projects = [],
  onSelectProject,
  onOpenRegisterModal,
  onOpenAssignGuideModal
}) {
  const [analytics, setAnalytics] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const safeProjects = Array.isArray(projects) ? projects : [];

  const pendingGuideAllocations = safeProjects.filter(
    p => !p.guideId || p.status === 'Awaiting Guide Allocation' || p.needsGuideAllocation
  );

  const pendingReviews = safeProjects.filter(p => {
    const active = p.stages?.[p.currentStageIndex];
    return active && active.status === 'submitted';
  });
  const pendingReviewCount = pendingReviews.length;

  const approvedCount = safeProjects.filter(p => p.status === 'Completed' || (p.overallMarks?.stagesCompleted || 0) >= 3).length;

  useEffect(() => {
    loadAnalytics();
  }, [projects]);

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const filteredProjects = safeProjects.filter(p => {
    const matchesType = typeFilter === 'all' || p.type?.toLowerCase() === typeFilter.toLowerCase();
    const s = search.toLowerCase();
    const matchesSearch =
      !s ||
      p.title?.toLowerCase().includes(s) ||
      p.id?.toLowerCase().includes(s) ||
      p.guideName?.toLowerCase().includes(s) ||
      p.teamMembers?.some(m => m.rollNumber?.toLowerCase().includes(s) || m.name?.toLowerCase().includes(s));
    return matchesType && matchesSearch;
  });

  const exportToCSV = () => {
    if (safeProjects.length === 0) {
      alert('No project data to export.');
      return;
    }

    const headers = [
      'Project ID',
      'Title',
      'Category',
      'Domain',
      'Team Roll Numbers',
      'Faculty Supervisor',
      'Current Stage',
      'Overall Marks',
      'Max Marks',
      'Percentage',
      'Status'
    ];

    const rows = safeProjects.map(p => [
      `"${p.id}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.type}"`,
      `"${p.domain}"`,
      `"${(p.teamMembers || []).map(m => m.rollNumber).join('; ')}"`,
      `"${p.guideName || 'Awaiting Allocation'}"`,
      `"${p.stages?.[p.currentStageIndex]?.name || 'Synopsis'}"`,
      p.overallMarks?.obtained ?? 0,
      p.overallMarks?.totalPossible ?? 200,
      `${p.overallMarks?.percentage ?? 0}%`,
      `"${p.status}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SMART_PRO_CSE_Projects_Master_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting matching Template Screen 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome, Coordinator!</span>
            <span className="text-2xl">👩‍🏫</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Oversee and manage the project lifecycle, faculty guide allocation, and university records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenRegisterModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>New Batch</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric KPI Cards matching Template Screen 4 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Projects */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Projects
            </span>
            <div className="text-3xl font-black font-mono text-slate-900">
              {safeProjects.length}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Enrolled Batches
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0 border border-blue-100">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Approved */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Approved
            </span>
            <div className="text-3xl font-black font-mono text-emerald-600">
              {approvedCount}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Milestones Certified
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Pending Reviews */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Pending Reviews
            </span>
            <div className="text-3xl font-black font-mono text-amber-600">
              {pendingReviewCount}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Awaiting Evaluation
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Completion Rate
            </span>
            <div className="text-3xl font-black font-mono text-purple-600">
              {analytics?.avgDepartmentPercentage || 87}%
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Department Avg
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Priority Pending Guide Allocations Notification Banner */}
      {pendingGuideAllocations.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50/50 border-2 border-amber-400 rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping shrink-0"></span>
              <div className="p-2.5 bg-amber-100 text-amber-900 rounded-2xl shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
                  <span>Proposals Awaiting Faculty Guide Allocation ({pendingGuideAllocations.length})</span>
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Student batches have submitted proposals. Review technical domains and allocate an official faculty guide.
                </p>
              </div>
            </div>
            <span className="text-xs font-black text-amber-900 bg-amber-200/80 px-3.5 py-1.5 rounded-full border border-amber-300 self-start sm:self-auto shadow-2xs">
              Action Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {pendingGuideAllocations.map((p) => (
              <div
                key={p.id}
                className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                      {p.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      Unassigned
                    </span>
                  </div>

                  <div className="font-black text-sm text-slate-900 leading-snug line-clamp-2">
                    {p.title}
                  </div>

                  <div className="text-xs text-indigo-700 font-semibold flex items-center gap-1">
                    <span>{p.type}</span>
                    <span>•</span>
                    <span className="truncate">{p.domain}</span>
                  </div>

                  <div className="text-xs text-slate-500 pt-1">
                    Batch: <strong className="font-mono text-slate-800">{p.teamMembers?.map(m => m.rollNumber).join(', ') || 'N/A'}</strong>
                  </div>
                </div>

                <button
                  onClick={() => onOpenAssignGuideModal(p)}
                  className="w-full py-2.5 px-4 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 hover:scale-[1.01]"
                >
                  <UserCog className="w-4 h-4" />
                  <span>Allocate Faculty Guide</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Main Row: Project Status Overview (Left 2/3) + Upcoming Events (Right 1/3) matching Screen 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Project Status Overview Bar Chart Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Project Status Overview
              </h3>
              <p className="text-xs text-slate-500">
                Department distribution across Mini vs Major projects and milestones
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-brand-500"></span>
                <span>Mini Projects</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-amber-500"></span>
                <span>Major Projects</span>
              </span>
            </div>
          </div>

          {/* Stylized Bar Chart matching Screen 4 */}
          <div className="pt-6 pb-2">
            <div className="flex items-end justify-around h-48 border-b border-slate-200 px-4">
              {/* Category 1: Mini Projects */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-end gap-1.5 h-36">
                  <div className="w-7 bg-brand-500 rounded-t-lg transition-all hover:opacity-90" style={{ height: '65%' }}></div>
                  <div className="w-7 bg-amber-500 rounded-t-lg transition-all hover:opacity-90" style={{ height: '40%' }}></div>
                </div>
                <span className="text-[11px] font-bold text-slate-600">Registered</span>
              </div>

              {/* Category 2: In Review */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-end gap-1.5 h-36">
                  <div className="w-7 bg-brand-500 rounded-t-lg transition-all hover:opacity-90" style={{ height: '50%' }}></div>
                  <div className="w-7 bg-amber-500 rounded-t-lg transition-all hover:opacity-90" style={{ height: '70%' }}></div>
                </div>
                <span className="text-[11px] font-bold text-slate-600">In Review</span>
              </div>

              {/* Category 3: Ongoing */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-end gap-1.5 h-36">
                  <div className="w-7 bg-brand-500 rounded-t-lg transition-all hover:opacity-90" style={{ height: '85%' }}></div>
                  <div className="w-7 bg-amber-500 rounded-t-lg transition-all hover:opacity-90" style={{ height: '60%' }}></div>
                </div>
                <span className="text-[11px] font-bold text-slate-600">Ongoing</span>
              </div>

              {/* Category 4: Completed */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-end gap-1.5 h-36">
                  <div className="w-7 bg-brand-500 rounded-t-lg transition-all hover:opacity-90" style={{ height: '90%' }}></div>
                  <div className="w-7 bg-amber-500 rounded-t-lg transition-all hover:opacity-90" style={{ height: '80%' }}></div>
                </div>
                <span className="text-[11px] font-bold text-slate-600">Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Live Action Queue (Option B) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Live Action Queue
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Proposals & milestones requiring coordinator action
                </p>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                pendingGuideAllocations.length + pendingReviews.length > 0
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {pendingGuideAllocations.length + pendingReviews.length} Action Items
              </span>
            </div>

            <div className="space-y-3 mt-3">
              {/* 1. Projects Awaiting Guide Allocation */}
              {pendingGuideAllocations.map(p => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 line-clamp-1">
                          {p.title}
                        </div>
                        <div className="text-[10px] text-amber-800 font-semibold mt-0.5 flex items-center gap-1.5">
                          <span className="font-mono">{p.id}</span>
                          <span>•</span>
                          <span>Awaiting Guide Allocation</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenAssignGuideModal && onOpenAssignGuideModal(p)}
                    className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Allocate Faculty Guide Now</span>
                  </button>
                </div>
              ))}

              {/* 2. Projects Awaiting Review/Grading */}
              {pendingReviews.map(p => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 line-clamp-1">
                          {p.title}
                        </div>
                        <div className="text-[10px] text-brand-700 font-semibold mt-0.5 flex items-center gap-1.5">
                          <span className="font-mono">{p.id}</span>
                          <span>•</span>
                          <span>Stage 0{p.currentStageIndex + 1} Submitted</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectProject && onSelectProject(p)}
                    className="w-full py-1.5 px-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Inspect Deliverables & Grade</span>
                  </button>
                </div>
              ))}

              {/* 3. Empty state if all actions cleared */}
              {pendingGuideAllocations.length === 0 && pendingReviews.length === 0 && (
                <div className="p-6 text-center bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-extrabold text-slate-900">
                    All Batches Allocated & Current
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                    No pending supervisor allocations or unreviewed milestone submissions.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Department Queue Status</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Synced</span>
            </span>
          </div>
        </div>
      </div>

      {/* 5. Master Projects Registry Table matching SMART-PRO style */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Department Master Projects Registry
            </h3>
            <p className="text-xs text-slate-500">
              Showing {filteredProjects.length} of {safeProjects.length} registered batches
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Search title, roll number, guide..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 w-48 sm:w-64"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white font-semibold"
            >
              <option value="all">All Categories</option>
              <option value="Mini Project">Mini Projects</option>
              <option value="Major Project">Major Projects</option>
            </select>
          </div>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">ID</th>
                <th className="px-4 py-3.5">Project Title</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Batch Roll Numbers</th>
                <th className="px-4 py-3.5">Faculty Supervisor</th>
                <th className="px-4 py-3.5">Active Milestone</th>
                <th className="px-4 py-3.5 text-right">Awarded Score</th>
                <th className="px-4 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 font-mono font-black text-slate-500">{p.id}</td>
                  <td className="px-4 py-4 max-w-xs">
                    <div
                      onClick={() => onSelectProject(p)}
                      className="font-black text-slate-900 hover:text-brand-600 cursor-pointer truncate text-sm"
                    >
                      {p.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{p.domain}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                      {p.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono font-bold text-slate-700">
                    {p.teamMembers?.map(m => m.rollNumber).join(', ')}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
                      {p.guideId ? (
                        <div>
                          <div className="font-extrabold text-indigo-950">{p.guideName}</div>
                          <div className="text-[10px] text-slate-400">{p.guideDesignation || 'Faculty Guide'}</div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                          <span>Awaiting Guide</span>
                        </span>
                      )}
                      {onOpenAssignGuideModal && (
                        <button
                          onClick={() => onOpenAssignGuideModal(p)}
                          title={p.guideId ? "Reassign or change faculty guide" : "Allocate faculty supervisor to this batch"}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all flex items-center gap-1 shadow-2xs hover:scale-105 ${
                            p.guideId
                              ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
                              : 'text-white bg-indigo-600 hover:bg-indigo-700 border-indigo-600 font-black'
                          }`}
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>{p.guideId ? 'Change' : 'Allocate'}</span>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-900 text-white font-mono">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-mono font-black text-slate-900 text-sm">
                    {p.overallMarks?.obtained ?? 0} / {p.overallMarks?.totalPossible ?? 200}{' '}
                    <span className="text-[11px] font-normal text-slate-400">
                      ({p.overallMarks?.percentage ?? 0}%)
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => onSelectProject(p)}
                      className="px-3.5 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl border border-brand-200 transition-colors shadow-2xs"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
