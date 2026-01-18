"use client";

import { useEffect, useState } from 'react';
import {
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Building2
} from 'lucide-react';

interface SubmissionStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  byType: {
    place?: number;
    event?: number;
    'real-estate'?: number;
  };
}

interface SubmissionStatsProps {
  refreshTrigger?: number;
}

export default function SubmissionStats({ refreshTrigger = 0 }: SubmissionStatsProps) {
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/submissions/stats');

        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="card p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-muted">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 border-red-200 dark:border-red-800">
        <div className="text-center">
          <XCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Status Statistics */}
      <div>
        <h2 className="heading-3 mb-4">Submission Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pending */}
          <div className="card p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.pending}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Approved */}
          <div className="card p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.approved}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Rejected */}
          <div className="card p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {stats.rejected}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Type Statistics */}
      <div>
        <h2 className="heading-3 mb-4">By Submission Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Places */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">Places</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {stats.byType.place || 0}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          {/* Events */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">Events</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.byType.event || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* Real Estate */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted mb-1">Real Estate</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.byType['real-estate'] || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
