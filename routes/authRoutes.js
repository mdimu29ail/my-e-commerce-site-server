const express = require('express');
const router = express.Router();

// কন্ট্রোলার ইমপোর্ট (আমরা আগে এগুলো তৈরি করেছি)
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  forgotPassword,
} = require('../controllers/authController');

// প্রোফাইল আপডেটের জন্য ইউজার কন্ট্রোলার থেকে ফাংশন নেওয়া হচ্ছে
const { updateUserProfile } = require('../controllers/userController');

// মিডলওয়্যার ইমপোর্ট
const { protect } = require('../middleware/authMiddleware');

/**
 * @desc    নতুন ইউজার রেজিস্ট্রেশন
 * @route   POST /api/auth/register
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @desc    লগইন করা এবং JWT টোকেন সেট করা
 * @route   POST /api/auth/login
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @desc    লগআউট করা এবং কুকি ক্লিয়ার করা
 * @route   POST /api/auth/logout
 * @access  Public
 */
router.post('/logout', logoutUser);

/**
 * @desc    পাসওয়ার্ড ভুলে গেলে রিকোয়েস্ট পাঠানো (Email/OTP)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @desc    নিজের প্রোফাইল দেখা
 * @route   GET /api/auth/profile
 * @access  Private (Protect মিডলওয়্যার প্রয়োজন)
 */
router.get('/profile', protect, getUserProfile);

/**
 * @desc    নিজের প্রোফাইল আপডেট করা
 * @route   PUT /api/auth/profile
 * @access  Private
 */
router.put('/profile', protect, updateUserProfile);

module.exports = router;
