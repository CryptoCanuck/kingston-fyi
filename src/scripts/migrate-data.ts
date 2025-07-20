import { connectMongoose } from '../lib/mongodb';
import { Place } from '../models/Place';
import { Event } from '../models/Event';
import { mockPlaces } from '../data/mock-places';
import { mockEvents } from '../data/mock-events';
import { Place as IPlace, Event as IEvent } from '../types/models';
import * as readline from 'readline';

// Script to migrate mock data to MongoDB
async function migrateData() {
  console.log('Starting data migration...');
  
  try {
    // Connect to MongoDB
    await connectMongoose();
    console.log('Connected to MongoDB');
    
    // Check if data already exists
    const existingPlaces = await Place.countDocuments();
    const existingEvents = await Event.countDocuments();
    
    if (existingPlaces > 0 || existingEvents > 0) {
      console.log(`Found existing data: ${existingPlaces} places, ${existingEvents} events`);
      const response = await prompt('Data already exists. Do you want to clear and re-import? (yes/no): ');
      
      if (response?.toLowerCase() !== 'yes') {
        console.log('Migration cancelled');
        process.exit(0);
      }
      
      // Clear existing data
      console.log('Clearing existing data...');
      await Promise.all([
        Place.deleteMany({}),
        Event.deleteMany({})
      ]);
      console.log('Existing data cleared');
    }
    
    // Migrate Places
    console.log('\nMigrating places...');
    const placesToInsert = mockPlaces.map((place: IPlace) => {
      // Transform place data for MongoDB
      return {
        ...place,
        _id: undefined, // Let MongoDB generate the ID
        id: undefined, // Remove the mock ID field
        location: {
          type: 'Point',
          coordinates: [place.location.lng, place.location.lat] // MongoDB expects [lng, lat]
        },
        hours: place.hours ? new Map(Object.entries(place.hours)) : new Map(),
        createdAt: place.createdAt || new Date(),
        updatedAt: place.updatedAt || new Date()
      };
    });
    
    // Insert places in batches to avoid memory issues
    const placesBatchSize = 50;
    let placesInserted = 0;
    
    for (let i = 0; i < placesToInsert.length; i += placesBatchSize) {
      const batch = placesToInsert.slice(i, i + placesBatchSize);
      await Place.insertMany(batch, { ordered: false });
      placesInserted += batch.length;
      console.log(`Inserted ${placesInserted}/${placesToInsert.length} places`);
    }
    
    console.log(`✓ Successfully migrated ${placesInserted} places`);
    
    // Migrate Events
    console.log('\nMigrating events...');
    const eventsToInsert = mockEvents.map((event: IEvent) => {
      // Transform event data for MongoDB
      return {
        ...event,
        _id: undefined, // Let MongoDB generate the ID
        id: undefined, // Remove the mock ID field
        startDate: new Date(event.startDate),
        endDate: event.endDate ? new Date(event.endDate) : null,
        createdAt: event.createdAt || new Date(),
        updatedAt: event.updatedAt || new Date()
      };
    });
    
    // Insert events in batches
    const eventsBatchSize = 50;
    let eventsInserted = 0;
    
    for (let i = 0; i < eventsToInsert.length; i += eventsBatchSize) {
      const batch = eventsToInsert.slice(i, i + eventsBatchSize);
      await Event.insertMany(batch, { ordered: false });
      eventsInserted += batch.length;
      console.log(`Inserted ${eventsInserted}/${eventsToInsert.length} events`);
    }
    
    console.log(`✓ Successfully migrated ${eventsInserted} events`);
    
    // Create indexes
    console.log('\nCreating indexes...');
    await Promise.all([
      Place.createIndexes(),
      Event.createIndexes()
    ]);
    console.log('✓ Indexes created successfully');
    
    // Print summary
    console.log('\n=== Migration Summary ===');
    console.log(`Places migrated: ${placesInserted}`);
    console.log(`Events migrated: ${eventsInserted}`);
    console.log(`Total documents: ${placesInserted + eventsInserted}`);
    
    // Verify the migration
    const finalPlaceCount = await Place.countDocuments();
    const finalEventCount = await Event.countDocuments();
    console.log('\n=== Verification ===');
    console.log(`Places in database: ${finalPlaceCount}`);
    console.log(`Events in database: ${finalEventCount}`);
    
    if (finalPlaceCount === placesInserted && finalEventCount === eventsInserted) {
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.error('\n❌ Migration verification failed - counts do not match');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    process.exit(0);
  }
}

// Helper function for user prompt
function prompt(question: string): Promise<string | null> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Run the migration
if (require.main === module) {
  migrateData().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { migrateData };