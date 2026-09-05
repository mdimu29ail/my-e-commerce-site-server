const mongoose = require('mongoose');

// রিভিউ আইটেম স্কিমা (আগের মতোই থাকবে)
const reviewItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    // ১. বেসিক ইনফরমেশন
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    nameEn: {
      type: String,
      required: [true, 'English name required'],
      trim: true,
    },
    nameBn: { type: String, required: [true, 'বাংলা নাম আবশ্যক'], trim: true },
    slug: { type: String, unique: true, lowercase: true },
    descriptionEn: { type: String, required: true },
    descriptionBn: { type: String, required: true },

    // ২. প্রাইসিং ও ইনভেন্টরি
    price: { type: Number, required: true, default: 0 },
    discountPrice: { type: Number, default: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: { type: String },
    stock: { type: Number, required: true, default: 0 },
    images: [{ type: String, required: true }],

    // --- ৩. FASHION & APPAREL ---
    colors: [{ type: String }],
    sizes: [{ type: String }],
    fabricGsm: { type: String },
    pattern: { type: String },
    fitType: { type: String },
    collarType: { type: String },
    sleeveLength: { type: String },
    occasion: { type: String },
    careGuide: { type: String },

    // --- ৪. HOME, TECH & GENERAL ---
    material: { type: String },
    dimensions: { type: String },
    weight: { type: String },
    processor: { type: String },
    ram: { type: String },
    storage: { type: String },
    displaySize: { type: String },
    batteryLife: { type: String },
    ipRating: { type: String },

    // --- ৫. FOOD & GROCERIES ---
    ingredients: { type: String },
    origin: { type: String },
    netQuantity: { type: String },
    purity: { type: String },
    expiryDate: { type: String },
    storageType: { type: String },
    isOrganic: { type: Boolean, default: false },

    // --- ৬. SEO & STATUS ---
    metaTitle: { type: String },
    metaDescription: { type: String },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
    },

    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewItemSchema],
    isFeatured: { type: Boolean, default: false },
    tags: [String],
    soldCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ইনডেক্সিং
productSchema.index({ nameEn: 'text', nameBn: 'text', tags: 'text' });

// --- ফিক্সড স্লাগ মিডলওয়্যার (Async Style) ---
productSchema.pre('save', async function () {
  if (this.isModified('nameEn')) {
    this.slug = this.nameEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
});

module.exports = mongoose.model('Product', productSchema);
