'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { AuthResponse } from '@/types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  email: string | null;
  bioCompleted: boolean;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  setBioCompleted: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [bioCompleted, setBioCompletedState] = useState(false);

  useEffect(() => {
    // Check localStorage on mount (client-side only)
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('accessToken');
    const storedEmail = localStorage.getItem('email');
    const storedUserId = localStorage.getItem('userId');
    const storedBioCompleted = localStorage.getItem('bioCompleted');

    if (token) {
      setIsAuthenticated(true);
      setEmail(storedEmail);
      setUserId(storedUserId);
      setBioCompletedState(storedBioCompleted === 'true');
    }
    setIsLoading(false);
  }, []);

  const login = (authData: AuthResponse) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem('userId', authData.userId);
    localStorage.setItem('email', authData.email);
    localStorage.setItem('bioCompleted', String(authData.bioCompleted));

    setIsAuthenticated(true);
    setUserId(authData.userId);
    setEmail(authData.email);
    setBioCompletedState(authData.bioCompleted);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    setIsAuthenticated(false);
    setUserId(null);
    setEmail(null);
    setBioCompletedState(false);
  };

  const setBioCompleted = (value: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bioCompleted', String(value));
    }
    setBioCompletedState(value);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userId,
        email,
        bioCompleted,
        login,
        logout,
        setBioCompleted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
