import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  UserCheck,
  UserCog,
  ArrowRightLeft,
  Award,
  AlertCircle,
  CheckCircle2,
  X,
  Users,
  Layers,
  History,
  RotateCcw
} from 'lucide-react';

export default function AssignGuideModal({
  isOpen,
  onClose,
  project,
  onGuideAssigned
}) {
  const [guides, setGuides] = useState([]);
  const [selectedGuideId, setSelectedGuideId] = useState('');
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadGuides();
      setSelectedGuideId(project?.guideId || '');
      setError('');
    }
  }, [isOpen, project]);

  const loadGuides = async () => {
    setLoadingGuides(true);
    try {
      const data = await api.getGuides();
      setGuides(data);
    } catch (err) {
      setError('Failed to fetch faculty guides list: ' + err.message);
    } finally {
      setLoadingGuides(false);
    }
  };

  if (!isOpen || !project) return null;

  const currentGuide = guides.find(g => g.id === project.guideId) || {
    id: project.guideId,
    name: project.guideName,
    designation: project.guideDesignation,
    email: project.guideEmail
  };

  const selectedGuide = guides.find(g => g.id === selectedGuideId);
  const isChanged = selectedGuideId && selectedGuideId !== project.guideId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGuideId) {
      setError('Please select a faculty guide from the dropdown.');
      return;
    }

    if (selectedGuideId === project.guideId) {
      setError('Selected faculty guide is already assigned to this project.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.assignGuide(project.id, selectedGuideId);
      if (onGuideAssigned) {
        onGuideAssigned(res.project);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reassign faculty guide.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              <UserCog className="w-3.5 h-3.5 text-indigo-300" />
              <span>COORDINATOR SUPERVISORY ACTION</span>
            </span>
            <span className="text-xs text-slate-300 font-mono">{project.id}</span>
          </div>

          <h3 className="text-xl font-black tracking-tight text-white">
            {project.guideId ? 'Reassign Faculty Guide' : 'Allocate Faculty Guide'}
          </h3>
          <p className="text-xs text-indigo-200/90 mt-1">
            {project.guideId
              ? 'Allocate or transfer project supervision to another CSE faculty guide.'
              : 'Review technical domain and allocate an official faculty guide to this newly registered batch.'}
          </p>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Project Summary Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-xs font-black text-slate-800 line-clamp-1">
              {project.title}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>{project.type}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Batch: {project.teamMembers?.map(m => m.rollNumber).join(', ') || 'N/A'}</span>
              </span>
            </div>
          </div>

          {/* Guide Comparison Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            {/* Current Guide */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {project.guideId ? 'Current Assigned Guide' : 'Current Status'}
              </span>
              <div className={`font-extrabold text-xs truncate ${project.guideId ? 'text-slate-900' : 'text-amber-700'}`}>
                {project.guideId ? currentGuide.name : 'Awaiting Allocation'}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {project.guideId ? (currentGuide.designation || 'Faculty Member') : 'Newly registered batch'}
              </div>
            </div>

            {/* Target Selected Guide */}
            <div className={`p-3.5 rounded-2xl border transition-colors ${
              isChanged ? 'bg-indigo-50/70 border-indigo-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                New Assigned Guide
              </span>
              <div className="font-extrabold text-xs text-indigo-950 truncate">
                {isChanged && selectedGuide ? selectedGuide.name : 'Select below'}
              </div>
              <div className="text-[11px] text-indigo-700/80 truncate">
                {isChanged && selectedGuide ? (selectedGuide.designation || selectedGuide.specialization) : 'No change selected'}
              </div>
            </div>
          </div>

          {/* Guide Dropdown Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Select New Faculty Guide <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedGuideId}
              onChange={(e) => setSelectedGuideId(e.target.value)}
              disabled={loadingGuides || submitting}
              className="w-full px-4 py-3 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-slate-800 shadow-2xs"
            >
              <option value="">-- Choose Faculty Guide --</option>
              {guides.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} — {g.designation} ({g.specialization || 'CSE'})
                  {g.id === project.guideId ? ' (Currently Assigned)' : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400">
              Only department faculty guides registered in the academic roster can be selected.
            </p>
          </div>

          {/* Reassignment Audit History if any */}
          {project.reassignmentHistory && project.reassignmentHistory.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/90 text-xs space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>Reassignment Audit History</span>
              </span>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {project.reassignmentHistory.map((h, idx) => (
                  <div key={idx} className="text-[11px] text-slate-600 flex items-center justify-between">
                    <span>
                      Changed from <strong className="text-slate-800">{h.previousGuideName}</strong> to <strong className="text-indigo-700">{h.newGuideName}</strong>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(h.reassignedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Policy Banner (Conditional for initial allocation vs reassignment) */}
          {project.guideId ? (
            <div className="p-3.5 bg-amber-50/90 border-2 border-amber-300 rounded-2xl text-xs text-amber-950 space-y-1">
              <div className="font-black flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-amber-900">
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Academic Evaluation Policy: Progress Resets to Zero</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900">
                Because each faculty guide maintains different evaluation rubrics and expectations, reassigning the guide will <strong>reset the project back to Stage 1 (Synopsis) with 0 marks</strong>. The student batch will submit deliverables to the new guide for fresh evaluation from the start.
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 space-y-1">
              <div className="font-black flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-blue-900">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span>Initial Faculty Supervisor Allocation</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-900">
                Assigning this faculty guide will officially approve the batch proposal and unlock <strong>Stage 1 (Synopsis)</strong> so the students can upload their initial proposal slides.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !isChanged}
              className={`px-5 py-2.5 text-xs font-black rounded-xl text-white shadow-sm flex items-center gap-2 transition-all ${
                isChanged && !submitting
                  ? 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01]'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Saving...'
                  : project.guideId
                  ? 'Reassign & Reset to Stage 1'
                  : 'Confirm Guide Allocation'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

