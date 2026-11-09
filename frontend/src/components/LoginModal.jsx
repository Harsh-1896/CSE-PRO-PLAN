import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import {
  GraduationCap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserCheck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Code2,
  Lightbulb,
  BookOpen
} from 'lucide-react';

export default function LoginModal() {
  const { login, quickDemoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (demoEmail) => {
    setError('');
    setLoading(true);
    try {
      await quickDemoLogin(demoEmail);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        {/* Left Hero & Illustration Section */}
        <div className="bg-gradient-to-br from-brand-50 via-white to-blue-50/60 p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                  SMART-PRO
                </h1>
                <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mt-1">
                  CSE Department
                </p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight mt-4">
              Intelligent Project Lifecycle & Evaluation Platform
            </h2>

            <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-black tracking-wider uppercase">
              <span>Plan</span> • <span>Track</span> • <span>Evaluate</span> • <span>Excel</span>
            </div>

            <p className="text-sm text-slate-600 mt-4 leading-relaxed max-w-md">
              A smart platform to manage Mini & Major Projects from proposal to final evaluation. Sequential stage uploads, criteria rubrics, and automated grading.
            </p>
          </div>

          {/* Stylized Modern Vector Graphic matching template */}
          <div className="my-8 flex items-center justify-center relative">
            <div className="w-72 h-44 bg-gradient-to-tr from-slate-900 to-brand-900 rounded-2xl p-4 shadow-xl border-4 border-white flex flex-col justify-between relative transform -rotate-1 hover:rotate-0 transition-transform">
              {/* Screen Top Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                </div>
                <span className="text-[10px] font-mono text-brand-200">project_evaluation.py</span>
              </div>

              {/* Code Screen Body */}
              <div className="flex items-center justify-center my-auto">
                <div className="text-center">
                  <div className="font-mono text-2xl font-black text-brand-300 flex items-center justify-center gap-2">
                    <Code2 className="w-7 h-7 text-brand-400" />
                    <span>&lt;/&gt;</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block font-mono">B.Tech Capstone 2025-2026</span>
                </div>
              </div>

              {/* Laptop Base */}
              <div className="text-right">
                <span className="text-[10px] bg-brand-500 text-white font-bold px-2 py-0.5 rounded">Rubric v2.0</span>
              </div>
            </div>

            {/* Glowing Lightbulb Badge */}
            <div className="absolute -top-3 right-6 w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-lg shadow-amber-400/40 animate-bounce">
              <Lightbulb className="w-6 h-6" />
            </div>

            {/* Stacked Books Badge */}
            <div className="absolute -bottom-2 left-6 w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center justify-between pt-2">
            <span>Department of Computer Science & Engineering</span>
            <span className="font-mono font-bold">Academic Year 2025-26</span>
          </div>
        </div>

        {/* Right Login Form Section */}
        <div className="p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Welcome Back!
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Login to continue to your department project workspace
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Select Dropdown */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                  Select Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                >
                  <option value="student">Student (B.Tech CSE)</option>
                  <option value="guide">Faculty Supervisor (Guide)</option>
                  <option value="coordinator">Head Project Coordinator</option>
                </select>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-brand-500/25 transition-all hover:scale-[1.01]"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative px-3 bg-white text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                or 1-Click Demo Profiles
              </span>
            </div>

            {/* 1-Click Persona Quick Logins matching template */}
            <div className="space-y-1.5">
              {DEMO_USERS.slice(0, 3).map((demo) => (
                <button
                  key={demo.email}
                  onClick={() => handleDemoSelect(demo.email)}
                  disabled={loading}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-brand-400 bg-slate-50/60 hover:bg-brand-50/50 flex items-center justify-between text-left transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-brand-600 flex items-center justify-center font-bold text-xs shadow-2xs">
                      {demo.name.charAt(0)}
                    </span>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 leading-tight">
                        {demo.name}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {demo.role} • {demo.rollNumber || demo.designation || demo.email}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Footer help */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500 font-medium">
              New here? Contact your department admin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
