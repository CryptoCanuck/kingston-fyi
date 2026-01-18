import { Schema, model, models, Document, Model } from 'mongoose';
import { Place as IPlace, PlaceCategory } from '@/types/models';
import { generateSlug } from '@/lib/db-utils';

// GeoJSON Point type for MongoDB location field
interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// Extended interface for MongoDB document
export interface IPlaceDocument extends Omit<IPlace, 'id' | 'createdAt' | 'updatedAt' | 'location'>, Document {
  _id: string;
  ownerId?: string; // Reference to User who owns this place
  googlePlaceId?: string; // Google Places API place_id for deduplication
  location: GeoJSONPoint;
  createdAt: Date;
  updatedAt: Date;
}

const placeSchema = new Schema<IPlaceDocument>({
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['restaurant', 'bar', 'nightclub', 'cafe', 'bakery', 'shopping', 'attraction', 'activity', 'service'] as PlaceCategory[],
    index: true,
  },
  subcategories: [{
    type: String,
    trim: true,
  }],
  description: {
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
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: number[]) {
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && // longitude
                 v[1] >= -90 && v[1] <= 90; // latitude
        },
        message: 'Invalid coordinates',
      },
    },
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
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
    },
  },
  hours: {
    type: Map,
    of: {
      open: String,
      close: String,
    },
    default: new Map(),
  },
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    default: null,
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  reviewCount: {
    type: Number,
    min: 0,
    default: 0,
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
  features: [{
    type: String,
    trim: true,
  }],
  amenities: [{
    type: String,
    trim: true,
  }],
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
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  googlePlaceId: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
  collection: 'places',
});

// Indexes for geospatial queries and performance
placeSchema.index({ location: '2dsphere' });
placeSchema.index({ name: 'text', description: 'text' });
placeSchema.index({ category: 1, featured: 1 });
placeSchema.index({ createdAt: -1 });
placeSchema.index({ 'address.city': 1, category: 1 });
placeSchema.index({ googlePlaceId: 1 }, { unique: true, sparse: true });

// Virtual for id to match TypeScript interface
placeSchema.virtual('id').get(function() {
  return this._id?.toString();
});

// Convert location to lat/lng format for API responses
placeSchema.virtual('location.lat').get(function(this: IPlaceDocument) {
  return this.location?.coordinates?.[1];
});

placeSchema.virtual('location.lng').get(function(this: IPlaceDocument) {
  return this.location?.coordinates?.[0];
});

// Ensure virtuals are included in JSON
placeSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: function(_doc: any, ret: any) {
    // Transform location from GeoJSON to lat/lng format
    if (ret.location && ret.location.coordinates) {
      ret.location = {
        lat: ret.location.coordinates[1],
        lng: ret.location.coordinates[0],
      };
    }
    // Remove MongoDB internal fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, ...transformed } = ret;
    return transformed;
  },
});

// Static methods
placeSchema.statics.findBySlug = function(slug: string) {
  return this.findOne({ slug });
};

placeSchema.statics.findByCategory = function(category: PlaceCategory) {
  return this.find({ category });
};

placeSchema.statics.findFeatured = function(limit?: number) {
  const query = this.find({ featured: true });
  if (limit) query.limit(limit);
  return query;
};

placeSchema.statics.findNearby = function(lat: number, lng: number, maxDistanceKm: number = 10) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: maxDistanceKm * 1000, // Convert to meters
      },
    },
  });
};

placeSchema.statics.search = function(searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm },
  });
};

// Instance methods
placeSchema.methods.updateRating = async function(newRating: number) {
  // Calculate new average rating
  const totalRating = this.rating * this.reviewCount + newRating;
  this.reviewCount += 1;
  this.rating = totalRating / this.reviewCount;
  return this.save();
};

placeSchema.methods.isOwnedBy = function(userId: string) {
  return this.ownerId?.toString() === userId;
};

// Pre-save middleware
placeSchema.pre<IPlaceDocument>('save', function(next) {
  // Generate slug if not provided
  if (!this.slug && this.name) {
    this.slug = generateSlug(this.name);
  }
  
  // Ensure location is in correct GeoJSON format
  if (this.location && Array.isArray(this.location)) {
    const coords = this.location as unknown as [number, number];
    // Type assertion is necessary here due to Mongoose's handling of subdocuments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).location = {
      type: 'Point',
      coordinates: coords,
    };
  }
  
  next();
});

export const Place: Model<IPlaceDocument> = models.Place || model<IPlaceDocument>('Place', placeSchema);