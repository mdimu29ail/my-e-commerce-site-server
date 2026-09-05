const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Tracking = require('../models/Tracking'); // ট্র্যাকিং মডেলটি ইমপোর্ট করুন

// @desc    নতুন অর্ডার তৈরি করা এবং স্টক কমানো + লয়ালটি পয়েন্ট যোগ করা
// @route   POST /api/orders
// @access  Private
exports.addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'অর্ডারে কোনো পণ্য নেই' });
    }

    // ১. অর্ডার ডাটাবেসে সেভ করা
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      status: 'Order Placed',
      placedAt: Date.now(),
    });

    const createdOrder = await order.save();

    // ২. ইনভেন্টরি আপডেট (পণ্যর স্টক কমানো)
    // এবং চেক করা স্টক ০ হলে কি হবে
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty },
      });
    }

    // ৩. অটোমেটিক লয়ালটি পয়েন্ট যোগ করা
    // লজিক: প্রতি ১০০ টাকার কেনাকাটায় ১ পয়েন্ট (টোটাল প্রাইস অনুযায়ী)
    const pointsToEarn = Math.floor(totalPrice / 100);

    if (pointsToEarn > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { loyaltyPoints: pointsToEarn },
      });
      console.log(
        `✅ ${pointsToEarn} loyalty points added to user: ${req.user.name}`
      );
    }

    // ৪. অটোমেটিক ট্র্যাকিং রেকর্ড তৈরি করা (অর্ডার হওয়ার সাথে সাথে)
    await Tracking.create({
      order: createdOrder._id,
      user: req.user._id,
      trackingId:
        `TRK${Date.now()}${createdOrder._id.toString().slice(-4)}`.toUpperCase(),
      currentStatus: 'Order Placed',
      history: [
        {
          status: 'Order Placed',
          location: 'System',
          messageEn: 'Your order has been placed successfully.',
          messageBn: 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।',
        },
      ],
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Order Error:', error);
    res
      .status(500)
      .json({ message: 'অর্ডারটি সম্পন্ন করা সম্ভব হয়নি: ' + error.message });
  }
};

// @desc    আইডি দিয়ে অর্ডারের ডিটেইলস দেখা
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (order) {
      const isAdmin = req.user.role === 'admin';
      const isOwner = order.user._id.toString() === req.user._id.toString();

      if (isAdmin || isOwner) {
        res.json(order);
      } else {
        res.status(401).json({ message: 'আপনার এই অর্ডার দেখার অনুমতি নেই' });
      }
    } else {
      res.status(404).json({ message: 'অর্ডার পাওয়া যায়নি' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    অর্ডার পেমেন্ট স্ট্যাটাস আপডেট করা (Online Payment Success হলে)
// @route   PUT /api/orders/:id/pay
exports.updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentStatus = 'Paid';
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'অর্ডার পাওয়া যায়নি' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    অর্ডার ডেলিভারি স্ট্যাটাস আপডেট করা (Admin/Seller)
// @route   PUT /api/orders/:id/deliver
exports.updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = req.body.status || 'Successfully Delivered';

      if (order.status === 'Successfully Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }

      const updatedOrder = await order.save();

      // ট্র্যাকিং আপডেট (যদি ডেলিভারড হয়)
      await Tracking.findOneAndUpdate(
        { order: order._id },
        {
          $set: { currentStatus: order.status },
          $push: {
            history: {
              status: order.status,
              location: 'Destination',
              messageEn: `Order ${order.status}`,
              messageBn: `অর্ডারটি ${order.status}`,
            },
          },
        }
      );

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'অর্ডার পাওয়া যায়নি' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    লগইন করা ইউজারের সব অর্ডার দেখা
// @route   GET /api/orders/myorders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    সব অর্ডার দেখা (অ্যাডমিন)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    সেলার-ভিত্তিক অর্ডার পাওয়া
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'orderItems.seller': req.user._id }).sort(
      { createdAt: -1 }
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    অর্ডার ডিলিট করা (Admin Only)
// @route   DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.json({ message: 'অর্ডারটি সফলভাবে ডিলিট করা হয়েছে' });
    } else {
      res.status(404).json({ message: 'অর্ডার পাওয়া যায়নি' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    অর্ডারের স্ট্যাটাস আপডেট করা (মডারেটর/অ্যাডমিন প্রোটোকল)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      const newStatus = req.body.status;
      order.status = newStatus;

      // টাইমস্ট্যাম্প আপডেট লজিক
      const statusTimestamps = {
        'Order Placed': 'placedAt',
        'Processing & Verification': 'verifiedAt',
        'En Route to Destination': 'shippedAt',
        'Out for Delivery': 'outForDeliveryAt',
        'Successfully Delivered': 'deliveredAt',
      };

      if (statusTimestamps[newStatus]) {
        order[statusTimestamps[newStatus]] = Date.now();
      }

      // ডেলিভারি ফ্ল্যাগ আপডেট
      if (newStatus === 'Successfully Delivered') {
        order.isDelivered = true;
        order.deliveredAt = order.deliveredAt || Date.now();
      }

      const updatedOrder = await order.save();

      // ট্র্যাকিং রেকর্ড আপডেট করা
      const trackingMessages = {
        'Order Placed': {
          en: 'Order has been placed.',
          bn: 'অর্ডারটি গ্রহণ করা হয়েছে।',
        },
        'Processing & Verification': {
          en: 'Your order is being verified and prepared.',
          bn: 'আপনার অর্ডারটি যাচাই এবং প্রস্তুত করা হচ্ছে।',
        },
        'En Route to Destination': {
          en: 'Your order is on its way to the destination.',
          bn: 'আপনার অর্ডারটি গন্তব্যের পথে রয়েছে।',
        },
        'Out for Delivery': {
          en: 'Our delivery partner is out to deliver your order.',
          bn: 'আমাদের ডেলিভারি পার্টনার আপনার অর্ডারটি পৌঁছে দেওয়ার জন্য বের হয়েছে।',
        },
        'Successfully Delivered': {
          en: 'Your order has been successfully delivered.',
          bn: 'আপনার অর্ডারটি সফলভাবে পৌঁছে দেওয়া হয়েছে।',
        },
        Cancelled: { en: 'Order has been cancelled.', bn: 'অর্ডারটি বাতিল করা হয়েছে।' },
        Returned: { en: 'Order has been returned.', bn: 'অর্ডারটি ফেরত দেওয়া হয়েছে।' },
      };

      const msg = trackingMessages[newStatus] || {
        en: `Order status updated to ${newStatus}`,
        bn: `অর্ডারের অবস্থা পরিবর্তন করে ${newStatus} করা হয়েছে`,
      };

      await Tracking.findOneAndUpdate(
        { order: order._id },
        {
          $set: { currentStatus: newStatus },
          $push: {
            history: {
              status: newStatus,
              location: req.body.location || 'Hub',
              messageEn: msg.en,
              messageBn: msg.bn,
            },
          },
        },
        { upsert: true }
      );

      // Real-time Socket.io push to user
      try {
        const { getIO } = require('../sockets/chatSocket');
        const io = getIO();
        io.to(String(order.user)).emit('orderStatusUpdated', {
          orderId: String(order._id),
          status: newStatus,
          updatedAt: new Date(),
        });
      } catch (socketErr) {
        console.warn('Socket emit warning:', socketErr.message);
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order manifest not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
