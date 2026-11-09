import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export const DEMO_USERS = [
  {
    role: 'student',
    title: 'Student (Rahul - Active Review 3)',
    name: 'Rahul Sharma',
    rollNumber: '21CS045',
    email: 'rahul.sharma@cse.edu',
    badge: 'Final Year Student'
  },
  {
    role: 'student',
    title: 'Student (Ananya - Changes Requested)',
    name: 'Ananya Patel',
    rollNumber: '21CS012',
    email: 'ananya.patel@cse.edu',
    badge: 'Final Year Student'
  },
  {
    role: 'guide',
    title: 'Faculty Guide (Dr. Arvind Rao)',
    name: 'Dr. Arvind Rao',
    email: 'dr.rao@cse.edu',
    badge: 'Assoc. Professor & Guide'
  },
  {
    role: 'guide',
    title: 'Faculty Guide (Dr. Priya Mehta)',
    name: 'Dr. Priya Mehta',
    email: 'dr.mehta@cse.edu',
    badge: 'Professor & Guide'
  },
  {
    role: 'coordinator',
    title: 'Project Coordinator (Prof. Sunitha)',
    name: 'Prof. K. Sunitha',
    email: 'coordinator@cse.edu',
    badge: 'Head Project Coordinator'
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cse_proplan_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    }
    initAuth();
  }, [token]);

  const login = async (email, password = 'password123') => {
    const res = await api.login(email, password);
    localStorage.setItem('cse_proplan_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const quickDemoLogin = async (email) => {
    return login(email, 'password123');
  };

  const logout = () => {
    localStorage.removeItem('cse_proplan_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        quickDemoLogin,
        isAuthenticated: !!user,
        role: user ? user.role : null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

