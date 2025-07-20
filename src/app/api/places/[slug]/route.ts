import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import { Place } from '@/models/Place';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Connect to MongoDB
    await connectMongoose();
    
    const { slug } = await params;
    
    // Find place by slug
    const place = await Place.findOne({ slug })
      .select('-__v')
      .lean();

    if (!place) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      place,
    });
    
  } catch (error) {
    console.error('Error fetching place:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place' },
      { status: 500 }
    );
  }
}