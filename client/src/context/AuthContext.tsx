'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface AuthUser {
  /** The MongoDB _id of the synced User document */
  id: string;
  /** WordPress numeric User ID */
  wpUserId: number;
  email: string;
  name: string;
  /** Synced role (e.g. 'admin' or 'user') */
  role: string;
  lastLogin?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => void;
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_COOKIE_NAME = 'vaultz_token';

// ─────────────────────────────────────────────
// Cookie helpers (browser-compatible)
// ─────────────────────────────────────────────

function setCookie(name: string, value: string, days = 30): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Rehydrate auth state from cookie & fetch synced MongoDB user session on mount
  useEffect(() => {
    async function rehydrateSession() {
      const storedToken = getCookie(TOKEN_COOKIE_NAME);
      if (storedToken) {
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        try {
          // Fetch the validated session and synced user details from MongoDB
          const { data } = await api.get('/auth/me');
          
          if (data.success && data.user) {
            setUser({
              id: data.user._id,
              wpUserId: data.user.wpUserId,
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
              lastLogin: data.user.lastLogin,
            });
          } else {
            throw new Error('Failed to load user session profile');
          }
        } catch (error) {
          console.error('Session restoration failed:', error);
          // Token is invalid/expired or server db record is gone — reset session
          deleteCookie(TOKEN_COOKIE_NAME);
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    }

    rehydrateSession();
  }, []);

  /**
   * Login — posts credentials to the Express auth endpoint which proxies
   * to WordPress JWT, retrieves the token, syncs MongoDB, and updates session.
   */
  const login = useCallback(async (emailOrUsername: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/wp-login', { 
        username: emailOrUsername, // WordPress JWT plugin matches either in 'username' field
        password 
      });
      
      const jwt: string = data.token;
      const syncedUser = data.user;

      // Persist token in cookie (accessible to Next.js middleware)
      setCookie(TOKEN_COOKIE_NAME, jwt);
      setToken(jwt);

      // Attach token to API requests
      api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;

      // Update user state with the synced MongoDB details
      setUser({
        id: syncedUser.id,
        wpUserId: syncedUser.wpUserId,
        email: syncedUser.email,
        name: syncedUser.name,
        role: syncedUser.role,
        lastLogin: syncedUser.lastLogin,
      });

      router.push('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Login failed';
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(() => {
    deleteCookie(TOKEN_COOKIE_NAME);
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
    router.push('/');
  }, [router]);

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return ctx;
}
