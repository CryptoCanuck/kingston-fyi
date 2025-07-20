import Link from 'next/link';
import { MapPin, ArrowLeft } from 'lucide-react';

export default function PlaceNotFound() {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Place Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The place you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
        </div>
        
        <div className="space-y-3">
          <Link
            href="/explore"
            className="btn-primary px-6 py-3 inline-flex items-center gap-2"
          >
            Browse All Places
          </Link>
          
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}