// Export all MongoDB models from a single entry point
export { User } from './User';
export { Place } from './Place';
export { Event } from './Event';
export { Review } from './Review';
export { Submission } from './Submission';

// Export types separately
export type { IUserDocument } from './User';
export type { IPlaceDocument } from './Place';
export type { IEventDocument } from './Event';
export type { IReviewDocument } from './Review';
export type { ISubmissionDocument } from './Submission';

// Re-export database utilities
export * from '@/lib/mongodb';
export * from '@/lib/db-utils';