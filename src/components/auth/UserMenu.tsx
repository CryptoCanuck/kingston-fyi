"use client";

import { useState, useRef, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  LogOut, 
  Settings, 
  FileText, 
  Building, 
  ChevronDown,
  Loader2
} from 'lucide-react';

export function UserMenu() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/login"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="btn-primary px-4 py-2 text-sm"
        >
          Sign up
        </Link>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    {
      label: 'Profile',
      href: '/profile',
      icon: User,
    },
    {
      label: 'My Listings',
      href: '/my-listings',
      icon: FileText,
      show: session.user.role === 'business_owner' || session.user.role === 'admin',
    },
    {
      label: 'Business Dashboard',
      href: '/business/dashboard',
      icon: Building,
      show: session.user.role === 'business_owner',
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
            {getInitials(session.user.name || session.user.email || 'U')}
          </div>
        )}
        <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
          {session.user.name || session.user.email}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {session.user.name || 'User'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {session.user.email}
            </p>
            {session.user.role !== 'user' && (
              <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                {session.user.role.replace('_', ' ').charAt(0).toUpperCase() + session.user.role.slice(1).replace('_', ' ')}
              </span>
            )}
          </div>

          <div className="py-2">
            {menuItems
              .filter(item => item.show !== false)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-2">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}