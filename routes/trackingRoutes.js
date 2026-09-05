const express = require('express');
const router = express.Router();

// কন্ট্রোলার ইমপোর্ট (নতুন ফাংশনসহ)
const {
  updateTrackingStatus,
  getTrackingDetails,
  getAllTracking, // নতুন যোগ করা হয়েছে
  getTrackingByTrkId, // নতুন যোগ করা হয়েছে
  syncWithCourier,
} = require('../controllers/trackingController');

// মিডলওয়্যার ইমপোর্ট
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @desc    সব ট্র্যাকিং রেকর্ড দেখা (অ্যাডমিন ও মডারেটর)
 * @route   GET /api/tracking
 * @access  Private (Admin/Moderator)
 */
router.get('/', protect, authorize('admin', 'moderator'), getAllTracking);

/**
 * @desc    অর্ডারের ট্র্যাকিং তথ্য এবং স্ট্যাটাস আপডেট করা
 * @route   POST /api/tracking/:orderId
 * @access  Private (Seller/Admin/Moderator)
 */
router.post(
  '/:orderId',
  protect,
  authorize('seller', 'admin', 'moderator'),
  updateTrackingStatus
);

/**
 * @desc    অর্ডার আইডি দিয়ে ট্র্যাকিং ডিটেইলস দেখা
 * @route   GET /api/tracking/:orderId
 * @access  Private (Owner/Seller/Admin)
 */
router.get('/:orderId', protect, getTrackingDetails);

/**
 * @desc    সরাসরি ট্র্যাকিং আইডি (যেমন: TRK123...) দিয়ে সার্চ করা
 * @route   GET /api/tracking/id/:trackingId
 * @access  Private
 */
router.get('/id/:trackingId', protect, getTrackingByTrkId);

/**
 * @desc    কুরিয়ার সার্ভিস (যেমন: Pathao/RedX) থেকে ডাটা সিঙ্ক করা
 * @route   POST /api/tracking/sync/:trackingId
 * @access  Private (Admin Only)
 */
router.post('/sync/:trackingId', protect, authorize('admin'), syncWithCourier);

module.exports = router;
