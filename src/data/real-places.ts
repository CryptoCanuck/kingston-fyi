import { Place, PlaceCategory } from '@/types/models';

// Real Kingston businesses - starting with well-known establishments
export const realKingstonPlaces: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Restaurants
  {
    slug: 'chez-piggy',
    name: 'Chez Piggy',
    category: 'restaurant' as PlaceCategory,
    subcategories: ['Fine Dining', 'Canadian', 'Historic'],
    description: 'Iconic Kingston restaurant housed in a beautifully restored 19th-century limestone stable. Known for creative seasonal cuisine featuring local ingredients and an extensive wine list.',
    address: {
      street: '68 Princess Street',
      city: 'Kingston',
      province: 'ON',
      postalCode: 'K7L 1A4',
      country: 'Canada',
    },
    location: {
      lat: 44.2307,
      lng: -76.4813,
    },
    contact: {
      phone: '(613) 549-7673',
      website: 'https://chezpiggy.com',
    },
    hours: {
      tuesday: { open: '11:30', close: '21:00' },
      wednesday: { open: '11:30', close: '21:00' },
      thursday: { open: '11:30', close: '21:00' },
      friday: { open: '11:30', close: '22:00' },
      saturday: { open: '11:30', close: '22:00' },
      sunday: { open: '11:30', close: '21:00' },
    },
    priceRange: '$$$',
    rating: 4.4,
    reviewCount: 1200,
    images: {
      main: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=800&h=600&fit=crop'
      ],
    },
    features: ['Patio', 'Historic Building', 'Local Ingredients', 'Wine Bar', 'Romantic'],
    amenities: ['Wheelchair Accessible', 'Reservations', 'Private Dining'],
    verified: true,
    featured: true,
  },
  {
    slug: 'atomica',
    name: 'Atomica',
    category: 'restaurant' as PlaceCategory,
    subcategories: ['Pizza', 'Italian', 'Contemporary'],
    description: 'Modern Italian restaurant specializing in wood-fired Neapolitan pizza and creative cocktails. Features a stylish downtown atmosphere with an open kitchen.',
    address: {
      street: '71 Brock Street',
      city: 'Kingston',
      province: 'ON',
      postalCode: 'K7L 1R8',
      country: 'Canada',
    },
    location: {
      lat: 44.2297,
      lng: -76.4801,
    },
    contact: {
      phone: '(613) 542-9986',
      website: 'https://atomicakingston.com',
    },
    hours: {
      monday: { open: '17:00', close: '22:00' },
      tuesday: { open: '17:00', close: '22:00' },
      wednesday: { open: '17:00', close: '22:00' },
      thursday: { open: '17:00', close: '23:00' },
      friday: { open: '17:00', close: '23:00' },
      saturday: { open: '17:00', close: '23:00' },
      sunday: { open: '17:00', close: '22:00' },
    },
    priceRange: '$$',
    rating: 4.6,
    reviewCount: 890,
    images: {
      main: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=800&h=600&fit=crop'
      ],
    },
    features: ['Wood-fired Oven', 'Craft Cocktails', 'Open Kitchen', 'Date Night'],
    amenities: ['Takeout', 'Delivery', 'Bar'],
    verified: true,
    featured: true,
  },
  {
    slug: 'dianne-s-fish-bar-and-grill',
    name: "Dianne's Fish Bar & Grill",
    category: 'restaurant' as PlaceCategory,
    subcategories: ['Seafood', 'Canadian', 'Casual Dining'],
    description: 'Fresh seafood restaurant specializing in fish and chips, seafood platters, and Maritime favorites. Family-owned and operated for over 30 years.',
    address: {
      street: '195 Ontario Street',
      city: 'Kingston',
      province: 'ON',
      postalCode: 'K7L 2Y9',
      country: 'Canada',
    },
    location: {
      lat: 44.2284,
      lng: -76.4836,
    },
    contact: {
      phone: '(613) 549-4340',
    },
    hours: {
      monday: { open: '11:00', close: '20:00' },
      tuesday: { open: '11:00', close: '20:00' },
      wednesday: { open: '11:00', close: '20:00' },
      thursday: { open: '11:00', close: '20:00' },
      friday: { open: '11:00', close: '21:00' },
      saturday: { open: '11:00', close: '21:00' },
      sunday: { open: '12:00', close: '20:00' },
    },
    priceRange: '$$',
    rating: 4.3,
    reviewCount: 650,
    images: {
      main: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1559847844-d7b38ba17aeb?w=800&h=600&fit=crop'
      ],
    },
    features: ['Fresh Seafood', 'Family Owned', 'Fish & Chips', 'Maritime Cuisine'],
    amenities: ['Takeout', 'Family Friendly', 'Casual Dining'],
    verified: true,
    featured: false,
  },
  
  // Cafes
  {
    slug: 'pan-chancho',
    name: 'Pan Chancho Bakery & Café',
    category: 'cafe' as PlaceCategory,
    subcategories: ['Bakery', 'Coffee', 'Breakfast', 'Lunch'],
    description: 'Artisan bakery and café serving fresh-baked breads, pastries, coffee, and gourmet sandwiches. Known for their sourdough and European-style baking.',
    address: {
      street: '44 Princess Street',
      city: 'Kingston',
      province: 'ON',
      postalCode: 'K7L 1A3',
      country: 'Canada',
    },
    location: {
      lat: 44.2314,
      lng: -76.4807,
    },
    contact: {
      phone: '(613) 544-7790',
      website: 'https://panchancho.com',
    },
    hours: {
      monday: { open: '07:00', close: '17:00' },
      tuesday: { open: '07:00', close: '17:00' },
      wednesday: { open: '07:00', close: '17:00' },
      thursday: { open: '07:00', close: '17:00' },
      friday: { open: '07:00', close: '17:00' },
      saturday: { open: '07:00', close: '17:00' },
      sunday: { open: '08:00', close: '16:00' },
    },
    priceRange: '$$',
    rating: 4.7,
    reviewCount: 980,
    images: {
      main: 'https://images.unsplash.com/photo-1514066558159-fc8c737ef259?w=800&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1555507036-ab794f4eca25?w=800&h=600&fit=crop'
      ],
    },
    features: ['Fresh Bread', 'Artisan Coffee', 'European Pastries', 'Outdoor Seating'],
    amenities: ['WiFi', 'Takeout', 'Catering', 'Vegan Options'],
    verified: true,
    featured: true,
  },

  // Bars & Nightlife
  {
    slug: 'the-mansion',
    name: 'The Mansion',
    category: 'bar' as PlaceCategory,
    subcategories: ['Nightclub', 'Live Music', 'Dancing'],
    description: 'Historic three-floor venue featuring live bands, DJs, and multiple bars. One of Kingston\'s premier nightlife destinations with different vibes on each floor.',
    address: {
      street: '104 Clarence Street',
      city: 'Kingston',
      province: 'ON',
      postalCode: 'K7L 5N6',
      country: 'Canada',
    },
    location: {
      lat: 44.2301,
      lng: -76.4789,
    },
    contact: {
      phone: '(613) 549-6565',
      website: 'https://themansionkingston.com',
    },
    hours: {
      wednesday: { open: '21:00', close: '02:00' },
      thursday: { open: '21:00', close: '02:00' },
      friday: { open: '21:00', close: '02:00' },
      saturday: { open: '21:00', close: '02:00' },
    },
    priceRange: '$$',
    rating: 4.1,
    reviewCount: 750,
    images: {
      main: 'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=800&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1571263320228-9046a3ae9845?w=800&h=600&fit=crop'
      ],
    },
    features: ['Live Music', 'Dancing', 'Multiple Floors', 'Historic Building'],
    amenities: ['19+', 'Coat Check', 'VIP Area'],
    verified: true,
    featured: true,
  },

  // Attractions
  {
    slug: 'fort-henry',
    name: 'Fort Henry National Historic Site',
    category: 'attraction' as PlaceCategory,
    subcategories: ['Historic Site', 'Museum', 'Tours', 'Military History'],
    description: 'Magnificent 19th-century British fortress overlooking Kingston and the St. Lawrence River. Features military demonstrations, guided tours, and stunning views.',
    address: {
      street: '1 Fort Henry Drive',
      city: 'Kingston',
      province: 'ON',
      postalCode: 'K7K 5G8',
      country: 'Canada',
    },
    location: {
      lat: 44.2361,
      lng: -76.4669,
    },
    contact: {
      phone: '(613) 542-7388',
      website: 'https://www.pc.gc.ca/en/lhn-nhs/on/henry',
    },
    hours: {
      monday: { open: '10:00', close: '17:00' },
      tuesday: { open: '10:00', close: '17:00' },
      wednesday: { open: '10:00', close: '17:00' },
      thursday: { open: '10:00', close: '17:00' },
      friday: { open: '10:00', close: '17:00' },
      saturday: { open: '10:00', close: '17:00' },
      sunday: { open: '10:00', close: '17:00' },
    },
    priceRange: '$$',
    rating: 4.5,
    reviewCount: 2100,
    images: {
      main: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&h=600&fit=crop'
      ],
    },
    features: ['Guided Tours', 'Military Demonstrations', 'Historic Exhibits', 'Scenic Views'],
    amenities: ['Parking', 'Gift Shop', 'Accessible', 'Group Tours'],
    verified: true,
    featured: true,
  },
];

// Function to convert real places to full Place objects
export function generateRealPlaces(): Place[] {
  return realKingstonPlaces.map((place, index) => ({
    ...place,
    id: `real-place-${index + 1}`,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  }));
}