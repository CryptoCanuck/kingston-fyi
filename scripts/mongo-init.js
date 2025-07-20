// MongoDB initialization script for Kingston.FYI

db = db.getSiblingDB('kingston-fyi');

// Create a non-root user for the application
db.createUser({
  user: 'kingston_app',
  pwd: 'kingston_app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'kingston-fyi'
    }
  ]
});

// Create indexes for optimal performance
db.places.createIndex({ slug: 1 }, { unique: true });
db.places.createIndex({ category: 1 });
db.places.createIndex({ status: 1 });
db.places.createIndex({ location: '2dsphere' });
db.places.createIndex({ 
  name: 'text', 
  description: 'text', 
  'address.street': 'text' 
});

db.events.createIndex({ slug: 1 }, { unique: true });
db.events.createIndex({ startDate: 1 });
db.events.createIndex({ endDate: 1 });
db.events.createIndex({ status: 1 });
db.events.createIndex({ 
  title: 'text', 
  description: 'text' 
});

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ zitadelId: 1 }, { unique: true });

db.reviews.createIndex({ placeId: 1 });
db.reviews.createIndex({ userId: 1 });
db.reviews.createIndex({ createdAt: -1 });

db.submissions.createIndex({ type: 1 });
db.submissions.createIndex({ status: 1 });
db.submissions.createIndex({ submittedBy: 1 });
db.submissions.createIndex({ createdAt: -1 });

print('MongoDB initialization completed successfully!');