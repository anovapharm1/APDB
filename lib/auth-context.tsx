'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, WHITELISTED_USERS } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('pipeline_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (WHITELISTED_USERS[parsed.username]) {
          setUser(parsed);
        }
      } catch {
        localStorage.removeItem('pipeline_user');
      }
    }
  }, []);
  const login = (username: string, password: string): boolean => {
    const normalizedUsername = username.trim().toUpperCase();
    const normalizedPassword = password.trim();
    if (normalizedPassword !== 'neswan') {
      return false;
    }

    const userInfo = WHITELISTED_USERS[normalizedUsername];
    if (!userInfo) {
      return false;
    }

    const newUser: User = {
      id: normalizedUsername,
      username: normalizedUsername,
      name: userInfo.name,
      role: userInfo.role,
    };

    setUser(newUser);
    localStorage.setItem('pipeline_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pipeline_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
