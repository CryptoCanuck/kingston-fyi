"use client";

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import React from 'react';
import type { AuthUser } from '@/types/user';

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const user = session?.user as AuthUser | undefined;
  const isAuthenticated = !!user;
  const isLoading_ = status === 'loading' || isLoading;

  const login = useCallback(async (email: string, password: string, callbackUrl?: string) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: callbackUrl || '/explore',
      });

      if (result?.error) {
        throw new Error('Invalid email or password');
      }

      if (result?.ok) {
        router.push(callbackUrl || '/explore');
        router.refresh();
      }

      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const loginWithZitadel = useCallback(async (callbackUrl?: string) => {
    await signIn('zitadel', { callbackUrl: callbackUrl || '/explore' });
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const register = useCallback(async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      // Auto-login after registration
      await login(data.email, data.password);

      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const updateProfile = useCallback(async (data: Partial<AuthUser>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Profile update failed');
      }

      // Update session
      await update();
      
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [update]);

  const hasRole = useCallback((role: string) => {
    return user?.role === role;
  }, [user]);

  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  const isBusinessOwner = useCallback(() => {
    return hasRole('business_owner');
  }, [hasRole]);

  const isModerator = useCallback(() => {
    return hasRole('moderator');
  }, [hasRole]);

  const canSubmitListings = useCallback(() => {
    return isAuthenticated && (isAdmin() || isBusinessOwner());
  }, [isAuthenticated, isAdmin, isBusinessOwner]);

  const canModerateContent = useCallback(() => {
    return isAuthenticated && (isAdmin() || isModerator());
  }, [isAuthenticated, isAdmin, isModerator]);

  return {
    user,
    session,
    status,
    isAuthenticated,
    isLoading: isLoading_,
    login,
    loginWithZitadel,
    logout,
    register,
    updateProfile,
    hasRole,
    isAdmin,
    isBusinessOwner,
    isModerator,
    canSubmitListings,
    canModerateContent,
  };
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string;
    roles?: string[];
  }
) {
  return function ProtectedComponent(props: P) {
    const { user, isLoading, hasRole } = useAuth();
    const router = useRouter();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="spinner h-8 w-8 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      router.push(options?.redirectTo || '/login');
      return null;
    }

    if (options?.roles && !options.roles.some(role => hasRole(role))) {
      router.push('/403'); // Forbidden page
      return null;
    }

    return <Component {...props} />;
  };
}