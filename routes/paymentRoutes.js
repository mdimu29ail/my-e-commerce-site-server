const express = require('express');
const router = express.Router();

// কন্ট্রোলার ইমপোর্ট
const {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN,
} = require('../controllers/paymentController');

// মিডলওয়্যার ইমপোর্ট
const { protect } = require('../middleware/authMiddleware');

/**
 * @desc    পেমেন্ট প্রসেস শুরু করা (SSLCommerz/bKash-এ রিডাইরেক্ট করবে)
 * @route   POST /api/payment/initiate
 * @access  Private (শুধুমাত্র লগইন করা ক্রেতা)
 */
router.post('/initiate', protect, initiatePayment);

/**
 * @desc    পেমেন্ট সফল হলে গেটওয়ে এই ইউআরএল-এ ডাটা পাঠাবে
 * @route   POST /api/payment/success/:tranId
 * @access  Public (Gateway Callback)
 * @note    এটি পাবলিক কারণ পেমেন্ট গেটওয়ে সরাসরি এই রাউট কল করে
 */
router.post('/success/:tranId', paymentSuccess);

/**
 * @desc    পেমেন্ট ফেইল করলে গেটওয়ে এই ইউআরএল-এ পাঠাবে
 * @route   POST /api/payment/fail/:tranId
 * @access  Public
 */
router.post('/fail/:tranId', paymentFail);

/**
 * @desc    ইউজার পেমেন্ট ক্যানসেল করলে
 * @route   POST /api/payment/cancel/:tranId
 * @access  Public
 */
router.post('/cancel/:tranId', paymentCancel);

/**
 * @desc    Instant Payment Notification (IPN) - ব্যাকগ্রাউন্ড ভেরিফিকেশন
 * @route   POST /api/payment/ipn
 * @access  Public
 */
router.post('/ipn', paymentIPN);

module.exports = router;
