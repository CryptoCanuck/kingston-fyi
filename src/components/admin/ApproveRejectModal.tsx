"use client";

import { useState } from 'react';
import { X, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';

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

interface ApproveRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: SubmissionData | null;
  onSuccess: () => void;
}

export function ApproveRejectModal({
  isOpen,
  onClose,
  submission,
  onSuccess,
}: ApproveRejectModalProps) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen || !submission) return null;

  const displayName = submission.data.name || submission.data.title || 'Untitled';

  const handleAction = async (action: 'approve' | 'reject') => {
    setError('');
    setSuccessMessage('');

    // Validation for reject action
    if (action === 'reject' && !notes.trim()) {
      setError('Rejection reason is required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/submissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId: submission._id,
          action,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      setSuccessMessage(`Submission ${action}d successfully!`);

      // Close modal and refresh list after a short delay
      setTimeout(() => {
        onSuccess();
        onClose();
        setNotes('');
        setSuccessMessage('');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setNotes('');
      setError('');
      setSuccessMessage('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Review Submission
            </h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start space-x-3 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3 mb-4">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submission Details */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {displayName}
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">
                    Type:
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {submission.type === 'real-estate'
                      ? 'Real Estate'
                      : submission.type.charAt(0).toUpperCase() + submission.type.slice(1)}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">
                    Submitted by:
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {submission.submittedBy.name} ({submission.submittedBy.email})
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">
                    Description:
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {submission.data.description}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">
                    Submitted:
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes/Reason Input */}
            <div className="mb-6">
              <label htmlFor="notes" className="block text-sm font-medium mb-2">
                Notes {submission.status === 'pending' && (
                  <span className="text-gray-500 dark:text-gray-400">(required for rejection)</span>
                )}
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 transition-colors resize-none"
                placeholder="Enter approval notes or rejection reason..."
                disabled={isLoading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleAction('reject')}
                disabled={isLoading || submission.status !== 'pending'}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleAction('approve')}
                disabled={isLoading || submission.status !== 'pending'}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
