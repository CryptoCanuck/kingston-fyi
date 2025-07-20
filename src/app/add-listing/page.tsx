"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Check, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlaceCategory } from '@/types/models';
import { useAuth } from '@/hooks/useAuth';

interface BusinessFormData {
  // Basic Info
  name: string;
  category: PlaceCategory | '';
  subcategories: string;
  description: string;
  
  // Location
  street: string;
  city: string;
  province: string;
  postalCode: string;
  
  // Contact
  phone: string;
  email: string;
  website: string;
  
  // Hours (simplified)
  hours: string;
  
  // Additional
  priceRange: '$' | '$$' | '$$$' | '$$$$' | '';
  features: string;
  amenities: string;
}

const categories: { value: PlaceCategory; label: string }[] = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'bar', label: 'Bar/Pub' },
  { value: 'cafe', label: 'Cafe' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'attraction', label: 'Attraction' },
  { value: 'activity', label: 'Activity' },
  { value: 'service', label: 'Service' },
];

const priceRanges = [
  { value: '$', label: '$ - Budget Friendly' },
  { value: '$$', label: '$$ - Moderate' },
  { value: '$$$', label: '$$$ - Upscale' },
  { value: '$$$$', label: '$$$$ - Fine Dining' },
];

export default function AddListingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState<BusinessFormData>({
    name: '',
    category: '',
    subcategories: '',
    description: '',
    street: '',
    city: 'Kingston',
    province: 'ON',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    hours: '',
    priceRange: '',
    features: '',
    amenities: '',
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?callbackUrl=/add-listing');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        throw new Error('Failed to submit listing');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <div className="spinner h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="card p-8 max-w-md mx-auto text-center">
          <Shield className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <h2 className="heading-3 mb-2">Authentication Required</h2>
          <p className="text-muted mb-6">
            You need to be signed in to add a business listing.
          </p>
          <Link href="/login?callbackUrl=/add-listing" className="btn-primary px-6 py-3">
            Sign in to continue
          </Link>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-subtle py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-2xl">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="heading-2 mb-4">Submission Received!</h1>
            <p className="text-muted mb-6">
              Thank you for submitting your business listing. We&apos;ll review your information and get back to you within 2-3 business days.
            </p>
            <div className="space-y-3">
              <Link href="/explore" className="btn-primary">
                Browse Listings
              </Link>
              <Link href="/" className="btn-outline">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          
          <h1 className="heading-1 text-gradient-indigo-purple mb-2">
            Add Your Business
          </h1>
          <p className="text-lg text-muted">
            Join Kingston.FYI and reach more customers in your community
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-2 text-sm text-muted">
            Step {currentStep} of 4
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="heading-3 mb-6">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Business Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800"
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subcategories</label>
                <input
                  type="text"
                  name="subcategories"
                  value={formData.subcategories}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800"
                  placeholder="e.g., Fine Dining, Italian, Romantic"
                />
                <p className="text-xs text-muted mt-1">Separate multiple subcategories with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800"
                  placeholder="Describe your business, what makes it special, and what customers can expect..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="heading-3 mb-6">Location Details</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Street Address *</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800"
                  placeholder="123 Princess Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Province *</label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800"
                    placeholder="K7L 1A1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact & Hours */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="heading-3 mb-6">Contact & Hours</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800"
                    placeholder="(613) 555-0123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800"
                    placeholder="info@yourbusiness.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800"
                  placeholder="https://yourbusiness.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Operating Hours</label>
                <textarea
                  name="hours"
                  value={formData.hours}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800"
                  placeholder="Mon-Fri: 9:00 AM - 6:00 PM&#10;Sat: 10:00 AM - 4:00 PM&#10;Sun: Closed"
                />
              </div>
            </div>
          )}

          {/* Step 4: Additional Details */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="heading-3 mb-6">Additional Details</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <select
                  name="priceRange"
                  value={formData.priceRange}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800"
                >
                  <option value="">Select price range</option>
                  {priceRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Key Features</label>
                <input
                  type="text"
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800"
                  placeholder="e.g., Outdoor Seating, Live Music, Free WiFi"
                />
                <p className="text-xs text-muted mt-1">Separate multiple features with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amenities</label>
                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800"
                  placeholder="e.g., Wheelchair Accessible, Parking, Takeout"
                />
                <p className="text-xs text-muted mt-1">Separate multiple amenities with commas</p>
              </div>

              {/* Photo Upload Placeholder */}
              <div>
                <label className="block text-sm font-medium mb-2">Business Photos</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted mb-2">Upload photos of your business</p>
                  <p className="text-xs text-muted">Coming soon - photo upload functionality</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary px-6 py-2"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn-primary px-6 py-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Listing'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}