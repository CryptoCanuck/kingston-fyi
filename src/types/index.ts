export * from './restaurant';
export * from './review';
export * from './user';

// Common types
export type SortOption = 'rating' | 'reviews' | 'name' | 'price';
export type FilterOption = {
  cuisine?: string[];
  priceRange?: string[];
  features?: string[];
  rating?: number;
};

export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}