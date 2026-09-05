const express = require('express');
const router = express.Router();

// কন্ট্রোলার ইমপোর্ট
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getRecommendedProducts,
} = require('../controllers/productController');

const {
  createProductReview,
  getTopProducts,
  deleteReview,
  adminAddReview,
  updateReviewStatus,
  getAllReviews,
  getApprovedReviews,
} = require('../controllers/reviewController');

// মিডলওয়্যার ইমপোর্ট (সিকিউরিটির জন্য)
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// ==========================================
// PUBLIC ROUTES (সবাই দেখতে পারবে)
// ==========================================

/**
 * @desc    সব প্রোডাক্ট পাওয়া (সার্চ, ফিল্টার এবং পেজিনেশন সহ)
 * @route   GET /api/products
 */
router.get('/', getProducts);

/**
 * @desc    টপ রেটেড প্রোডাক্ট পাওয়া (হোম পেজ সেকশনের জন্য)
 * @route   GET /api/products/top
 */
router.get('/top', getTopProducts);

/**
 * @desc    এআই রেকমেন্ডেড প্রোডাক্ট (ইউজার ইন্টারেস্ট অনুযায়ী)
 * @route   GET /api/products/recommendations
 */
router.get('/recommendations', getRecommendedProducts);

/**
 * @desc    অ্যাপ্রুভড রিভিউ পাওয়া (হোম পেজের জন্য)
 * @route   GET /api/products/reviews/approved
 */
router.get('/reviews/approved', getApprovedReviews);

// ==========================================
// ADMIN/MODERATOR ROUTES (মডারেশন)
// ==========================================

/**
 * @desc    সব রিভিউ পাওয়া (Admin/Moderator)
 * @route   GET /api/products/all-reviews
 */
router.get(
  '/all-reviews',
  protect,
  authorize('admin', 'moderator'),
  getAllReviews
);

/**
 * @desc    নির্দিষ্ট একটি প্রোডাক্টের ডিটেইলস দেখা
 * @route   GET /api/products/:id
 */
router.get('/:id', getProductById);

// ==========================================
// PRIVATE ROUTES (লগইন করা থাকতে হবে)
// ==========================================

/**
 * @desc    প্রোডাক্টে রিভিউ দেওয়া (শুধুমাত্র কাস্টমার)
 * @route   POST /api/products/:id/reviews
 */
router.post('/:id/reviews', protect, createProductReview);

/**
 * @desc    বাজে রিভিউ ডিলিট করা (শুধুমাত্র অ্যাডমিন বা মডারেটর)
 */
router.delete(
  '/:id/reviews/:reviewId',
  protect,
  authorize('admin', 'moderator'),
  deleteReview
);

/**
 * @desc    Admin/Moderator এর জন্য রিভিউ যোগ করা
 * @route   POST /api/products/:id/admin-reviews
 */
router.post(
  '/:id/admin-reviews',
  protect,
  authorize('admin', 'moderator'),
  adminAddReview
);

/**
 * @desc    রিভিউ স্ট্যাটাস আপডেট করা (Approve/Reject/Hide)
 * @route   PUT /api/products/:id/reviews/:reviewId/status
 */
router.put(
  '/:id/reviews/:reviewId/status',
  protect,
  authorize('admin', 'moderator'),
  updateReviewStatus
);

// ==========================================
// SELLER, ADMIN & MODERATOR ROUTES (ম্যানেজমেন্ট)
// ==========================================

/**
 * @desc    নতুন প্রোডাক্ট যোগ করা
 * @route   POST /api/products
 * @access  Private (Seller/Admin/Moderator)
 */
router.post(
  '/',
  protect,
  authorize('seller', 'admin', 'moderator'),
  createProduct
);

/**
 * @desc    প্রোডাক্ট আপডেট এবং ডিলিট করা
 * @route   PUT/DELETE /api/products/:id
 * @access  Private (Seller/Admin/Moderator)
 */
router
  .route('/:id')
  .put(protect, authorize('seller', 'admin', 'moderator'), updateProduct)
  .delete(protect, authorize('seller', 'admin', 'moderator'), deleteProduct);

module.exports = router;
