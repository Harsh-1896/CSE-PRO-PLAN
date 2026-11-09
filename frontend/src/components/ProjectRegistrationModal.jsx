import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import {
  X,
  Plus,
  Trash2,
  FolderPlus,
  Users,
  CheckCircle,
  AlertCircle,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  Cpu,
  Info,
  Clock
} from 'lucide-react';

export default function ProjectRegistrationModal({ isOpen, onClose, onProjectCreated }) {
  const { user } = useAuth();
  const [guides, setGuides] = useState([]);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [type, setType] = useState('Major Project');
  const [title, setTitle] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [semester, setSemester] = useState('Semester 7');
  const [domain, setDomain] = useState('Artificial Intelligence & Machine Learning');
  const [description, setDescription] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [guideId, setGuideId] = useState('');

  // Teammates: student starts as leader
  const [teammates, setTeammates] = useState([
    {
      rollNumber: user?.rollNumber || '21CS045',
      name: user?.name || 'Self',
      email: user?.email || '',
      isLeader: true
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      loadGuides();
      if (user?.rollNumber) {
        setTeammates([
          {
            rollNumber: user.rollNumber,
            name: user.name,
            email: user.email,
            isLeader: true
          }
        ]);
      }
    }
  }, [isOpen, user]);

  const loadGuides = async () => {
    setLoadingGuides(true);
    try {
      const data = await api.getGuides();
      setGuides(data);
      if (data.length > 0 && !guideId) {
        setGuideId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load guides:', err);
    } finally {
      setLoadingGuides(false);
    }
  };

  const addTeammateRow = () => {
    if (teammates.length >= 4) {
      alert('Maximum 4 students permitted per project batch.');
      return;
    }
    setTeammates([
      ...teammates,
      { rollNumber: '', name: '', email: '', isLeader: false }
    ]);
  };

  const removeTeammateRow = (index) => {
    if (index === 0) {
      alert('Cannot remove the team leader.');
      return;
    }
    setTeammates(teammates.filter((_, i) => i !== index));
  };

  const updateTeammate = (index, field, value) => {
    const updated = [...teammates];
    updated[index][field] = value;
    if (field === 'rollNumber' && value && !updated[index].email) {
      updated[index].email = `${value.toLowerCase()}@cse.edu`;
    }
    setTeammates(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Project title is required.');
      return;
    }
    // Faculty guide is allocated by Coordinator for student proposals
    for (let i = 0; i < teammates.length; i++) {
      if (!teammates[i].rollNumber.trim()) {
        setError(`Please enter the Roll Number for Teammate #${i + 1}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const techStack = techStackInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        type,
        academicYear,
        semester,
        domain,
        description: description.trim(),
        techStack,
        githubUrl: githubUrl.trim(),
        teamMembers: teammates
      };

      const result = await api.createProject(payload);
      onProjectCreated(result.project);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <FolderPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black">Register New CSE Project Proposal</h3>
              <p className="text-xs text-brand-100 mt-0.5">
                Register batch & submit proposal. Department Coordinator will review and allocate your official faculty guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Project Category Interactive Cards */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Select Project Category *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => {
                  setType('Mini Project');
                  setSemester('Semester 6');
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  type === 'Mini Project'
                    ? 'border-brand-600 bg-brand-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900">Mini Project</span>
                  <span className="text-[10px] font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-md">
                    3rd Year (Sem 6)
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Focused semester project prototype evaluating core systems & problem definition.
                </p>
              </div>

              <div
                onClick={() => {
                  setType('Major Project');
                  setSemester('Semester 7');
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  type === 'Major Project'
                    ? 'border-brand-600 bg-brand-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900">Major Project</span>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                    Final Year (Sem 7/8)
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Comprehensive engineering capstone project spanning 5 review stages and final viva defense.
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Real-Time Distributed Threat Intelligence Platform using Federated AI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          {/* Domain & Faculty Guide Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                Technical Domain *
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white font-medium"
              >
                <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</option>
                <option value="Cloud & Distributed Systems">Cloud & Distributed Systems</option>
                <option value="Cybersecurity & Cryptography">Cybersecurity & Cryptography</option>
                <option value="IoT & Embedded Systems">IoT & Embedded Systems</option>
                <option value="Blockchain & Web3">Blockchain & Web3</option>
                <option value="Full Stack Web & Mobile">Full Stack Web & Mobile</option>
                <option value="Data Science & Big Data">Data Science & Big Data</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Faculty Supervisor Allocation</span>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Assigned by Coordinator</span>
                </span>
              </label>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Award className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-slate-900 leading-tight">
                    Prof. K. Sunitha (Head Coordinator)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Will allocate guide based on domain & teacher workload
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description Abstract */}
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Abstract & Scope of Work
            </label>
            <textarea
              rows={3}
              placeholder="Outline the real-world problem, proposed methodology, and expected engineering deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 leading-relaxed"
            />
          </div>

          {/* Tech stack & github */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Tech Stack (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="Python, PyTorch, React, Docker, FastAPI"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                GitHub Repository URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://github.com/team/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Team Members List */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-600" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Team Members by Roll Number (Max 4 students)
                </h4>
              </div>
              {teammates.length < 4 && (
                <button
                  type="button"
                  onClick={addTeammateRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors border border-brand-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Teammate</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {teammates.map((member, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3"
                >
                  <div className="w-full sm:w-36">
                    <div className="text-[10px] text-slate-400 font-black uppercase mb-1">
                      Roll Number {idx === 0 && '(Leader)'}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 21CS045"
                      value={member.rollNumber}
                      onChange={(e) => updateTeammate(idx, 'rollNumber', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono uppercase font-black border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div className="w-full sm:flex-1">
                    <div className="text-[10px] text-slate-400 font-black uppercase mb-1">
                      Full Name
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Student full name"
                      value={member.name}
                      onChange={(e) => updateTeammate(idx, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-brand-500 font-semibold"
                    />
                  </div>

                  <div className="w-full sm:flex-1">
                    <div className="text-[10px] text-slate-400 font-black uppercase mb-1">
                      Email
                    </div>
                    <input
                      type="email"
                      placeholder="roll@cse.edu"
                      value={member.email}
                      onChange={(e) => updateTeammate(idx, 'email', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-brand-500 font-mono"
                    />
                  </div>

                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => removeTeammateRow(idx)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors self-end sm:self-center"
                      title="Remove teammate"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Department Proposal Policy Banner */}
          <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Department Proposal Workflow:</strong> Student batches register proposal details and teammates. The proposal is automatically forwarded to <strong>Head Project Coordinator (Prof. K. Sunitha)</strong>, who reviews the technical domain and assigns an official faculty guide.
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
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
              className="px-6 py-2.5 text-xs font-black text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-all flex items-center gap-2 hover:scale-[1.01]"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'Submitting Proposal...' : 'Submit Proposal to Coordinator'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
