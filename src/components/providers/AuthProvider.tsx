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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ['/', '/login', '/register', '/auth/callback'];
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user && !isPublicRoute && !pathname?.startsWith('/api/')) router.push('/login');
      else if (session?.user && (pathname === '/login' || pathname === '/register')) router.push('/admin');
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (event === 'SIGNED_OUT') router.push('/login');
      else if (event === 'SIGNED_IN' && isPublicRoute) router.push('/admin');
    });

    return () => subscription.unsubscribe();
  }, [pathname, isPublicRoute, router]);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
