import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Return user profile without sensitive fields
    const userProfile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      role: user.role,
      emailVerified: user.emailVerified,
      preferences: user.preferences,
      stats: user.stats,
      joinedAt: user.joinedAt,
      createdAt: user.createdAt,
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Only allow updating certain fields
    const allowedFields = ['name', 'bio', 'location', 'avatar', 'preferences'] as const;
    const updateData: Partial<{
      name: string;
      bio: string;
      location: string;
      avatar: string;
      preferences: {
        notifications: boolean;
        newsletter: boolean;
        publicProfile: boolean;
      };
    }> = {};
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Return updated user profile without sensitive fields
    const userProfile = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      location: updatedUser.location,
      role: updatedUser.role,
      emailVerified: updatedUser.emailVerified,
      preferences: updatedUser.preferences,
      stats: updatedUser.stats,
      joinedAt: updatedUser.joinedAt,
      createdAt: updatedUser.createdAt,
    };

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: userProfile
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}