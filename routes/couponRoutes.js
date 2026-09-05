// const express = require('express');
// const router = express.Router();
// const {
//   getCoupons,
//   createCoupon,
//   updateCoupon,
//   deleteCoupon,
//   validateCoupon,
// } = require('../controllers/couponController');
// const { protect } = require('../middleware/authMiddleware');
// const { adminOnly, adminOrSeller } = require('../middleware/roleMiddleware');

// // কাস্টমারদের জন্য
// router.post('/validate', protect, validateCoupon);

// // অ্যাডমিনদের জন্য
// router
//   .route('/')
//   .get(protect, adminOnly, getCoupons)
//   .post(protect, adminOrSeller, createCoupon);

// router
//   .route('/:id')
//   .put(protect, adminOrSeller, updateCoupon)
//   .delete(protect, adminOrSeller, deleteCoupon);

// module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');
const { adminOrSeller } = require('../middleware/roleMiddleware');

// ==========================================
// PUBLIC/CUSTOMER PROTOCOLS
// ==========================================

/**
 * @desc    কুপন ভ্যালিডেশন (চেকআউটের সময় গ্রাহকরা ব্যবহার করবে)
 * @route   POST /api/coupons/validate
 */
router.post('/validate', protect, validateCoupon);

// ==========================================
// PROMOTION MANAGEMENT PROTOCOLS (Admin & Seller)
// ==========================================

router
  .route('/')
  /**
   * @desc    সব কুপন দেখা (অ্যাডমিন সব দেখবে, সেলার শুধু নিজের গুলো)
   * @access  Private (Admin or Seller)
   */
  .get(protect, adminOrSeller, getCoupons) // 🚨 ফিক্স: adminOnly থেকে adminOrSeller করা হয়েছে

  /**
   * @desc    নতুন কুপন ইনজেস্ট করা
   * @access  Private (Admin or Seller)
   */
  .post(protect, adminOrSeller, createCoupon);

router
  .route('/:id')
  /**
   * @desc    কুপন আপডেট করা
   */
  .put(protect, adminOrSeller, updateCoupon)

  /**
   * @desc    আর্কাইভ থেকে কুপন মুছে ফেলা
   */
  .delete(protect, adminOrSeller, deleteCoupon);

module.exports = router;
