export interface Review {
  id: string;
  restaurantId: string;
  userId: string;
  rating: number;
  title: string;
  content: string;
  visitDate: Date;
  helpful: number;
  images?: string[];
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewWithUser extends Review {
  user: {
    id: string;
    name: string;
    avatar?: string;
    reviewCount: number;
  };
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentReviews: ReviewWithUser[];
}