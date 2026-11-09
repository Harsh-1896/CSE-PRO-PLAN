import React, { useState } from 'react';
import { api } from '../api';
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  ExternalLink,
  MessageSquareWarning,
  FileUp
} from 'lucide-react';

export default function StageUploadModal({ isOpen, onClose, project, stage, onStageSubmitted }) {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [externalDocUrl, setExternalDocUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !stage) return null;

  const isChangesRequested = stage.status === 'changes_requested';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file && !externalDocUrl && !stage.submission) {
      setError('Please choose a file or enter an external document link to upload.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('notes', notes);
      if (externalDocUrl) {
        formData.append('externalDocUrl', externalDocUrl);
      }

      const res = await api.submitStage(project.id, stage.id, formData);
      onStageSubmitted(res.project);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-brand-700 to-brand-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <FileUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-white/20 font-bold font-mono px-2 py-0.5 rounded uppercase">
                  PHASE 0{stage.order} OF 05
                </span>
                <h3 className="text-lg font-black">{stage.name} Upload</h3>
              </div>
              <p className="text-xs text-brand-100 mt-0.5 truncate max-w-md">{project.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Guide's Changes Requested Banner */}
          {isChangesRequested && stage.review && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-black text-amber-900">
                <MessageSquareWarning className="w-4 h-4 text-amber-600" />
                <span>Guide Requested Revisions:</span>
              </div>
              <p className="italic bg-white p-2.5 rounded-xl border border-amber-200/70 text-slate-800 leading-relaxed font-medium">
                "{stage.review.comments}"
              </p>
              <div className="text-[11px] text-amber-700 font-semibold pt-0.5">
                Please revise your deliverables and upload the updated version below.
              </div>
            </div>
          )}

          {/* Stage Deliverable Specifications Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
            <div className="font-extrabold text-slate-900">Required Deliverable:</div>
            <p className="text-slate-600 leading-relaxed">{stage.description}</p>
            <div className="text-[11px] font-mono text-slate-500 pt-1">
              Accepted formats: <strong className="text-brand-700 font-bold">{stage.allowedFileTypes}</strong> (Max 25 MB)
            </div>
          </div>

          {/* Drag & Drop File Upload Field */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Choose Document / Presentation File *
            </label>
            <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-brand-50/20 transition-all cursor-pointer relative">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mb-2.5 shadow-2xs">
                  <Paperclip className="w-6 h-6" />
                </div>
                {file ? (
                  <div className="space-y-0.5">
                    <div className="text-sm font-extrabold text-brand-700 flex items-center justify-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>{file.name}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • File selected
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-bold text-brand-600 hover:underline">
                      Click to choose file
                    </span>{' '}
                    <span className="text-xs text-slate-500">or drag and drop here</span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {stage.name === 'Synopsis'
                        ? 'Synopsis Document (PDF / DOCX)'
                        : stage.name.includes('PPT')
                        ? 'Slide Presentation (PPTX / PDF)'
                        : 'Final Thesis / Report (PDF)'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cloud Slides URL */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Online Slides / Figma / Cloud Link (Optional)
            </label>
            <div className="relative">
              <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="url"
                placeholder="https://docs.google.com/presentation/d/... or Canva link"
                value={externalDocUrl}
                onChange={(e) => setExternalDocUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Submitter Notes */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Notes for Faculty Guide
            </label>
            <textarea
              rows={2}
              placeholder="Summarize your progress, highlight any specific slides or modules to inspect..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 leading-relaxed"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-extrabold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {submitting ? 'Uploading Deliverables...' : isChangesRequested ? 'Resubmit Revisions' : 'Submit Stage Artifacts'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
