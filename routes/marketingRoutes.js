const express = require('express');
const router = express.Router();

// ১. কন্ট্রোলার ইমপোর্ট
const {
  getMarketingStats,
  getCampaigns,
  createCampaign,
} = require('../controllers/marketingController');

// ২. মিডলওয়্যার ইমপোর্ট (ফিক্স করা হয়েছে)
// আপনার প্রজেক্টের স্ট্রাকচার অনুযায়ী protect এবং adminOnly ব্যবহার করা হলো
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// ৩. রাউট সেটআপ
// এখানে 'admin' এর বদলে 'adminOnly' ব্যবহার করতে হবে
router.get('/stats', protect, adminOnly, getMarketingStats);
router.get('/campaigns', protect, adminOnly, getCampaigns);
router.post('/campaigns', protect, adminOnly, createCampaign);

module.exports = router;
