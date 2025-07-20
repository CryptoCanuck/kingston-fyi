import { Event, EventCategory } from '@/types/models';

// Event name components
const eventTypes = {
  music: {
    prefixes: ['Live', 'Acoustic', 'Jazz', 'Rock', 'Folk', 'Classical', 'Open Mic'],
    names: ['Night', 'Sessions', 'Showcase', 'Concert', 'Performance', 'Evening', 'Series', 'Festival'],
    suffixes: ['at', 'with', 'featuring', 'presents']
  },
  art: {
    prefixes: ['Art', 'Gallery', 'Artisan', 'Local', 'Contemporary', 'Heritage', 'Creative'],
    names: ['Exhibition', 'Show', 'Market', 'Fair', 'Walk', 'Tour', 'Opening', 'Workshop'],
    suffixes: ['featuring', 'showcasing', 'presenting', 'celebrating']
  },
  food: {
    prefixes: ['Taste of', 'Kingston', 'Local', 'Farm', 'Artisan', 'Craft', 'Heritage'],
    names: ['Food Festival', 'Wine Tasting', 'Beer Festival', 'Market', 'Cooking Class', 'Dinner', 'Brunch'],
    suffixes: ['featuring', 'with', 'celebrating', 'showcasing']
  },
  community: {
    prefixes: ['Community', 'Family', 'Neighborhood', 'Local', 'Kingston', 'Annual'],
    names: ['Festival', 'Fair', 'Celebration', 'Gathering', 'Market', 'Day', 'Walk', 'Tour'],
    suffixes: ['celebrating', 'featuring', 'supporting', 'honoring']
  }
};

// Venue names (mix of real and realistic)
const venues = [
  { name: 'The Grand Theatre', address: '218 Princess Street', lat: 44.2308, lng: -76.4804 },
  { name: 'Market Square', address: '216 Ontario Street', lat: 44.2287, lng: -76.4821 },
  { name: 'Confederation Park', address: 'King Street West', lat: 44.2298, lng: -76.4892 },
  { name: 'Kingston City Hall', address: '216 Ontario Street', lat: 44.2287, lng: -76.4821 },
  { name: 'Queen\'s University', address: 'University Avenue', lat: 44.2253, lng: -76.4951 },
  { name: 'Memorial Centre', address: '303 York Street', lat: 44.2275, lng: -76.4869 },
  { name: 'Springer Market Square', address: '363 King Street East', lat: 44.2345, lng: -76.4756 },
  { name: 'Kingston Brewing Company', address: '34 Clarence Street', lat: 44.2299, lng: -76.4801 },
  { name: 'The Isabel Bader Centre', address: '390 King Street West', lat: 44.2289, lng: -76.4923 },
  { name: 'Portsmouth Olympic Harbour', address: '53 Yonge Street', lat: 44.2108, lng: -76.4589 },
  { name: 'Fort Henry', address: '1 Fort Henry Drive', lat: 44.2361, lng: -76.4669 },
  { name: 'Limestone City Blues Festival Grounds', address: 'Confederation Park', lat: 44.2298, lng: -76.4892 },
  { name: 'Kingston Public Library', address: '130 Johnson Street', lat: 44.2301, lng: -76.4834 },
  { name: 'Agnes Etherington Art Centre', address: '36 University Avenue', lat: 44.2253, lng: -76.4951 },
  { name: 'The Phoenix', address: '390 Princess Street', lat: 44.2308, lng: -76.4789 },
  { name: 'The Mansion', address: '104 Clarence Street', lat: 44.2301, lng: -76.4789 },
  { name: 'Toucan Irish Pub', address: '76 Princess Street', lat: 44.2307, lng: -76.4813 },
  { name: 'The Sleepless Goat Café', address: '91 Princess Street', lat: 44.2307, lng: -76.4815 },
  { name: 'Tir Nan Og Irish Pub', address: '200 Ontario Street', lat: 44.2285, lng: -76.4823 },
  { name: 'Stages Nightclub', address: '390 Princess Street', lat: 44.2308, lng: -76.4789 }
];

// Event descriptions by category
const eventDescriptions = {
  music: [
    'Join us for an evening of live music featuring local and touring artists.',
    'Experience the vibrant Kingston music scene with talented performers.',
    'An intimate musical performance in the heart of downtown Kingston.',
    'Celebrate music with fellow Kingston music lovers and discover new artists.',
    'Live music event showcasing the best of local and regional talent.'
  ],
  art: [
    'Explore local artwork and meet the artists behind the creations.',
    'A celebration of Kingston\'s vibrant arts community and creative talent.',
    'Discover unique pieces from local artisans and craftspeople.',
    'An exhibition showcasing the diverse artistic landscape of Kingston.',
    'Join fellow art enthusiasts for an evening of creativity and inspiration.'
  ],
  food: [
    'Taste the flavors of Kingston with local chefs and food artisans.',
    'A culinary celebration featuring the best of local cuisine and beverages.',
    'Experience Kingston\'s food scene with tastings and demonstrations.',
    'Discover local flavors and meet the passionate people behind them.',
    'A delicious journey through Kingston\'s diverse culinary offerings.'
  ],
  community: [
    'Bring the family for a fun-filled community celebration.',
    'Join your neighbors for a day of activities, food, and entertainment.',
    'A community gathering celebrating what makes Kingston special.',
    'Connect with fellow Kingstonians at this local celebration.',
    'Family-friendly event bringing the community together.'
  ]
};

// Organizers
const organizers = [
  'Kingston Arts Council', 'Downtown Kingston BIA', 'City of Kingston',
  'Queen\'s University', 'Kingston Community Foundation', 'Kingston Public Library',
  'Tourism Kingston', 'Kingston Frontenacs', 'Limestone City Blues Society',
  'Kingston Symphony', 'Modern Fuel Artist-Run Centre', 'Agnes Etherington Art Centre',
  'Kingston WritersFest', 'Kingston Canadian Film Festival', 'Skeleton Park Arts Festival',
  'YGK Music', 'Kingston Live Music', 'Community Events Kingston'
];

function generateEventTitle(category: EventCategory): string {
  if (!eventTypes[category as keyof typeof eventTypes]) {
    return `Kingston ${category.charAt(0).toUpperCase() + category.slice(1)} Event`;
  }
  
  const config = eventTypes[category as keyof typeof eventTypes];
  const prefix = config.prefixes[Math.floor(Math.random() * config.prefixes.length)];
  const name = config.names[Math.floor(Math.random() * config.names.length)];
  
  const variations = [
    `${prefix} ${name}`,
    `Kingston ${name}`,
    `${prefix} Music ${name}`,
    `Downtown ${name}`,
    `${name} Series`,
    `Annual ${name}`,
    `${prefix} Kingston ${name}`
  ];
  
  return variations[Math.floor(Math.random() * variations.length)];
}

function generateEventDate(): { start: Date; end?: Date; startTime: string; endTime?: string } {
  const now = new Date();
  const daysFromNow = Math.floor(Math.random() * 90); // Next 90 days
  const eventDate = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);
  
  // Event times
  const startHours = [10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21];
  const startHour = startHours[Math.floor(Math.random() * startHours.length)];
  const startMinutes = [0, 30][Math.floor(Math.random() * 2)];
  
  const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`;
  
  // Duration (1-4 hours)
  const duration = 1 + Math.floor(Math.random() * 4);
  const endHour = startHour + duration;
  const endTime = `${String(endHour).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`;
  
  // Some events span multiple days
  const isMultiDay = Math.random() < 0.1;
  const endDate = isMultiDay ? 
    new Date(eventDate.getTime() + (1 + Math.floor(Math.random() * 3)) * 24 * 60 * 60 * 1000) : 
    undefined;
  
  return {
    start: eventDate,
    end: endDate,
    startTime,
    endTime: endTime
  };
}

function generateTicketInfo(category: EventCategory) {
  const isFree = Math.random() < 0.4; // 40% of events are free
  
  if (isFree) {
    return {
      price: 0,
      availability: 'available' as const
    };
  }
  
  const prices = {
    music: [15, 20, 25, 30, 35, 40],
    art: [5, 10, 15, 20],
    food: [25, 35, 45, 55, 65, 75],
    community: [5, 10, 15],
    sports: [20, 25, 30, 40, 50],
    education: [10, 15, 20, 25],
    business: [50, 75, 100, 125],
    other: [10, 15, 20, 25]
  };
  
  const categoryPrices = prices[category] || prices.other;
  const price = categoryPrices[Math.floor(Math.random() * categoryPrices.length)];
  
  const availabilities = ['available', 'limited', 'sold-out'] as const;
  const weights = [0.7, 0.25, 0.05]; // Most available, some limited, few sold out
  let random = Math.random();
  let availability: typeof availabilities[number] = 'available';
  
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      availability = availabilities[i];
      break;
    }
  }
  
  return {
    price,
    availability,
    url: `https://tickets.kingston.ca/event-${Math.random().toString(36).substr(2, 9)}`
  };
}

export function generateKingstonEvents(count: number = 30): Event[] {
  const categories: EventCategory[] = ['music', 'art', 'food', 'community', 'sports', 'education'];
  const events: Event[] = [];
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const title = generateEventTitle(category);
    const venue = venues[Math.floor(Math.random() * venues.length)];
    const organizer = organizers[Math.floor(Math.random() * organizers.length)];
    const dateInfo = generateEventDate();
    const ticketInfo = generateTicketInfo(category);
    
    const descriptions = eventDescriptions[category as keyof typeof eventDescriptions] || 
      ['Join us for this exciting Kingston event celebrating our local community.'];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    
    const event: Event = {
      id: `generated-event-${i + 1}`,
      slug: title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-'),
      title,
      description,
      category,
      startDate: dateInfo.start,
      endDate: dateInfo.end,
      startTime: dateInfo.startTime,
      endTime: dateInfo.endTime,
      location: {
        name: venue.name,
        address: {
          street: venue.address,
          city: 'Kingston',
          province: 'ON',
          postalCode: `K7L ${Math.floor(Math.random() * 9)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}`,
          country: 'Canada'
        },
        coordinates: {
          lat: venue.lat + (Math.random() - 0.5) * 0.001, // Small variance
          lng: venue.lng + (Math.random() - 0.5) * 0.001
        }
      },
      organizer: {
        name: organizer,
        contact: {
          email: `info@${organizer.toLowerCase().replace(/\s+/g, '')}.ca`,
          website: `https://${organizer.toLowerCase().replace(/\s+/g, '')}.ca`
        }
      },
      ticketInfo,
      images: {
        main: `https://images.unsplash.com/photo-${1500000000000 + i}?w=800&h=600&fit=crop`,
        gallery: [
          `https://images.unsplash.com/photo-${1500000000000 + i + 1000}?w=800&h=600&fit=crop`
        ]
      },
      tags: [category, 'Kingston', 'Local', 'Community'],
      maxAttendees: Math.random() < 0.3 ? 50 + Math.floor(Math.random() * 200) : undefined,
      currentAttendees: Math.random() < 0.5 ? Math.floor(Math.random() * 100) : undefined,
      verified: Math.random() > 0.1, // 90% verified
      featured: Math.random() > 0.85, // 15% featured
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    };
    
    events.push(event);
  }
  
  // Sort by start date
  return events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}