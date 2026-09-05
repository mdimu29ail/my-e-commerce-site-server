const express = require('express');
const router = express.Router();

// কন্ট্রোলার ইমপোর্ট
const {
  createCategory,
  getCategories,
  getCategoryTree,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// মিডলওয়্যার ইমপোর্ট (সিকিউরিটির জন্য)
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// ==========================================
// PUBLIC ROUTES (ক্রেতারা দেখতে পারবে)
// ==========================================

/**
 * @desc    সব ক্যাটাগরির সাধারণ লিস্ট পাওয়া
 * @route   GET /api/categories
 * @access  Public
 */
router.get('/', getCategories);

/**
 * @desc    নেস্টেড ক্যাটাগরি স্ট্রাকচার (Parent-Child Tree) পাওয়া
 * @route   GET /api/categories/tree
 * @access  Public (মেনু বা সাইডবারের জন্য ব্যবহৃত হবে)
 */
router.get('/tree', getCategoryTree);

// ==========================================
// PRIVATE ROUTES (শুধুমাত্র অ্যাডমিন ম্যানেজ করবে)
// ==========================================

/**
 * @desc    নতুন ক্যাটাগরি তৈরি করা
 * @route   POST /api/categories
 * @access  Private (Admin Only)
 */
router.post('/', protect, adminOnly, createCategory);

/**
 * @desc    ক্যাটাগরি আপডেট করা
 * @route   PUT /api/categories/:id
 * @access  Private (Admin Only)
 */
router.put('/:id', protect, adminOnly, updateCategory);

/**
 * @desc    ক্যাটাগরি ডিলিট করা
 * @route   DELETE /api/categories/:id
 * @access  Private (Admin Only)
 */
router.delete('/:id', protect, adminOnly, deleteCategory);

module.exports = router;
