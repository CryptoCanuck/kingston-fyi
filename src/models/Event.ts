import { Schema, model, models, Document, Model } from 'mongoose';
import { Event as IEvent, EventCategory } from '@/types/models';
import { generateSlug } from '@/lib/db-utils';

// Extended interface for MongoDB document
export interface IEventDocument extends Omit<IEvent, 'id' | 'createdAt' | 'updatedAt'>, Document {
  _id: string;
  placeId?: string; // Reference to Place hosting the event
  organizerId?: string; // Reference to User organizing the event
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEventDocument>({
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['music', 'art', 'food', 'sports', 'community', 'education', 'business', 'other'] as EventCategory[],
    index: true,
  },
  startDate: {
    type: Date,
    required: true,
    index: true,
  },
  endDate: {
    type: Date,
    default: null,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    default: null,
  },
  location: {
    name: {
      type: String,
      required: true,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
        default: 'Kingston',
      },
      province: {
        type: String,
        required: true,
        default: 'ON',
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
        default: 'Canada',
      },
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
    },
  },
  organizer: {
    name: {
      type: String,
      required: true,
    },
    contact: {
      phone: {
        type: String,
        default: null,
      },
      email: {
        type: String,
        lowercase: true,
        default: null,
      },
      website: {
        type: String,
        default: null,
      },
    },
  },
  ticketInfo: {
    price: {
      type: Number,
      min: 0,
      default: null,
    },
    url: {
      type: String,
      default: null,
    },
    availability: {
      type: String,
      enum: ['available', 'limited', 'sold-out'],
      default: null,
    },
  },
  images: {
    main: {
      type: String,
      required: true,
    },
    gallery: [{
      type: String,
    }],
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  maxAttendees: {
    type: Number,
    min: 0,
    default: null,
  },
  currentAttendees: {
    type: Number,
    min: 0,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
    index: true,
  },
  featured: {
    type: Boolean,
    default: false,
    index: true,
  },
  placeId: {
    type: Schema.Types.ObjectId,
    ref: 'Place',
    default: null,
    index: true,
  },
  organizerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
}, {
  timestamps: true,
  collection: 'events',
});

// Indexes for performance
eventSchema.index({ startDate: 1, category: 1 });
eventSchema.index({ 'location.coordinates.lat': 1, 'location.coordinates.lng': 1 });
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ tags: 1 });
eventSchema.index({ createdAt: -1 });

// Compound index for upcoming events
eventSchema.index({ startDate: 1, featured: 1 });

// Virtual for id to match TypeScript interface
eventSchema.virtual('id').get(function() {
  return this._id?.toString();
});

// Virtual to check if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  return this.startDate > new Date();
});

// Virtual to check if event is ongoing
eventSchema.virtual('isOngoing').get(function() {
  const now = new Date();
  return this.startDate <= now && (!this.endDate || this.endDate >= now);
});

// Virtual to check if event is past
eventSchema.virtual('isPast').get(function() {
  const now = new Date();
  return this.endDate ? this.endDate < now : this.startDate < now;
});

// Virtual for availability percentage
eventSchema.virtual('availabilityPercentage').get(function() {
  if (!this.maxAttendees || this.maxAttendees === 0) return null;
  const currentAttendees = this.currentAttendees || 0;
  return Math.round((currentAttendees / this.maxAttendees) * 100);
});

// Ensure virtuals are included in JSON
eventSchema.set('toJSON', {
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
eventSchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug });
};

eventSchema.statics.findUpcoming = function(limit?: number) {
  const query = this.find({ startDate: { $gte: new Date() } })
    .sort({ startDate: 1 });
  if (limit) query.limit(limit);
  return query;
};

eventSchema.statics.findByCategory = function(category: EventCategory) {
  return this.find({ category });
};

eventSchema.statics.findFeatured = function(limit?: number) {
  const query = this.find({ featured: true });
  if (limit) query.limit(limit);
  return query;
};

eventSchema.statics.findByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    $or: [
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
      { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
    ],
  });
};

eventSchema.statics.findNearby = function(lat: number, lng: number, maxDistanceKm: number = 10) {
  const maxDistanceDegrees = maxDistanceKm / 111.12; // Rough conversion
  return this.find({
    'location.coordinates.lat': {
      $gte: lat - maxDistanceDegrees,
      $lte: lat + maxDistanceDegrees,
    },
    'location.coordinates.lng': {
      $gte: lng - maxDistanceDegrees,
      $lte: lng + maxDistanceDegrees,
    },
  });
};

eventSchema.statics.search = function(searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm },
  });
};

// Instance methods
eventSchema.methods.updateAttendance = function(count: number) {
  this.currentAttendees = Math.max(0, Math.min(count, this.maxAttendees || count));
  
  // Update ticket availability based on attendance
  if (this.maxAttendees && this.ticketInfo) {
    const percentageFull = this.currentAttendees / this.maxAttendees;
    if (percentageFull >= 1) {
      this.ticketInfo.availability = 'sold-out';
    } else if (percentageFull >= 0.8) {
      this.ticketInfo.availability = 'limited';
    } else {
      this.ticketInfo.availability = 'available';
    }
  }
  
  return this.save();
};

eventSchema.methods.addAttendee = function() {
  if (!this.maxAttendees || this.currentAttendees < this.maxAttendees) {
    return this.updateAttendance(this.currentAttendees + 1);
  }
  throw new Error('Event is at full capacity');
};

eventSchema.methods.removeAttendee = function() {
  return this.updateAttendance(this.currentAttendees - 1);
};

eventSchema.methods.isOrganizedBy = function(userId: string) {
  return this.organizerId?.toString() === userId;
};

// Pre-save middleware
eventSchema.pre<IEventDocument>('save', function(next) {
  // Generate slug if not provided
  if (!this.slug && this.title) {
    this.slug = generateSlug(this.title);
  }
  
  // Ensure end date is after start date if provided
  if (this.endDate && this.endDate < this.startDate) {
    next(new Error('End date must be after start date'));
    return;
  }
  
  // Ensure current attendees doesn't exceed max
  if (this.maxAttendees && this.currentAttendees && this.currentAttendees > this.maxAttendees) {
    this.currentAttendees = this.maxAttendees;
  }
  
  next();
});

export const Event: Model<IEventDocument> = models.Event || model<IEventDocument>('Event', eventSchema);