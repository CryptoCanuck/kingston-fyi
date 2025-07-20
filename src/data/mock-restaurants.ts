import { Restaurant } from '@/types';

export const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    slug: 'chez-piggy',
    name: 'Chez Piggy',
    description: 'Iconic Kingston restaurant serving globally-inspired cuisine in a charming limestone courtyard setting. Known for their weekend brunch and romantic atmosphere.',
    cuisine: ['Contemporary', 'Canadian', 'International'],
    priceRange: '$$$',
    address: {
      street: '68R Princess St',
      city: 'Kingston',
      province: 'ON',
      postalCode: 'K7L 1A5',
      country: 'Canada'
    },
    coordinates: {
      lat: 44.2312,
      lng: -76.4816
    },
    phone: '(613) 549-7673',
    website: 'https://www.chezpiggy.com',
    email: 'info@chezpiggy.com',
    hours: {
      monday: { open: '11:30', close: '21:00' },
      tuesday: { open: '11:30', close: '21:00' },
      wednesday: { open: '11:30', close: '21:00' },
      thursday: { open: '11:30', close: '21:00' },
      friday: { open: '11:30', close: '22:00' },
      saturday: { open: '10:00', close: '22:00' },
      sunday: { open: '10:00', close: '21:00' }
    },
    images: {
      main: '/images/restaurants/chez-piggy-main.jpg',
      gallery: [
        '/images/restaurants/chez-piggy-1.jpg',
        '/images/restaurants/chez-piggy-2.jpg',
        '/images/restaurants/chez-piggy-3.jpg'
      ]
    },
    features: ['Patio', 'Weekend Brunch', 'Historic Building', 'Full Bar', 'Reservations', 'Private Dining'],
    rating: 4.5,
    reviewCount: 892,
    featured: true,
    verified: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    slug: 'atomica',
    name: 'Atomica',
    description: 'Modern Italian kitchen and wine bar featuring handmade pasta, wood-fired pizzas, and an extensive wine selection in a stylish downtown setting.',
    cuisine: ['Italian', 'Pizza', 'Wine Bar'],
    priceRange: '$$$',
    address: {
      street: '71 Brock St',
      city: 'Kingston',
      province: 'ON',
      postalCode: 'K7L 1R8',
      country: 'Canada'
    },
    coordinates: {
      lat: 44.2298,
      lng: -76.4813
    },
    phone: '(613) 530-2118',
    website: 'https://www.atomica.ca',
    hours: {
      monday: 'Closed',
      tuesday: { open: '17:00', close: '22:00' },
      wednesday: { open: '17:00', close: '22:00' },
      thursday: { open: '17:00', close: '22:00' },
      friday: { open: '17:00', close: '23:00' },
      saturday: { open: '17:00', close: '23:00' },
      sunday: { open: '17:00', close: '21:00' }
    },
    images: {
      main: '/images/restaurants/atomica-main.jpg',
      gallery: [
        '/images/restaurants/atomica-1.jpg',
        '/images/restaurants/atomica-2.jpg'
      ]
    },
    features: ['Wine Bar', 'Handmade Pasta', 'Wood-Fired Pizza', 'Date Night', 'Reservations'],
    rating: 4.6,
    reviewCount: 567,
    featured: true,
    verified: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '3',
    slug: 'woodenheads',
    name: 'Woodenheads Gourmet Pizza',
    description: 'Kingston\'s original gourmet pizza place, serving creative wood-fired pizzas with unique toppings and local ingredients since 1995.',
    cuisine: ['Pizza', 'Italian', 'Vegetarian Friendly'],
    priceRange: '$$',
    address: {
      street: '192 Ontario St',
      city: 'Kingston',
      province: 'ON',
      postalCode: 'K7L 2Y8',
      country: 'Canada'
    },
    coordinates: {
      lat: 44.2314,
      lng: -76.4859
    },
    phone: '(613) 549-1812',
    website: 'https://www.woodenheads.ca',
    hours: {
      monday: { open: '11:30', close: '21:00' },
      tuesday: { open: '11:30', close: '21:00' },
      wednesday: { open: '11:30', close: '21:00' },
      thursday: { open: '11:30', close: '22:00' },
      friday: { open: '11:30', close: '23:00' },
      saturday: { open: '11:30', close: '23:00' },
      sunday: { open: '16:00', close: '21:00' }
    },
    images: {
      main: '/images/restaurants/woodenheads-main.jpg',
      gallery: [
        '/images/restaurants/woodenheads-1.jpg',
        '/images/restaurants/woodenheads-2.jpg'
      ]
    },
    features: ['Wood-Fired Pizza', 'Local Ingredients', 'Craft Beer', 'Takeout', 'Delivery', 'Patio'],
    rating: 4.4,
    reviewCount: 723,
    featured: false,
    verified: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '4',
    slug: 'tango-nuevo',
    name: 'Tango Nuevo',
    description: 'Vibrant Latin tapas restaurant offering Spanish and Latin American small plates, cocktails, and live music in a colorful, energetic atmosphere.',
    cuisine: ['Spanish', 'Latin American', 'Tapas'],
    priceRange: '$$',
    address: {
      street: '331 King St E',
      city: 'Kingston',
      province: 'ON',
      postalCode: 'K7L 3B4',
      country: 'Canada'
    },
    coordinates: {
      lat: 44.2321,
      lng: -76.4775
    },
    phone: '(613) 544-3311',
    website: 'https://www.tangonuevo.ca',
    hours: {
      monday: 'Closed',
      tuesday: { open: '17:00', close: '22:00' },
      wednesday: { open: '17:00', close: '22:00' },
      thursday: { open: '17:00', close: '23:00' },
      friday: { open: '17:00', close: '00:00' },
      saturday: { open: '17:00', close: '00:00' },
      sunday: { open: '17:00', close: '21:00' }
    },
    images: {
      main: '/images/restaurants/tango-nuevo-main.jpg',
      gallery: [
        '/images/restaurants/tango-nuevo-1.jpg',
        '/images/restaurants/tango-nuevo-2.jpg',
        '/images/restaurants/tango-nuevo-3.jpg'
      ]
    },
    features: ['Tapas', 'Live Music', 'Cocktails', 'Gluten-Free Options', 'Group Dining', 'Late Night'],
    rating: 4.3,
    reviewCount: 445,
    featured: false,
    verified: true,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: '5',
    slug: 'pan-chancho',
    name: 'Pan Chancho Bakery & Café',
    description: 'Beloved local bakery and café known for artisanal breads, pastries, sandwiches, and prepared foods made with high-quality local ingredients.',
    cuisine: ['Bakery', 'Café', 'Canadian'],
    priceRange: '$$',
    address: {
      street: '44 Princess St',
      city: 'Kingston',
      province: 'ON',
      postalCode: 'K7L 1A4',
      country: 'Canada'
    },
    coordinates: {
      lat: 44.2308,
      lng: -76.4821
    },
    phone: '(613) 544-7790',
    website: 'https://www.panchancho.com',
    hours: {
      monday: { open: '07:00', close: '18:00' },
      tuesday: { open: '07:00', close: '18:00' },
      wednesday: { open: '07:00', close: '18:00' },
      thursday: { open: '07:00', close: '18:00' },
      friday: { open: '07:00', close: '18:00' },
      saturday: { open: '07:00', close: '18:00' },
      sunday: { open: '08:00', close: '17:00' }
    },
    images: {
      main: '/images/restaurants/pan-chancho-main.jpg',
      gallery: [
        '/images/restaurants/pan-chancho-1.jpg',
        '/images/restaurants/pan-chancho-2.jpg'
      ]
    },
    features: ['Bakery', 'Breakfast', 'Lunch', 'Takeout', 'Local Ingredients', 'Catering'],
    rating: 4.7,
    reviewCount: 1203,
    featured: true,
    verified: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05')
  }
];

// Helper function to get featured restaurants
export const getFeaturedRestaurants = () => {
  return mockRestaurants.filter(restaurant => restaurant.featured);
};

// Helper function to get restaurant by slug
export const getRestaurantBySlug = (slug: string) => {
  return mockRestaurants.find(restaurant => restaurant.slug === slug);
};

// Helper function to search restaurants
export const searchRestaurants = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return mockRestaurants.filter(restaurant => 
    restaurant.name.toLowerCase().includes(lowercaseQuery) ||
    restaurant.cuisine.some(c => c.toLowerCase().includes(lowercaseQuery)) ||
    restaurant.description.toLowerCase().includes(lowercaseQuery)
  );
};