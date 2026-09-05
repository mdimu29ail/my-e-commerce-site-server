const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema(
  {
    // ১. কোন অর্ডারের ট্র্যাকিং এটি
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
    },

    // ২. কোন ইউজারের অর্ডার এটি (Security ও দ্রুত ফিল্টার করার জন্য যোগ করা হলো)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ৩. ট্র্যাকিং আইডি (ইউনিক)
    trackingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // ৪. কুরিয়ার তথ্য
    courierName: {
      type: String,
      default: 'In-house Delivery',
    },

    // ৫. বর্তমান অবস্থা (Current Status)
    currentStatus: {
      type: String,
      enum: [
        'Order Placed',
        'Processing & Verification',
        'En Route to Destination',
        'Out for Delivery',
        'Successfully Delivered',
        'Cancelled',
        'Returned',
      ],
      default: 'Order Placed',
    },

    // ৬. ট্র্যাকিং টাইমলাইন হিস্ট্রি
    history: [
      {
        status: String,
        location: String,
        messageEn: String, // 'Your parcel has reached the hub'
        messageBn: String, // 'আপনার পার্সেলটি হাবে পৌঁছেছে'
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ৭. অতিরিক্ত তথ্য
    estimatedDeliveryDate: {
      type: Date,
    },
    liveTrackingUrl: {
      type: String,
    },
  },
  {
    timestamps: true, // createdAt ও updatedAt অটোমেটিক মেইনটেইন হবে
  }
);

// --- ইনডেক্সিং (সার্চিং ফাস্ট করার জন্য) ---
// Note: trackingId and order already have unique:true in schema, so no duplicate index needed
trackingSchema.index({ user: 1 });

module.exports = mongoose.model('Tracking', trackingSchema);
