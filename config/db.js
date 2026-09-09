const mongoose = require('mongoose');

const connectDB = async () => {
  // ─── Validate MONGO_URI before attempting connection ───────────────────────
  // On Vercel, env vars come from the Dashboard (Settings → Environment Variables).
  // If MONGO_URI is missing, this gives a clear, actionable error instead of the
  // cryptic Mongoose "got undefined" crash.
  if (!process.env.MONGO_URI) {
    console.error(
      '❌ FATAL: MONGO_URI environment variable is not set.\n' +
        '   → In production (Vercel): go to Project → Settings → Environment Variables and add MONGO_URI.\n' +
        '   → In development: add MONGO_URI to your server/.env file.'
    );
    // In serverless (Vercel) we must NOT call process.exit() — it kills the
    // function without sending a response. Throw instead so the caller gets a
    // proper 500 with a meaningful message.
    throw new Error('MONGO_URI environment variable is not defined');
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Re-throw so the serverless function returns a 500 rather than hanging
    throw error;
  }
};

module.exports = connectDB;
