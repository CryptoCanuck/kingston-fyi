import { Schema, model, models, Document, Model } from 'mongoose';
import { User as IUser } from '@/types/user';

// Extended interface for MongoDB document
export interface IUserDocument extends Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>, Document {
  _id: string;
  zitadelId?: string; // External ID from Zitadel (optional for credential users)
  password?: string; // Password for credential-based authentication
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>({
  zitadelId: {
    type: String,
    required: false, // Optional for credential users
    unique: true,
    sparse: true, // Allow null values
    index: true,
  },
  password: {
    type: String,
    required: false,
    select: false, // Don't include password in queries by default
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    maxlength: 500,
    default: null,
  },
  location: {
    type: String,
    default: null,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['user', 'business_owner', 'moderator', 'admin'],
    default: 'user',
    index: true,
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true,
    },
    newsletter: {
      type: Boolean,
      default: true,
    },
    publicProfile: {
      type: Boolean,
      default: true,
    },
  },
  stats: {
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    photoCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'users',
});

// Indexes for performance
userSchema.index({ email: 1, role: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for id to match TypeScript interface
userSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', {
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
userSchema.statics.findByZitadelId = function(zitadelId: string) {
  return this.findOne({ zitadelId });
};

userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Instance methods
userSchema.methods.incrementReviewCount = function() {
  this.stats.reviewCount += 1;
  return this.save();
};

userSchema.methods.incrementPhotoCount = function(count: number = 1) {
  this.stats.photoCount += count;
  return this.save();
};

userSchema.methods.incrementHelpfulVotes = function() {
  this.stats.helpfulVotes += 1;
  return this.save();
};

// Pre-save middleware
userSchema.pre('save', function(next) {
  // Ensure email is lowercase
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

export const User: Model<IUserDocument> = models.User || model<IUserDocument>('User', userSchema);