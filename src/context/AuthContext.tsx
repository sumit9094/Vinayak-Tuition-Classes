'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  _id: string;
  email: string;
  name: string;
  type: 'student' | 'staff';
  role?: 'admin' | 'teacher';
  branches?: string[];
  branch?: string;
  subject?: string;
  standard?: string;
  subjects?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'POST',
        });
        if (response.ok) {
          const data = await response.json();
          setUser({ ...data.user, type: data.type });
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Session check failed', e);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    try {
      // 1. Attempt Student Login first
      let response = await fetch('/api/students/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const studentUser: User = { ...data.student, type: 'student' };
        setUser(studentUser);
        return studentUser;
      }
      
      // 2. Attempt Staff Login as fallback
      response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const staffUser: User = { ...data.user, type: 'staff' };
        setUser(staffUser);
        return staffUser;
      }
      
      return null;
    } catch (err) {
      console.error('Login action error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      return response.ok;
    } catch (err) {
      console.error('Registration error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
