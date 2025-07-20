export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedAt: Date;
  emailVerified: boolean;
  role: 'user' | 'admin' | 'moderator' | 'business_owner';
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    publicProfile: boolean;
  };
  stats: {
    reviewCount: number;
    photoCount: number;
    helpfulVotes: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedAt: Date;
  stats: {
    reviewCount: number;
    photoCount: number;
    helpfulVotes: number;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  image?: string;
  role: 'user' | 'admin' | 'moderator' | 'business_owner';
}