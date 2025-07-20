import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import mongoose from 'mongoose';

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kingston-fyi';
const MONGODB_DB = process.env.MONGODB_DB || 'kingston-fyi';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable');
}

// MongoDB Native Client (for NextAuth adapter)
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const opts: MongoClientOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  };

  const client = new MongoClient(MONGODB_URI, opts);
  await client.connect();
  
  const db = client.db(MONGODB_DB);
  
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Mongoose Connection (for schemas and models)
let isConnected = false;

export async function connectMongoose(): Promise<void> {
  if (isConnected) {
    console.log('Using existing mongoose connection');
    return;
  }

  try {
    const options: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    };

    await mongoose.connect(MONGODB_URI, options);
    isConnected = true;
    console.log('Mongoose connected successfully');

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB with Mongoose:', error);
    throw error;
  }
}

// Helper function to get database instance
export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

// Export both for flexibility
export { mongoose };