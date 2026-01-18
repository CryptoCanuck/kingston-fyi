"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Loader2,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Inbox
} from 'lucide-react';
import { SubmissionCard } from './SubmissionCard';
import { ApproveRejectModal } from './ApproveRejectModal';

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

interface PaginationData {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface SubmissionListResponse {
  submissions: SubmissionData[];
  pagination: PaginationData;
}

export default function SubmissionList() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<SubmissionListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get filter parameters from URL
  const status = searchParams.get('status') || '';
  const type = searchParams.get('type') || '';

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query string
        const params = new URLSearchParams();
        if (status && status !== 'all') {
          params.set('status', status);
        }
        if (type && type !== 'all') {
          params.set('type', type);
        }
        params.set('page', currentPage.toString());
        params.set('limit', '10');

        const queryString = params.toString();
        const url = `/api/submissions${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch submissions');
        }

        const responseData = await response.json();
        setData(responseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [status, type, currentPage, refreshTrigger]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [status, type]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (submission: SubmissionData) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
  };

  const handleSuccess = () => {
    // Refetch submissions to update the list
    setRefreshTrigger(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="card p-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-muted text-lg">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-12 border-red-200 dark:border-red-800">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="heading-3 mb-2 text-red-600 dark:text-red-400">
            Error Loading Submissions
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.submissions.length === 0) {
    return (
      <div className="card p-12">
        <div className="text-center">
          <Inbox className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
          <h3 className="heading-3 mb-2 text-gray-700 dark:text-gray-300">
            No Submissions Found
          </h3>
          <p className="text-muted">
            {status || type
              ? 'Try adjusting your filters to see more results.'
              : 'There are no submissions yet.'}
          </p>
        </div>
      </div>
    );
  }

  const { submissions, pagination } = data;

  return (
    <div className="space-y-6">
      {/* Submissions List Header */}
      <div className="flex items-center justify-between">
        <h2 className="heading-2 flex items-center">
          <FileText className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
          Submissions
        </h2>
        <p className="text-muted">
          Showing {submissions.length} of {pagination.total} submissions
        </p>
      </div>

      {/* Submissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {submissions.map((submission) => (
          <SubmissionCard
            key={submission._id}
            submission={submission}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {/* Approve/Reject Modal */}
      <ApproveRejectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        submission={selectedSubmission}
        onSuccess={handleSuccess}
      />

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted">
              Page {pagination.page} of {pagination.totalPages}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>

              {/* Page numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - pagination.page) <= 1
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;

                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsisBefore && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            page === pagination.page
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>

            <div className="text-sm text-muted">
              Total: {pagination.total}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
