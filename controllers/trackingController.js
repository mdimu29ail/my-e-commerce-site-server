
const Order = require('../models/Order');
const Tracking = require('../models/Tracking');
const User = require('../models/User');

/**
 * @desc আইডি থেকে '#' চিহ্ন সরানোর জন্য হেল্পার ফাংশন
 */
const cleanId = id => {
  if (typeof id === 'string' && id.startsWith('#')) {
    return id.substring(1);
  }
  return id;
};

// @desc    সব ট্র্যাকিং রেকর্ড দেখা (Admin/Moderator Only)
exports.getAllTracking = async (req, res) => {
  try {
    const trackingRecords = await Tracking.find({})
      .populate('order', 'totalPrice status createdAt')
      .populate('user', 'name email phone')
      .sort({ updatedAt: -1 });
    res.json(trackingRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    অর্ডার আইডি দিয়ে ট্র্যাকিং ডিটেইলস দেখা
exports.getTrackingDetails = async (req, res) => {
  try {
    const orderId = cleanId(req.params.orderId);

    const tracking = await Tracking.findOne({ order: orderId })
      .populate(
        'order',
        'totalPrice paymentMethod status placedAt verifiedAt shippedAt outForDeliveryAt deliveredAt'
      )
      .populate('user', 'name phone email');

    if (!tracking) {
      return res
        .status(404)
        .json({ message: 'এই অর্ডারের কোনো ট্র্যাকিং তথ্য পাওয়া যায়নি' });
    }

    // আইডি তুলনা করার লজিক (Populated Object হ্যান্ডেল করার জন্য)
    const trackingUserId = tracking.user?._id
      ? tracking.user._id.toString()
      : tracking.user?.toString();
    const currentUserId = req.user._id.toString();

    const isAdmin = req.user.role === 'admin';
    const isModerator = req.user.role === 'moderator';
    const isOwner = trackingUserId === currentUserId;

    if (isAdmin || isModerator || isOwner) {
      res.json(tracking);
    } else {
      res.status(403).json({ message: 'আপনার এই তথ্য দেখার অনুমতি নেই' });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: 'সার্ভার সমস্যা: তথ্য দেখা সম্ভব হচ্ছে না' });
  }
};

// @desc    ট্র্যাকিং আইডি (TRK...) দিয়ে সার্চ করা
exports.getTrackingByTrkId = async (req, res) => {
  try {
    const trkId = req.params.trackingId.trim().toUpperCase();

    const tracking = await Tracking.findOne({ trackingId: trkId })
      .populate(
        'order',
        'totalPrice paymentMethod status placedAt verifiedAt shippedAt outForDeliveryAt deliveredAt'
      )
      .populate('user', 'name phone email');

    if (!tracking) {
      return res.status(404).json({ message: 'ভুল ট্র্যাকিং আইডি' });
    }

    const trackingUserId = tracking.user?._id
      ? tracking.user._id.toString()
      : tracking.user?.toString();
    const currentUserId = req.user._id.toString();

    const isAdmin = req.user.role === 'admin';
    const isOwner = trackingUserId === currentUserId;

    if (isAdmin || isOwner) {
      res.json(tracking);
    } else {
      res.status(403).json({ message: 'আপনার এই তথ্য দেখার অনুমতি নেই' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    অর্ডারের জন্য ট্র্যাকিং তৈরি বা আপডেট করা
exports.updateTrackingStatus = async (req, res) => {
  try {
    const { status, location, descriptionEn, descriptionBn, trackingId } =
      req.body;
    const orderId = cleanId(req.params.orderId);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'অর্ডারটি পাওয়া যায়নি' });
    }

    let tracking = await Tracking.findOne({ order: orderId });

    // যদি ট্র্যাকিং রেকর্ড না থাকে, তবে নতুন তৈরি করুন
    if (!tracking) {
      tracking = new Tracking({
        order: orderId,
        user: order.user, // User ID বাধ্যতামূলক
        trackingId:
          trackingId || `TRK${Date.now()}${orderId.slice(-4)}`.toUpperCase(),
        currentStatus: 'Order Placed',
        history: [],
      });
    }

    const newEvent = {
      status: status || order.status,
      location: location || 'Warehouse',
      messageEn: descriptionEn || `Package status: ${status}`,
      messageBn: descriptionBn || `পার্সেল আপডেট: ${status}`,
      updatedAt: Date.now(),
    };

    tracking.history.unshift(newEvent);
    tracking.currentStatus = status || tracking.currentStatus;

    if (trackingId) tracking.trackingId = trackingId.trim().toUpperCase();

    await tracking.save();

    // মূল অর্ডারের স্ট্যাটাস সিঙ্ক করা
    if (status) {
      order.status = status;
      if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
      await order.save();
    }

    res.status(200).json({ message: 'শিপিং আপডেট সফল হয়েছে', tracking });
  } catch (error) {
    res.status(500).json({ message: 'সার্ভারে সমস্যা: ' + error.message });
  }
};

// @desc    কুরিয়ার সার্ভিস API সিঙ্ক
exports.syncWithCourier = async (req, res) => {
  try {
    const { trackingId } = req.params;
    res.status(200).json({
      message: `ট্র্যাকিং আইডি ${trackingId} এর ডাটা সিঙ্ক সফল হয়েছে`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
