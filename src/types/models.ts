// Base types
export interface Location {
  lat: number;
  lng: number;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface OpeningHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

// Place types
export type PlaceCategory = 
  | 'restaurant'
  | 'bar'
  | 'nightclub'
  | 'cafe'
  | 'bakery'
  | 'shopping'
  | 'attraction'
  | 'activity'
  | 'service';

export interface Place {
  id: string;
  slug: string;
  name: string;
  category: PlaceCategory;
  subcategories: string[];
  description: string;
  address: Address;
  location: Location;
  contact: ContactInfo;
  hours?: OpeningHours;
  priceRange?: '$' | '$$' | '$$$' | '$$$$';
  rating?: number;
  reviewCount?: number;
  images: {
    main: string;
    gallery?: string[];
  };
  features?: string[];
  amenities?: string[];
  verified: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Event types
export type EventCategory = 
  | 'music'
  | 'art'
  | 'food'
  | 'sports'
  | 'community'
  | 'education'
  | 'business'
  | 'other';

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: EventCategory;
  startDate: Date;
  endDate?: Date;
  startTime: string;
  endTime?: string;
  location: {
    name: string;
    address: Address;
    coordinates: Location;
  };
  organizer: {
    name: string;
    contact?: ContactInfo;
  };
  ticketInfo?: {
    price?: number;
    url?: string;
    availability?: 'available' | 'limited' | 'sold-out';
  };
  images: {
    main: string;
    gallery?: string[];
  };
  tags?: string[];
  maxAttendees?: number;
  currentAttendees?: number;
  verified: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Real Estate types
export type PropertyType = 
  | 'house'
  | 'condo'
  | 'apartment'
  | 'townhouse'
  | 'land'
  | 'commercial';

export type ListingType = 'sale' | 'rent';

export interface RealEstateListing {
  id: string;
  slug: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  address: Address;
  location: Location;
  details: {
    bedrooms?: number;
    bathrooms?: number;
    squareFeet?: number;
    lotSize?: number;
    yearBuilt?: number;
    parking?: number;
    basement?: boolean;
  };
  features: string[];
  images: {
    main: string;
    gallery?: string[];
  };
  contact: {
    name: string;
    phone?: string;
    email?: string;
    agency?: string;
  };
  virtualTour?: string;
  verified: boolean;
  featured: boolean;
  availableDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User submission types
export interface Submission {
  id: string;
  type: 'place' | 'event' | 'real-estate';
  data: Place | Event | RealEstateListing;
  submittedBy: {
    name: string;
    email: string;
    phone?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  submittedAt: Date;
  reviewedAt?: Date;
}