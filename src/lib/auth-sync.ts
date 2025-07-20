import { User } from '@/models/User';
import { connectMongoose } from '@/lib/mongodb';
import type { Profile, User as NextAuthUser } from 'next-auth';

interface ZitadelProfile extends Profile {
  sub: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
  'urn:zitadel:iam:org:project:roles'?: string[];
}

interface SyncUserParams {
  user: NextAuthUser;
  profile: ZitadelProfile;
}

/**
 * Sync user data from Zitadel to MongoDB
 * This function is called during the sign-in process
 */
export async function syncUserFromZitadel({ user, profile }: SyncUserParams) {
  try {
    // Ensure MongoDB connection
    await connectMongoose();

    // Extract user data from profile
    const userData = {
      zitadelId: profile.sub,
      email: profile.email || user.email || '',
      name: profile.name || profile.preferred_username || user.name || 'Unknown User',
      avatar: profile.picture || user.image || null,
      emailVerified: profile.email_verified || false,
      role: mapZitadelRole(profile['urn:zitadel:iam:org:project:roles']),
      joinedAt: new Date(),
    };

    // Check if user already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingUser = await (User as any).findByZitadelId(userData.zitadelId);

    if (existingUser) {
      // Update existing user with latest data from Zitadel
      existingUser.email = userData.email;
      existingUser.name = userData.name;
      existingUser.avatar = userData.avatar;
      existingUser.emailVerified = userData.emailVerified;
      existingUser.role = userData.role;
      
      await existingUser.save();
      return existingUser;
    } else {
      // Create new user
      const newUser = await User.create(userData);
      return newUser;
    }
  } catch (error) {
    console.error('Error syncing user from Zitadel:', error);
    throw error;
  }
}

/**
 * Map Zitadel roles to application roles
 */
function mapZitadelRole(zitadelRoles?: string[]): string {
  if (!zitadelRoles || zitadelRoles.length === 0) {
    return 'user';
  }

  // Priority order: admin > moderator > business_owner > user
  if (zitadelRoles.includes('admin') || zitadelRoles.includes('kingston-fyi:admin')) {
    return 'admin';
  }
  if (zitadelRoles.includes('moderator') || zitadelRoles.includes('kingston-fyi:moderator')) {
    return 'moderator';
  }
  if (zitadelRoles.includes('business_owner') || zitadelRoles.includes('kingston-fyi:business_owner')) {
    return 'business_owner';
  }
  
  return 'user';
}

/**
 * Update user role in MongoDB
 */
export async function updateUserRole(userId: string, newRole: string) {
  try {
    await connectMongoose();
    
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update role - business_owner is a valid role in the schema
    if (['user', 'business_owner', 'moderator', 'admin'].includes(newRole)) {
      user.role = newRole as 'user' | 'business_owner' | 'moderator' | 'admin';
    } else {
      throw new Error(`Invalid role: ${newRole}`);
    }
    await user.save();
    
    return user;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Get or create user from Zitadel ID
 */
export async function getOrCreateUserFromZitadelId(
  zitadelId: string, 
  userData?: Partial<{
    email: string;
    name: string;
    avatar: string;
    role: string;
  }>
) {
  try {
    await connectMongoose();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let user = await (User as any).findByZitadelId(zitadelId);
    
    if (!user && userData) {
      // Create user with provided data
      user = await User.create({
        zitadelId,
        email: userData.email || `user-${zitadelId}@example.com`,
        name: userData.name || 'Unknown User',
        avatar: userData.avatar || null,
        role: userData.role || 'user',
        emailVerified: false,
        joinedAt: new Date(),
      });
    }
    
    return user;
  } catch (error) {
    console.error('Error getting or creating user:', error);
    throw error;
  }
}

/**
 * Delete user account and associated data
 */
export async function deleteUserAccount(userId: string) {
  try {
    await connectMongoose();
    
    // Import models to avoid circular dependencies
    const { Review } = await import('@/models/Review');
    const { Place } = await import('@/models/Place');
    
    // Delete user's reviews
    await Review.deleteMany({ userId });
    
    // Transfer ownership of places to admin or delete them
    await Place.updateMany(
      { ownerId: userId },
      { $unset: { ownerId: 1 } }
    );
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
}