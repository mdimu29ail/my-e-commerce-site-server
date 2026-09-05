const User = require('../models/User');
const Order = require('../models/Order');

// @desc    কেনাকাটার পর লয়ালটি পয়েন্ট যোগ করা (অটোমেটিক প্রসেস)
// @route   Internal Call (After payment success)
exports.addLoyaltyPoints = async (userId, orderAmount) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // লজিক: প্রতি ১০০ টাকার কেনাকাটায় ৫ পয়েন্ট (আপনার ইচ্ছা অনুযায়ী পরিবর্তন করতে পারেন)
    const pointsToAdd = Math.floor(orderAmount / 100) * 5;

    user.loyaltyPoints += pointsToAdd;
    await user.save();

    console.log(`✅ ${pointsToAdd} points added to User: ${user.name}`);
  } catch (error) {
    console.error('❌ Loyalty Point Error:', error.message);
  }
};

// @desc    পয়েন্ট রিডিম (Redeem) করে ডিসকাউন্ট নেওয়া
// @route   POST /api/loyalty/redeem
// @access  Private
exports.redeemPoints = async (req, res) => {
  try {
    const { pointsToRedeem } = req.body;
    const user = await User.findById(req.user._id);

    // ১. চেক করা হচ্ছে ইউজারের পর্যাপ্ত পয়েন্ট আছে কি না
    if (user.loyaltyPoints < pointsToRedeem) {
      return res
        .status(400)
        .json({ message: 'আপনার পর্যাপ্ত লয়ালটি পয়েন্ট নেই' });
    }

    // ২. পয়েন্টকে টাকায় রূপান্তর (লজিক: ১০ পয়েন্ট = ১ টাকা)
    const discountAmount = Math.floor(pointsToRedeem / 10);

    if (discountAmount < 1) {
      return res
        .status(400)
        .json({ message: 'ন্যূনতম ১০ পয়েন্ট রিডিম করতে হবে' });
    }

    // ৩. ইউজারের ব্যালেন্স থেকে পয়েন্ট কমিয়ে দেওয়া
    user.loyaltyPoints -= pointsToRedeem;
    await user.save();

    res.json({
      message: 'পয়েন্ট সফলভাবে রিডিম হয়েছে',
      discountAmount,
      remainingPoints: user.loyaltyPoints,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    ইউজারের বর্তমান পয়েন্ট এবং স্ট্যাটাস দেখা
// @route   GET /api/loyalty/status
// @access  Private
exports.getLoyaltyStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('loyaltyPoints name');

    // মেম্বারশিপ টায়ার (Tier) লজিক
    let tier = 'Bronze';
    if (user.loyaltyPoints > 5000) tier = 'Platinum';
    else if (user.loyaltyPoints > 2000) tier = 'Gold';
    else if (user.loyaltyPoints > 500) tier = 'Silver';

    res.json({
      points: user.loyaltyPoints,
      tier: tier,
      nextTierRequirement:
        tier === 'Bronze' ? 500 : tier === 'Silver' ? 2000 : 5000,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    অ্যাডমিন দ্বারা কোনো বিশেষ ইভেন্টে বোনাস পয়েন্ট দেওয়া
// @route   POST /api/loyalty/admin/bonus
// @access  Private (Admin Only)
exports.giveBonusPoints = async (req, res) => {
  try {
    const { userId, bonusPoints, reason } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'ইউজার পাওয়া যায়নি' });
    }

    user.loyaltyPoints += Number(bonusPoints);
    await user.save();

    res.json({
      message: `${bonusPoints} বোনাস পয়েন্ট দেওয়া হয়েছে। কারণ: ${reason}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
