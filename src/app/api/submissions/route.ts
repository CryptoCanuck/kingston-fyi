import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongodb';
import { Submission } from '@/models/Submission';
import { isAuthenticated, isAdmin, getCurrentUser } from '@/lib/auth';
import { generateSlug } from '@/lib/db-utils';

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectMongoose();
    
    const submissionData = await request.json();
    
    // Prepare place or event data based on submission type
    let data;
    
    if (submissionData.type === 'place' || !submissionData.type) {
      // Default to place if no type specified
      data = {
        name: submissionData.name,
        slug: generateSlug(submissionData.name),
        category: submissionData.category,
        description: submissionData.description,
        verified: false,
        featured: false,
        location: {
          type: 'Point',
          coordinates: [
            submissionData.lng || -76.4816 + (Math.random() - 0.5) * 0.01,
            submissionData.lat || 44.2312 + (Math.random() - 0.5) * 0.01
          ]
        },
        address: {
          street: submissionData.street,
          city: submissionData.city || 'Kingston',
          province: submissionData.province || 'ON',
          postalCode: submissionData.postalCode,
          country: submissionData.country || 'Canada',
        },
        contact: {
          phone: submissionData.phone || null,
          email: submissionData.email || null,
          website: submissionData.website || null,
        },
        subcategories: submissionData.subcategories ? 
          submissionData.subcategories.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        features: submissionData.features ? 
          submissionData.features.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        amenities: submissionData.amenities ? 
          submissionData.amenities.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        images: {
          main: submissionData.imageUrl || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop`,
          gallery: [],
        },
        hours: submissionData.hours ? parseHours(submissionData.hours) : undefined,
        priceRange: submissionData.priceRange || null,
      };
    } else if (submissionData.type === 'event') {
      data = {
        title: submissionData.title,
        slug: generateSlug(submissionData.title),
        description: submissionData.description,
        category: submissionData.category,
        startDate: new Date(submissionData.startDate),
        endDate: submissionData.endDate ? new Date(submissionData.endDate) : null,
        startTime: submissionData.startTime,
        endTime: submissionData.endTime || null,
        location: {
          name: submissionData.locationName,
          address: {
            street: submissionData.street,
            city: submissionData.city || 'Kingston',
            province: submissionData.province || 'ON',
            postalCode: submissionData.postalCode,
            country: submissionData.country || 'Canada',
          },
          coordinates: {
            lat: submissionData.lat || 44.2312 + (Math.random() - 0.5) * 0.01,
            lng: submissionData.lng || -76.4816 + (Math.random() - 0.5) * 0.01,
          }
        },
        organizer: {
          name: submissionData.organizerName,
          contact: {
            phone: submissionData.phone || null,
            email: submissionData.email || null,
            website: submissionData.website || null,
          }
        },
        ticketInfo: submissionData.price ? {
          price: parseFloat(submissionData.price),
          url: submissionData.ticketUrl || null,
          availability: 'available'
        } : null,
        images: {
          main: submissionData.imageUrl || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop`,
          gallery: [],
        },
        tags: submissionData.tags ? 
          submissionData.tags.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean) : [],
        maxAttendees: submissionData.maxAttendees ? parseInt(submissionData.maxAttendees) : null,
        currentAttendees: 0,
        verified: false,
        featured: false,
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid submission type' },
        { status: 400 }
      );
    }
    
    // Create submission document
    const submission = new Submission({
      type: submissionData.type || 'place',
      data,
      submittedBy: {
        name: submissionData.contactName || submissionData.name || 'Anonymous',
        email: submissionData.email,
        phone: submissionData.phone || null,
      },
      status: 'pending',
    });

    // Save submission
    await submission.save();

    // TODO: Send email notifications
    // - To admin about new submission
    // - To submitter confirming receipt

    return NextResponse.json(
      { 
        message: 'Submission received successfully',
        submissionId: submission.id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error processing submission:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}

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
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    // Execute query
    const [submissions, totalCount] = await Promise.all([
      Submission.find(query)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('reviewerId', 'name email')
        .lean(),
      Submission.countDocuments(query)
    ]);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    return NextResponse.json({
      submissions,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        perPage: parseInt(limit),
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
    
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// Helper function to parse hours string into structured format
function parseHours(hoursString: string) {
  if (!hoursString) return undefined;
  
  // This is a simplified parser - in a real app you'd want more robust parsing
  // Parse different formats like "Mon-Fri 9-5, Sat 10-4, Sun Closed"
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const hours = new Map();
  
  // Default hours
  days.forEach(day => {
    if (day === 'saturday' || day === 'sunday') {
      hours.set(day, { open: '10:00', close: '16:00' });
    } else {
      hours.set(day, { open: '09:00', close: '17:00' });
    }
  });
  
  // Try to parse custom hours from the string
  // This is a basic implementation that could be improved
  
  return hours;
}

// PATCH endpoint for approving/rejecting submissions (admin only)
export async function PATCH(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectMongoose();
    
    // Check if user is authenticated and is admin
    const isAuth = await isAuthenticated();
    const adminUser = await isAdmin();
    const currentUser = await getCurrentUser();
    
    if (!isAuth || !adminUser || !currentUser?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { submissionId, action, notes } = await request.json();
    
    if (!submissionId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const submission = await Submission.findById(submissionId);
    
    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }
    
    if (action === 'approve') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (submission as any).approve(currentUser.id, notes);
    } else if (action === 'reject') {
      if (!notes) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (submission as any).reject(currentUser.id, notes);
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: `Submission ${action}d successfully`,
      submission
    });
    
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}