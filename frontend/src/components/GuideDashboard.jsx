import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Star,
  Users,
  Award,
  ArrowRight,
  Calculator,
  AlertTriangle,
  ChevronRight,
  PieChart,
  Calendar,
  Layers,
  Lock
} from 'lucide-react';

export default function GuideDashboard({
  projects = [],
  onSelectProject,
  onOpenReviewModal
}) {
  const { user } = useAuth();
  const safeProjects = Array.isArray(projects) ? projects : [];

  const pendingEvaluations = safeProjects.filter(p => {
    const activeStage = p.stages?.[p.currentStageIndex];
    return activeStage && activeStage.status === 'submitted';
  });

  const approvedSynopsisCount = safeProjects.filter(p => {
    return p.stages?.[0]?.status === 'approved';
  }).length;

  const totalMarksAwarded = safeProjects.reduce((acc, p) => acc + (p.overallMarks?.obtained || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome, {user?.name || 'Dr. Mehta'}!</span>
            <span className="text-2xl">👨‍🏫</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Manage your assigned student project batches, inspect deliverables, and score rubric criteria
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold shadow-2xs">
          <Award className="w-3.5 h-3.5 text-indigo-600" />
          <span>Department Faculty Supervisor</span>
        </div>
      </div>

      {/* 2. Top 4 Metric KPI Cards matching Template Screen 3 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Assigned Projects */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Assigned Projects
            </span>
            <div className="text-3xl font-black font-mono text-slate-900">
              {safeProjects.length}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Batches Supervised
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Approved Synopsis */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Approved Synopsis
            </span>
            <div className="text-3xl font-black font-mono text-emerald-600">
              {approvedSynopsisCount}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Stage 1 Certified
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
              {pendingEvaluations.length}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Awaiting Your Grading
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Total Marks Awarded */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Marks
            </span>
            <div className="text-3xl font-black font-mono text-brand-600">
              {totalMarksAwarded}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Cumulative Points
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Star className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Action Needed Notification Banner (if submissions awaiting review) */}
      {pendingEvaluations.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-6 space-y-4 shadow-sm animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-amber-950 font-black text-sm uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Deliverables Awaiting Your Rubric Grading ({pendingEvaluations.length})</span>
            </div>
            <span className="text-xs text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full font-bold border border-amber-300">
              Immediate Action
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingEvaluations.map((p) => {
              const stage = p.stages?.[p.currentStageIndex];
              if (!stage) return null;
              return (
                <div
                  key={p.id}
                  className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {p.id}
                      </span>
                      <span className="text-xs font-bold bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full border border-blue-200">
                        {stage.name} Uploaded
                      </span>
                    </div>
                    <div className="text-sm font-black text-slate-900 leading-snug line-clamp-1">
                      {p.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Batch: <strong className="font-mono text-slate-800">{p.teamMembers?.map(m => m.rollNumber).join(', ') || 'N/A'}</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Ready to score</span>
                    <button
                      onClick={() => onOpenReviewModal(stage, p)}
                      className="px-4 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 hover:scale-[1.01]"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Evaluate & Enter Marks</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Main Row: My Projects Table (Left 2/3) + Project Statistics Donut (Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): My Projects Table matching Screen 3 */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                My Projects
              </h3>
              <p className="text-xs text-slate-500">
                Supervised student batches and milestone status
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">
              {safeProjects.length} Assigned
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200/90 rounded-2xl shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Project Title</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Next Review</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeProjects.map((p) => {
                  const activeStage = p.stages?.[p.currentStageIndex] || p.stages?.[0];
                  const isSubmitted = activeStage?.status === 'submitted';

                  let statusBadge = (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      In Progress
                    </span>
                  );

                  if (isSubmitted) {
                    statusBadge = (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                        Review Pending
                      </span>
                    );
                  } else if (p.status === 'Completed') {
                    statusBadge = (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completed
                      </span>
                    );
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 max-w-xs">
                        <div
                          onClick={() => onSelectProject(p)}
                          className="font-black text-slate-900 hover:text-brand-600 cursor-pointer truncate"
                        >
                          {p.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.id} • {p.type}</div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-600">
                        {p.teamMembers?.length || 0} Members
                      </td>
                      <td className="px-4 py-3.5">
                        {statusBadge}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                        {activeStage?.name || '10 Nov 2026'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isSubmitted && (
                            <button
                              onClick={() => onOpenReviewModal(activeStage, p)}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
                            >
                              Grade
                            </button>
                          )}
                          <button
                            onClick={() => onSelectProject(p)}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {safeProjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No project batches assigned yet. Department Coordinator will allocate batches to you shortly.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1/3): Project Statistics Gauge matching Screen 3 */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Project Statistics
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervised batch milestone health
            </p>
          </div>

          {/* Donut Chart Visual Graphic matching Screen 3 */}
          <div className="py-2 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray="70, 100"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-500"
                  strokeDasharray="20, 100"
                  strokeDashoffset="-70"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black font-mono text-slate-900 block leading-none">
                  70%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  On Schedule
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>On Track</span>
              </span>
              <span className="font-mono font-bold text-slate-800">70%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>At Risk / Revisions</span>
              </span>
              <span className="font-mono font-bold text-slate-800">20%</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Delayed Uploads</span>
              </span>
              <span className="font-mono font-bold text-slate-800">10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
