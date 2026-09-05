// const mongoose = require('mongoose');

// const couponSchema = new mongoose.Schema(
//   {
//     code: { type: String, required: true, unique: true, uppercase: true },
//     discount: { type: Number, required: true },
//     expiryDate: { type: Date, required: true },
//     isActive: { type: Boolean, default: true },
//     usageLimit: { type: Number, default: 100 },
//     usedCount: { type: Number, default: 0 },
//     seller: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     },
//   },
//   { timestamps: true }
// );

// // যদি আগে ভুল করে থাকেন তবে এটি নিশ্চিত করুন
// module.exports = mongoose.model('Coupon', couponSchema);
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    // ১. কুপন কোড (ইউনিক এবং ক্যাপিটাল লেটার নিশ্চিত করা)
    code: {
      type: String,
      required: [true, 'Please provide a unique promo code'],
      unique: true,
      uppercase: true,
      trim: true,
    },

    // ২. ডিসকাউন্ট পার্সেন্টেজ
    discount: {
      type: Number,
      required: [true, 'Discount magnitude is required'],
      min: [1, 'Discount must be at least 1%'],
      max: [100, 'Discount cannot exceed 100%'],
    },

    // ৩. মেয়াদের তারিখ
    expiryDate: {
      type: Date,
      required: [true, 'Termination date is required'],
    },

    // ৪. স্ট্যাটাস প্রোটোকল
    isActive: {
      type: Boolean,
      default: true,
    },

    // ৫. লিমিটেশন ম্যাট্রিক্স
    usageLimit: {
      type: Number,
      default: 100,
    },
    usedCount: {
      type: Number,
      default: 0,
    },

    // ৬. অথোরিটি রেফারেন্স (সেলার অথবা অ্যাডমিন যে কেউ হতে পারে)
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Authority reference (Seller ID) is required'],
    },
  },
  {
    timestamps: true, // Ingestion Date এবং Update Date অটোমেটিক থাকবে
  }
);

// --- ইনডেক্সিং (দ্রুত কুপন ভেরিফাই করার জন্য) ---
couponSchema.index({ code: 1, isActive: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
