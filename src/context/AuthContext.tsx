'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name: string;
  role: 'Admin' | 'Teacher';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check if user session mock exists (simulated session)
    const savedUser = sessionStorage.getItem('mock_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse mock user session', e);
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log('// TODO: connect to /api/auth/login');
    console.log('Logging in with credentials:', { email, password });

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        setIsLoading(false);
        // Simulation rule: fail if email is fail@vinayak.com
        if (email === 'fail@vinayak.com') {
          console.warn('Authentication failed: mock error trigger');
          resolve(false);
        } else {
          const mockUser: User = {
            email,
            name: email.split('@')[0].toUpperCase(),
            role: 'Admin',
          };
          setUser(mockUser);
          sessionStorage.setItem('mock_user', JSON.stringify(mockUser));
          console.log('Authentication successful for mock user:', mockUser);
          resolve(true);
        }
      }, 1500); // 1.5s simulated delay
    });
  };

  const register = async (formData: any): Promise<boolean> => {
    setIsLoading(true);
    console.log('// TODO: connect to /api/auth/register');
    console.log('Registering account with data:', formData);

    return new Promise((resolve) => {
      setTimeout(() => {
        setIsLoading(false);
        console.log('Registration simulation complete.');
        resolve(true);
      }, 1500); // 1.5s simulated delay
    });
  };

  const logout = () => {
    console.log('Logging out mock user:', user);
    setUser(null);
    sessionStorage.removeItem('mock_user');
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
