const express = require('express');
const router = express.Router();

// কন্ট্রোলার ইমপোর্ট (আমরা আগে এটি তৈরি করেছি)
const {
  redeemPoints,
  getLoyaltyStatus,
  giveBonusPoints,
} = require('../controllers/loyaltyController');

// মিডলওয়্যার ইমপোর্ট
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

/**
 * @desc    ইউজারের বর্তমান পয়েন্ট এবং মেম্বারশিপ টায়ার (Bronze/Silver/Gold) দেখা
 * @route   GET /api/loyalty/status
 * @access  Private (লগইন করা যেকোনো ইউজার)
 */
router.get('/status', protect, getLoyaltyStatus);

/**
 * @desc    পয়েন্ট রিডিম (Redeem) করে ডিসকাউন্ট নেওয়া
 * @route   POST /api/loyalty/redeem
 * @access  Private (শুধুমাত্র ক্রেতা)
 */
router.post('/redeem', protect, redeemPoints);

/**
 * @desc    অ্যাডমিন দ্বারা কোনো বিশেষ ইভেন্টে (যেমন: জন্মদিন বা ক্যাম্পেইন) বোনাস পয়েন্ট দেওয়া
 * @route   POST /api/loyalty/admin/bonus
 * @access  Private (শুধুমাত্র অ্যাডমিন)
 */
router.post('/admin/bonus', protect, adminOnly, giveBonusPoints);

module.exports = router;
