const express = require('express');
const router = express.Router();

// ১. কন্ট্রোলার ইম্পোর্ট
const {
  createRefund,
  getRefunds,
  updateRefundStatus,
  getMyRefunds,
} = require('../controllers/refundController');

// ২. মিডলওয়্যার ইম্পোর্ট
const { protect } = require('../middleware/authMiddleware');
const { moderatorOrAdmin, adminOnly } = require('../middleware/roleMiddleware');

// ৩. রাউট সেটআপ
router.get('/my', protect, getMyRefunds);

// এই ২৯ নম্বর লাইনটি চেক করুন
router.post('/', protect, moderatorOrAdmin, createRefund);

router.get('/', protect, moderatorOrAdmin, getRefunds);
router.put('/:id', protect, adminOnly, updateRefundStatus);

module.exports = router;
