import { Event, EventCategory } from '@/types/models';
import { generateKingstonEvents } from './kingston-events-generator';

// Generate comprehensive event data
const generatedEvents = generateKingstonEvents(40);

const featuredEventData: Partial<Event>[] = [
  {
    title: "Kingston Buskers Rendezvous",
    category: 'music' as EventCategory,
    description: "Annual street performance festival featuring musicians, magicians, and artists from around the world.",
    startDate: new Date('2024-07-12'),
    endDate: new Date('2024-07-14'),
    startTime: '12:00',
    endTime: '22:00',
    maxAttendees: 5000,
    currentAttendees: 3200,
    tags: ['festival', 'music', 'family-friendly', 'outdoor'],
  },
  {
    title: "Limestone City Blues Festival",
    category: 'music' as EventCategory,
    description: "Three days of blues music featuring local and international artists.",
    startDate: new Date('2024-08-23'),
    endDate: new Date('2024-08-25'),
    startTime: '17:00',
    endTime: '23:00',
    ticketInfo: {
      price: 45,
      url: 'https://example.com/blues-fest',
      availability: 'available',
    },
    tags: ['music', 'blues', 'festival', 'summer'],
  },
  {
    title: "Kingston Farmers Market",
    category: 'food' as EventCategory,
    description: "Weekly farmers market featuring local produce, artisanal goods, and food vendors.",
    startDate: new Date('2024-07-20'),
    startTime: '08:00',
    endTime: '14:00',
    tags: ['market', 'local', 'food', 'shopping'],
  },
  {
    title: "Art After Dark",
    category: 'art' as EventCategory,
    description: "Monthly gallery tour featuring extended hours, artist talks, and wine tastings.",
    startDate: new Date('2024-07-25'),
    startTime: '18:00',
    endTime: '21:00',
    ticketInfo: {
      price: 15,
      availability: 'limited',
    },
    tags: ['art', 'gallery', 'culture', 'nightlife'],
  },
  {
    title: "Queen's University Homecoming",
    category: 'community' as EventCategory,
    description: "Annual homecoming celebration with football game, parade, and alumni events.",
    startDate: new Date('2024-10-19'),
    startTime: '09:00',
    endTime: '23:00',
    maxAttendees: 20000,
    currentAttendees: 15000,
    tags: ['university', 'sports', 'alumni', 'tradition'],
  },
  {
    title: "Kingston Craft Beer Festival",
    category: 'food' as EventCategory,
    description: "Taste craft beers from local and regional breweries with live music and food trucks.",
    startDate: new Date('2024-09-07'),
    startTime: '14:00',
    endTime: '21:00',
    ticketInfo: {
      price: 35,
      url: 'https://example.com/beer-fest',
      availability: 'available',
    },
    tags: ['beer', 'festival', 'food', 'music'],
  },
  {
    title: "Tech Talk Tuesday",
    category: 'business' as EventCategory,
    description: "Monthly meetup for tech professionals featuring speakers and networking.",
    startDate: new Date('2024-07-30'),
    startTime: '18:30',
    endTime: '20:30',
    maxAttendees: 100,
    currentAttendees: 67,
    tags: ['tech', 'networking', 'business', 'education'],
  },
  {
    title: "Kingston Triathlon",
    category: 'sports' as EventCategory,
    description: "Annual triathlon event featuring multiple distance categories for all skill levels.",
    startDate: new Date('2024-08-11'),
    startTime: '07:00',
    endTime: '14:00',
    ticketInfo: {
      price: 125,
      url: 'https://example.com/triathlon',
      availability: 'limited',
    },
    tags: ['sports', 'fitness', 'competition', 'outdoor'],
  },
];

function generateEvent(data: Partial<Event>, index: number): Event {
  const id = `event-${index + 1}`;
  const slug = data.title!.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  const locations = [
    { name: 'Market Square', street: '216 Ontario Street' },
    { name: 'City Park', street: 'West Street' },
    { name: 'Grand Theatre', street: '218 Princess Street' },
    { name: 'K-Rock Centre', street: '1 The Tragically Hip Way' },
    { name: 'Isabel Bader Centre', street: '390 King Street W' },
  ];
  
  const locationIndex = index % locations.length;
  
  return {
    id,
    slug,
    title: data.title!,
    description: data.description!,
    category: data.category!,
    startDate: data.startDate!,
    endDate: data.endDate,
    startTime: data.startTime!,
    endTime: data.endTime,
    location: {
      name: locations[locationIndex].name,
      address: {
        street: locations[locationIndex].street,
        city: 'Kingston',
        province: 'ON',
        postalCode: 'K7L 2A1',
        country: 'Canada',
      },
      coordinates: {
        lat: 44.2312 + (Math.random() - 0.5) * 0.02,
        lng: -76.4860 + (Math.random() - 0.5) * 0.02,
      },
    },
    organizer: {
      name: `${data.title} Organizing Committee`,
      contact: {
        email: `info@${slug}.com`,
        phone: '(613) 555-0123',
      },
    },
    ticketInfo: data.ticketInfo,
    images: {
      main: `https://picsum.photos/seed/${slug}/800/600`,
      gallery: [
        `https://picsum.photos/seed/${slug}-1/800/600`,
        `https://picsum.photos/seed/${slug}-2/800/600`,
      ],
    },
    tags: data.tags,
    maxAttendees: data.maxAttendees,
    currentAttendees: data.currentAttendees,
    verified: Math.random() > 0.2,
    featured: Math.random() > 0.6,
    createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  };
}

const featuredEvents = featuredEventData.map((data, index) => generateEvent(data, index));

// Combine featured events with generated events
export const mockEvents: Event[] = [...featuredEvents, ...generatedEvents];

export function getUpcomingEvents(limit?: number): Event[] {
  const now = new Date();
  const upcoming = mockEvents
    .filter(event => event.startDate > now)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  
  return limit ? upcoming.slice(0, limit) : upcoming;
}

export function getEventsByCategory(category: EventCategory): Event[] {
  return mockEvents.filter(event => event.category === category);
}

export function getEventBySlug(slug: string): Event | undefined {
  return mockEvents.find(event => event.slug === slug);
}

export function getFeaturedEvents(limit: number = 3): Event[] {
  return mockEvents.filter(event => event.featured).slice(0, limit);
}

export function searchEvents(query: string): Event[] {
  const lowercaseQuery = query.toLowerCase();
  return mockEvents.filter(event => 
    event.title.toLowerCase().includes(lowercaseQuery) ||
    event.description.toLowerCase().includes(lowercaseQuery) ||
    event.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}