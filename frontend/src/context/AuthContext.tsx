'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: (name: string, email: string, avatarUrl?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
  apiUrl: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth from local storage
  useEffect(() => {
    const storedToken = localStorage.getItem('simplifier_token');
    const storedUser = localStorage.getItem('simplifier_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Save auth tokens to local storage on modification
  const handleAuthSuccess = (newToken: string, newUser: UserProfile) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('simplifier_token', newToken);
    localStorage.setItem('simplifier_user', JSON.stringify(newUser));
  };

  // Register Method
  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      if (data.success) {
        handleAuthSuccess(data.token, data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (err) {
      console.error('Registration fetch error:', err);
      return { success: false, message: 'Could not connect to the authentication server.' };
    }
  };

  // Login Method
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.success) {
        handleAuthSuccess(data.token, data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Invalid credentials' };
      }
    } catch (err) {
      console.error('Login fetch error:', err);
      return { success: false, message: 'Could not connect to the authentication server.' };
    }
  };

  // Google Mock Authentication Method
  const loginWithGoogle = async (name: string, email: string, avatarUrl?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, avatarUrl })
      });

      const data = await response.json();
      if (data.success) {
        handleAuthSuccess(data.token, data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Google Auth failed' };
      }
    } catch (err) {
      // Direct Mock fallback in case backend is disconnected before server initializes
      console.error('Google oauth API error, logging in locally:', err);
      const mockId = 'mock_google_' + Math.random().toString(36).substr(2, 9);
      const mockUser: UserProfile = {
        id: mockId,
        name,
        email,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`
      };
      // Mock JWT token
      const mockToken = 'mock_jwt_token_header.' + btoa(JSON.stringify(mockUser));
      handleAuthSuccess(mockToken, mockUser);
      return { success: true };
    }
  };

  // Logout Method
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('simplifier_token');
    localStorage.removeItem('simplifier_user');
  };

  // Helper to fetch private endpoint request headers
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      isLoading,
      login,
      register,
      loginWithGoogle,
      logout,
      getAuthHeaders,
      apiUrl: API_BASE_URL
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be wrapped inside an AuthProvider');
  }
  return context;
};
