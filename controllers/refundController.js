const Refund = require('../models/Refund');
const Order = require('../models/Order');

// নিশ্চিত করুন এখানে exports. লিখা আছে
exports.createRefund = async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;
    const refund = await Refund.create({
      order: orderId,
      user: req.user._id,
      amount,
      reason,
      status: 'Pending',
    });
    res.status(201).json(refund);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find({}).populate('user', 'name email');
    res.json(refunds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRefundStatus = async (req, res) => {
  try {
    const refund = await Refund.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(refund);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find({ user: req.user._id });
    res.json(refunds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
