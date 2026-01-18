"use client";

import { Calendar, Mail, User, FileText, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubmissionData {
  _id: string;
  type: 'place' | 'event' | 'real-estate';
  data: {
    name?: string;
    title?: string;
    description: string;
  };
  submittedBy: {
    name: string;
    email: string;
    phone?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
}

interface SubmissionCardProps {
  submission: SubmissionData;
  onViewDetails?: (submission: SubmissionData) => void;
}

const statusColors: Record<string, string> = {
  pending: 'from-yellow-500 to-amber-500',
  approved: 'from-green-500 to-emerald-500',
  rejected: 'from-red-500 to-rose-500',
};

const statusBadgeColors: Record<string, string> = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
  approved: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
};

const typeColors: Record<string, string> = {
  place: 'from-indigo-500 to-purple-500',
  event: 'from-purple-500 to-pink-500',
  'real-estate': 'from-blue-500 to-cyan-500',
};

const typeBadgeColors: Record<string, string> = {
  place: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
  event: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
  'real-estate': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
};

export function SubmissionCard({ submission, onViewDetails }: SubmissionCardProps) {
  const displayName = submission.data.name || submission.data.title || 'Untitled';
  const gradientClass = statusColors[submission.status] || 'from-gray-500 to-slate-500';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="group card card-hover">
      {/* Header with status indicator */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4">
        <div className={`absolute top-0 right-0 h-full w-2 bg-gradient-to-b ${gradientClass}`} />

        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:bg-clip-text transition-all duration-200">
                {displayName}
              </h3>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                typeBadgeColors[submission.type]
              )}>
                {submission.type === 'real-estate' ? 'Real Estate' : submission.type.charAt(0).toUpperCase() + submission.type.slice(1)}
              </span>
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                statusBadgeColors[submission.status]
              )}>
                {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Status icon */}
          <div className={`bg-gradient-to-br ${gradientClass} text-white p-3 rounded-full shadow-lg`}>
            <FileText className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
          {submission.data.description}
        </p>

        {/* Submitter info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <User className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <span className="font-medium">Submitted by:</span>
            <span className="truncate">{submission.submittedBy.name}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <span className="truncate">{submission.submittedBy.email}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <span>Submitted on {formatDate(submission.submittedAt)}</span>
          </div>
        </div>

        {/* Review notes (if rejected) */}
        {submission.status === 'rejected' && submission.reviewNotes && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-xs font-medium text-red-800 dark:text-red-300 mb-1">
              Rejection Reason:
            </p>
            <p className="text-sm text-red-700 dark:text-red-400 line-clamp-2">
              {submission.reviewNotes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onViewDetails?.(submission)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors duration-200"
          >
            <Eye className="h-4 w-4" />
            View Details
          </button>

          {submission.reviewedAt && (
            <span className="text-xs text-gray-500 dark:text-gray-500">
              Reviewed {formatDate(submission.reviewedAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
