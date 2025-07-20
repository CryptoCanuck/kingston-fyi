import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import { Place } from '@/models/Place';
import { Event } from '@/models/Event';
import { Place as IPlace, Event as IEvent } from '@/types/models';

interface SearchResults {
  places: IPlace[];
  events: IEvent[];
  realEstate: unknown[];
}

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectMongoose();
    
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // all, places, events, real-estate
    const limit = searchParams.get('limit');
    const maxLimit = limit ? parseInt(limit) : 10;

    const results: SearchResults = {
      places: [],
      events: [],
      realEstate: [],
    };

    if (query.length < 2) {
      return NextResponse.json(results);
    }

    // Use Promise.all for parallel execution of searches
    const searchPromises: Promise<void>[] = [];

    // Search places
    if (type === 'all' || type === 'places') {
      const placeSearchPromise = Place.find({
        $text: { $search: query }
      })
        .select('-__v')
        .sort({ score: { $meta: "textScore" }, featured: -1 })
        .limit(maxLimit)
        .lean()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((places: any[]) => {
          results.places = places || [];
        })
        .catch(err => {
          console.error('Error searching places:', err);
          // Try fallback regex search if text search fails
          return Place.find({
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { subcategories: { $in: [new RegExp(query, 'i')] } }
            ]
          })
            .select('-__v')
            .sort({ featured: -1, createdAt: -1 })
            .limit(maxLimit)
            .lean()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((places: any[]) => {
              results.places = places || [];
            });
        });
      
      searchPromises.push(placeSearchPromise);
    }

    // Search events
    if (type === 'all' || type === 'events') {
      const eventSearchPromise = Event.find({
        $text: { $search: query }
      })
        .select('-__v')
        .sort({ score: { $meta: "textScore" }, startDate: 1 })
        .limit(maxLimit)
        .lean()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((events: any[]) => {
          results.events = events || [];
        })
        .catch(err => {
          console.error('Error searching events:', err);
          // Try fallback regex search if text search fails
          return Event.find({
            $or: [
              { title: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { tags: { $in: [new RegExp(query, 'i')] } }
            ]
          })
            .select('-__v')
            .sort({ startDate: 1 })
            .limit(maxLimit)
            .lean()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((events: any[]) => {
              results.events = events || [];
            });
        });
      
      searchPromises.push(eventSearchPromise);
    }

    // Execute all searches in parallel
    await Promise.all(searchPromises);

    // Real estate search would go here when implemented
    // For now, keep it empty as per the original implementation

    return NextResponse.json({
      query,
      results,
      total: results.places.length + results.events.length + results.realEstate.length,
    });
    
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}