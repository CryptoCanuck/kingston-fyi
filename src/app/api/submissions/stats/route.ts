import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import { Submission } from '@/models/Submission';
import { isAuthenticated, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectMongoose();

    // Check if user is authenticated and is admin
    const isAuth = await isAuthenticated();
    const adminUser = await isAdmin();

    if (!isAuth || !adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get statistics from the model
    const stats = await Submission.getStats();

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching submission stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submission statistics' },
      { status: 500 }
    );
  }
}
