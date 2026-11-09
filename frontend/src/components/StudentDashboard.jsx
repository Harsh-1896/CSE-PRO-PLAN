import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Upload,
  ArrowRight,
  Trophy,
  Sparkles,
  FileText,
  AlertTriangle,
  Award,
  Users,
  Layers,
  GraduationCap,
  FolderPlus,
  Send
} from 'lucide-react';

export default function StudentDashboard({
  projects = [],
  onOpenRegisterModal,
  onSelectProject,
  onOpenUploadModal
}) {
  const { user } = useAuth();
  const safeProjects = Array.isArray(projects) ? projects : [];
  const primaryProject = safeProjects[0];

  const activeStage = primaryProject
    ? (primaryProject.stages?.[primaryProject.currentStageIndex] || primaryProject.stages?.[0])
    : null;

  const isRevisionNeeded = activeStage?.status === 'changes_requested';
  const hasGuide = Boolean(primaryProject?.guideId && primaryProject.status !== 'Awaiting Guide Allocation');
  const canUploadNow = hasGuide && (activeStage?.status === 'pending_submission' || isRevisionNeeded);

  // Compute stats
  const activeCount = safeProjects.length;
  const stagesDone = primaryProject?.overallMarks?.stagesCompleted || 0;
  const overallPercentage = primaryProject?.overallMarks?.percentage || 0;
  const pendingActions = isRevisionNeeded ? 1 : canUploadNow ? 1 : !hasGuide ? 1 : 0;

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting & Current Semester */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Hello, {user?.name || 'Riya'}!</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Here's your project overview, sequential milestones, and evaluation status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-brand-500" />
            <span>Current Semester: Sem 7</span>
          </div>

          <button
            onClick={onOpenRegisterModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-[1.02]"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Proposal</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric KPI Cards matching Template Screen 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: My Projects */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              My Projects
            </span>
            <div className="text-3xl font-black font-mono text-slate-900">
              {activeCount}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Active Projects
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <FolderKanban className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Pending Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Pending Tasks
            </span>
            <div className="text-3xl font-black font-mono text-amber-600">
              {pendingActions}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              {pendingActions === 0 ? 'All caught up' : 'Actions Required'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Submitted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Submitted
            </span>
            <div className="text-3xl font-black font-mono text-emerald-600">
              {stagesDone}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Stages Approved
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Overall Progress (Radial circular gauge) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Overall Progress
            </span>
            <div className="text-3xl font-black font-mono text-brand-600">
              {overallPercentage}%
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Curriculum Target
            </span>
          </div>

          {/* Radial progress ring illustration */}
          <div className="relative w-13 h-13 flex items-center justify-center">
            <svg className="w-13 h-13 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-brand-500 transition-all duration-700"
                strokeDasharray={`${overallPercentage || 5}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-black font-mono text-brand-700">
              {overallPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Layout (Split: Left 2/3, Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Project Progress Stepper, Recent Updates, Registered Batch */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: My Project Progress Stepper */}
          {primaryProject && (
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    My Project Progress
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {primaryProject.title}
                  </p>
                </div>
                <button
                  onClick={() => onSelectProject(primaryProject)}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Connected Stepper Timeline matching template */}
              <div className="py-2">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 relative">
                  {primaryProject.stages?.map((stg, sIdx) => {
                    const isApproved = stg.status === 'approved';
                    const isCurrent = primaryProject.currentStageIndex === sIdx;
                    const isLocked = !stg.unlocked;

                    let circleStyle = 'bg-slate-100 text-slate-400 border-slate-200';
                    let label = stg.name;
                    let sublabel = 'Locked';

                    if (isApproved) {
                      circleStyle = 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/25';
                      sublabel = 'Approved';
                    } else if (isCurrent) {
                      circleStyle = 'bg-brand-500 text-white border-brand-500 shadow-sm shadow-brand-500/25 animate-pulse';
                      sublabel = stg.status === 'submitted' ? 'In Review' : isRevisionNeeded ? 'Revisions' : 'Current';
                    }

                    return (
                      <div
                        key={stg.id}
                        onClick={() => onSelectProject(primaryProject)}
                        className="flex flex-col items-center text-center p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-xs mb-2 transition-transform group-hover:scale-105 ${circleStyle}`}>
                          {isApproved ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            <span>{sIdx + 1}</span>
                          )}
                        </div>
                        <div className="font-extrabold text-xs text-slate-900 leading-tight">
                          {label}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {sublabel}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Card: Recent Updates matching Template */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Recent Updates
              </h3>
              <button
                onClick={() => primaryProject && onSelectProject(primaryProject)}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {stagesDone > 0 ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">
                        Synopsis approved by {primaryProject?.guideName || 'Supervisor'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Score awarded: {primaryProject?.stages?.[0]?.review?.marks?.total || 25} marks
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">Recently</span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center border border-blue-200 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">
                        Stage 1: Synopsis Submission Open
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Prepare problem statement and architecture slides
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">Active</span>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">
                      Review 1 PPT Presentation Scheduled
                    </div>
                    <div className="text-[11px] text-slate-500">
                      SRS documentation and architecture review
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-400">Term Date</span>
              </div>
            </div>
          </div>

          {/* Registered Project Batch Card */}
          {primaryProject && (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                    {primaryProject.id}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                    {primaryProject.type}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {primaryProject.domain}
                  </span>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 text-white font-mono">
                  {primaryProject.status}
                </span>
              </div>

              <div>
                <h4
                  onClick={() => onSelectProject(primaryProject)}
                  className="text-lg font-black text-slate-900 hover:text-brand-600 cursor-pointer transition-colors"
                >
                  {primaryProject.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {primaryProject.description}
                </p>
              </div>

              {/* Team Members & Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Batch Teammates ({primaryProject.teamMembers?.length || 0})
                  </span>
                  <div className="font-mono text-xs font-bold text-slate-800">
                    {primaryProject.teamMembers?.map(m => m.rollNumber).join(', ')}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Faculty Supervisor
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    {primaryProject.guideName || 'Awaiting Allocation'}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Current Score: <strong className="font-mono text-slate-900">{primaryProject.overallMarks?.obtained ?? 0} / 200</strong>
                </span>

                <div className="flex items-center gap-2">
                  {canUploadNow && (
                    <button
                      onClick={() => onOpenUploadModal(activeStage, primaryProject)}
                      className="px-4 py-2 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload {activeStage?.name}</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectProject(primaryProject)}
                    className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1 border border-slate-200"
                  >
                    <span>Open Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1/3): Quick Actions & Motivation Trophy Banner */}
        <div className="space-y-6">
          {/* Quick Actions Card matching Template */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Quick Actions
            </h3>

            <div className="space-y-2">
              <button
                onClick={onOpenRegisterModal}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200/80 hover:border-brand-300 text-xs font-bold text-slate-800 hover:text-brand-700 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <FolderPlus className="w-4 h-4 text-brand-500" />
                  <span>Submit Proposal</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => {
                  if (primaryProject && activeStage) onOpenUploadModal(activeStage, primaryProject);
                }}
                disabled={!canUploadNow}
                className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all group ${
                  canUploadNow
                    ? 'bg-slate-50 hover:bg-brand-50 border-slate-200/80 hover:border-brand-300 text-slate-800 hover:text-brand-700'
                    : 'bg-slate-100/50 border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Upload className="w-4 h-4 text-emerald-500" />
                  <span>Upload Documents</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => primaryProject && onSelectProject(primaryProject)}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200/80 hover:border-brand-300 text-xs font-bold text-slate-800 hover:text-brand-700 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>View My Project</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Motivation Trophy Card matching Template */}
          <div className="bg-gradient-to-br from-amber-400/10 via-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-6 text-center space-y-3 relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center mx-auto shadow-md shadow-amber-400/30">
              <Trophy className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900 tracking-tight">
                Aim for Excellence
              </h4>
              <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                Build Innovative Solutions! Target distinction marks with comprehensive documentation and code defense.
              </p>
            </div>

            <button
              onClick={() => primaryProject && onSelectProject(primaryProject)}
              className="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center mx-auto shadow-sm shadow-brand-500/25 transition-transform hover:scale-105"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
