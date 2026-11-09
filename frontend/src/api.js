const API_BASE = '/api';

export function getAuthHeader() {
  const token = localStorage.getItem('cse_proplan_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest(endpoint, options = {}) {
  const headers = {
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  // If body is not FormData, set Content-Type JSON
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  getMe: () => apiRequest('/auth/me'),

  // Metadata
  getGuides: () => apiRequest('/guides'),
  getRubrics: () => apiRequest('/rubrics'),
  getAnalytics: () => apiRequest('/analytics'),
  resetDemoData: () => apiRequest('/reset-demo', { method: 'POST' }),

  // Projects
  getProjects: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/projects${query ? `?${query}` : ''}`);
  },
  getProject: (id) => apiRequest(`/projects/${id}`),
  createProject: (projectData) => apiRequest('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData)
  }),

  // Stage Submission (Multipart)
  submitStage: (projectId, stageId, formData) => {
    return apiRequest(`/projects/${projectId}/stages/${stageId}/submit`, {
      method: 'POST',
      body: formData // FormData automatically handles multipart/form-data boundary
    });
  },

  // Guide Review & Rubric Marks
  reviewStage: (projectId, stageId, reviewData) => {
    return apiRequest(`/projects/${projectId}/stages/${stageId}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  },

  // Coordinator: Reassign / Assign Guide
  assignGuide: (projectId, guideId) => {
    return apiRequest(`/projects/${projectId}/assign-guide`, {
      method: 'PUT',
      body: JSON.stringify({ guideId })
    });
  }
};

