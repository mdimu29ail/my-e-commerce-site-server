const express = require('express');
const router = express.Router();

// কন্ট্রোলার ইমপোর্ট
const {
  createProductReview,
  deleteReview,
  getTopProducts,
} = require('../controllers/reviewController');

// মিডলওয়্যার ইমপোর্ট
const { protect } = require('../middleware/authMiddleware');
const { authorize, moderatorOrAdmin } = require('../middleware/roleMiddleware');

// ==========================================
// PUBLIC ROUTES (সবাই দেখতে পারবে)
// ==========================================

/**
 * @desc    টপ রেটেড পণ্যগুলোর তালিকা পাওয়া
 * @route   GET /api/reviews/top
 */
router.get('/top', getTopProducts);

// ==========================================
// PRIVATE ROUTES (লগইন করা ক্রেতাদের জন্য)
// ==========================================

/**
 * @desc    নির্দিষ্ট পণ্যে রিভিউ যোগ করা
 * @route   POST /api/reviews/:productId
 * @access  Private (Customer only)
 */
router.post('/:productId', protect, createProductReview);

// ==========================================
// ADMIN & MODERATOR ROUTES (মডারেশন)
// ==========================================

/**
 * @desc    কোনো রিভিউ ডিলিট করা (স্প্যাম বা অশালীন মন্তব্যের জন্য)
 * @route   DELETE /api/reviews/:reviewId/product/:productId
 * @access  Private (Admin/Moderator)
 */
router.delete(
  '/:reviewId/product/:productId',
  protect,
  moderatorOrAdmin,
  deleteReview
);

module.exports = router;
