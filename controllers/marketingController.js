const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get Marketing Stats
exports.getMarketingStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    // একটি সিম্পল ক্যালকুলেশন
    res.json({
      reach: (totalUsers * 1.2).toFixed(1) + 'k',
      conversion:
        totalOrders > 0
          ? ((totalOrders / totalUsers) * 10).toFixed(2) + '%'
          : '0%',
      roi: '12.4x',
      ingress: totalUsers.toLocaleString(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Campaigns
exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Campaign
exports.createCampaign = async (req, res) => {
  try {
    const campaign = new Campaign(req.body);
    const saved = await campaign.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
