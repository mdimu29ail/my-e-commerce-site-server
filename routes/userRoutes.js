const express = require('express');
const router = express.Router();

// ১. কন্ট্রোলার থেকে ফাংশনগুলো ইমপোর্ট
const {
  getUsers,
  getUserById,
  updateUserProfile,
  updateUserRole,
  deleteUser,
  updateLoyaltyPoints,
  getUserAnalytics,
  getChatUsers,
} = require('../controllers/userController');

// ২. মিডলওয়্যারগুলো ইমপোর্ট করুন (এটিই মিসিং ছিল)
// নিশ্চিত করুন আপনার প্রজেক্টে এই ফাইলটির পাথ ঠিক আছে কি না
const {
  protect,
  adminOnly,
  moderatorOrAdmin,
} = require('../middleware/authMiddleware');

/**
 * @desc    ইউজারের পার্সোনাল অ্যানালিটিক্স ডাটা পাওয়া
 * @route   GET /api/users/analytics
 * @access  Private (User/Seller/Admin)
 */
router.get('/analytics', protect, getUserAnalytics);

/**
 * @desc    চ্যাটের জন্য অ্যাডমিন, মডারেটর এবং সেলারদের তালিকা পাওয়া
 * @route   GET /api/users/chat-users
 * @access  Private
 */
router.get('/chat-users', protect, getChatUsers);

/**
 * @desc    নিজের প্রোফাইল দেখা এবং আপডেট করা
 */
router
  .route('/profile')
  .get(protect, (req, res) => res.json(req.user))
  .put(protect, updateUserProfile);

// ==========================================
// ADMIN & MODERATOR ROUTES (ম্যানেজমেন্ট)
// ==========================================

/**
 * @desc    সব ইউজারের তালিকা দেখা (মডারেটর ও অ্যাডমিন উভয়ই পারবে)
 * @route   GET /api/users
 */
router.get('/', protect, moderatorOrAdmin, getUsers);

/**
 * @desc    নির্দিষ্ট ইউজারের ডিটেইলস দেখা
 * @route   GET /api/users/:id
 */
router.get('/:id', protect, moderatorOrAdmin, getUserById);

/**
 * @desc    ইউজার রোল, পয়েন্ট এবং অ্যাপ্রুভাল স্ট্যাটাস আপডেট (শুধুমাত্র অ্যাডমিন)
 * @route   PUT /api/users/:id/role
 */
router.put('/:id/role', protect, moderatorOrAdmin, updateUserRole);
/**
 * @desc    ম্যানুয়ালি লয়ালটি পয়েন্ট আপডেট করা
 * @route   PUT /api/users/:id/loyalty
 */
router.put('/:id/loyalty', protect, adminOnly, updateLoyaltyPoints);

/**
 * @desc    ইউজার ডিলিট করা
 * @route   DELETE /api/users/:id
 */
router.delete('/:id', protect, adminOnly, deleteUser);

module.exports = router;
