import { Schema, model, models, Document, Model } from 'mongoose';
import { Review as IReview } from '@/types/review';

// Extended interface for MongoDB document
export interface IReviewDocument extends Omit<IReview, 'id' | 'createdAt' | 'updatedAt' | 'restaurantId'>, Document {
  _id: string;
  placeId: string; // Changed from restaurantId to support all place types
  userId: string;
  helpfulVotes?: Array<{
    userId: string;
    votedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}


const reviewSchema = new Schema<IReviewDocument>({
  placeId: {
    type: String,
    ref: 'Place',
    required: true,
    index: true,
  },
  userId: {
    type: String,
    ref: 'User',
    required: true,
    index: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number',
    },
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000,
  },
  visitDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(date: Date) {
        return date <= new Date();
      },
      message: 'Visit date cannot be in the future',
    },
  },
  helpful: {
    type: Number,
    default: 0,
    min: 0,
  },
  images: [{
    type: String,
    validate: {
      validator: function(url: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(url);
      },
      message: 'Invalid image URL',
    },
  }],
  verified: {
    type: Boolean,
    default: false,
    index: true,
  },
  helpfulVotes: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    votedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
  collection: 'reviews',
});

// Indexes for performance
reviewSchema.index({ placeId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ rating: 1, verified: 1 });
reviewSchema.index({ visitDate: -1 });

// Compound index for preventing duplicate reviews
reviewSchema.index({ placeId: 1, userId: 1 }, { unique: true });

// Text index for searching reviews
reviewSchema.index({ title: 'text', content: 'text' });

// Virtual for id to match TypeScript interface
reviewSchema.virtual('id').get(function() {
  return this._id?.toString();
});

// Virtual for helpful count (derived from helpfulVotes array)
reviewSchema.virtual('helpfulCount').get(function(this: IReviewDocument) {
  return this.helpfulVotes?.length || 0;
});

// Ensure virtuals are included in JSON
reviewSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: function(_doc: any, ret: any) {
    // Remove MongoDB internal fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, helpfulVotes, ...transformed } = ret;
    // Keep helpful count but not the detailed votes
    transformed.helpful = ret.helpfulCount || ret.helpful || 0;
    return transformed;
  },
});

// Static methods
reviewSchema.statics.findByPlace = function(placeId: string, options?: { limit?: number; skip?: number }) {
  const query = this.find({ placeId })
    .sort({ createdAt: -1 })
    .populate('userId', 'name avatar');
    
  if (options?.skip) query.skip(options.skip);
  if (options?.limit) query.limit(options.limit);
  
  return query;
};

reviewSchema.statics.findByUser = function(userId: string, options?: { limit?: number; skip?: number }) {
  const query = this.find({ userId })
    .sort({ createdAt: -1 })
    .populate('placeId', 'name slug category');
    
  if (options?.skip) query.skip(options.skip);
  if (options?.limit) query.limit(options.limit);
  
  return query;
};

reviewSchema.statics.getAverageRating = async function(placeId: string): Promise<number> {
  const result = await this.aggregate([
    { $match: { placeId: placeId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } },
  ]);
  
  return result[0]?.avgRating || 0;
};

reviewSchema.statics.getRatingDistribution = async function(placeId: string) {
  const result = await this.aggregate([
    { $match: { placeId: placeId } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);
  
  // Initialize distribution with all ratings
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  // Fill in actual counts
  result.forEach(item => {
    distribution[item._id] = item.count;
  });
  
  return distribution;
};

reviewSchema.statics.getRecentReviews = function(limit: number = 10) {
  return this.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name avatar')
    .populate('placeId', 'name slug category');
};

reviewSchema.statics.getVerifiedReviews = function(placeId: string) {
  return this.find({ placeId, verified: true })
    .sort({ createdAt: -1 })
    .populate('userId', 'name avatar');
};

// Instance methods
reviewSchema.methods.markAsHelpful = async function(this: IReviewDocument, userId: string) {
  // Check if user has already voted
  const hasVoted = this.helpfulVotes?.some(
    (vote) => vote.userId.toString() === userId
  );
  
  if (hasVoted) {
    throw new Error('User has already marked this review as helpful');
  }
  
  // Add the vote
  if (!this.helpfulVotes) {
    this.helpfulVotes = [];
  }
  
  this.helpfulVotes.push({ userId, votedAt: new Date() });
  this.helpful = this.helpfulVotes.length;
  
  return this.save();
};

reviewSchema.methods.removeHelpfulVote = async function(this: IReviewDocument, userId: string) {
  if (!this.helpfulVotes) return this;
  
  this.helpfulVotes = this.helpfulVotes.filter(
    (vote) => vote.userId.toString() !== userId
  );
  this.helpful = this.helpfulVotes.length;
  
  return this.save();
};

reviewSchema.methods.verifyReview = async function() {
  this.verified = true;
  return this.save();
};

// Pre-save middleware
reviewSchema.pre<IReviewDocument>('save', async function(next) {
  // Ensure visit date is not in the future
  if (this.visitDate > new Date()) {
    next(new Error('Visit date cannot be in the future'));
    return;
  }
  
  // Update helpful count from votes array
  if (this.helpfulVotes && Array.isArray(this.helpfulVotes)) {
    this.helpful = this.helpfulVotes.length;
  }
  
  next();
});

// Post-save middleware to update place rating
reviewSchema.post<IReviewDocument>('save', async function() {
  // Import Place model here to avoid circular dependency
  const Place = (await import('./Place')).Place;
  
  // Calculate new average rating for the place
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const avgRating = await (this.constructor as any).getAverageRating(this.placeId);
  const reviewCount = await (this.constructor as Model<IReviewDocument>).countDocuments({ placeId: this.placeId });
  
  // Update place with new rating info
  await Place.findByIdAndUpdate(this.placeId, {
    rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
    reviewCount,
  });
});

// Post-remove middleware to update place rating when review is deleted
reviewSchema.post<IReviewDocument>('findOneAndDelete', async function() {
  const Place = (await import('./Place')).Place;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const avgRating = await (this.constructor as any).getAverageRating(this.placeId);
  const reviewCount = await (this.constructor as Model<IReviewDocument>).countDocuments({ placeId: this.placeId });
  
  await Place.findByIdAndUpdate(this.placeId, {
    rating: Math.round(avgRating * 10) / 10,
    reviewCount,
  });
});

export const Review: Model<IReviewDocument> = models.Review || model<IReviewDocument>('Review', reviewSchema);