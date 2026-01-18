"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Clock, CheckCircle2, XCircle, FileText, Calendar, Building2 } from 'lucide-react';

export default function SubmissionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<string>(searchParams.get('status') || 'all');
  const [type, setType] = useState<string>(searchParams.get('type') || 'all');

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (status && status !== 'all') {
      params.set('status', status);
    }

    if (type && type !== 'all') {
      params.set('type', type);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '/admin/submissions';

    router.push(newUrl, { scroll: false });
  }, [status, type, router]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value);
  };

  const clearFilters = () => {
    setStatus('all');
    setType('all');
  };

  const hasActiveFilters = status !== 'all' || type !== 'all';

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="heading-3">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <div className="relative">
            <select
              id="status-filter"
              value={status}
              onChange={handleStatusChange}
              className="w-full px-4 py-2.5 pr-10 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">⏱️ Pending</option>
              <option value="approved">✅ Approved</option>
              <option value="rejected">❌ Rejected</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {status === 'pending' && <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />}
              {status === 'approved' && <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />}
              {status === 'rejected' && <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />}
              {status === 'all' && <Filter className="h-4 w-4 text-gray-400" />}
            </div>
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <div className="relative">
            <select
              id="type-filter"
              value={type}
              onChange={handleTypeChange}
              className="w-full px-4 py-2.5 pr-10 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="place">📍 Place</option>
              <option value="event">📅 Event</option>
              <option value="real-estate">🏢 Real Estate</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              {type === 'place' && <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
              {type === 'event' && <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
              {type === 'real-estate' && <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
              {type === 'all' && <Filter className="h-4 w-4 text-gray-400" />}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm text-muted">Active filters:</span>
            {status !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                Status: {status}
              </span>
            )}
            {type !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                Type: {type}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
