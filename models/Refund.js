const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
  {
    // ১. কোন অর্ডারের টাকা রিফান্ড হচ্ছে
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    // ২. কোন গ্রাহককে টাকা ফেরত দেওয়া হচ্ছে
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ৩. কোন রিটার্ন রিকোয়েস্টের ভিত্তিতে এই রিফান্ড (যদি থাকে)
    returnRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Return',
      default: null,
    },

    // ৪. আর্থিক তথ্য
    amount: {
      type: Number,
      required: [true, 'রিফান্ড অ্যামাউন্ট দেওয়া বাধ্যতামূলক'],
      min: [1, 'রিফান্ড অ্যামাউন্ট অন্তত ১ টাকা হতে হবে'],
    },
    currency: {
      type: String,
      default: 'BDT',
    },

    // ৫. রিফান্ড মেথড (বিকাশ/নগদ/কার্ড বা ওয়ালেট)
    paymentMethod: {
      type: String,
      required: true,
      enum: [
        'bKash',
        'Nagad',
        'Bank Transfer',
        'Loyalty Points',
        'Original Payment Method',
      ],
      default: 'Original Payment Method',
    },

    // ৬. ট্রানজেকশন আইডি (গেটওয়ে থেকে প্রাপ্ত রিফান্ড ট্রানজেকশন আইডি)
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // শুধুমাত্র রিফান্ড কমপ্লিট হলে এটি থাকবে
    },

    // ৭. রিফান্ড স্ট্যাটাস
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed', 'Failed'],
      default: 'Pending',
    },

    // ৮. অডিট ট্রেইল (কে রিফান্ডটি অ্যাপ্রুভ বা প্রসেস করেছে)
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Admin or Moderator ID
    },

    // ৯. কারণ এবং নোট
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    adminNote: {
      type: String,
      trim: true,
    },

    // ১০. রিফান্ড শেষ হওয়ার সময়
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// --- ইনডেক্সিং (দ্রুত ট্র্যাকিং এবং অডিটের জন্য) ---
refundSchema.index({ order: 1, status: 1 });
// Note: transactionId already has unique:true sparse in schema, no duplicate index needed

module.exports = mongoose.model('Refund', refundSchema);
