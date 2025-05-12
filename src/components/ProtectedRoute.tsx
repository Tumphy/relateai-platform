'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip during server-side rendering or when loading
    if (typeof window === 'undefined' || loading) {
      return;
    }

    const isPublicRoute = [
      '/',
      '/login',
      '/signup',
      '/forgot-password',
      '/reset-password',
    ].includes(pathname);

    if (!isAuthenticated && !isPublicRoute) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router, pathname]);

  // Show loading state if checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Check if this is a protected route and user is not authenticated
  const isPublicRoute = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ].includes(pathname);

  if (!isAuthenticated && !isPublicRoute) {
    return null; // Will redirect in effect
  }

  return <>{children}</>;
}