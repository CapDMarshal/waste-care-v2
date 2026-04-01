'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuthContext = () => useContext(AuthContext);

// Helper: fetch user role from profiles table
async function getUserRole(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  return (data as any)?.role ?? null;
}

// Helper: redirect based on role
async function redirectAfterLogin(userId: string, router: ReturnType<typeof useRouter>) {
  const role = await getUserRole(userId);
  if (role === 'admin') {
    router.push('/admin');
  } else {
    // Regular users go to the main dashboard
    router.push('/dashboard');
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Routes that are accessible without login
  const publicRoutes = ['/', '/login', '/register', '/auth/callback', '/landing'];
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
  // Admin routes are protected by server-side requireAdmin() — no need to handle here
  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);

      if (!session?.user) {
        // Not logged in: protect non-public routes
        if (!isPublicRoute && !isAdminRoute && !pathname?.startsWith('/api/')) {
          router.push('/login');
        }
      } else if (pathname === '/login' || pathname === '/register') {
        // Logged in but on auth pages: redirect to correct destination by role
        await redirectAfterLogin(session.user.id, router);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_OUT') {
        router.push('/login');
      } else if (event === 'SIGNED_IN' && session?.user && isPublicRoute && pathname !== '/') {
        // Only redirect on explicit login (not on every page load)
        await redirectAfterLogin(session.user.id, router);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
