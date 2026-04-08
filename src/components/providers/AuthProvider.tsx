'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    (window as any).__WASTECARE_REACT_MOUNTED__ = true;
    try {
      sessionStorage.removeItem('__wastecare_zombie_retry__');
    } catch (e) {
    }

    return () => {
      (window as any).__WASTECARE_REACT_MOUNTED__ = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const getUserWithTimeout = async (timeoutMs = 7000) => {
      return Promise.race([
        supabase.auth.getUser(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Auth getUser timeout')), timeoutMs);
        }),
      ]);
    };

    const initAuth = async () => {
      try {
        const { data: { user: currentUser } } = await getUserWithTimeout();
        if (cancelled) return;

        setUser(currentUser ?? null);
      } catch (error) {
        if (!cancelled) {
          console.error('Auth init error:', error);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;

      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
