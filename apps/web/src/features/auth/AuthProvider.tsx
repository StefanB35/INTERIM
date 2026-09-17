import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, getAccessToken, restoreSession, setAccessToken } from '../../lib/api';
import { AuthResponseSchema, UserSchema, type User } from '../../lib/schemas';
import type { LoginValues } from './schemas';

export type AppRole = 'EMPLOYER' | 'ANIMATOR';
type AuthContextValue = { user: User | null; isLoading: boolean; login: (values: LoginValues) => Promise<User>; logout: () => Promise<void>; refreshUser: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    void (async () => {
      try {
        if (await restoreSession()) setUser(await api.get('/me', UserSchema));
      } finally { setIsLoading(false); }
    })();
  }, []);
  const login = async (values: LoginValues) => { const result = await api.post('/auth/login', values, AuthResponseSchema); setAccessToken(result.accessToken); setUser(result.user); return result.user; };
  const logout = async () => { if (getAccessToken()) await api.post('/auth/logout', {}, undefined).catch(() => undefined); setAccessToken(null); setUser(null); };
  const refreshUser = async () => { const refreshed = await restoreSession(); if (refreshed) setUser(await api.get('/me', UserSchema)); };
  return <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue { const context = useContext(AuthContext); if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider.'); return context; }
export function useOptionalAuth(): AuthContextValue | null { return useContext(AuthContext); }
export function dashboardPath(role: AppRole): string { return role === 'EMPLOYER' ? '/employeur' : '/animateur'; }

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth(); const location = useLocation();
  if (isLoading) return <main className="auth-state"><p>Vérification de ta session...</p></main>;
  if (!user) return <Navigate to={`/connexion?returnTo=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return <>{children}</>;
}

export function RequireRole({ role, children }: { role: AppRole; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role !== role) return <Navigate to={dashboardPath(user.role as AppRole)} replace />;
  return <>{children}</>;
}
