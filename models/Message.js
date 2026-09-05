// const mongoose = require('mongoose');

// const messageSchema = new mongoose.Schema(
//   {
//     // ১. কে মেসেজ পাঠাচ্ছে (Sender)
//     sender: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },

//     // ২. কার কাছে মেসেজ যাচ্ছে (Receiver - Seller or Customer)
//     receiver: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },

//     // ৩. মেসেজের বিষয়বস্তু
//     message: {
//       type: String,
//       required: [true, 'মেসেজ খালি রাখা যাবে না'],
//       trim: true,
//     },

//     // ৪. কনটেক্সটুয়াল চ্যাট (নির্দিষ্ট কোন পণ্য সম্পর্কে কথা হচ্ছে কি না)
//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Product',
//       default: null,
//     },

//     // ৫. এটাচমেন্ট (ছবি বা ফাইল পাঠানোর জন্য)
//     attachments: [
//       {
//         type: String, // Firebase/Cloudinary URL
//       },
//     ],

//     // ৬. মেসেজ স্ট্যাটাস (Seen/Unseen)
//     isRead: {
//       type: Boolean,
//       default: false,
//     },

//     // ৭. চ্যাট সেশন ট্র্যাক করার জন্য (অপশনাল কিন্তু সার্চের জন্য ভালো)
//     conversationId: {
//       type: String,
//     },
//   },
//   {
//     timestamps: true, // এটি createdAt এবং updatedAt অটোমেটিক যোগ করবে
//   }
// );

// // --- ইনডেক্সিং (দ্রুত চ্যাট হিস্ট্রি লোড করার জন্য অত্যন্ত জরুরি) ---
// // sender এবং receiver এর মধ্যে মেসেজ দ্রুত খুঁজে পেতে সাহায্য করবে
// messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
// messageSchema.index({ receiver: 1, isRead: 1 }); // আনরেড মেসেজ কাউন্ট করার জন্য

// module.exports = mongoose.model('Message', messageSchema);

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    message: {
      type: String,
      required: [true, 'মেসেজ খালি রাখা যাবে না'],
      trim: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },

    attachments: [
      {
        type: String,
      },
    ],

    isRead: {
      type: Boolean,
      default: false,
    },

    conversationId: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ইনডেক্সিং
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
