import React, { useState, useEffect, Component } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './api';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SidebarViews from './components/SidebarViews';
import LoginModal from './components/LoginModal';
import StudentDashboard from './components/StudentDashboard';
import GuideDashboard from './components/GuideDashboard';
import CoordinatorDashboard from './components/CoordinatorDashboard';
import UnifiedProjectPage from './components/UnifiedProjectPage';
import ProjectRegistrationModal from './components/ProjectRegistrationModal';
import StageUploadModal from './components/StageUploadModal';
import GuideReviewModal from './components/GuideReviewModal';
import AssignGuideModal from './components/AssignGuideModal';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="bg-white border-2 border-rose-200 rounded-3xl p-8 max-w-lg text-center shadow-lg space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-xl font-black">
              !
            </div>
            <h2 className="text-xl font-black text-slate-900">Dashboard View Recovered</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              An unexpected render glitch occurred: {this.state.error?.message || 'Unknown error'}. You can return to the main dashboard safely.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { user, role, loading, isAuthenticated } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [currentNavView, setCurrentNavView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [uploadModalData, setUploadModalData] = useState({ isOpen: false, stage: null, project: null });
  const [reviewModalData, setReviewModalData] = useState({ isOpen: false, stage: null, project: null });
  const [assignGuideModalData, setAssignGuideModalData] = useState({ isOpen: false, project: null });

  // Toast alert
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated, user]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const data = await api.getProjects();
      setProjects(data);

      // If viewing a project, refresh its state
      if (selectedProject) {
        const updated = data.find(p => p.id === selectedProject.id);
        if (updated) setSelectedProject(updated);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all project data to default CSE Department demo records?')) {
      try {
        await api.resetDemoData();
        setSelectedProject(null);
        await loadProjects();
        showToast('Database reset to fresh CSE department sample records.');
      } catch (err) {
        alert('Failed to reset: ' + err.message);
      }
    }
  };

  const handleProjectCreated = (newProject) => {
    setProjects(prev => [newProject, ...prev]);
    setSelectedProject(newProject);
    showToast(`Project "${newProject.title}" successfully registered! Synopsis stage is now unlocked.`);
  };

  const handleStageSubmitted = (updatedProject) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
    showToast('Stage deliverable uploaded successfully! Guide has been notified for review.');
  };

  const handleReviewCompleted = (updatedProject) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
    showToast('Evaluation recorded and marks calculated! Next stage has been updated.');
  };

  // Upload modal triggers
  const openUploadModal = (stage, proj = selectedProject) => {
    setUploadModalData({ isOpen: true, stage, project: proj });
  };

  // Review modal triggers
  const openReviewModal = (stage, proj = selectedProject) => {
    setReviewModalData({ isOpen: true, stage, project: proj });
  };

  // Assign Guide modal trigger
  const openAssignGuideModal = (proj = selectedProject) => {
    setAssignGuideModalData({ isOpen: true, project: proj });
  };

  const handleGuideAssigned = (updatedProject) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    if (selectedProject && selectedProject.id === updatedProject.id) {
      setSelectedProject(updatedProject);
    }
    loadProjects();
    showToast(`Faculty guide updated to ${updatedProject.guideName} successfully!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-300">Loading CSE ProPlan...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginModal />;
  }

  return (
    <div className="flex h-screen bg-[#f4f7fe] text-slate-800 font-sans overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Persistent Left Sidebar */}
      <Sidebar
        currentView={selectedProject ? 'project_detail' : currentNavView}
        onNavigate={(viewId) => {
          setSelectedProject(null);
          setCurrentNavView(viewId);
          if (viewId === 'proposals' && role === 'student') {
            setShowRegisterModal(true);
          }
        }}
      />

      {/* Main Right Content Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar
          onResetData={handleResetData}
          onGoHome={() => {
            setSelectedProject(null);
            setCurrentNavView('dashboard');
          }}
          onOpenNotifications={() => {
            setSelectedProject(null);
            setCurrentNavView('notifications');
          }}
          viewingProject={!!selectedProject || currentNavView !== 'dashboard'}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            {selectedProject ? (
              <UnifiedProjectPage
                project={selectedProject}
                onOpenUploadModal={(stage) => openUploadModal(stage, selectedProject)}
                onOpenReviewModal={(stage) => openReviewModal(stage, selectedProject)}
                onOpenAssignGuideModal={openAssignGuideModal}
                onProjectUpdated={loadProjects}
                onBack={() => {
                  setSelectedProject(null);
                  setCurrentNavView('dashboard');
                }}
              />
            ) : currentNavView !== 'dashboard' ? (
              <SidebarViews
                viewId={currentNavView}
                projects={projects}
                onSelectProject={(proj) => setSelectedProject(proj)}
                onOpenRegisterModal={() => setShowRegisterModal(true)}
                onOpenAssignGuideModal={openAssignGuideModal}
                onResetData={handleResetData}
              />
            ) : (
              <>
                {role === 'student' && (
                  <StudentDashboard
                    projects={projects}
                    onOpenRegisterModal={() => setShowRegisterModal(true)}
                    onSelectProject={(proj) => setSelectedProject(proj)}
                    onOpenUploadModal={(stage, proj) => openUploadModal(stage, proj)}
                  />
                )}

                {role === 'guide' && (
                  <GuideDashboard
                    projects={projects}
                    onSelectProject={(proj) => setSelectedProject(proj)}
                    onOpenReviewModal={(stage, proj) => openReviewModal(stage, proj)}
                  />
                )}

                {role === 'coordinator' && (
                  <CoordinatorDashboard
                    projects={projects}
                    onSelectProject={(proj) => setSelectedProject(proj)}
                    onOpenRegisterModal={() => setShowRegisterModal(true)}
                    onOpenAssignGuideModal={openAssignGuideModal}
                  />
                )}
              </>
            )}
          </ErrorBoundary>
        </main>

        {/* Minimal Footer */}
        <footer className="bg-transparent py-4 text-center text-xs text-slate-400 no-print border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>SMART-PRO • Intelligent Project Lifecycle & Evaluation Platform</span>
            <span className="font-mono text-[11px]">CSE Department • AY 2025-2026</span>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <ProjectRegistrationModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onProjectCreated={handleProjectCreated}
      />

      {uploadModalData.isOpen && (
        <StageUploadModal
          isOpen={uploadModalData.isOpen}
          onClose={() => setUploadModalData({ isOpen: false, stage: null, project: null })}
          stage={uploadModalData.stage}
          project={uploadModalData.project}
          onStageSubmitted={handleStageSubmitted}
        />
      )}

      {reviewModalData.isOpen && (
        <GuideReviewModal
          isOpen={reviewModalData.isOpen}
          onClose={() => setReviewModalData({ isOpen: false, stage: null, project: null })}
          stage={reviewModalData.stage}
          project={reviewModalData.project}
          onReviewCompleted={handleReviewCompleted}
        />
      )}

      {assignGuideModalData.isOpen && (
        <AssignGuideModal
          isOpen={assignGuideModalData.isOpen}
          onClose={() => setAssignGuideModalData({ isOpen: false, project: null })}
          project={assignGuideModalData.project}
          onGuideAssigned={handleGuideAssigned}
        />
      )}
    </div>
  );
}

