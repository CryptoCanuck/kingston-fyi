"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface SignupFormProps {
  callbackUrl?: string;
}

export function SignupForm({ callbackUrl = '/explore' }: SignupFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validations, setValidations] = useState({
    passwordLength: false,
    passwordMatch: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time password validation
    if (name === 'password') {
      setValidations(prev => ({
        ...prev,
        passwordLength: value.length >= 8,
        passwordMatch: value === formData.confirmPassword && value.length > 0,
      }));
    }
    if (name === 'confirmPassword') {
      setValidations(prev => ({
        ...prev,
        passwordMatch: value === formData.password && value.length > 0,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // First, register the user via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Then sign them in
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError('Failed to sign in after registration');
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleZitadelSignup = () => {
    signIn('zitadel', { callbackUrl });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Full name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 transition-colors"
              placeholder="John Doe"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 transition-colors"
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 transition-colors"
              placeholder="Create a password"
              disabled={isLoading}
            />
          </div>
          <div className="mt-2 space-y-1">
            <div className={`flex items-center space-x-2 text-sm ${validations.passwordLength ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
              {validations.passwordLength ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-current" />
              )}
              <span>At least 8 characters</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 transition-colors"
              placeholder="Confirm your password"
              disabled={isLoading}
            />
          </div>
          {formData.confirmPassword && (
            <div className="mt-2">
              <div className={`flex items-center space-x-2 text-sm ${validations.passwordMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {validations.passwordMatch ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span>{validations.passwordMatch ? 'Passwords match' : 'Passwords do not match'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Privacy Policy
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading || !validations.passwordLength || !validations.passwordMatch}
          className="w-full btn-primary py-3 px-4 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create account</span>
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleZitadelSignup}
          disabled={isLoading}
          className="w-full btn-outline py-3 px-4"
        >
          Sign up with Zitadel
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}