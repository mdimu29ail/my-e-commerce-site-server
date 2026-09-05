const express = require('express');
const router = express.Router();

// কন্ট্রোলার ইমপোর্ট (এখানে updateOrderStatus যোগ করা হয়েছে)
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus, // <--- এটি আগে মিসিং ছিল
  getMyOrders,
  getOrders,
  getSellerOrders,
} = require('../controllers/orderController');

// মিডলওয়্যার ইমপোর্ট
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// ==========================================
// CUSTOMER ROUTES (ক্রেতাদের জন্য)
// ==========================================

router.post('/', protect, addOrderItems);
router.get('/myorders', protect, getMyOrders);

// ==========================================
// SELLER ROUTES (বিক্রেতাদের জন্য)
// ==========================================

router.get(
  '/seller/all',
  protect,
  authorize('seller', 'admin'),
  getSellerOrders
);

// ==========================================
// ADMIN & MODERATOR ROUTES (ম্যানেজমেন্ট)
// ==========================================

// সব অর্ডারের তালিকা দেখা
router.get('/', protect, authorize('admin', 'moderator'), getOrders);

// অর্ডারের স্ট্যাটাস আপডেট (Pending -> Processing -> Shipped -> Delivered)
// এটি আপনার মডারেটর ড্যাশবোর্ডের জন্য অত্যন্ত জরুরি
router.put(
  '/:id/status',
  protect,
  authorize('admin', 'moderator'),
  updateOrderStatus
);

/**
 * @desc    নির্দিষ্ট একটি অর্ডারের ডিটেইলস দেখা
 */
router.get('/:id', protect, getOrderById);

/**
 * @desc    অর্ডার পেমেন্ট স্ট্যাটাস আপডেট (Paid)
 */
router.put('/:id/pay', protect, updateOrderToPaid);

/**
 * @desc    অর্ডার ডেলিভারি স্ট্যাটাস আপডেট (Delivered)
 */
router.put(
  '/:id/deliver',
  protect,
  authorize('seller', 'admin'),
  updateOrderToDelivered
);

module.exports = router;
