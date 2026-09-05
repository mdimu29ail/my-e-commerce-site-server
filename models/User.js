const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // ডিফল্টভাবে কুয়েরিতে পাসওয়ার্ড আসবে না
    },
    role: {
      type: String,
      enum: ['user', 'seller', 'moderator', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: 'https://i.ibb.co/default-avatar.png',
    },
    photoURL: {
      type: String,
      default: 'https://i.ibb.co/default-avatar.png',
    },
    phone: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      maxLength: [200, 'Bio cannot exceed 200 characters'],
    },
    shopBanner: {
      type: String,
      default: '',
    },
    shopName: {
      type: String,
      trim: true,
    },
    address: {
      division: { type: String, default: '' },
      district: { type: String, default: '' },
      upazila: { type: String, default: '' },
      detailAddress: { type: String, default: '' },
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ১. পাসওয়ার্ড হ্যাশ করার মিডলওয়্যার (Cleaned up for Mongoose 5+)
userSchema.pre('save', async function () {
  // পাসওয়ার্ড পরিবর্তন না হলে হুক থেকে বের হয়ে যাবে
  if (!this.isModified('password')) {
    return;
  }
  // next() লাগবে না, Mongoose নিজে এটি হ্যান্ডেল করবে
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ২. পাসওয়ার্ড ভেরিফাই করার মেথড
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ৩. সাইন ইন করার জন্য JWT টোকেন জেনারেট করার মেথড (Fixed Payload & Fallback)
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { userId: this._id }, // 🔴 FIX: id এর বদলে userId দেওয়া হয়েছে (authMiddleware এর সাথে মিল রাখার জন্য)
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d', // 🔴 FIX: .env তে না থাকলে ডিফল্ট 30 দিন
    }
  );
};

// ৪. পাসওয়ার্ড রিসেট টোকেন জেনারেট করার মেথড
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
