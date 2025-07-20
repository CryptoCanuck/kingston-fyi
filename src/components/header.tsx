"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './auth';
import { useState } from 'react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Explore', href: '/explore' },
  { name: 'Places', href: '/places' },
  { name: 'Events', href: '/events' },
  { name: 'Real Estate', href: '/real-estate' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass-effect">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xl font-bold text-gradient-indigo-purple">Kingston.FYI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-all duration-200 hover:text-indigo-600 dark:hover:text-indigo-400",
                  pathname === item.href
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-gray-600 dark:text-gray-400"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <UserMenu />
            </div>
          </nav>

          {/* Mobile menu button and theme toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    pathname === item.href
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                <UserMenu />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}