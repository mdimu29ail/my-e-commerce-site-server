const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema(
  {
    // ১. অর্ডার রেফারেন্স (অর্ডারের সব তথ্য পেতে ব্যবহৃত হবে)
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    // ২. কাস্টমার আইডেন্টিটি
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ৩. নির্দিষ্ট আইটেম প্রোটোকল (অর্ডারের কোন প্রোডাক্টটি ফেরত আসছে)
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        seller: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],

    // ৪. রিটার্ন ন্যারেটিভ (Reason)
    // এটি ফ্রন্টএন্ডের সিলেক্ট অপশনের সাথে মিল রাখা হয়েছে
    reason: {
      type: String,
      required: [true, 'Please specify the reason for return'],
      enum: [
        'Defective Product',
        'Wrong Item Received',
        'Damaged in Transit',
        'Quality not as expected',
        'Missing Parts',
        'Changed My Mind',
      ],
    },

    // ৫. ভিজ্যুয়াল এভিডেন্স (ইমেজ ইউআরএল অ্যারে)
    images: [
      {
        type: String, // Firebase/ImgBB/Cloudinary URL
      },
    ],

    // ৬. অতিরিক্ত বিস্তারিত ন্যারেটিভ
    additionalDetails: {
      type: String,
      trim: true,
    },

    // ৭. প্রোটোকল স্ট্যাটাস (টাইমলাইনের সাথে সিঙ্ক করা)
    status: {
      type: String,
      enum: [
        'Pending', // Request Ingested
        'Approved', // Protocol Approved
        'Rejected', // Denied
        'Picked Up', // Reverse Logistics Active
        'Received', // Archive Received
        'Refunded', // Financial Reversal Complete
      ],
      default: 'Pending',
    },

    // ৮. অ্যাডমিন বা মডারেটর মন্তব্য
    adminComment: {
      type: String,
    },

    // ৯. রিফান্ড রেফারেন্স
    refundId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Refund',
    },
  },
  {
    timestamps: true, // Ingestion Date (createdAt) অটোমেটিক তৈরি হবে
  }
);

// --- দ্রুত কুয়েরি করার জন্য ইনডেক্সিং ---
returnSchema.index({ order: 1, user: 1 });
returnSchema.index({ status: 1 });

module.exports = mongoose.model('Return', returnSchema);
