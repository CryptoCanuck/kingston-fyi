import Link from 'next/link';
import { MapPin, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-subtle border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xl font-bold text-gradient-indigo-purple">Kingston.FYI</span>
            </div>
            <p className="text-muted mb-4">
              Your local guide to Kingston, Ontario. Discover handpicked restaurants, nightlife,
              events, and real estate in the Limestone City.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              © {new Date().getFullYear()} Kingston.FYI. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/explore" className="text-muted hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/places" className="text-muted hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                  Places
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-muted hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-muted">
                <Mail className="h-4 w-4" />
                <span>info@kingston.fyi</span>
              </li>
              <li className="flex items-center space-x-2 text-muted">
                <Phone className="h-4 w-4" />
                <span>(613) 555-0123</span>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-sm text-muted">
                Have a business to add?<br />
                <Link href="/add-listing" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  Add your listing
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}