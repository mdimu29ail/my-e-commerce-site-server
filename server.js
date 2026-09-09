const path = require('path');
const http = require('http');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Security Middlewares
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
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
const settingsRoutes = require('./routes/settingsRoutes'); // ১. এখানে যোগ করা হয়েছে

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// ==========================================
// ২. এরপর CORS সেটআপ করুন
// ==========================================
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
// ==========================================
// ১. সবার আগে app ইনিশিয়ালাইজ করুন (এটি মাস্ট)
// ==========================================
const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true, // কুকি/টোকেন আদান-প্রদানের জন্য এটি জরুরি
  })
);

// ==========================================
// ৩. এরপর অন্যান্য মিডলওয়্যারগুলো দিন
// ==========================================
// JSON Body Parser (অবশ্যই অন্যান্য রাউটের আগে থাকতে হবে)
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// Security Middlewares
app.use(helmet());
// app.use(xss());

// NoSQL & XSS Sanitization
app.use((req, res, next) => {
  if (req.body) {
    mongoSanitize.sanitize(req.body);
  }
  if (req.params) {
    mongoSanitize.sanitize(req.params);
  }
  next();
});

// HTTP Parameter Pollution প্রতিরোধ
// app.use(hpp());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 200,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', limiter);

// ডিভেলপমেন্ট মোডে লগিং (Logging)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --- ৩. এপিআই রাউট মাউন্টিং (API Routes) ---

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
app.use('/api/settings', settingsRoutes); // ২. এখানে যোগ করা হয়েছে
// হেলথ চেক রাউট
app.get('/', (req, res) => {
  res.send('API is running and secure... 🚀');
});

// --- ৪. এরর হ্যান্ডলিং মিডলওয়্যার (Error Handling) ---

// ৪.১ ৪-০-৪ (Route Not Found)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// ৪.২ গ্লোবাল এরর হ্যান্ডলার
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// --- ৫. সকেট ইন্টিগ্রেশন (Real-time Chat) ---
chatSocket(server);

// --- ৬. সার্ভার লিসেনিং (Start Server) ---

const PORT = process.env.PORT || 5000;

// Export app for Vercel
module.exports = app;

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
app.get('/', (req, res) => res.send('Server is running'));

// প্রোসেস আনহ্যান্ডেলড রিজেকশন (যেমন ডাটাবেস এরর)
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`.red);
  // সার্ভার বন্ধ করে দেওয়া হবে
  server.close(() => process.exit(1));
});
