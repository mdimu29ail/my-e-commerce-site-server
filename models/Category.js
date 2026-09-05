const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    // ১. ক্যাটাগরির নাম (English & Bengali)
    nameEn: {
      type: String,
      required: [true, 'Please add a category name in English'],
      unique: true,
      trim: true,
    },
    nameBn: {
      type: String,
      required: [true, 'ক্যাটাগরির নাম বাংলায় দিন'],
      trim: true,
    },

    // ২. SEO ফ্রেন্ডলি URL এর জন্য স্লাগ
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    // ৩. ভিজ্যুয়াল এলিমেন্ট (ইমেজ URL - ImgBB/Cloudinary)
    image: {
      type: String,
      required: [true, 'Category visual is required'],
    },

    // ৪. নেস্টেড ক্যাটাগরি লজিক (ভবিষ্যতের জন্য সাব-ক্যাটাগরি সাপোর্ট)
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },

    // ৫. অতিরিক্ত তথ্য ও ডেসক্রিপশন
    description: {
      type: String,
      trim: true,
    },

    // ৬. অ্যাডমিন ট্র্যাকিং (কে তৈরি করেছে)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ৭. স্ট্যাটাস কন্ট্রোল
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt এবং updatedAt অটোমেটিক মেইনটেইন হবে
  }
);

// --- মিডলওয়্যার: স্লাগ জেনারেট করা (FIXED) ---
// এখানে async function ব্যবহার করা হয়েছে, তাই next() এর প্রয়োজন নেই
categorySchema.pre('save', async function () {
  if (this.isModified('nameEn')) {
    this.slug = this.nameEn
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-') // স্পেস বা স্পেশাল ক্যারেক্টার বদলে ড্যাশ হবে
      .replace(/(^-|-$)+/g, ''); // শুরুতে বা শেষে বাড়তি ড্যাশ মুছে যাবে
  }
});

module.exports = mongoose.model('Category', categorySchema);
