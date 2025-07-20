"use client";

import { Suspense } from 'react';
import { SignupForm } from '@/components/auth';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

function SignupContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/explore';

  return (
    <div className="min-h-screen bg-gradient-subtle py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-md">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center text-muted hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>

        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="heading-2 text-gradient-indigo-purple mb-2">
              Create your account
            </h1>
            <p className="text-lg text-muted">
              Join Kingston.FYI to explore and share local insights
            </p>
          </div>

          <SignupForm callbackUrl={callbackUrl} />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted">
            Need help?{' '}
            <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-8 w-8"></div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}