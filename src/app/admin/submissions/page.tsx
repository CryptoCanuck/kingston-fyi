"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Shield,
  AlertTriangle
} from 'lucide-react';
import SubmissionStats from '@/components/admin/SubmissionStats';

export default function AdminSubmissionsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?callbackUrl=/admin/submissions');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check if user is admin
  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gradient-subtle py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-muted hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Link>
          </div>

          <div className="card p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="heading-2 mb-4">Access Denied</h1>
            <p className="text-muted mb-6">
              You don't have permission to access this page. This area is restricted to administrators only.
            </p>
            <Link href="/" className="btn-primary inline-block">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-muted hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-1 text-gradient-indigo-purple">
                Submission Management
              </h1>
              <p className="text-muted mt-2">
                Review and manage business listing submissions
              </p>
            </div>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </span>
          </div>
        </div>

        {/* Admin Content */}
        <SubmissionStats />
      </div>
    </div>
  );
}
