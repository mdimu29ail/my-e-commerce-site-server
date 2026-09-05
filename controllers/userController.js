const User = require('../models/User');

const Order = require('../models/Order');

/**
 * @desc    সব ইউজারদের তালিকা পাওয়া
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select(
      'name email role avatar image photoURL loyaltyPoints'
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    চ্যাটের জন্য অ্যাডমিন, মডারেটর এবং সেলারদের তালিকা পাওয়া
 */
exports.getChatUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ['admin', 'moderator', 'seller'] },
      _id: { $ne: req.user._id }, // নিজেকে বাদ দেওয়া
    }).select('name email role avatar image photoURL shopName');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    নির্দিষ্ট ইউজার আইডি দিয়ে ডাটা দেখা
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'ভুল আইডি ফরম্যাট বা সার্ভার এরর' });
  }
};

/**
 * @desc    নিজের প্রোফাইল এবং ইমেজ আপডেট (ImgBB URL সহ)
 * @route   PUT /api/users/profile
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // ১. সাধারণ তথ্য আপডেট
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;

      // ২. ইমেজ আপডেট লজিক (avatar এবং photoURL দুটোই আপডেট করা হচ্ছে সিঙ্কের জন্য)
      const newImage = req.body.image || req.body.photoURL;
      if (newImage) {
        user.avatar = newImage;
        user.photoURL = newImage;
      }

      if (user.role === 'seller') {
        user.shopName = req.body.shopName || user.shopName;
      }

      // ৩. অ্যাড্রেস অবজেক্ট আপডেট
      if (req.body.address) {
        user.address = {
          division: req.body.address.division || user.address?.division || '',
          district: req.body.address.district || user.address?.district || '',
          upazila: req.body.address.upazila || user.address?.upazila || '',
          detailAddress:
            req.body.address.detailAddress || user.address?.detailAddress || '',
        };
      }

      // ৪. ডাটাবেসে সেভ করা (এটি মডেলের pre-save মিডলওয়্যার কল করবে)
      const updatedUser = await user.save();

      // ৫. ফ্রন্টএন্ডে আপডেট হওয়া ডাটা পাঠানো
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        photoURL: updatedUser.photoURL,
        address: updatedUser.address,
        shopName: updatedUser.shopName,
        loyaltyPoints: updatedUser.loyaltyPoints,
      });
    } else {
      res.status(404).json({ message: 'ইউজার পাওয়া যায়নি' });
    }
  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ message: 'আপডেট ব্যর্থ হয়েছে: ' + error.message });
  }
};

/**
 * @desc    ইউজার রোল এবং অ্যাপ্রুভাল স্ট্যাটাস আপডেট (Admin Only)
 */
exports.updateUserRole = async (req, res) => {
  try {
    // ১. req.body থেকে isBlocked সহ সব ডাটা রিসিভ করা
    const { name, role, phone, loyaltyPoints, isApproved, isBlocked } =
      req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
    }

    // ২. আইডেন্টিটি ফিল্ট্রেশন লজিক (সাসপেন্ড/ব্লক আপডেট)
    if (isBlocked !== undefined) {
      user.isBlocked = isBlocked === 'true' || isBlocked === true;
    }

    // ৩. বাকি তথ্য আপডেট
    if (name) user.name = name;
    if (role) user.role = role;
    if (phone) user.phone = phone;

    // ৪. লয়ালটি পয়েন্ট প্রসেসিং
    if (loyaltyPoints !== undefined) {
      user.loyaltyPoints = Number(loyaltyPoints);
    }

    // ৫. মার্চেন্ট অ্যাপ্রুভাল লজিক
    if (isApproved !== undefined) {
      user.isApproved = isApproved === 'true' || isApproved === true;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'সিস্টেম প্রোটোকল আপডেট সফল হয়েছে',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        role: updatedUser.role,
        isBlocked: updatedUser.isBlocked, // আপডেট হওয়া স্ট্যাটাস রিটার্ন
        loyaltyPoints: updatedUser.loyaltyPoints,
        isApproved: updatedUser.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'PROTOCOL ERROR: ' + error.message,
    });
  }
};

/**
 * @desc    ইউজার ডিলিট করা
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'আপনি নিজের অ্যাকাউন্ট ডিলিট করতে পারবেন না',
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'অ্যাডমিন অ্যাকাউন্ট ডিলিট করা সম্ভব নয়',
      });
    }

    await user.deleteOne();
    res
      .status(200)
      .json({ success: true, message: 'ইউজার সফলভাবে ডিলিট করা হয়েছে' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    লয়ালটি পয়েন্ট সরাসরি আপডেট
 */
exports.updateLoyaltyPoints = async (req, res) => {
  try {
    const { points } = req.body;

    if (points === undefined) {
      return res
        .status(400)
        .json({ success: false, message: 'পয়েন্ট প্রদান করুন' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'ইউজার পাওয়া যায়নি' });
    }

    user.loyaltyPoints = Number(points);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'পয়েন্ট আপডেট হয়েছে',
      user: {
        name: user.name,
        loyaltyPoints: user.loyaltyPoints,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get User Specific Analytics
// @route   GET /api/users/analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // ১. বেসিক স্ট্যাটস (Total Orders, Total Spent, Pending)
    const orders = await Order.find({ user: userId });
    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (acc, order) => acc + (order.isPaid ? order.totalPrice : 0),
      0
    );
    const pendingItems = orders.filter(o => o.status !== 'Delivered').length;

    // ২. স্পেন্ডিং চার্ট ডাটা (গত ৬ মাস)
    const spendingChart = await Order.aggregate([
      { $match: { user: userId, isPaid: true } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          spent: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];
    const formattedSpending = spendingChart.map(item => ({
      name: months[item._id - 1],
      spent: item.spent,
    }));

    // ৩. অর্ডার স্ট্যাটাস ব্রেকডাউন (Pie Chart)
    const statusChart = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$status',
          value: { $sum: 1 },
        },
      },
    ]);

    const formattedStatus = statusChart.map(item => ({
      name: item._id.toUpperCase(),
      value: item.value,
    }));

    res.json({
      stats: {
        totalOrders,
        totalSpent,
        pendingItems,
        loyaltyPoints: req.user.loyaltyPoints || 0,
      },
      spendingData:
        formattedSpending.length > 0
          ? formattedSpending
          : [{ name: 'N/A', spent: 0 }],
      statusData: formattedStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
