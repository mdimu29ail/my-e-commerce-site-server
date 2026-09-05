const express = require('express');
const router = express.Router();

// ১. কন্ট্রোলার থেকে ফাংশনগুলো ইমপোর্ট
const {
  requestReturn,
  getReturns,
  getMyReturns,
  getReturnById,
  updateReturnStatus,
  getSellerReturns,
} = require('../controllers/returnController');

// ২. মিডলওয়্যার ইমপোর্ট
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// ==========================================
// USER ROUTES (আর্কাইভ ইনজেশন ও পার্সোনাল লেজার)
// ==========================================

/**
 * @desc    নতুন রিটার্ন রিকোয়েস্ট তৈরি করা
 * @route   POST /api/returns
 */
router.post('/', protect, requestReturn);

/**
 * @desc    নিজের সব রিটার্ন রিকোয়েস্ট দেখা
 * @route   GET /api/returns/myreturns
 */
router.get('/myreturns', protect, getMyReturns);

// ==========================================
// MERCHANT & ADMIN ROUTES (ম্যানেজমেন্ট লেজার)
// ==========================================

/**
 * @desc    সেলারদের জন্য তাদের পণ্যের রিটার্ন দেখা
 * @route   GET /api/returns/seller
 */
router.get('/seller', protect, authorize('seller', 'admin'), getSellerReturns);

/**
 * @desc    অ্যাডমিন বা মডারেটরদের জন্য সব রিটার্ন দেখা
 * @route   GET /api/returns
 */
router.get('/', protect, authorize('admin', 'moderator'), getReturns);

/**
 * @desc    নির্দিষ্ট আইডি দিয়ে বিস্তারিত ম্যানিফেস্ট দেখা
 * @route   GET /api/returns/:id
 */
router.get('/:id', protect, getReturnById);

/**
 * @desc    রিটার্ন স্ট্যাটাস বা প্রোটোকল আপডেট করা
 * @route   PUT /api/returns/:id
 */
router.put(
  '/:id',
  protect,
  authorize('admin', 'moderator', 'seller'),
  updateReturnStatus
);

module.exports = router;
