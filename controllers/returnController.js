const Return = require('../models/Return');
const Order = require('../models/Order');

// @desc    নতুন রিটার্ন রিকোয়েস্ট তৈরি করা
exports.requestReturn = async (req, res) => {
  try {
    // এখানে images যোগ করা হয়েছে যা ফ্রন্টএন্ড থেকে আসবে
    const { orderId, reason, items, additionalDetails, images } = req.body;

    const returnRequest = new Return({
      user: req.user._id,
      order: orderId,
      reason,
      items,
      additionalDetails,
      images, // ডাটাবেসে ইমেজ সেভ করার জন্য
    });

    const savedReturn = await returnRequest.save();
    res.status(201).json(savedReturn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    সব রিটার্ন দেখা
exports.getReturns = async (req, res) => {
  try {
    // populate('order') যোগ করা হয়েছে যাতে ফ্রন্টএন্ডে আইডি পাওয়া যায়
    const returns = await Return.find({})
      .populate('user', 'name email avatar')
      .populate('order', '_id totalPrice createdAt')
      .sort({ createdAt: -1 });
    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    নিজের রিটার্ন দেখা
exports.getMyReturns = async (req, res) => {
  try {
    // এখানে populate('order') যোগ করা হয়েছে যাতে slice error না হয়
    const returns = await Return.find({ user: req.user._id })
      .populate('order', '_id totalPrice createdAt status')
      .sort({ createdAt: -1 });
    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    আইডি দিয়ে রিটার্ন দেখা
exports.getReturnById = async (req, res) => {
  try {
    // বিস্তারিত তথ্যের জন্য populate ব্যবহার করা হয়েছে
    const returnReq = await Return.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate(
        'order',
        '_id totalPrice createdAt status paymentMethod address'
      );

    if (!returnReq) {
      return res.status(404).json({ message: 'Return not found' });
    }
    res.json(returnReq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    সেলার রিটার্ন দেখা
exports.getSellerReturns = async (req, res) => {
  try {
    // লজিক: সেলারের নিজের প্রডাক্ট যেসব অর্ডারে আছে, সেই রিটার্নগুলো খুঁজে বের করা
    const sellerOrders = await Order.find({
      'orderItems.seller': req.user._id,
    });
    const orderIds = sellerOrders.map(o => o._id);

    const returns = await Return.find({ order: { $in: orderIds } })
      .populate('user', 'name email')
      .populate('order', '_id totalPrice createdAt');

    res.json(returns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    স্ট্যাটাস আপডেট করা
exports.updateReturnStatus = async (req, res) => {
  try {
    const returnReq = await Return.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(returnReq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
