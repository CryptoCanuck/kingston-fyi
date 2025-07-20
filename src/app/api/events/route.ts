import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import { Event } from '@/models/Event';
import { EventCategory } from '@/types/models';

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectMongoose();
    
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') as EventCategory | null;
    const search = searchParams.get('search');
    const upcoming = searchParams.get('upcoming');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page') || '1';
    const perPage = limit ? parseInt(limit) : 20;
    const skip = (parseInt(page) - 1) * perPage;
    
    // Start date filter for date-based queries
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    
    // Filter by upcoming events
    if (upcoming === 'true') {
      query.startDate = { $gte: new Date() };
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      const dateQuery: { $gte?: Date; $lte?: Date } = {};
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);
      
      if (Object.keys(dateQuery).length > 0) {
        query.$or = [
          { startDate: dateQuery },
          { endDate: dateQuery },
          { 
            startDate: { $lte: startDate ? new Date(startDate) : new Date() },
            endDate: { $gte: endDate ? new Date(endDate) : new Date() }
          }
        ];
      }
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }
    
    // Execute query with search if provided
    let events;
    let totalCount;
    
    if (search && search.trim().length >= 2) {
      // Use text search for search queries
      const searchQuery = { 
        ...query,
        $text: { $search: search }
      };
      
      [events, totalCount] = await Promise.all([
        Event.find(searchQuery)
          .select('-__v')
          .sort({ score: { $meta: "textScore" }, startDate: 1 })
          .skip(skip)
          .limit(perPage)
          .lean(),
        Event.countDocuments(searchQuery)
      ]);
    } else {
      // Regular query without search
      const sortOrder: Record<string, 1 | -1> = upcoming === 'true'
        ? { startDate: 1 } // Upcoming events sorted by nearest first
        : { featured: -1, startDate: -1 }; // Others sorted by featured and recent
      
      [events, totalCount] = await Promise.all([
        Event.find(query)
          .select('-__v')
          .sort(sortOrder)
          .skip(skip)
          .limit(perPage)
          .lean(),
        Event.countDocuments(query)
      ]);
    }
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / perPage);
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;
    
    return NextResponse.json({
      events,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        perPage,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
    
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}