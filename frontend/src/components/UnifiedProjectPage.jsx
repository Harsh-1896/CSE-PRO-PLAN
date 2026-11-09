import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Upload,
  ExternalLink,
  Award,
  Users,
  Calendar,
  Github,
  Printer,
  ChevronRight,
  Clock,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  FileCheck,
  History,
  FileUp,
  Sliders,
  CheckCircle,
  FileCode,
  Share2,
  ArrowRightLeft,
  ArrowLeft,
  Download,
  FolderOpen,
  Cpu
} from 'lucide-react';

export default function UnifiedProjectPage({
  project,
  onOpenUploadModal,
  onOpenReviewModal,
  onOpenAssignGuideModal,
  onProjectUpdated,
  onBack
}) {
  const { user, role } = useAuth();
  const [selectedStageIndex, setSelectedStageIndex] = useState(
    project.currentStageIndex !== undefined ? project.currentStageIndex : 0
  );
  // Tabs: 'overview' | 'reviews' | 'documents' | 'evaluation'
  const [activeTab, setActiveTab] = useState('overview');

  const selectedStage = project.stages[selectedStageIndex];
  
  const isStudent = role === 'student';
  const isCoordinator = role === 'coordinator';
  const isMyGuide = project.guideId === user?.id;
  
  // Student ownership check
  const isMyProject =
    isStudent && (
      project.createdBy === user?.id ||
      (project.teamMembers && project.teamMembers.some(m => m.rollNumber === user?.rollNumber))
    );

  // STRICT RULES:
  // 1. Only students can upload/re-upload files for their project
  // 2. Guides and Coordinators evaluate/grade rubrics
  const canUploadCurrent =
    isStudent &&
    isMyProject &&
    selectedStage.unlocked &&
    (selectedStage.status === 'pending_submission' || selectedStage.status === 'changes_requested');

  const canReviewCurrent =
    (isMyGuide || isCoordinator) &&
    !!selectedStage.submission &&
    (selectedStage.status === 'submitted' || selectedStage.status === 'changes_requested');

  // Stage status metadata styling
  const stageMeta = {
    approved: {
      label: 'Approved',
      sublabel: 'Milestone Completed',
      pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold',
      badgeClass: 'bg-emerald-600 text-white shadow-emerald-500/20',
      borderClass: 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-400',
      stepNumClass: 'bg-emerald-600 text-white',
      lineClass: 'bg-emerald-500',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />
    },
    changes_requested: {
      label: 'Changes Requested',
      sublabel: 'Revision Needed',
      pillClass: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
      badgeClass: 'bg-amber-500 text-white shadow-amber-500/20',
      borderClass: 'border-amber-300 bg-amber-50/30 hover:border-amber-400',
      stepNumClass: 'bg-amber-500 text-white animate-pulse',
      lineClass: 'bg-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />
    },
    submitted: {
      label: 'Under Guide Review',
      sublabel: 'Awaiting Grading',
      pillClass: 'bg-blue-50 text-blue-800 border-blue-300 font-bold',
      badgeClass: 'bg-blue-600 text-white shadow-blue-500/20',
      borderClass: 'border-blue-300 bg-blue-50/20 hover:border-blue-400',
      stepNumClass: 'bg-blue-600 text-white animate-pulse',
      lineClass: 'bg-blue-300',
      icon: <Clock className="w-5 h-5 text-blue-600" />
    },
    pending_submission: {
      label: 'Ready for Upload',
      sublabel: 'Current Milestone',
      pillClass: 'bg-purple-50 text-purple-800 border-purple-300 font-bold',
      badgeClass: 'bg-purple-600 text-white shadow-purple-500/20',
      borderClass: 'border-purple-300 bg-purple-50/20 hover:border-purple-400',
      stepNumClass: 'bg-purple-600 text-white',
      lineClass: 'bg-slate-200',
      icon: <Upload className="w-5 h-5 text-purple-600" />
    },
    locked: {
      label: 'Locked',
      sublabel: 'Sequential Gate',
      pillClass: 'bg-slate-100 text-slate-500 border-slate-200',
      badgeClass: 'bg-slate-300 text-slate-600',
      borderClass: 'border-slate-200 bg-slate-50/60 opacity-70 hover:opacity-100',
      stepNumClass: 'bg-slate-200 text-slate-400',
      lineClass: 'bg-slate-200',
      icon: <Lock className="w-4 h-4 text-slate-400" />
    }
  };

  // Dynamic Action Banner message based on project state & active role
  const getActionBanner = () => {
    if (selectedStage.status === 'changes_requested') {
      return {
        type: 'warning',
        bg: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-950',
        icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
        title: `Revisions Requested on ${selectedStage.name}`,
        desc: `Guide ${project.guideName} requested changes: "${selectedStage.review?.comments || 'Please revise your deliverables.'}"`,
        actionText: isStudent && isMyProject ? 'Upload Revised File Now' : null,
        onAction: () => onOpenUploadModal(selectedStage)
      };
    }
    if (selectedStage.status === 'submitted') {
      return {
        type: 'info',
        bg: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 text-blue-950',
        icon: <Clock className="w-5 h-5 text-blue-600 shrink-0" />,
        title: `${selectedStage.name} Submitted — Awaiting Evaluation`,
        desc: `The student team has uploaded deliverables. Guide ${project.guideName} or Coordinator can inspect deliverables and score rubric criteria.`,
        actionText: isMyGuide || isCoordinator ? 'Grade Rubric & Approve' : null,
        onAction: () => onOpenReviewModal(selectedStage)
      };
    }
    if (selectedStage.status === 'pending_submission') {
      return {
        type: 'action',
        bg: 'bg-gradient-to-r from-purple-50 to-brand-50 border-purple-300 text-purple-950',
        icon: <Upload className="w-5 h-5 text-purple-600 shrink-0" />,
        title: `Next Milestone: Upload ${selectedStage.name}`,
        desc: `This stage is currently unlocked. The student team must upload their deliverable to initiate guide review.`,
        actionText: isStudent && isMyProject ? `Upload ${selectedStage.name} Deliverables` : null,
        onAction: () => onOpenUploadModal(selectedStage)
      };
    }
    if (selectedStage.status === 'approved') {
      return {
        type: 'success',
        bg: 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 text-emerald-950',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
        title: `${selectedStage.name} Approved & Graded`,
        desc: `Scored ${selectedStage.review?.marks?.total || 0} / ${selectedStage.review?.marks?.maxTotal || 0} marks. Review feedback: "${selectedStage.review?.comments || 'Approved'}"`,
        actionText: null,
        onAction: null
      };
    }
    return null;
  };

  const actionBanner = getActionBanner();

  // All submitted documents across 5 stages
  const allDocuments = project.stages
    .filter(s => s.submission)
    .map(s => ({
      stageId: s.id,
      stageName: s.name,
      fileName: s.submission.fileName,
      fileSize: s.submission.fileSize,
      fileUrl: s.submission.fileUrl,
      submittedAt: s.submission.submittedAt,
      submittedBy: s.submission.submittedBy,
      notes: s.submission.notes,
      version: s.submission.version,
      externalDoc: s.submission.links?.externalDoc
    }));

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER (Screen 6): Back Button + Title + Download Report & View Repository */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Back</span>
            </button>
          )}
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Project Details
          </h2>
        </div>

        <div className="flex items-center gap-3 no-print">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-all hover:shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download Report</span>
          </button>

          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-sm shadow-brand-500/25 transition-all"
            >
              <Github className="w-4 h-4" />
              <span>View Repository</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed"
            >
              <Github className="w-4 h-4" />
              <span>No Repository URL</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SPLIT HERO CARDS (Screen 6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Hero Card (65% width = 8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 flex flex-col md:flex-row items-start gap-6 relative overflow-hidden">
          {/* Subtle background gradient glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-brand-50/70 to-indigo-50/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>

          {/* AI / Cyber Glowing Badge from Screen 6 */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-sky-400 via-brand-600 to-indigo-700 p-0.5 shadow-lg shadow-brand-500/20 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/80 backdrop-blur-md rounded-[14px] flex flex-col items-center justify-center text-center p-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-radial from-brand-500/30 via-transparent to-transparent opacity-70"></div>
              <Cpu className="w-7 h-7 text-sky-300 mb-1 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
              <span className="font-mono text-xs font-black tracking-widest text-sky-200">
                AI • ML
              </span>
            </div>
          </div>

          {/* Project Overview Details */}
          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                {project.title}
              </h1>
              <span
                className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                  project.status === 'Approved' || project.overallMarks.stagesCompleted === 5
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : project.status === 'Awaiting Guide Allocation'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {project.status === 'Approved' ? 'Approved' : project.status}
              </span>
            </div>

            {/* Metadata Table Rows from Screen 6 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs pt-1">
              <div>
                <span className="font-semibold text-slate-400 block text-[11px]">Team Members</span>
                <span className="font-bold text-slate-800">
                  {project.teamMembers.map(m => m.name).join(', ')}
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-400 block text-[11px]">Guide</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{project.guideName}</span>
                  {isCoordinator && onOpenAssignGuideModal && (
                    <button
                      onClick={() => onOpenAssignGuideModal(project)}
                      className="text-[10px] font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-2 py-0.5 rounded border border-brand-200 transition-colors"
                      title="Reassign or change guide"
                    >
                      Change
                    </button>
                  )}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-400 block text-[11px]">Domain</span>
                <span className="font-bold text-slate-800">{project.domain}</span>
              </div>

              <div>
                <span className="font-semibold text-slate-400 block text-[11px]">Submitted On</span>
                <span className="font-bold text-slate-800">
                  {new Date(project.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Hero Card: Project Passport (35% width = 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Project Passport
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Project ID</span>
                <span className="font-mono font-bold text-slate-800">{project.id}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Batch</span>
                <span className="font-bold text-slate-800">{project.academicYear || '2025-2026'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Status</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>{project.status}</span>
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400 font-semibold">Final Score</span>
                <span className="font-mono font-black text-base text-slate-900">
                  {project.overallMarks.obtained} / {project.overallMarks.totalPossible}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('reviews')}
            className="mt-5 w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-500/25 flex items-center justify-center gap-2"
          >
            <span>View Full History</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. DYNAMIC ACTION BANNER (if changes requested or pending review) */}
      {actionBanner && (
        <div className={`p-4 sm:p-5 rounded-2xl border ${actionBanner.bg} shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in slide-in-from-top-1`}>
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-white/80 rounded-xl shadow-2xs">
              {actionBanner.icon}
            </div>
            <div>
              <div className="font-black text-xs sm:text-sm tracking-tight">{actionBanner.title}</div>
              <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{actionBanner.desc}</p>
            </div>
          </div>

          {actionBanner.actionText && (
            <button
              onClick={actionBanner.onAction}
              className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 self-start sm:self-auto"
            >
              <span>{actionBanner.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 4. MAIN TABS STRIP (Overview | Reviews | Documents | Evaluation) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="flex items-center border-b border-slate-200 px-6 gap-8 text-xs font-bold bg-white">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-brand-500 text-brand-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-brand-500 text-brand-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Reviews</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`py-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'documents'
                ? 'border-brand-500 text-brand-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Documents ({allDocuments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('evaluation')}
            className={`py-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'evaluation'
                ? 'border-brand-500 text-brand-600 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Evaluation</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="p-6 sm:p-7 space-y-7">
            {/* Abstract Section from Screen 6 */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                Project Abstract & Scope
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {project.description || 'No detailed project abstract provided.'}
              </p>

              {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Tech Stack:
                  </span>
                  {project.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md bg-white text-slate-800 border border-slate-200 shadow-2xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 5-Stage Stepper Bar */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Stage-Wise Milestone Pipeline
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Strict chronological gating: Each phase unseals only after formal approval.
                  </p>
                </div>
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                  Phase {selectedStageIndex + 1} of 5
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {project.stages.map((stage, idx) => {
                  const meta = stageMeta[stage.status] || stageMeta.locked;
                  const isSelected = selectedStageIndex === idx;

                  return (
                    <button
                      key={stage.id}
                      onClick={() => setSelectedStageIndex(idx)}
                      className={`text-left p-3.5 rounded-2xl border transition-all relative ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/20 ring-2 ring-brand-500/20 shadow-xs'
                          : meta.borderClass
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center ${meta.stepNumClass}`}
                        >
                          0{idx + 1}
                        </span>
                        {meta.icon}
                      </div>

                      <div className="font-bold text-xs text-slate-900 truncate">
                        {stage.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {meta.sublabel}
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className={`px-1.5 py-0.2 rounded font-bold ${meta.pillClass}`}>
                          {meta.label}
                        </span>
                        <span className="font-mono text-slate-500 font-bold">
                          {stage.review?.marks ? `${stage.review.marks.total}m` : 'Locked'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Stage Detail Card */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 text-xs font-black flex items-center justify-center">
                      0{selectedStage.order}
                    </span>
                    <h3 className="font-black text-base text-slate-900">{selectedStage.name} Details</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${stageMeta[selectedStage.status]?.pillClass}`}>
                      {stageMeta[selectedStage.status]?.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{selectedStage.description}</p>
                </div>

                {/* Contextual Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {canUploadCurrent && (
                    <button
                      onClick={() => onOpenUploadModal(selectedStage)}
                      className="px-4 py-2 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-sm shadow-brand-500/25 transition-all flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {selectedStage.status === 'changes_requested'
                          ? 'Upload Revised File'
                          : 'Upload Deliverables'}
                      </span>
                    </button>
                  )}

                  {canReviewCurrent && (
                    <button
                      onClick={() => onOpenReviewModal(selectedStage)}
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Grade Rubric Criteria</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Stage Content: Uploaded file or lock notice */}
              {!selectedStage.unlocked ? (
                <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center max-w-md mx-auto">
                  <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <h5 className="font-bold text-slate-800 text-sm">Stage Locked by Sequential Gate</h5>
                  <p className="text-xs text-slate-500 mt-1">
                    Unlocks automatically when Stage {selectedStage.order - 1} is approved by {project.guideName}.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Left: Student Submission */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-black text-slate-700 uppercase tracking-wider">
                      <span>Submitted Stage Artifact</span>
                      {selectedStage.submission && (
                        <span className="text-[10px] font-mono text-slate-400 lowercase">
                          v{selectedStage.submission.version} • {new Date(selectedStage.submission.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {selectedStage.submission ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 truncate">
                            <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600 shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="truncate">
                              <div className="font-bold text-xs text-slate-900 truncate">
                                {selectedStage.submission.fileName}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {selectedStage.submission.fileSize} • {selectedStage.submission.submittedBy}
                              </div>
                            </div>
                          </div>

                          <a
                            href={selectedStage.submission.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-colors shrink-0"
                          >
                            <span>Inspect File</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        {selectedStage.submission.notes && (
                          <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                            <span className="font-bold text-slate-700 block mb-1">Student Deliverables Notes:</span>
                            <p className="text-slate-600">{selectedStage.submission.notes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-xs">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                        <p className="font-bold text-slate-800">No deliverables uploaded yet</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Student team must upload their deliverable for guide review.
                        </p>
                        {canUploadCurrent && (
                          <button
                            onClick={() => onOpenUploadModal(selectedStage)}
                            className="mt-3 px-3.5 py-1.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors"
                          >
                            Upload File Now
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Faculty Guide Review */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-black text-slate-700 uppercase tracking-wider">
                      <span>Faculty Guide Evaluation & Rubric</span>
                      {selectedStage.review && (
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Evaluated by {selectedStage.review.reviewedBy}
                        </span>
                      )}
                    </div>

                    {selectedStage.review ? (
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              selectedStage.review.decision === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {selectedStage.review.decision === 'approved' ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {selectedStage.review.decision === 'approved' ? 'Approved' : 'Changes Requested'}
                            </span>
                          </span>

                          <span className="font-mono text-sm font-black text-indigo-700">
                            {selectedStage.review.marks?.total} / {selectedStage.review.marks?.maxTotal}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                          <span className="font-bold text-slate-700 block mb-0.5">Official Guide Remark:</span>
                          <p className="text-slate-600 italic">"{selectedStage.review.comments}"</p>
                        </div>

                        {selectedStage.review.marks?.criteria && (
                          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                            <table className="w-full text-left">
                              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                                <tr>
                                  <th className="p-2">Criteria</th>
                                  <th className="p-2 text-center w-16">Max</th>
                                  <th className="p-2 text-right w-16">Awarded</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {selectedStage.review.marks.criteria.map((c, i) => (
                                  <tr key={i}>
                                    <td className="p-2 font-medium text-slate-800">{c.name}</td>
                                    <td className="p-2 text-center font-mono text-slate-400">{c.maxMarks}</td>
                                    <td className="p-2 text-right font-mono font-bold text-indigo-600">
                                      {c.awardedMarks}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
                        <Award className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                        <p className="font-bold text-slate-700">
                          {selectedStage.submission ? 'Deliverable Under Review' : 'Awaiting Student Deliverables'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {selectedStage.submission
                            ? 'Faculty guide or coordinator can evaluate submission and grade rubric marks.'
                            : 'Marks and rubric breakdown will appear here once graded.'}
                        </p>
                        {canReviewCurrent && (
                          <button
                            onClick={() => onOpenReviewModal(selectedStage)}
                            className="mt-3 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                          >
                            Grade Rubric Now
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Chronological Evaluation & Review Ledger
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed evaluation remarks and rubric scoring across all project milestones.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {project.stages.map((stg, idx) => (
                <div
                  key={stg.id}
                  className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        Phase 0{idx + 1}
                      </span>
                      <span className="font-black text-xs text-slate-900">{stg.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${stageMeta[stg.status]?.pillClass}`}>
                        {stageMeta[stg.status]?.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 italic">
                      {stg.review?.comments ? `"${stg.review.comments}"` : 'No evaluation remarks recorded yet.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Score</span>
                      <span className="font-mono font-black text-sm text-indigo-700">
                        {stg.review?.marks ? `${stg.review.marks.total} / ${stg.review.marks.maxTotal}` : '-'}
                      </span>
                    </div>

                    {stg.submission && (isMyGuide || isCoordinator) && (
                      <button
                        onClick={() => {
                          setSelectedStageIndex(idx);
                          onOpenReviewModal(stg);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors"
                      >
                        {stg.review ? 'Update Grade' : 'Grade Rubric'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Project Document Repository
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  All submitted stage artifacts, synopses, and slide decks in one central ledger.
                </p>
              </div>
            </div>

            {allDocuments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No Documents Uploaded Yet</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Deliverables uploaded by the student team across all 5 stages will be collected here.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Stage</th>
                      <th className="p-3">Document File</th>
                      <th className="p-3">Uploaded By</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allDocuments.map((doc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{doc.stageName}</td>
                        <td className="p-3 font-medium text-slate-700 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-brand-500" />
                          <span>{doc.fileName}</span>
                          <span className="text-[10px] text-slate-400">({doc.fileSize})</span>
                        </td>
                        <td className="p-3 text-slate-600">{doc.submittedBy}</td>
                        <td className="p-3 text-slate-500">
                          {new Date(doc.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">
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
            )}
          </div>
        )}

        {/* TAB 4: EVALUATION (Consolidated Marksheet) */}
        {activeTab === 'evaluation' && (
          <div className="p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Consolidated 5-Stage Department Marksheet
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete evaluation summary across all project milestones
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Grand Total</span>
                <span className="text-xl font-black font-mono text-slate-900">
                  {project.overallMarks.obtained} / {project.overallMarks.totalPossible}
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5">Milestone</th>
                    <th className="px-4 py-3.5">Deliverable Details</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-center">Max Marks</th>
                    <th className="px-4 py-3.5 text-right">Awarded</th>
                    <th className="px-4 py-3.5">Faculty Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.stages.map((stg, idx) => (
                    <tr key={stg.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-bold font-mono text-slate-900">Phase 0{idx + 1}</td>
                      <td className="px-4 py-3.5 font-black text-slate-800">{stg.name}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${stageMeta[stg.status]?.pillClass}`}>
                          {stageMeta[stg.status]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono text-slate-500 font-semibold">
                        {stg.review?.marks ? stg.review.marks.maxTotal : idx < 2 ? 30 : idx < 4 ? 40 : 60}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-black text-indigo-700 text-sm">
                        {stg.review?.marks ? stg.review.marks.total : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 italic max-w-xs truncate">
                        {stg.review?.comments || (stg.unlocked ? 'Pending evaluation' : 'Locked')}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100/70 font-bold border-t-2 border-slate-300">
                    <td colSpan={3} className="px-4 py-3.5 text-slate-900 font-black uppercase text-xs">
                      Consolidated Cumulative Degree Score
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-slate-700 font-bold">
                      {project.overallMarks.totalPossible}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-base font-black text-brand-700">
                      {project.overallMarks.obtained}
                    </td>
                    <td className="px-4 py-3.5 text-brand-800 font-black">
                      {project.overallMarks.percentage}% • {project.overallMarks.grade}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
