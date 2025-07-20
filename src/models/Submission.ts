import { Schema, model, models, Document, Model } from 'mongoose';
import { Submission as ISubmission } from '@/types/models';

// Extended interface for MongoDB document
export interface ISubmissionDocument extends Omit<ISubmission, 'id' | 'submittedAt' | 'reviewedAt'>, Document {
  _id: string;
  reviewerId?: string; // Reference to User who reviewed this submission
  submittedAt: Date;
  reviewedAt?: Date;
}

const submissionSchema = new Schema<ISubmissionDocument>({
  type: {
    type: String,
    required: true,
    enum: ['place', 'event', 'real-estate'],
    index: true,
  },
  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
  submittedBy: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
    },
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
  },
  reviewNotes: {
    type: String,
    default: null,
  },
  reviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: false, // We're manually handling submittedAt/reviewedAt
  collection: 'submissions',
});

// Indexes for performance
submissionSchema.index({ status: 1, submittedAt: -1 });
submissionSchema.index({ 'submittedBy.email': 1 });
submissionSchema.index({ type: 1, status: 1 });

// Virtual for id to match TypeScript interface
submissionSchema.virtual('id').get(function() {
  return this._id?.toString();
});

// Virtual to check if submission is pending review
submissionSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

// Virtual to check if submission has been reviewed
submissionSchema.virtual('isReviewed').get(function() {
  return this.status !== 'pending' && this.reviewedAt !== null;
});

// Virtual to calculate time since submission
submissionSchema.virtual('daysSinceSubmission').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.submittedAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Ensure virtuals are included in JSON
submissionSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: function(_doc: any, ret: any) {
    // Remove MongoDB internal fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, ...transformed } = ret;
    return transformed;
  },
});

// Static methods
submissionSchema.statics.findPending = function(options?: { limit?: number; skip?: number }) {
  const query = this.find({ status: 'pending' })
    .sort({ submittedAt: 1 }) // Oldest first for FIFO processing
    .populate('reviewerId', 'name email');
    
  if (options?.skip) query.skip(options.skip);
  if (options?.limit) query.limit(options.limit);
  
  return query;
};

submissionSchema.statics.findByStatus = function(status: 'pending' | 'approved' | 'rejected') {
  return this.find({ status })
    .sort({ submittedAt: -1 })
    .populate('reviewerId', 'name email');
};

submissionSchema.statics.findByEmail = function(email: string) {
  return this.find({ 'submittedBy.email': email.toLowerCase() })
    .sort({ submittedAt: -1 });
};

submissionSchema.statics.findByType = function(type: 'place' | 'event' | 'real-estate') {
  return this.find({ type })
    .sort({ submittedAt: -1 })
    .populate('reviewerId', 'name email');
};

submissionSchema.statics.getStats = async function() {
  const [
    totalSubmissions,
    pendingCount,
    approvedCount,
    rejectedCount,
    typeDistribution,
  ] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ status: 'pending' }),
    this.countDocuments({ status: 'approved' }),
    this.countDocuments({ status: 'rejected' }),
    this.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
  ]);

  return {
    total: totalSubmissions,
    pending: pendingCount,
    approved: approvedCount,
    rejected: rejectedCount,
    byType: typeDistribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>),
  };
};

// Instance methods
submissionSchema.methods.approve = async function(reviewerId: string, notes?: string) {
  if (this.status !== 'pending') {
    throw new Error('Can only approve pending submissions');
  }

  this.status = 'approved';
  this.reviewerId = reviewerId;
  this.reviewedAt = new Date();
  if (notes) {
    this.reviewNotes = notes;
  }

  // After saving, we'll need to create the actual document in the appropriate collection
  await this.save();

  // Import models here to avoid circular dependencies
  const Place = (await import('./Place')).Place;
  const Event = (await import('./Event')).Event;

  // Create the actual document based on type
  if (this.type === 'place') {
    await Place.create(this.data);
  } else if (this.type === 'event') {
    await Event.create(this.data);
  }
  // Add real-estate handling when that model is created

  return this;
};

submissionSchema.methods.reject = async function(reviewerId: string, reason: string) {
  if (this.status !== 'pending') {
    throw new Error('Can only reject pending submissions');
  }

  if (!reason) {
    throw new Error('Rejection reason is required');
  }

  this.status = 'rejected';
  this.reviewerId = reviewerId;
  this.reviewedAt = new Date();
  this.reviewNotes = reason;

  return this.save();
};

submissionSchema.methods.sendNotification = async function() {
  // TODO: Implement email notification to submitter
  // This would integrate with an email service like SendGrid or AWS SES
  console.log(`Notification would be sent to ${this.submittedBy.email} about submission ${this.id}`);
};

// Pre-save middleware
submissionSchema.pre<ISubmissionDocument>('save', function(next) {
  // Validate data based on submission type
  if (this.type === 'place') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const placeData = this.data as any;
    if (!placeData.name) {
      next(new Error('Place submissions must have a name'));
      return;
    }
  }

  if (this.type === 'event') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventData = this.data as any;
    if (!eventData.title) {
      next(new Error('Event submissions must have a title'));
      return;
    }
  }

  // Ensure reviewedAt is set when status changes from pending
  if (this.isModified('status') && this.status !== 'pending' && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }

  next();
});

// Post-save middleware for notifications
submissionSchema.post<ISubmissionDocument>('save', async function() {
  // Send notification when status changes
  if (this.isModified && this.isModified('status') && this.status !== 'pending') {
    // Call the sendNotification method
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (this as any).sendNotification();
  }
});

export const Submission: Model<ISubmissionDocument> = models.Submission || model<ISubmissionDocument>('Submission', submissionSchema);