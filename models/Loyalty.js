const mongoose = require('mongoose');

const loyaltySchema = new mongoose.Schema(
  {
    // ১. কোন ইউজারের লয়ালটি ডাটা এটি
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // ২. বর্তমান ব্যালেন্স এবং আজীবনের অর্জন
    currentPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarnedPoints: {
      type: Number,
      default: 0, // এটি মেম্বারশিপ টায়ার (Tier) নির্ধারণে সাহায্য করবে
    },

    // ৩. মেম্বারশিপ টায়ার (Tier System)
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze',
    },

    // ৪. পয়েন্ট লেনদেনের ইতিহাস (Transaction History)
    history: [
      {
        transactionType: {
          type: String,
          enum: [
            'Earned',
            'Redeemed',
            'Expired',
            'Refunded_Debit',
            'Admin_Bonus',
          ],
          required: true,
        },
        points: {
          type: Number,
          required: true,
        },
        descriptionEn: {
          type: String,
          required: true, // e.g., "Earned from Order #123"
        },
        descriptionBn: {
          type: String,
          required: true, // e.g., "অর্ডার #১২৩ থেকে অর্জিত"
        },
        order: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ৫. পয়েন্টের মেয়াদ (ঐচ্ছিক: সাধারণত ১ বছর রাখা হয়)
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// --- মিডলওয়্যার: পয়েন্টের ওপর ভিত্তি করে অটোমেটিক টায়ার আপডেট করা ---
loyaltySchema.pre('save', function (next) {
  const points = this.totalEarnedPoints;

  if (points >= 10000) {
    this.tier = 'Platinum';
  } else if (points >= 5000) {
    this.tier = 'Gold';
  } else if (points >= 1000) {
    this.tier = 'Silver';
  } else {
    this.tier = 'Bronze';
  }

  next();
});

// --- ইনডেক্সিং (ইউজার আইডি দিয়ে দ্রুত ডাটা খোঁজার জন্য) ---
loyaltySchema.index({ user: 1 });

module.exports = mongoose.model('Loyalty', loyaltySchema);
