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

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/auth/callback', '/', '/tentang'];
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublicRoute) {
        // Not logged in and trying to access protected route
        router.push('/login');
      } else if (user && (pathname === '/login' || pathname === '/register')) {
        // Logged in and trying to access auth pages
        router.push('/dashboard');
      }
    }
  }, [user, loading, isPublicRoute, pathname, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16a34a] mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!user && !isPublicRoute) {
    return null;
  }

  // Don't render auth pages if already authenticated
  if (user && (pathname === '/login' || pathname === '/register')) {
    return null;
  }

  return <>{children}</>;
}
