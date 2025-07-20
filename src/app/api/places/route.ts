import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import { Place } from '@/models/Place';
import { PlaceCategory } from '@/types/models';

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectMongoose();
    
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    const page = searchParams.get('page') || '1';
    const perPage = limit ? parseInt(limit) : 20;
    const skip = (parseInt(page) - 1) * perPage;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    
    // Filter by category (supports comma-separated categories)
    if (category) {
      const categories = category.split(',').filter(cat => cat.trim());
      if (categories.length === 1) {
        query.category = categories[0] as PlaceCategory;
      } else if (categories.length > 1) {
        query.category = { $in: categories as PlaceCategory[] };
      }
    }
    
    // Featured filter
    if (featured === 'true') {
      query.featured = true;
    }
    
    // Execute query with search if provided
    let places;
    let totalCount;
    
    if (search && search.trim().length >= 2) {
      // Use text search for search queries
      const searchQuery = { 
        ...query,
        $text: { $search: search }
      };
      
      [places, totalCount] = await Promise.all([
        Place.find(searchQuery)
          .select('-__v')
          .sort({ score: { $meta: "textScore" }, featured: -1, createdAt: -1 })
          .skip(skip)
          .limit(perPage)
          .lean(),
        Place.countDocuments(searchQuery)
      ]);
    } else {
      // Regular query without search
      [places, totalCount] = await Promise.all([
        Place.find(query)
          .select('-__v')
          .sort({ featured: -1, createdAt: -1 })
          .skip(skip)
          .limit(perPage)
          .lean(),
        Place.countDocuments(query)
      ]);
    }
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / perPage);
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;
    
    return NextResponse.json({
      places,
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
    console.error('Error fetching places:', error);
    return NextResponse.json(
      { error: 'Failed to fetch places' },
      { status: 500 }
    );
  }
}