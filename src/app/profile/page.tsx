"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Settings, 
  FileText,
  Building,
  Camera,
  Loader2
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?callbackUrl=/profile');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: '',
        location: '',
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        name: formData.name,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'moderator':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'business_owner':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-muted hover:text-indigo-600 dark:hover:text-indigo-400 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
          
          <h1 className="heading-1 text-gradient-indigo-purple">
            My Profile
          </h1>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="card p-6 text-center">
              <div className="relative inline-block mb-4">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-medium">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                  <Camera className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <h2 className="heading-3 mb-2">{user.name || 'User'}</h2>
              <p className="text-muted mb-4">{user.email}</p>
              
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role || 'user')}`}>
                <Shield className="h-3 w-3 mr-1" />
                {user.role?.replace('_', ' ').charAt(0).toUpperCase() + (user.role?.slice(1).replace('_', ' ') || '')}
              </span>
            </div>

            {/* Quick Links */}
            <div className="card p-6 mt-6">
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-3">
                {user.role === 'business_owner' && (
                  <>
                    <Link
                      href="/my-listings"
                      className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      My Listings
                    </Link>
                    <Link
                      href="/business/dashboard"
                      className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Business Dashboard
                    </Link>
                  </>
                )}
                <Link
                  href="/settings"
                  className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </Link>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="md:col-span-2">
            <div className="card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="heading-3">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-outline px-4 py-2 text-sm"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="btn-ghost px-4 py-2 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <User className="inline h-4 w-4 mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-gray-100">{user.name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email Address
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">{user.email}</p>
                  <p className="text-xs text-muted mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Member Since
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                {/* Future fields */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-muted">
                    More profile options coming soon, including bio, location, and preferences.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="card p-8 mt-6">
              <h2 className="heading-3 mb-6">Activity Stats</h2>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">0</p>
                  <p className="text-sm text-muted">Reviews</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">0</p>
                  <p className="text-sm text-muted">Photos</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">0</p>
                  <p className="text-sm text-muted">Helpful Votes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}