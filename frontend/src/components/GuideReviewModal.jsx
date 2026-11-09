import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  Calculator,
  Award,
  MessageSquare,
  Sparkles,
  Sliders,
  Check,
  Zap,
  Info
} from 'lucide-react';

export default function GuideReviewModal({ isOpen, onClose, project, stage, onReviewCompleted }) {
  const [rubrics, setRubrics] = useState(null);
  const [criteriaMarks, setCriteriaMarks] = useState([]);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && stage) {
      loadRubric();
      if (stage.review) {
        setComments(stage.review.comments || '');
      } else {
        setComments('');
      }
    }
  }, [isOpen, stage]);

  const loadRubric = async () => {
    try {
      const allRubrics = await api.getRubrics();
      const stageRubric = allRubrics[stage.id];
      setRubrics(stageRubric);

      if (stageRubric) {
        const existingMarks = stage.review?.marks?.criteria || [];
        const initial = stageRubric.criteria.map((c) => {
          const match = existingMarks.find(m => m.id === c.id);
          return {
            id: c.id,
            name: c.name,
            maxMarks: c.maxMarks,
            description: c.description,
            awardedMarks: match ? match.awardedMarks : Math.round(c.maxMarks * 0.85 * 10) / 10
          };
        });
        setCriteriaMarks(initial);
      }
    } catch (err) {
      console.error('Error fetching rubrics:', err);
    }
  };

  const handleMarkChange = (id, val) => {
    const num = parseFloat(val);
    setCriteriaMarks(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          awardedMarks: isNaN(num) ? 0 : Math.max(0, Math.min(c.maxMarks, num))
        };
      }
      return c;
    }));
  };

  // Quick Preset Setter
  const applyPresetPercentage = (pct) => {
    if (!rubrics) return;
    setCriteriaMarks(prev => prev.map(c => ({
      ...c,
      awardedMarks: Math.round(c.maxMarks * (pct / 100) * 10) / 10
    })));
  };

  // Real-time dynamic total calculation
  const totalAwarded = criteriaMarks.reduce((sum, c) => sum + (Number(c.awardedMarks) || 0), 0);
  const maxTotal = rubrics ? rubrics.maxTotal : 0;
  const percentage = maxTotal > 0 ? Math.round((totalAwarded / maxTotal) * 1000) / 10 : 0;

  let gradeBadge = 'B';
  let gradeColor = 'bg-blue-100 text-blue-800 border-blue-300';
  let barGradient = 'from-blue-600 to-indigo-600';
  if (percentage >= 90) {
    gradeBadge = 'O (Outstanding)';
    gradeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    barGradient = 'from-emerald-500 to-teal-500';
  } else if (percentage >= 80) {
    gradeBadge = 'A+ (Excellent)';
    gradeColor = 'bg-teal-100 text-teal-800 border-teal-300';
    barGradient = 'from-teal-500 to-emerald-500';
  } else if (percentage >= 70) {
    gradeBadge = 'A (Very Good)';
    gradeColor = 'bg-indigo-100 text-indigo-800 border-indigo-300';
    barGradient = 'from-indigo-500 to-blue-500';
  } else if (percentage >= 60) {
    gradeBadge = 'B+ (Good)';
    gradeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    barGradient = 'from-amber-500 to-orange-500';
  }

  const handleSubmit = async (actionType) => {
    setError('');
    if (!stage.submission) {
      setError('Cannot evaluate: The student team has not uploaded deliverables for this stage yet! A file must be uploaded before review.');
      return;
    }
    if (actionType === 'changes_requested' && !comments.trim()) {
      setError('Please provide feedback comments explaining what changes are needed before requesting revision.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        decision: actionType,
        comments: comments.trim(),
        criteriaMarks: criteriaMarks.map(c => ({
          id: c.id,
          awardedMarks: c.awardedMarks
        }))
      };

      const res = await api.reviewStage(project.id, stage.id, payload);
      onReviewCompleted(res.project);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !stage) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-800 via-indigo-700 to-brand-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-white/20 font-bold font-mono px-2 py-0.5 rounded uppercase">
                  RUBRIC EVALUATION
                </span>
                <h3 className="text-lg font-black">{stage.name}</h3>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5 truncate max-w-md">{project.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Submitted File Inspector */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Submitted Stage Deliverable</span>
              {stage.submission && (
                <span className="text-[11px] font-mono text-slate-400">
                  Version {stage.submission.version}
                </span>
              )}
            </div>

            {stage.submission ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-black text-slate-900 truncate">
                        {stage.submission.fileName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {stage.submission.fileSize} • Submitted by {stage.submission.submittedBy}
                      </div>
                    </div>
                  </div>

                  <a
                    href={stage.submission.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl border border-brand-200 transition-colors shrink-0"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {stage.submission.notes && (
                  <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800">Student Notes: </span>
                    {stage.submission.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-rose-800 bg-rose-50 p-3.5 rounded-2xl border border-rose-200 flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>
                  <strong>No file uploaded yet:</strong> A faculty guide cannot grade or approve a stage until the student team submits their deliverable file.
                </span>
              </div>
            )}
          </div>

          {/* Rubric Criteria Evaluation Card */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm space-y-4">
            {/* Dynamic Real-time Score Bar */}
            <div className="space-y-2 pb-3 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    CSE Department Rubric Criteria
                  </h4>
                </div>

                {/* Score badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-semibold">Total Score:</span>
                  <span className="text-base font-black font-mono text-indigo-950">
                    {totalAwarded.toFixed(1)} / {maxTotal}
                  </span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-md border ${gradeColor}`}>
                    {percentage}% • {gradeBadge}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full bg-gradient-to-r ${barGradient} rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>

              {/* Quick Fill Presets */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>Quick Presets:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPresetPercentage(92)}
                    className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
                  >
                    Outstanding (92%)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetPercentage(82)}
                    className="px-2 py-0.5 text-[10px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200"
                  >
                    Excellent (82%)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetPercentage(72)}
                    className="px-2 py-0.5 text-[10px] font-bold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200"
                  >
                    Very Good (72%)
                  </button>
                </div>
              </div>
            </div>

            {/* Criteria List */}
            <div className="space-y-3">
              {criteriaMarks.map((crit) => {
                const critPct = Math.round((crit.awardedMarks / crit.maxMarks) * 100);

                return (
                  <div
                    key={crit.id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{crit.name}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-mono font-bold px-1.5 py-0.5 rounded">
                          Max: {crit.maxMarks}
                        </span>
                      </div>
                      {crit.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{crit.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <input
                        type="range"
                        min="0"
                        max={crit.maxMarks}
                        step="0.5"
                        value={crit.awardedMarks}
                        onChange={(e) => handleMarkChange(crit.id, e.target.value)}
                        className="w-24 sm:w-32 accent-indigo-600 cursor-pointer"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={crit.maxMarks}
                          value={crit.awardedMarks}
                          onChange={(e) => handleMarkChange(crit.id, e.target.value)}
                          className="w-16 px-2 py-1 text-xs font-mono font-black text-right border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-bold text-slate-400">/{crit.maxMarks}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guide Comments Textarea */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Faculty Guide Feedback & Remarks *</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Highlight strengths, identify gaps, or clearly state changes required before approval..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Remarks will be permanently recorded in the student project dossier.
            </p>
          </div>

          {/* Action Buttons: Approve vs Request Changes */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {/* Request Changes Button */}
              <button
                type="button"
                disabled={submitting || !stage.submission}
                onClick={() => handleSubmit('changes_requested')}
                className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Request revisions from the student team"
              >
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Request Changes</span>
              </button>

              {/* Approve Stage Button */}
              <button
                type="button"
                disabled={submitting || !stage.submission}
                onClick={() => handleSubmit('approved')}
                className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                title={stage.submission ? "Approve stage and unlock the next sequential milestone" : "Cannot approve without a student upload"}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'Approving...' : 'Approve & Unlock Next Stage'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
