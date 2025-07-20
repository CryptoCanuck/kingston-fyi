import { Place, PlaceCategory } from '@/types/models';

// Real Kingston street names and areas
const kingstonStreets = [
  'Princess Street', 'King Street', 'Queen Street', 'Ontario Street', 
  'Brock Street', 'Wellington Street', 'Bagot Street', 'Clergy Street',
  'Earl Street', 'Clarence Street', 'Johnson Street', 'Division Street',
  'Union Street', 'William Street', 'Montreal Street', 'Sydenham Street',
  'Gore Street', 'Palace Road', 'University Avenue', 'Stuart Street',
  'Bath Road', 'Frontenac Street', 'Rideau Street', 'Cataraqui Street',
  'Counter Street', 'Pine Street', 'Elm Street', 'Cedar Street'
];

// Business name generators by category
const businessNames = {
  restaurant: {
    prefixes: ['The', 'Chez', 'Casa', 'Bistro', 'Café', 'Trattoria', 'Le', 'La'],
    names: ['Kingston', 'Limestone', 'Cataraqui', 'Crown', 'Royal', 'Harbor', 'Mill', 'Stone', 'Garden', 'Corner', 'Heritage', 'Downtown', 'Waterfront', 'Historic', 'Artisan'],
    suffixes: ['Grill', 'Kitchen', 'Table', 'House', 'Bistro', 'Eatery', 'Dining', 'Restaurant', 'Tavern', 'Lounge']
  },
  cafe: {
    prefixes: ['The', 'Café', 'Coffee', 'Bean', 'Brew', 'Grind', 'Steam', 'Roast'],
    names: ['Kingston', 'Limestone', 'Harbor', 'Corner', 'Downtown', 'Morning', 'Central', 'Cozy', 'Local', 'Artisan', 'Fresh', 'Daily'],
    suffixes: ['Café', 'Coffee', 'Roasters', 'House', 'Shop', 'Bar', 'Co.', 'Station', 'Corner', 'Brewing']
  },
  bar: {
    prefixes: ['The', 'Ye Olde', 'Red', 'Blue', 'Green', 'Golden', 'Silver', 'Iron', 'Stone'],
    names: ['Crown', 'Lion', 'Rose', 'Oak', 'Anchor', 'Ship', 'Kingston', 'Limestone', 'Harbor', 'Mill', 'Forge', 'Station'],
    suffixes: ['Pub', 'Tavern', 'Bar', 'House', 'Inn', 'Lounge', 'Club', 'Brewery', 'Taphouse', 'Saloon']
  },
  shopping: {
    prefixes: ['Kingston', 'Limestone', 'Heritage', 'Vintage', 'Modern', 'Classic', 'Urban', 'Boutique'],
    names: ['Style', 'Fashion', 'Trends', 'Collection', 'Gallery', 'Emporium', 'Market', 'Shop', 'Store', 'Boutique'],
    suffixes: ['Co.', 'House', 'Shop', 'Store', 'Boutique', 'Gallery', 'Market', 'Emporium', 'Collection', 'Studio']
  },
  attraction: {
    prefixes: ['Kingston', 'Historic', 'Heritage', 'Royal', 'Limestone', 'Cataraqui', 'St. Lawrence'],
    names: ['Museum', 'Gallery', 'Centre', 'House', 'Site', 'Tour', 'Experience', 'Heritage', 'Cultural', 'Historic'],
    suffixes: ['Museum', 'Gallery', 'Centre', 'Site', 'Tours', 'Experience', 'House', 'Hall', 'Park', 'Gardens']
  }
};

// Cuisine types and subcategories
const cuisineTypes = {
  restaurant: [
    ['Italian', 'Pizza', 'Pasta'], ['Asian', 'Chinese', 'Thai'], ['Mexican', 'Latin', 'Tacos'],
    ['Canadian', 'Local', 'Farm-to-Table'], ['French', 'Fine Dining', 'European'],
    ['Indian', 'Curry', 'Spice'], ['Greek', 'Mediterranean', 'Fresh'], 
    ['Japanese', 'Sushi', 'Ramen'], ['American', 'Burgers', 'BBQ'],
    ['Seafood', 'Fresh Fish', 'Maritime'], ['Steakhouse', 'Grill', 'Meat'],
    ['Vegetarian', 'Vegan', 'Health'], ['Brunch', 'Breakfast', 'Casual']
  ],
  cafe: [
    ['Coffee Shop', 'Espresso', 'Local Roaster'], ['Bakery', 'Pastries', 'Fresh Baked'],
    ['Tea House', 'Specialty Tea', 'Loose Leaf'], ['Brunch', 'Breakfast', 'All Day'],
    ['Health Food', 'Smoothies', 'Organic'], ['Dessert', 'Sweets', 'Ice Cream'],
    ['Study Spot', 'WiFi', 'Quiet'], ['Artisan', 'Local', 'Handcrafted']
  ],
  bar: [
    ['Sports Bar', 'TVs', 'Game Day'], ['Craft Beer', 'Local Brew', 'Microbrewery'],
    ['Cocktail Lounge', 'Mixology', 'Craft Cocktails'], ['Wine Bar', 'Sommelier', 'Cellar'],
    ['Pub Food', 'Casual', 'Comfort Food'], ['Live Music', 'Entertainment', 'Shows'],
    ['Karaoke', 'Fun', 'Party'], ['Pool Hall', 'Games', 'Recreation']
  ]
};

// Business features by category
const businessFeatures = {
  restaurant: [
    'Outdoor Seating', 'Patio', 'Private Dining', 'Wine List', 'Craft Cocktails',
    'Live Music', 'Date Night', 'Family Friendly', 'Groups Welcome', 'Reservations',
    'Local Ingredients', 'Farm-to-Table', 'Seasonal Menu', 'Chef Special',
    'Romantic Atmosphere', 'Historic Building', 'Waterfront View', 'Downtown Location'
  ],
  cafe: [
    'WiFi', 'Study Space', 'Outdoor Seating', 'Local Roaster', 'Fresh Pastries',
    'Vegan Options', 'Gluten Free', 'Takeout', 'Catering', 'Meeting Space',
    'Art Gallery', 'Local Art', 'Community Hub', 'Book Exchange',
    'Pet Friendly', 'Laptop Friendly', 'Quiet Space', 'Group Tables'
  ],
  bar: [
    'Live Music', 'Sports TVs', 'Pool Table', 'Darts', 'Karaoke',
    'Craft Beer', 'Local Brewery', 'Wine Selection', 'Cocktails',
    'Pub Food', 'Late Night', 'Happy Hour', 'Trivia Nights',
    'Patio', 'Games', 'Dancing', 'DJ', 'Events Space'
  ],
  shopping: [
    'Local Made', 'Handcrafted', 'Unique Gifts', 'Vintage', 'Antiques',
    'Designer', 'Boutique', 'Custom Orders', 'Personal Shopping',
    'Gift Wrapping', 'Local Artists', 'Exclusive Items', 'Quality Goods'
  ]
};

// Amenities
const commonAmenities = [
  'Wheelchair Accessible', 'Parking Available', 'Public Transit', 'Takeout',
  'Delivery', 'Reservations', 'Walk-ins Welcome', 'Credit Cards',
  'Debit Cards', 'Cash Only', 'Group Discounts', 'Student Discounts'
];

// Sample descriptions templates
const descriptionTemplates = {
  restaurant: [
    "A beloved local {cuisine} restaurant serving {specialty} in the heart of downtown Kingston. Known for {feature1} and {feature2}.",
    "Authentic {cuisine} cuisine featuring {specialty} and seasonal ingredients. Perfect for {occasion} with {atmosphere}.",
    "Family-owned {cuisine} restaurant offering {specialty} and traditional favorites. Features {feature1} and welcomes {clientele}.",
    "Modern {cuisine} dining with a focus on {specialty}. Enjoy {feature1} in our {atmosphere} setting.",
    "Cozy {cuisine} spot known for {specialty} and {feature1}. A Kingston favorite for over {years} years."
  ],
  cafe: [
    "Local coffee roastery serving {specialty} and fresh pastries. Perfect spot for {activity} with {feature1}.",
    "Artisan café featuring {specialty} and locally sourced ingredients. Enjoy {atmosphere} with {feature1}.",
    "Community gathering place offering {specialty} and {feature1}. Great for {activity} or casual meetings.",
    "Cozy neighborhood café specializing in {specialty}. Features {feature1} and welcomes {clientele}.",
    "Independent coffee shop known for {specialty} and {feature1}. Your local spot for {activity}."
  ],
  bar: [
    "Popular {type} featuring {specialty} and {entertainment}. Great atmosphere for {occasion} with friends.",
    "Local favorite offering {specialty} and {feature1}. Known for {entertainment} and {atmosphere}.",
    "Classic {type} serving {specialty} and traditional pub fare. Features {entertainment} and {feature1}.",
    "Trendy spot for {specialty} and {entertainment}. Perfect for {occasion} in a {atmosphere} setting.",
    "Neighborhood {type} known for {specialty}, {entertainment}, and friendly service."
  ]
};

function generateBusinessName(category: PlaceCategory): string {
  if (!businessNames[category as keyof typeof businessNames]) {
    return `Kingston ${category.charAt(0).toUpperCase() + category.slice(1)}`;
  }
  
  const config = businessNames[category as keyof typeof businessNames];
  const prefix = config.prefixes[Math.floor(Math.random() * config.prefixes.length)];
  const name = config.names[Math.floor(Math.random() * config.names.length)];
  const suffix = config.suffixes[Math.floor(Math.random() * config.suffixes.length)];
  
  // Sometimes skip prefix, sometimes skip one part
  const variations = [
    `${prefix} ${name} ${suffix}`,
    `${name} ${suffix}`,
    `${prefix} ${suffix}`,
    `${name}'s ${suffix}`,
    `The ${name} ${suffix}`
  ];
  
  return variations[Math.floor(Math.random() * variations.length)];
}

function generateAddress(index: number): { street: string; coordinates: { lat: number; lng: number } } {
  const street = kingstonStreets[Math.floor(Math.random() * kingstonStreets.length)];
  const number = 50 + (index * 7) % 500; // Spread out the numbers
  
  // Kingston downtown area coordinates with some variance
  const baseLat = 44.2312;
  const baseLng = -76.4816;
  const lat = baseLat + (Math.random() - 0.5) * 0.02; // ~2km variance
  const lng = baseLng + (Math.random() - 0.5) * 0.03; // ~3km variance
  
  return {
    street: `${number} ${street}`,
    coordinates: { lat, lng }
  };
}

function generateDescription(category: PlaceCategory, subcategories: string[], features: string[]): string {
  if (!descriptionTemplates[category as keyof typeof descriptionTemplates]) {
    return `A popular ${category} in downtown Kingston, serving the local community with quality service and products.`;
  }
  
  const templates = descriptionTemplates[category as keyof typeof descriptionTemplates];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  const occasions = ['date nights', 'family dinners', 'business meetings', 'casual dining', 'special occasions'];
  const atmospheres = ['cozy', 'modern', 'historic', 'trendy', 'welcoming', 'elegant', 'casual', 'vibrant'];
  const activities = ['studying', 'working', 'meeting friends', 'reading', 'relaxing'];
  const clienteles = ['families', 'students', 'professionals', 'locals', 'visitors', 'everyone'];
  
  return template
    .replace('{cuisine}', subcategories[0] || category)
    .replace('{specialty}', subcategories[1] || 'quality food')
    .replace('{type}', subcategories[0] || 'establishment')
    .replace('{feature1}', features[0] || 'great service')
    .replace('{feature2}', features[1] || 'friendly staff')
    .replace('{entertainment}', features.find(f => f.includes('Music') || f.includes('Trivia')) || 'entertainment')
    .replace('{occasion}', occasions[Math.floor(Math.random() * occasions.length)])
    .replace('{atmosphere}', atmospheres[Math.floor(Math.random() * atmospheres.length)])
    .replace('{activity}', activities[Math.floor(Math.random() * activities.length)])
    .replace('{clientele}', clienteles[Math.floor(Math.random() * clienteles.length)])
    .replace('{years}', String(5 + Math.floor(Math.random() * 20)));
}

function generatePhoneNumber(): string {
  const exchange = 540 + Math.floor(Math.random() * 10); // 540-549 are Kingston exchanges
  const number = 1000 + Math.floor(Math.random() * 9000);
  return `(613) ${exchange}-${number}`;
}

function generateWebsite(name: string): string {
  const domains = ['.com', '.ca', '.net'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .substring(0, 15);
  return `https://${slug}kingston${domain}`;
}

function generateRating(): number {
  // Weighted towards good ratings (3.5-5.0)
  const weights = [0.05, 0.1, 0.15, 0.25, 0.25, 0.2]; // 1-star to 5-star weights
  let random = Math.random();
  let rating = 1;
  
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      rating = i + 1;
      break;
    }
  }
  
  // Add decimal precision
  return Math.round((rating + Math.random() - 0.5) * 10) / 10;
}

function selectRandomItems<T>(array: T[], min: number = 1, max: number = 4): T[] {
  const count = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateBusinessHours() {
  const patterns = [
    // Regular business hours
    {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
      saturday: { open: '10:00', close: '16:00' },
    },
    // Restaurant hours
    {
      tuesday: { open: '11:00', close: '22:00' },
      wednesday: { open: '11:00', close: '22:00' },
      thursday: { open: '11:00', close: '22:00' },
      friday: { open: '11:00', close: '23:00' },
      saturday: { open: '11:00', close: '23:00' },
      sunday: { open: '11:00', close: '21:00' },
    },
    // Café hours
    {
      monday: { open: '07:00', close: '17:00' },
      tuesday: { open: '07:00', close: '17:00' },
      wednesday: { open: '07:00', close: '17:00' },
      thursday: { open: '07:00', close: '17:00' },
      friday: { open: '07:00', close: '18:00' },
      saturday: { open: '08:00', close: '18:00' },
      sunday: { open: '08:00', close: '16:00' },
    },
    // Bar hours
    {
      wednesday: { open: '17:00', close: '02:00' },
      thursday: { open: '17:00', close: '02:00' },
      friday: { open: '17:00', close: '02:00' },
      saturday: { open: '15:00', close: '02:00' },
      sunday: { open: '15:00', close: '24:00' },
    }
  ];
  
  return patterns[Math.floor(Math.random() * patterns.length)];
}

export function generateKingstonBusinesses(count: number = 50): Place[] {
  const categories: PlaceCategory[] = ['restaurant', 'cafe', 'bar', 'shopping', 'attraction', 'service', 'activity'];
  const places: Place[] = [];
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const name = generateBusinessName(category);
    const subcategories = cuisineTypes[category as keyof typeof cuisineTypes] 
      ? cuisineTypes[category as keyof typeof cuisineTypes][Math.floor(Math.random() * cuisineTypes[category as keyof typeof cuisineTypes].length)]
      : [category];
    
    const availableFeatures = businessFeatures[category as keyof typeof businessFeatures] || [];
    const features = selectRandomItems(availableFeatures, 2, 5);
    const amenities = selectRandomItems(commonAmenities, 1, 4);
    const address = generateAddress(i);
    const rating = generateRating();
    
    const priceRanges: Array<'$' | '$$' | '$$$' | '$$$$'> = ['$', '$$', '$$$', '$$$$'];
    const priceWeights = [0.3, 0.4, 0.25, 0.05]; // Most businesses are $ or $$
    let priceRange: '$' | '$$' | '$$$' | '$$$$' = '$';
    let random = Math.random();
    for (let j = 0; j < priceWeights.length; j++) {
      random -= priceWeights[j];
      if (random <= 0) {
        priceRange = priceRanges[j];
        break;
      }
    }
    
    const place: Place = {
      id: `generated-${i + 1}`,
      slug: name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-'),
      name,
      category,
      subcategories,
      description: generateDescription(category, subcategories, features),
      address: {
        street: address.street,
        city: 'Kingston',
        province: 'ON',
        postalCode: `K7L ${Math.floor(Math.random() * 9)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}`,
        country: 'Canada',
      },
      location: address.coordinates,
      contact: {
        phone: generatePhoneNumber(),
        website: Math.random() > 0.3 ? generateWebsite(name) : undefined,
      },
      hours: generateBusinessHours(),
      priceRange,
      rating,
      reviewCount: Math.floor(Math.random() * 1000) + 50,
      images: {
        main: `https://images.unsplash.com/photo-${1400000000000 + i}?w=800&h=600&fit=crop`,
        gallery: [
          `https://images.unsplash.com/photo-${1400000000000 + i + 1000}?w=800&h=600&fit=crop`,
          `https://images.unsplash.com/photo-${1400000000000 + i + 2000}?w=800&h=600&fit=crop`,
        ],
      },
      features,
      amenities,
      verified: Math.random() > 0.2, // 80% verified
      featured: Math.random() > 0.8, // 20% featured
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    };
    
    places.push(place);
  }
  
  return places;
}