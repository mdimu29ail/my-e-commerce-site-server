const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // ১. কোন পণ্যের রিভিউ দেওয়া হচ্ছে
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },

    // ২. কে রিভিউ দিচ্ছে
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ৩. রেটিং এবং মন্তব্য
    rating: {
      type: Number,
      required: [true, 'দয়া করে ১ থেকে ৫ এর মধ্যে একটি রেটিং দিন'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'দয়া করে আপনার মন্তব্য লিখুন'],
      trim: true,
    },

    // ৪. পণ্যের বাস্তব ছবি (Customer trust বাড়ানোর জন্য)
    images: [
      {
        type: String, // Firebase/Cloudinary URL
      },
    ],

    // ৫. সিকিউরিটি এবং বিশ্বাসযোগ্যতা (Verified Purchase)
    isVerifiedPurchase: {
      type: Boolean,
      default: false, // কন্ট্রোলারের মাধ্যমে চেক করা হবে ইউজার এটি আসলে কিনেছে কি না
    },

    // ৬. সেলার বা অ্যাডমিনের উত্তর (Reply system)
    reply: {
      comment: String,
      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      repliedAt: Date,
    },

    // ৭. মডারেশন কন্ট্রোল (Moderator logic)
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Hidden', 'Flagged'],
      default: 'Pending', // ইউজার সাবমিশন এখন থেকে Pending থাকবে
    },
    
    // ৯. শেয়ারিং কন্ট্রোল
    isShared: {
      type: Boolean,
      default: false,
    },

    // ৮. হেল্পফুল ভোট (অন্যান্য কাস্টমারদের জন্য)
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// --- ইনডেক্সিং (একই প্রোডাক্টের রিভিউ দ্রুত খোঁজার জন্য) ---
reviewSchema.index({ product: 1, createdAt: -1 });

// --- ডাবল রিভিউ প্রতিরোধ (এক ইউজার এক প্রোডাক্টে একবারই রিভিউ দিতে পারবে) ---
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
