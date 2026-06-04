// scripts/mongo-init.js
// Runs once when the MongoDB container is first initialized.
// Creates a dedicated application user with minimal permissions
// (readWrite on blogplatform DB only — principle of least privilege).

db = db.getSiblingDB('blogplatform');

db.createUser({
  user: 'blogapp',
  pwd: process.env.MONGO_APP_PASSWORD || 'blogapp_password',
  roles: [
    {
      role: 'readWrite',
      db: 'blogplatform',
    },
  ],
});

// Create initial indexes explicitly (Mongoose also creates them on connect,
// but having them here ensures they exist before the first query).
db.users.createIndex({ email: 1 }, { unique: true });
db.blogs.createIndex({ title: 'text', content: 'text', tags: 'text' });
db.blogs.createIndex({ author: 1, createdAt: -1 });
db.blogs.createIndex({ published: 1, createdAt: -1 });

print('MongoDB initialization complete: blogplatform DB and blogapp user created.');
