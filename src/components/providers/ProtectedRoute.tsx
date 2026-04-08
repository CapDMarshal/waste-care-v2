'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from './AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = (path: string | null) => {
    if (!path) return false;
    if (path === '/') return true;

    const prefixRoutes = ['/login', '/register', '/auth/callback', '/landing', '/tentang'];
    return prefixRoutes.some(route => path === route || path.startsWith(`${route}/`));
  };

  const isPublicRoute = isPublicPath(pathname);

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublicRoute) {
        // Not logged in and trying to access protected route
        router.push('/login');
      }
    }
  }, [user, loading, isPublicRoute, pathname, router]);

  // Do not block the app globally while auth is still resolving.
  if (loading) {
    return <>{children}</>;
  }

  // Don't render protected content if not authenticated
  if (!user && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
