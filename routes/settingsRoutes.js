const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect } = require('../middleware/authMiddleware');

// ১. কনফিগারেশন গেট করা
router.get('/header', async (req, res) => {
  try {
    let config = await Settings.findOne({ key: 'header_manifest' });

    // ডাটাবেসে যদি ডাটা না থাকে, তবে ফ্রন্টএন্ডের ফরম্যাটে একটি অবজেক্ট দিন
    if (!config) {
      return res.json({
        key: 'header_manifest',
        labels: {
          shop: { text: 'Shop', badge: '', color: '#e11d48' },
          categories: { text: 'Categories', badge: 'SALE', color: '#14b8a6' },
          flash: { text: 'Flash Sale', badge: 'HOT', color: '#e11d48' },
        },
        shopMenu: { banners: [] },
        catMenu: { banners: [] },
        flashMenu: { nodes: [], topRated: [] },
      });
    }
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ২. কনফিগারেশন আপডেট করা
router.put('/header', protect, async (req, res) => {
  try {
    console.log('PUT /api/settings/header called with body:', JSON.stringify(req.body, null, 2));
    // key: 'header_manifest' দিয়ে চেক করে আপডেট বা ইনসার্ট হবে
    const updatedConfig = await Settings.findOneAndUpdate(
      { key: 'header_manifest' },
      { $set: req.body }, // $set ব্যবহার করা নিরাপদ
      { new: true, upsert: true }
    );
    res.status(200).json(updatedConfig);
  } catch (error) {
    console.error('PUT /api/settings/header error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
