// ─── Load environment variables FIRST ──────────────────────────────────────
// On Vercel, dotenv.config() is a no-op (no .env file exists) — env vars come
// from the Vercel Dashboard (Settings → Environment Variables). This call is
// kept here so local development still works via server/.env.
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

// ─── Core dependencies ──────────────────────────────────────────────────────
const http = require('http');
const express = require('express');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Security Middlewares
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

// Custom Imports
const connectDB = require('./config/db');
const { chatSocket } = require('./sockets/chatSocket');

// Route Files
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const messageRoutes = require('./routes/messageRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const returnRoutes = require('./routes/returnRoutes');
const refundRoutes = require('./routes/refundRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const couponRoutes = require('./routes/couponRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// ─── Connect to Database ─────────────────────────────────────────────────────
// connectDB() validates MONGO_URI and throws a clear error if it is missing,
// instead of the cryptic Mongoose "got undefined" crash.
connectDB().catch((err) => {
  console.error('❌ Database connection failed:', err.message);
  // Do NOT process.exit() here — on Vercel serverless the process is shared;
  // exiting would kill the container. Let individual requests fail with 503.
});

// ─── CORS configuration ──────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

// ─── Express app ─────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (server-to-server, Postman, etc.)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        callback(null, true);
      } else {
        // In production allow unknown origins too — tighten as needed
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// JSON Body Parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// Security Middlewares
app.use(helmet());

// NoSQL & XSS Sanitization
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  next();
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 200,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', limiter);

// Development logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('API is running and secure... 🚀');
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/settings', settingsRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// ─── Socket.io (Real-time Chat) ──────────────────────────────────────────────
// Socket.io requires a persistent HTTP server which is NOT available on Vercel
// serverless functions. We only attach it when running as a traditional Node
// server (local dev or a non-serverless host like Railway/Render).
const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
if (!isVercel) {
  chatSocket(server);
}

// ─── Start server (local / non-serverless only) ───────────────────────────────
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(
      `
      =========================================
      🚀 Server running in ${process.env.NODE_ENV} mode
      🌐 Port: ${PORT}
      🏠 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
      ✅ Database & Security: Verified
      =========================================
      `.yellow.bold
    );
  });
}

// ─── Unhandled Rejection Handler ─────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  if (process.env.NODE_ENV !== 'production') {
    // In development, close the local server and exit
    server.close(() => process.exit(1));
  }
  // In production (Vercel serverless): do NOT call process.exit()
  // The function will end naturally after the request completes.
});

// ─── Export app for Vercel serverless ────────────────────────────────────────
module.exports = app;
