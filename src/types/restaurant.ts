export interface Restaurant {
  id: string;
  slug: string;
  name: string;
  description: string;
  cuisine: string[];
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  website?: string;
  email?: string;
  hours: {
    [key: string]: {
      open: string;
      close: string;
    } | 'Closed';
  };
  images: {
    main: string;
    gallery: string[];
  };
  features: string[];
  rating: number;
  reviewCount: number;
  featured: boolean;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestaurantListItem {
  id: string;
  slug: string;
  name: string;
  cuisine: string[];
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  address: {
    street: string;
    city: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  images: {
    main: string;
  };
  featured: boolean;
}