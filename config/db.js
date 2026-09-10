const mongoose = require('mongoose');

// ─── Connection Cache for Serverless ────────────────────────────────────────
// In serverless environments (like Vercel), the function container can be reused.
// We cache the connection to prevent multiple initializations and "buffering timed out" errors.
let cachedConnection = null;

const connectDB = async () => {
  // If a connection already exists and is ready, use it.
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGO_URI) {
    console.error('❌ FATAL: MONGO_URI environment variable is not set.');
    throw new Error('MONGO_URI environment variable is not defined');
  }

  // If a connection is currently being established, wait for it.
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const options = {
      // These options help with stability in serverless environments
      bufferCommands: false, // Disable buffering to fail fast if connection is lost
    };

    console.log('⏳ Connecting to MongoDB...');
    cachedConnection = mongoose.connect(process.env.MONGO_URI, options);
    
    const conn = await cachedConnection;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    cachedConnection = null; // Reset cache on failure so next request can retry
    throw error;
  }
};

module.exports = connectDB;
