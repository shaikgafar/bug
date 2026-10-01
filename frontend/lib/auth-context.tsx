'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  switchDemoUser: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session on mount
    const savedToken = localStorage.getItem('bugtriage_token');
    const savedUser = localStorage.getItem('bugtriage_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('bugtriage_token');
        localStorage.removeItem('bugtriage_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string, role: UserRole = 'reporter') => {
    const data = await api.register(name, email, password, role);
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    api.logout();
    setToken(null);
    setUser(null);
  };

  const switchDemoUser = async (role: UserRole) => {
    const demoAccounts: Record<UserRole, { email: string; pass: string }> = {
      admin: { email: 'admin@bugtriage.ai', pass: 'Password123!' },
      developer: { email: 'dev.auth@bugtriage.ai', pass: 'Password123!' },
      reporter: { email: 'reporter@bugtriage.ai', pass: 'Password123!' },
    };
    const acc = demoAccounts[role];
    await login(acc.email, acc.pass);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        switchDemoUser,
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
