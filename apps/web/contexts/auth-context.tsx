'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '@/lib/auth-client';
import * as authClient from '@/lib/auth-client';

const STORAGE_KEYS = {
  accessToken: 'blooso_access_token',
  refreshToken: 'blooso_refresh_token',
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string) => Promise<User>;
  logout: () => Promise<void>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const loadUser = useCallback(async (token: string) => {
    try {
      const user = await authClient.getMe(token);
      setState((s) => ({
        ...s,
        user,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch {
      setState((s) => ({
        ...s,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      }));
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.accessToken);
        localStorage.removeItem(STORAGE_KEYS.refreshToken);
      }
    }
  }, []);

  const tryRefresh = useCallback(async () => {
    const refreshToken =
      typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.refreshToken) : null;

    if (!refreshToken) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    try {
      const data = await authClient.refresh(refreshToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
        localStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
      }
      setState((s) => ({
        ...s,
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch {
      setState((s) => ({
        ...s,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      }));
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.accessToken);
        localStorage.removeItem(STORAGE_KEYS.refreshToken);
      }
    }
  }, []);

  useEffect(() => {
    const accessToken =
      typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.accessToken) : null;
    const refreshToken =
      typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.refreshToken) : null;

    if (accessToken) {
      loadUser(accessToken);
    } else if (refreshToken) {
      tryRefresh();
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, [loadUser, tryRefresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authClient.login(email, password);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
      localStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
    }
    setState({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isLoading: false,
      isAuthenticated: true,
    });
    return data.user;
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const data = await authClient.register(email, password, name);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.accessToken, data.accessToken);
      localStorage.setItem(STORAGE_KEYS.refreshToken, data.refreshToken);
    }
    setState({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isLoading: false,
      isAuthenticated: true,
    });
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken =
      typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.refreshToken) : null;
    if (refreshToken) {
      try {
        await authClient.logout(refreshToken);
      } catch {
        // Ignore logout errors
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.accessToken);
      localStorage.removeItem(STORAGE_KEYS.refreshToken);
    }
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const getToken = useCallback(() => {
    return typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.accessToken) : null;
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
